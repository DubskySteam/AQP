package de.fhbielefeld.smartuser.application;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.security.hash.MD5;
import de.fhbielefeld.smartuser.persistence.jpa.User;
import de.fhbielefeld.smartuser.config.Configuration;
import de.fhbielefeld.smartuser.persistence.jpa.Resource;
import de.fhbielefeld.smartuser.persistence.jpa.UserRight;
import java.util.Hashtable;
import java.util.List;
import javax.naming.Context;
import javax.naming.NamingEnumeration;
import javax.naming.directory.Attributes;
import javax.naming.directory.SearchControls;
import javax.naming.directory.SearchResult;
import javax.naming.ldap.InitialLdapContext;
import javax.naming.ldap.LdapContext;

/**
 * Usermanager for identifiing and handling users over an LDAP directory.
 *
 * @author ffehring
 */
public class UsermanagerLDAP extends Usermanager {

    public UsermanagerLDAP(UsermanagerHandler umh) throws UsermanagerException {
        super(umh);
    }

    @Override
    public User performLogin(String username, String password) throws UsermanagerException {
        // Get applications configuration
        Configuration conf = new Configuration();

        User ldapuser = null;

        if (username == null || username.trim().isEmpty() || username.equals("")) {
            throw new UsermanagerException("No username given");
        }

//            String LDAP_user_filter = "(objectClass=user)";//"(&(objectClass=user)(sAMAccountName={"+LDAP_adminUID+"}))";
//            LDAP_user_filter = "(&(objectClass=user)(CN=" + username + "))";
        // Building context data
        Hashtable<String, String> env = new Hashtable<>();

        Message ldapmsg = new Message("Try to identify with LDAP and uname: " + username + " => ******", MessageLevel.INFO);
        Logger.addDebugMessage(ldapmsg);

        env.put(Context.INITIAL_CONTEXT_FACTORY,
                "com.sun.jndi.ldap.LdapCtxFactory");
        env.put(Context.SECURITY_AUTHENTICATION,
                "SIMPLE");
        env.put(Context.PROVIDER_URL, conf.getProperty("ldap_host")
                + ":" + conf.getProperty("ldap_port"));
        env.put(Context.SECURITY_PRINCIPAL, conf.getProperty("ldap_adminUID"));

        env.put(Context.SECURITY_CREDENTIALS, conf.getProperty("ldap_password"));

        env.put(Context.REFERRAL,
                "follow");

        String userfilter = conf.getProperty("ldap_user_filter").replace("$u", username);

        try {
            // Init Ldap context
            LdapContext ldapcontext = new InitialLdapContext(env, null);
//                String dn = "cn=" + LDAP_adminUID + "," + LDAP_base;

//                String attrs[] = {"password"};
            SearchControls sc = new SearchControls();
            sc.setSearchScope(SearchControls.SUBTREE_SCOPE);

            NamingEnumeration<SearchResult> items = ldapcontext.search(
                    conf.getProperty("ldap_base"),
                    userfilter,
                    sc);
            // If user was found
            while (items != null && items.hasMore()) {
                // Found no way to get rid of the unchecked warning
                @SuppressWarnings({"unchecked"})
                Hashtable<String, String> env1 = (Hashtable<String, String>) ldapcontext.getEnvironment().clone();
                try {
                    SearchResult sr = (SearchResult) items.next();

                    env1.put(Context.SECURITY_PRINCIPAL, sr.getNameInNamespace());
                    env1.put(Context.SECURITY_CREDENTIALS, password);
                    LdapContext context1 = new InitialLdapContext(env1, null);

                    NamingEnumeration<SearchResult> ldapusers = context1.search(
                            conf.getProperty("ldap_base"),
                            userfilter,
                            sc);
                    Attributes ldapuserattribs = ldapusers.next().getAttributes();
                    ldapuser = new User();
                    String displayname = ldapuserattribs.get("displayname").toString();
                    String[] name = displayname.split(" ", 3);
                    ldapuser.setUsername(username);
                    ldapuser.setFirstname(name[1]);
                    ldapuser.setLastname(name[2]);
                    ldapuser.setEmail(ldapuserattribs.get("mail").toString().replace("mail: ", ""));
                    ldapuser.generateAuthtoken();
                    //TODO get and set email and more data
                    // Debuginformation, what knows LDAP about me?
//                        NamingEnumeration<String> attribids = ldapuserattribs.getIDs();
//                        while(attribids.hasMore()) {
//                            String curId = attribids.next();
//                            System.out.println(curId + " => " + ldapuserattribs.get(curId));
//                        }
                } catch (javax.naming.AuthenticationException wrongPassword) {
                    Message msg = new Message("Could not identify user. Wrong credentials.", MessageLevel.ERROR);
                    Logger.addDebugMessage(msg);
                    // Wrong password entered. Try local database.
                    throw new UsermanagerException("Could not identify user. Wrong credentials.");
                }
            }
            if (ldapuser == null) {
                Message msg = new Message("Could not identify user. User not found.", MessageLevel.ERROR);
                Logger.addDebugMessage(msg);
                // TblUser not found.
                throw new UsermanagerException("Could not find user " + username);
            }
        } catch (javax.naming.NamingException ne) {
            Message msg = new Message("Could not identify user. NamingException: " + ne.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addDebugMessage(msg);
            throw new UsermanagerException("NamingException: " + ne.getLocalizedMessage());
        }

        if (conf.getProperty("copyusertolocal").equals("true")) {
            this.umh.resetActiveUsermanager();
            // Get logal usermanager
            do {
                Usermanager um = this.umh.getUsermanager();
                if (um.getClass() == UsermanagerLocal.class) {
                    break;
                }
            } while (this.umh.setNextUsermanagerActive());

            if (this.umh.getUsermanager().getClass() != UsermanagerLocal.class) {
                Message emsg = new Message("Could not copy user: Local usermanager is not available. ",
                         MessageLevel.WARNING);
                Logger.addDebugMessage(emsg);
                ldapuser.setId(Long.MAX_VALUE);
                return ldapuser;
            }

            // Create MD5 hash for password
            String md5password = MD5.generateMD5Hash(conf.getProperty("passwordsalt")
                    + password);
            ldapuser.setPassword(md5password);
            // Try save user on next available usermanager
            try {
                Usermanager um = this.umh.getUsermanager();
                User localuser = null;
                try {
                    localuser = um.createUser(ldapuser, ldapuser);
                    return localuser;
                } catch (UsermanagerException uex) {
                    if (uex.getLocalizedMessage().contains("User allready exists")) {
                        localuser = um.getUser(ldapuser.getUsername(), ldapuser);
                        return localuser;
                    }
                    throw uex;
                }
            } catch (UnsupportedOperationException | UsermanagerException ex) {
                Message emsg = new Message("Exception occured while trying to copy user: "
                        + ex.getLocalizedMessage(), MessageLevel.WARNING);
                Logger.addDebugMessage(emsg);
            } finally {
                this.umh.resetActiveUsermanager();
            }
        }

        return ldapuser;
    }

    @Override
    public boolean performLogout(String username) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public User getUser(String username, User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    /**
     * Searches an user with its authtoken. Relies on an local usermanager,
     * science authtokens are not stored on LDAP
     *
     * @param authtoken
     * @return
     * @throws UsermanagerException
     */
    @Override
    public User getUser(String authtoken) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
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
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
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
    public List<User> getUserlist(User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public boolean userHasRight(String username, String resource, String action) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public List<UserRight> userListRights(String username, String resource, String action) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }

    @Override
    public boolean grantRight(String username, String resource, String action, User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public boolean revokeRight(String username, String resource, String action, User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public List<User> getParentUsers() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public long countUsers() throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
