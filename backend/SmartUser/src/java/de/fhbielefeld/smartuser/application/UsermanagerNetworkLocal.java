package de.fhbielefeld.smartuser.application;

import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.security.hash.MD5;
import de.fhbielefeld.smartuser.persistence.jpa.Resource;
import de.fhbielefeld.smartuser.persistence.jpa.User;
import de.fhbielefeld.smartuser.persistence.jpa.UserRight;
import java.util.ArrayList;
import java.util.List;

/**
 * This usermanager combines usermanagement with remote service and local
 * database.
 *
 * @author ffehring
 */
public class UsermanagerNetworkLocal extends Usermanager {

    private final UsermanagerLocal umlocal;
    private final UsermanagerNetwork umnetwork;
    private final UsermanagerLDAP umldap;

    public UsermanagerNetworkLocal(UsermanagerHandler umh) throws UsermanagerException {
        super(umh);
        this.umlocal = new UsermanagerLocal(umh);
        this.umnetwork = new UsermanagerNetwork(umh);
        this.umldap = new UsermanagerLDAP(umh);
    }

    @Override
    public User performLogin(String username, String password) throws UsermanagerException {
        User user = null;

        Message imsg = new Message("Try to identify with MultiManager. Serviceorder: " 
                + this.umh.getConf().getProperty("serviceorder"), MessageLevel.INFO);

        List<Exception> exceptions = new ArrayList<>();

        String[] serviceorder = this.umh.getConf().getProperty("serviceorder").split(",");
        for (int i = 0; i < serviceorder.length; i++) {
            String curService = serviceorder[i];
            try {
                if (curService.equalsIgnoreCase("local")) {
                    user = this.umlocal.performLogin(username, password);
                }
                if (curService.equalsIgnoreCase("network")) {
                    user = this.umnetwork.performLogin(username, password);
                }
                if (curService.equalsIgnoreCase("ldap")) {
                    user = this.umldap.performLogin(username, password);
                }
            } catch (Exception ex) {
                exceptions.add(ex);
            }
        }

        if (user == null) {
            // Throw exceptions
            UsermanagerException uex = new UsermanagerException("Could not identify user >" + username + "<");
            for (Exception curEx : exceptions) {
                uex.addSuppressed(curEx);
            }
            throw uex;
        }

        // Copy from network to local database
        if (this.umh.getConf().getProperty("copyusertolocal").equals("true")) {
            Long userid = 0L;
            if (user.getId() != null) {
                userid = user.getId();
            }
            user.setId(null);
            // Create MD5 hash for password
            String md5password = MD5.generateMD5Hash(this.umh.getConf().getProperty("passwordsalt")
                    + password);
            user.setPassword(md5password);
            this.umlocal.createUser(user,null);
            if (userid != 0) {
                user.setId(userid);
            }
        }

        return user;
    }

    @Override
    public boolean performLogout(String username) throws UsermanagerException {
        boolean networklogout = false;
        boolean locallogout = false;
        try {
            this.umnetwork.performLogout(username);
            networklogout = true;
        } catch (UsermanagerException ex) {

        }
        try {
            this.umlocal.performLogout(username);
            locallogout = true;
        } catch (UsermanagerException ex) {

        }
        if (networklogout == true && locallogout == true) {
            return true;
        } else {
            return false;
        }
    }

    @Override
    public User getUser(String username, User requestor) throws UsermanagerException {
        User user = null;
        List<Exception> exceptions = new ArrayList<>();
        boolean getlocalfailed = false;
        boolean getnetworkfailed = false;

        if (this.umh.getConf().getProperty("serviceorder").equalsIgnoreCase("Local,Network")) {
            try {
                user = this.umlocal.getUser(username, requestor);
            } catch (Exception ex) {
                exceptions.add(ex);
                getlocalfailed = true;
            }
        }
        if (this.umh.getConf().getProperty("serviceorder").equalsIgnoreCase("Network,Local") || getlocalfailed == true) {
            try {
                user = this.umnetwork.getUser(username, requestor);
            } catch (Exception ex) {
                exceptions.add(ex);
                getnetworkfailed = true;
            }
        }
        if (getnetworkfailed == true && getlocalfailed == false) {
            try {
                user = this.umlocal.getUser(username, requestor);
            } catch (Exception ex) {
                exceptions.add(ex);
                getlocalfailed = true;
            }
        }

        // Throw exception on error
        if (user == null && (getlocalfailed == true || getnetworkfailed == true)) {
            Exception ex = exceptions.get(exceptions.size() - 1);
            UsermanagerException umex = new UsermanagerException("Error on getting userdata.");
            umex.addSuppressed(ex);
            throw umex;
        }

        return user;
    }

    @Override
    public User getUser(String authtoken) throws UsermanagerException {
        User user = null;
        List<Exception> exceptions = new ArrayList<>();
        boolean getlocalfailed = false;
        boolean getnetworkfailed = false;

        if (this.umh.getConf().getProperty("serviceorder").equalsIgnoreCase("Local,Network")) {
            try {
                user = this.umlocal.getUser(authtoken);
            } catch (Exception ex) {
                exceptions.add(ex);
                getlocalfailed = true;
            }
        }
        if (this.umh.getConf().getProperty("serviceorder").equalsIgnoreCase("Network,Local") || getlocalfailed == true) {
            try {
                user = this.umnetwork.getUser(authtoken);
            } catch (Exception ex) {
                exceptions.add(ex);
                getnetworkfailed = true;
            }
        }
        if (getnetworkfailed == true && getlocalfailed == false) {
            try {
                user = this.umlocal.getUser(authtoken);
            } catch (Exception ex) {
                exceptions.add(ex);
                getlocalfailed = true;
            }
        }

        // Throw exception on error
        if (user == null && (getlocalfailed == true || getnetworkfailed == true)) {
            Exception ex = exceptions.get(exceptions.size() - 1);
            UsermanagerException umex = new UsermanagerException("Error on getting userdata.");
            umex.addSuppressed(ex);
            throw umex;
        }

        return user;
    }

    @Override
    public List<User> getUserlist(User requestor) throws UsermanagerException {
        List<Exception> exceptions = new ArrayList<>();

        String[] serviceorder = this.umh.getConf().getProperty("serviceorder").split(",");
        for (int i = 0; i < serviceorder.length; i++) {
            String curService = serviceorder[i];
            try {
                if (curService.equalsIgnoreCase("Local")) {
                    return this.umlocal.getUserlist(requestor);
                }
                if (curService.equalsIgnoreCase("Network")) {
                    return this.umnetwork.getUserlist(requestor);
                }
                if (curService.equalsIgnoreCase("Ldap")) {
                    return this.umldap.getUserlist(requestor);
                }
            } catch (Exception ex) {
                exceptions.add(ex);
            }
        }

        // Throw exceptions
        UsermanagerException uex = new UsermanagerException("Could not get list of users");
        for (Exception curEx : exceptions) {
            uex.addSuppressed(curEx);
        }
        throw uex;
    }

    @Override
    public User createUser(User user, User creator) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public boolean confirmUser(String confirmToken) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public boolean requestMailLogin(String usermailname) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public User performMailLogin(String onelogintoken) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public User updateUser(User user, User requestor) throws UsermanagerException {
        List<Exception> exceptions = new ArrayList<>();
        boolean savelocalfailed = false;
        boolean savenetworkfailed = false;
        User newuser = null;

        if (this.umh.getConf().getProperty("serviceorder").equalsIgnoreCase("Local,Network")) {
            try {
                newuser = this.umlocal.updateUser(user, requestor);
            } catch (Exception ex) {
                exceptions.add(ex);
                savelocalfailed = true;
            }
        }
        if (this.umh.getConf().getProperty("serviceorder").equalsIgnoreCase("Network,Local") || savelocalfailed == true) {
            try {
                newuser = this.umnetwork.updateUser(user, requestor);
            } catch (Exception ex) {
                exceptions.add(ex);
                savenetworkfailed = true;
            }
        }
        if (savenetworkfailed == true && savelocalfailed == false) {
            try {
                newuser = this.umlocal.updateUser(user, requestor);
            } catch (Exception ex) {
                exceptions.add(ex);
                savelocalfailed = true;
            }
        }

        // Throw exception on error
        if (savelocalfailed == true && savenetworkfailed == true) {
            Exception ex = exceptions.get(exceptions.size() - 1);
            UsermanagerException umex = new UsermanagerException("Error on getting userdata.");
            umex.addSuppressed(ex);
            throw umex;
        }
        return newuser;
    }
    
    @Override
    public void deleteUser(String username, User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }
    
    @Override
    public Resource createResource(String resource, User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }
    
    @Override
    public List<Resource> userListResources(String username, String resource, String action) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }
    
    @Override
    public void deleteResource(String resource, User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }

    @Override
    public boolean userHasRight(String username, String resource, String action) throws UsermanagerException {

        List<Exception> exceptions = new ArrayList<>();
        boolean hasLDAPRight = false;
        boolean hasNetworkRight = false;
        boolean hasLocalRight = false;

        try {
            hasLDAPRight = this.umldap.userHasRight(username, resource, action);
        } catch (Exception ex) {
            exceptions.add(ex);
        }
        try {
            hasNetworkRight = this.umnetwork.userHasRight(username, resource, action);
        } catch (Exception ex) {
            exceptions.add(ex);
        }
        try {
            hasLocalRight = this.umlocal.userHasRight(username, resource, action);
        } catch (Exception ex) {
            exceptions.add(ex);
        }

        if (hasLDAPRight || hasNetworkRight || hasLocalRight) {
            return true;
        } else if (exceptions.size() > 0) {
            // Error while checking right
        }
        return false;
    }

    @Override
    public List<UserRight> userListRights(String username, String resource, String action) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }
    
    @Override
    public boolean grantRight(String username, String resource, String action, User requestor) throws UsermanagerException {
        List<Exception> exceptions = new ArrayList<>();
        boolean withouterror = true;
        try {
            this.umldap.grantRight(username, resource, action, requestor);
        } catch (Exception ex) {
            exceptions.add(ex);
            if (this.umh.getConf().getProperty("serviceorder").contains("LDAP")) {
                withouterror = false;
            }
        }
        try {
            this.umnetwork.grantRight(username, resource, action, requestor);
        } catch (Exception ex) {
            exceptions.add(ex);
            if (this.umh.getConf().getProperty("serviceorder").contains("Network")) {
                withouterror = false;
            }
        }
        try {
            this.umlocal.grantRight(username, resource, action, requestor);
        } catch (Exception ex) {
            exceptions.add(ex);
            if (this.umh.getConf().getProperty("serviceorder").contains("Local")) {
                withouterror = false;
            }
        }
        return withouterror;
    }

    @Override
    public boolean revokeRight(String username, String resource, String action, User requestor) throws UsermanagerException {
        List<Exception> exceptions = new ArrayList<>();
        boolean withouterror = true;
        try {
            this.umldap.revokeRight(username, resource, action, requestor);
        } catch (Exception ex) {
            exceptions.add(ex);
            if (this.umh.getConf().getProperty("serviceorder").contains("LDAP")) {
                withouterror = false;
            }
        }
        try {
            this.umnetwork.revokeRight(username, resource, action, requestor);
        } catch (Exception ex) {
            exceptions.add(ex);
            if (this.umh.getConf().getProperty("serviceorder").contains("Network")) {
                withouterror = false;
            }
        }
        try {
            this.umlocal.revokeRight(username, resource, action, requestor);
        } catch (Exception ex) {
            exceptions.add(ex);
            if (this.umh.getConf().getProperty("serviceorder").contains("Local")) {
                withouterror = false;
            }
        }
        return withouterror;
    }

    @Override
    public List<User> getParentUsers() throws UsermanagerException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public long countUsers() throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
