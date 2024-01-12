package de.fhbielefeld.smartuser.application;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.mail.Mailer;
import de.fhbielefeld.scl.mail.MailerException;
import de.fhbielefeld.scl.security.hash.MD5;
import de.fhbielefeld.smartuser.persistence.jpa.Resource;
import de.fhbielefeld.smartuser.persistence.jpa.UserRight;
import de.fhbielefeld.smartuser.persistence.jpa.User;
import de.fhbielefeld.smartuser.config.Configuration;
import de.fhbielefeld.smartuser.persistence.jpa.AccessFail;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.transaction.HeuristicMixedException;
import jakarta.transaction.HeuristicRollbackException;
import jakarta.transaction.NotSupportedException;
import jakarta.transaction.RollbackException;
import jakarta.transaction.SystemException;

/**
 * Uses local JPA connection to manage users data.
 *
 * @author ffehring
 */
public class UsermanagerLocal extends Usermanager {

    public UsermanagerLocal(UsermanagerHandler umh) throws UsermanagerException {
        super(umh);

        EntityManager em = this.umh.getEntityManager();
        if (em == null) {
            throw new UsermanagerException("Could not get EntityManager");
        }
    }

    @Override
    public User performLogin(String username, String password) throws UsermanagerException {
        Configuration conf = this.umh.getConf();

        // Create MD5 hash for password
        String md5password = MD5.generateMD5Hash(conf.getProperty("passwordsalt")
                + password);

        Message trymsg = new Message("Try to identify with "
                + this.getClass().getSimpleName() + " with uname: " + username
                + " => " + md5password, MessageLevel.INFO);
        Logger.addDebugMessage(trymsg);

        // Load user from database
        try {
            User user = this.umh.getEntityManager().createNamedQuery("User.login", User.class)
                    .setParameter("username", username)
                    .setParameter("password", md5password).getSingleResult();
            // Generate authtoken for this session
            String authtoken = MD5.generateTimetoken(
                    conf.getProperty("authtokensalt")
                    + user.getId());

            // Save authtoken to database
            user.setAuthtoken(authtoken);
            user.setLastlogin(LocalDateTime.now());
            this.umh.getUserTransaction().begin();
            this.umh.getEntityManager().merge(user);
            this.umh.getUserTransaction().commit();
            return user;
        } catch (NoResultException ex) {
            throw new UsermanagerException("Unknown username / password combination. Username: " + username + " Password: " + password + " MD5: " + md5password);
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            throw new UsermanagerException("Data access error.");
        }
    }

    @Override
    public boolean performLogout(String username) throws UsermanagerException {
        User user = null;
        try {
            user = this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class)
                    .setParameter("username", username).getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("Could not find user >" + username + "<");
        }
        user.setAuthtoken(null);
        try {
            this.umh.getUserTransaction().begin();
            this.umh.getEntityManager().merge(user);
            this.umh.getUserTransaction().commit();
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            throw new UsermanagerException("Data access error. " + ex.getLocalizedMessage());
        }

        // Local logout is never a global logout
        return false;
    }

    @Override
    public User getUser(String username, User requestor) throws UsermanagerException {
        User user = null;
        try {
            user = this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class).setParameter("username", username).getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("Could not find user >" + username + "<");
        }

        // Add self
        if (user.getUsername().equals(requestor.getUsername())) {
            return user;
        }
        // Return child user if permited
        if (user.getParent() == requestor
                && this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.user", "GETCHILDS")) {
            return user;
        }
        // Return every user if permited
        if (!this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.user", "GETALL")) {
            return user;
        }
        throw new UsermanagerException("You're not allowed to request users data.");
    }

    @Override
    public User getUser(String authtoken) throws UsermanagerException {
        User user;
        try {
            user = this.umh.getEntityManager().createNamedQuery("User.findByAuthtoken", User.class)
                    .setParameter("authtoken", authtoken).getSingleResult();
        } catch (NoResultException ex) {
            return null;
        }
        return user;
    }

    @Override
    public List<User> getUserlist(User requestor) throws UsermanagerException {
        List<User> users = new ArrayList<>();

        // Check if has right for listing all users
        boolean hasAllRight = false;
        if (this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.user", "GETALL")) {
            hasAllRight = true;
        }

        // Get list and check right for every user
        List<User> dbUsers = this.umh.getEntityManager().createNamedQuery("User.findAll", User.class).getResultList();
        if (hasAllRight) {
            // User can list all userdata
            users = dbUsers;
        } else {
            for (User curUser : dbUsers) {
                // Add child users if permited
                if (curUser.getParent() == requestor
                        && this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.user", "GETCHILDS")) {
                    users.add(curUser);
                    continue;
                }
                // Add self
                if (curUser.getUsername().equals(requestor.getUsername())) {
                    users.add(curUser);
                }
            }
        }

        return users;
    }

    @Override
    public User createUser(User user, User creator) throws UsermanagerException {
        // Check if creator has right to create new user
        if (creator != null && user != creator
                && !this.userHasRight(creator.getUsername(), "de.fhbielefeld.scl.smartuser.user", "CREATE")) {
            throw new UsermanagerException("You're not allowed to create users.");
        } else if (!this.userHasRight("*", "de.fhbielefeld.scl.smartuser.user", "CREATE")) {
            throw new UsermanagerException("You're not allowed to create users.");
        }

        // Check if user allready exists
        try {
            this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class)
                    .setParameter("username", user.getUsername())
                    .getSingleResult();
            throw new UsermanagerException("User allready exists");
        } catch (NoResultException ex) {
            // Create new user
        } catch (SecurityException | IllegalStateException ex) {
            throw new UsermanagerException("Could not save user: " + ex.getLocalizedMessage());
        }
        // Set parent
        user.setParent(creator);

        // Check password validity
        if (user.getPassword().length() < 7) {
            throw new UsermanagerException("Password must have at least 7 characters");
        }

        // Create MD5 hash for password
        Configuration conf = this.umh.getConf();
        String md5password = MD5.generateMD5Hash(conf.getProperty("passwordsalt")
                + user.getPassword());
        user.setPassword(md5password);
        if (conf.getProperty("confirm_mail").equalsIgnoreCase("true") && user.getEmail() != null) {
            user.setConfirmed(false);
            //TODO document confirmsalt and confirmMail options
            String confirmToken = MD5.generateMD5Hash(conf.getProperty("confirmsalt")
                    + user.getPassword());
            user.setConfirmToken(confirmToken);
            // Send confirmation mail
            Mailer mailer = new Mailer(conf);
            String subject = conf.getProperty("confirm_subject_" + user.getLang());
            if (subject == null) {
                subject = conf.getProperty("confirm_subject");
            }
            String content = conf.getProperty("confirm_content_" + user.getLang());
            if (content == null) {
                content = conf.getProperty("confirm_content");
            }
            // Insert confirm link
            String link = conf.getProperty("confirm_link") + user.getConfirmToken();
            content = content.replace("{confirm_link}", link);
            content = content.replace("{confirm_token}", user.getConfirmToken());

            try {
                Message sendMsg = new Message("Send confirmation message to >" + user.getEmail() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(sendMsg);
                mailer.send(user.getEmail(), null, subject, content);
            } catch (MailerException ex) {
                Message err = new Message("Could not send confirmation mail to >" + user.getEmail() + "< : " + ex.getLocalizedMessage(), MessageLevel.ERROR);
                Logger.addMessage(err);
                ex.printStackTrace();
                throw new UsermanagerException("Could not create user");
            }
        } else {
            user.setConfirmed(true);
        }

        try {
            this.umh.getUserTransaction().begin();
            this.umh.getEntityManager().persist(user);
            this.umh.getUserTransaction().commit();
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            throw new UsermanagerException("User could not be saved, due to data access error.");
        }
        return user;
    }

    @Override
    public boolean confirmUser(String confirmToken) throws UsermanagerException {

        User cuser = null;
        try {
            cuser = this.umh.getEntityManager().createNamedQuery("User.findByConfirmToken", User.class)
                    .setParameter("confirmToken", confirmToken).getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("Could not find user.");
        }

        try {
            cuser.setConfirmToken(null);
            cuser.setConfirmed(true);
            this.umh.getUserTransaction().begin();
            this.umh.getEntityManager().merge(cuser);
            this.umh.getUserTransaction().commit();
            return true;
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            Message msg = new Message("Could not update user: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(msg);
            throw new UsermanagerException(ex.getLocalizedMessage());
        }
    }

    @Override
    public boolean requestMailLogin(String usermailname) throws UsermanagerException {
        User cuser = null;
        try {
            cuser = this.umh.getEntityManager().createNamedQuery("User.findByEmail", User.class)
                    .setParameter("email", usermailname).getSingleResult();
        } catch (NoResultException ex) {
            // Try find user by username
            try {
                cuser = this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class)
                        .setParameter("username", usermailname).getSingleResult();
            } catch (jakarta.persistence.NoResultException ex1) {
                Message msg = new Message("No user found with username or email >" + usermailname + "< Ok send to prevent name / email fishing", MessageLevel.ERROR);
                Logger.addMessage(msg);
                return true;
            }
        }
        String oneloginToken = null;
        Configuration conf = this.umh.getConf();

        // Create token
        oneloginToken = this.randomString();
        // Save token
        try {
            cuser.setOneloginToken(oneloginToken);
            this.umh.getUserTransaction().begin();
            this.umh.getEntityManager().merge(cuser);
            this.umh.getUserTransaction().commit();
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            Message msg = new Message("Could not set onelogintoken to user: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(msg);
            throw new UsermanagerException(ex.getLocalizedMessage());
        }

        // Send confirmation mail
        Mailer mailer = new Mailer(conf);
        //TODO document create_subject options
        String subject = conf.getProperty("maillogin_subject_" + cuser.getLang());
        if (subject == null) {
            subject = conf.getProperty("maillogin_subject");
        }
        String content = conf.getProperty("maillogin_content_" + cuser.getLang());
        if (content == null) {
            content = conf.getProperty("maillogin_content");
        }
        // Insert confirm link
        String link = conf.getProperty("maillogin_link") + oneloginToken;
        content = content.replace("{maillogin_link}", link);

        try {
            mailer.send(cuser.getEmail(), null, subject, content);
        } catch (MailerException ex) {
            Message msg = new Message("Could not send login mail: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(msg);
            ex.printStackTrace();
            throw new UsermanagerException("Could not send login mail");
        }
        return true;
    }

    @Override
    public User performMailLogin(String onelogintoken) throws UsermanagerException {
        User cuser = null;
        Configuration conf = this.umh.getConf();
        // Check if a one time login credential was given
        try {
            cuser = this.umh.getEntityManager().createNamedQuery("User.findByOneloginToken", User.class)
                    .setParameter("oneloginToken", onelogintoken).getSingleResult();
            // Generate authtoken for this session
            String authtoken = MD5.generateTimetoken(
                    conf.getProperty("authtokensalt")
                    + cuser.getId());
            // Save authtoken to database
            cuser.setAuthtoken(authtoken);
            cuser.setOneloginToken(null);
            this.umh.getUserTransaction().begin();
            this.umh.getEntityManager().merge(cuser);
            this.umh.getUserTransaction().commit();
        } catch (NoResultException ex) {
            throw new UsermanagerException("User not found");
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            Message msg = new Message("Could not update user: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(msg);
            throw new UsermanagerException(ex.getLocalizedMessage());
        }
        return cuser;
    }

    @Override
    public User updateUser(User user, User requestor) throws UsermanagerException {
        // Check if there is a requestor
        if (requestor == null) {
            throw new UsermanagerException("Could not update user: Not authorised.");
        }
        // Get existing user
        User existingUser = null;
        try {
            existingUser = this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class)
                    .setParameter("username", user.getUsername())
                    .getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("User to update was not found");
        } catch (SecurityException | IllegalStateException ex) {
            throw new UsermanagerException("Could not update user: " + ex.getLocalizedMessage());
        }

        // Check right
        if (!existingUser.getUsername().equals(requestor.getUsername())
                && !(existingUser.getParent() == requestor
                && this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.user", "UPDATECHILDS"))
                && !this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.user", "UPDATEALL")) {
            throw new UsermanagerException("You're not allowed to update users data.");
        }

        // Create MD5 hash for password
        Configuration conf = this.umh.getConf();
        // Only update password if there is a new one given
        if (user.getPassword() != null) {
            String md5password = MD5.generateMD5Hash(conf.getProperty("passwordsalt")
                    + user.getPassword());
            user.setPassword(md5password);
        } else {
            user.setPassword(existingUser.getPassword());
        }
        try {
            this.umh.getUserTransaction().begin();
            user.setId(existingUser.getId());
            if (user.getCity() == null) {
                user.setCity(existingUser.getCity());
            }
            if (user.getConfirmToken() == null) {
                user.setConfirmToken(existingUser.getConfirmToken());
            }
            if (user.getCountry() == null) {
                user.setCountry(existingUser.getCountry());
            }
            if (user.getEmail() == null) {
                user.setEmail(existingUser.getEmail());
            }
            if (user.getFirstname() == null) {
                user.setFirstname(existingUser.getFirstname());
            }
            if (user.getHouseno() == null) {
                user.setHouseno(user.getHouseno());
            }
            if (user.getLang() == null) {
                user.setLang(user.getLang());
            }
            user.setLastlogin(existingUser.getLastlogin());
            if (user.getLastname() == null) {
                user.setLastname(existingUser.getLastname());
            }
            user.setParent(existingUser.getParent());
            if (user.getPassword() == null) {
                user.setPassword(existingUser.getPassword());
            }
            if (user.getPhone() == null) {
                user.setPhone(existingUser.getPhone());
            }
            if (user.getStreet() == null) {
                user.setStreet(existingUser.getStreet());
            }
            if (user.getUsername() == null) {
                user.setUsername(existingUser.getUsername());
            }
            user.setAuthtoken(existingUser.getAuthtoken());
            user.setConfirmed(existingUser.isConfirmed());
            this.umh.getEntityManager().merge(user);
            this.umh.getUserTransaction().commit();
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            throw new UsermanagerException("User could not be saved, due to data access error.");
        }
        return user;
    }

    @Override
    public void deleteUser(String username, User requestor) throws UsermanagerException {
        // Get existing user
        User existingUser = null;
        EntityManager em = this.umh.getEntityManager();
        try {
            existingUser = em.createNamedQuery("User.findByUsername", User.class)
                    .setParameter("username", username)
                    .getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("User to delete was not found");
        } catch (SecurityException | IllegalStateException ex) {
            throw new UsermanagerException("Could not delete user: " + ex.getLocalizedMessage());
        }

        // Check right
        if (!existingUser.getUsername().equals(username)
                && !(existingUser.getParent() == requestor
                && this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.user", "DELETECHILDS"))
                && !this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.user", "DELETEALL")) {
            throw new UsermanagerException("You're not allowed to delete this user.");
        }

        // Delete user
        throw new UnsupportedOperationException("Delete users is not possible!");
        //TODO jemand intelligents finden, der diese Methode implementieren kann
//        em.createNativeQuery("DELETE FROM smartuser.user WHERE id=" + existingUser.getId()).executeUpdate();   
//        try {
//            this.umh.getUserTransaction().begin();
//            em.merge(existingUser);
//            em.remove(existingUser);
//            this.umh.getUserTransaction().commit();
//        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
//            throw new UsermanagerException("User could not be deleted, due to data access error.");
//        }
    }

    @Override
    public Resource createResource(String resource, User requestor) throws UsermanagerException {
        // Create resource
        Resource res = new Resource();
        res.setPath(resource);
        try {
            this.umh.getUserTransaction().begin();
            this.umh.getEntityManager().persist(res);
            this.umh.getUserTransaction().commit();
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex1) {
            throw new UsermanagerException("Could not create resource >" + resource + "<");
        }
        return res;
    }

    @Override
    public List<Resource> userListResources(String username, String resource, String action) throws UsermanagerException {
        // Check if user exists
        try {
            this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class)
                    .setParameter("username", username).getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("User >" + username + "< not found.");
        }

        // Get user rights
        List<UserRight> foundRights = this.userListRights(username, resource, action);
        List<Resource> resources = new ArrayList<>();
        for (UserRight curRight : foundRights) {
            Resource curRes = curRight.getResource();
            if (!resources.contains(curRes)) {
                resources.add(curRes);
            }
        }
        return resources;
    }

    @Override
    public void deleteResource(String resource, User requestor) throws UsermanagerException {
        try {
            this.umh.getUserTransaction().begin();
            EntityManager em = this.umh.getEntityManager();
            // Find resource
            Resource res = em.createNamedQuery("Resource.findByPath", Resource.class).setParameter("path", resource).getSingleResult();
            // Find rights
            List<UserRight> resRights = em.createNamedQuery("UserRight.findByResource", UserRight.class).setParameter("resource", res).getResultList();
            for (UserRight curRight : resRights) {
                em.remove(curRight);
            }
            em.remove(res);
            this.umh.getUserTransaction().commit();
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex1) {
            throw new UsermanagerException("Could not create resource >" + resource + "<");
        }
    }

    @Override
    public boolean userHasRight(String username, String resource, String action) throws UsermanagerException {
        User user;
        List<Resource> resources;
        // Check if user exists
        try {
            user = this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class)
                    .setParameter("username", username).getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("User >" + username + "< not found.");
        }

        // Check if resource exists
        resources = findMatchingResources(resource);
        if (resources == null || resources.isEmpty()) {
            throw new UsermanagerException("Resource >" + resource + "< not found.");
        }

        CriteriaBuilder criteriaBuilder = this.umh.getEntityManager().getCriteriaBuilder();
        CriteriaQuery<UserRight> criteriaQuery = criteriaBuilder.createQuery(UserRight.class);
        Root<UserRight> rightRoot = criteriaQuery.from(UserRight.class);

        // Search for right on any of the found resources
        Predicate predResources = null;
        for (Resource curRes : resources) {
            Predicate predCurRes = criteriaBuilder.equal(rightRoot.get("resource"), curRes);
            if (predResources == null) {
                predResources = predCurRes;
            } else {
                predResources = criteriaBuilder.or(predResources, predCurRes);
            }
        }

        // Search for right on action or all-action
        Predicate predAction = criteriaBuilder.equal(rightRoot.get("action"), action);
        Predicate predAllAction = criteriaBuilder.equal(rightRoot.get("action"), "*");
        Predicate predActions = criteriaBuilder.or(predAction, predAllAction);

        // Search only for user
        Predicate predUser = criteriaBuilder.equal(rightRoot.get("user"), user);
        Predicate predAllUser = criteriaBuilder.equal(rightRoot.get("user"), 1L);
        Predicate predUsers = criteriaBuilder.or(predUser, predAllUser);
        Predicate finalPredicate = criteriaBuilder.and(predResources, predActions, predUsers);
        criteriaQuery.where(finalPredicate);
        List<UserRight> userrights = this.umh.getEntityManager().createQuery(criteriaQuery).getResultList();

        if (!userrights.isEmpty()) {
            return true;
        }

        String msg = "UsermanagerLocal: Did not find right for user >"
                + user.getUsername() + "< on >" + resource + "<";
        msg += " with action >" + action + "<";
        Message dmsg = new Message(msg, MessageLevel.INFO);
        Logger.addDebugMessage(dmsg);

        // Create log entry for failed access
        try {
            this.umh.getEntityManager().createNamedQuery(
                    "AccessFail.findByResourceActionUser", AccessFail.class)
                    .setParameter("resource", resource)
                    .setParameter("action", action)
                    .setParameter("user", user)
                    .getSingleResult();
        } catch (NoResultException ex) {
            try {
                AccessFail af = new AccessFail(resource, action, user);
                this.umh.getUserTransaction().begin();
                this.umh.getEntityManager().persist(af);
                this.umh.getUserTransaction().commit();
            } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex1) {
                Message dmsg2 = new Message("Could not create AccessFail entry for >"
                        + user.getUsername() + "< on >" + resource
                        + "< with action >" + action + "<", MessageLevel.ERROR);
                Logger.addMessage(dmsg2);
            }
        }

        return false;
    }

    @Override
    public List<UserRight> userListRights(String username, String resource, String action) throws UsermanagerException {
        User user;
        // Check if user exists
        try {
            user = this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class)
                    .setParameter("username", username).getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("User >" + username + "< not found.");
        }

        // Get users rights when nor resource or action given
        if (resource == null && action == null) {
            return this.umh.getEntityManager().createNamedQuery("UserRight.findByUser", UserRight.class)
                    .setParameter("user", user)
                    .getResultList();
        }

        if (action == null) {
            // Check if there are rights on datasets in scope of the given resource
            List<UserRight> foundRights = this.umh.getEntityManager().createNamedQuery("UserRight.findLikeResource", UserRight.class)
                    .setParameter("resource", resource)
                    .setParameter("user", user)
                    .getResultList();
            return foundRights;
        }

        // Check if there are rights on datasets in scope of the given resource (with given action)
        List<UserRight> foundRights = this.umh.getEntityManager().createNamedQuery("UserRight.findLikeResourceAction", UserRight.class)
                .setParameter("resource", resource)
                .setParameter("action", action)
                .setParameter("user", user)
                .getResultList();

        // Check if there are rights on datasets in scope of the given resource (with *-action)
        if (foundRights.isEmpty()) {
            foundRights = this.umh.getEntityManager().createNamedQuery("UserRight.findLikeResourceAction", UserRight.class)
                    .setParameter("resource", resource)
                    .setParameter("action", "*")
                    .setParameter("user", user)
                    .getResultList();
        }

        return foundRights;
    }

    @Override
    public boolean grantRight(String username, String resource, String action, User requestor) throws UsermanagerException {
        // Check rights for this operation
        if (!this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.userright", "GRANT")) {
            throw new UsermanagerException("You're not allowed to grant rights to users.");
        }

        // Get user
        User user;
        try {
            user = this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class)
                    .setParameter("username", username)
                    .getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("User >" + username + "< not found.");
        }

        // Check if user has right
        if (this.userHasRight(username, resource, action)) {
            return true;
        }
        // Check if resource already exists, if yes use, if not create
        Resource res;
        try {
            res = this.umh.getEntityManager()
                    .createNamedQuery("Resource.findByPath", Resource.class)
                    .setParameter("path", resource)
                    .getSingleResult();
        } catch (NoResultException ex) {
            res = this.createResource(resource, requestor);
        }
        // Create right
        UserRight right;
        right = new UserRight();
        right.setUser(user);
        right.setResource(res);
        right.setAction(action);
        try {
            this.umh.getUserTransaction().begin();
            this.umh.getEntityManager().persist(right);
            this.umh.getUserTransaction().commit();
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex1) {
            throw new UsermanagerException("Right could not be saved, due to data access error.");
        }

        return true;
    }

    @Override
    public boolean revokeRight(String username, String resource, String action, User requestor) throws UsermanagerException {
        // Check rights for this operation
        if (!this.userHasRight(requestor.getUsername(), "de.fhbielefeld.scl.smartuser.userright", "GRANT")) {
            throw new UsermanagerException("You're not allowed to revoke rights from users.");
        }

        User user;
        List<Resource> resources;
        UserRight right;

        try {
            user = this.umh.getEntityManager().createNamedQuery("User.findByUsername", User.class).getSingleResult();
        } catch (NoResultException ex) {
            throw new UsermanagerException("User >" + username + "< not found.");
        }

        // Check if resource already exists
        try {
            resources = findMatchingResources(resource);
        } catch (NoResultException ex) {
            throw new UsermanagerException("Resource does not exists");
        }
        // Check if right already exists
        try {
            right = this.umh.getEntityManager().createNamedQuery("Right.findByResourceAndAction", UserRight.class)
                    .setParameter("resource", resources)
                    .setParameter("action", action)
                    .setParameter("user", user).getSingleResult();
            this.umh.getEntityManager().remove(right);
        } catch (NoResultException ex) {
            // Nothing todo
        }

        return true;
    }

    /**
     * Finds an existing resource that matches the given resource. Means, it
     * finds also star-resources that includes a given resource
     *
     * @param resource Path to resource
     * @return Resources list
     */
    private List<Resource> findMatchingResources(String resource) {
        CriteriaBuilder criteriaBuilder = this.umh.getEntityManager().getCriteriaBuilder();
        CriteriaQuery<Resource> criteriaQuery = criteriaBuilder.createQuery(Resource.class);
        Root<Resource> resRoot = criteriaQuery.from(Resource.class);

        // Add global resource
        Predicate predGlobal = criteriaBuilder.equal(resRoot.get("path"), "*");

        // Search for star-resources
        String[] resparts = resource.split("\\.");
        String path = "";
        for (int i = 0; i < resparts.length; i++) {
            path = path + resparts[i];
            // Only on the last level the * can be omitted
            if (i == resparts.length - 1) {
                Predicate lastPred = criteriaBuilder.equal(resRoot.get("path"), path);
                predGlobal = criteriaBuilder.or(predGlobal, lastPred);
            }
            path += ".";
            // Create predicate
            Predicate curPred = criteriaBuilder.equal(resRoot.get("path"), path + "*");
            predGlobal = criteriaBuilder.or(predGlobal, curPred);
        }

        criteriaQuery.where(predGlobal);
        List<Resource> resources = this.umh.getEntityManager().createQuery(criteriaQuery).getResultList();
        return resources;
    }

    @Override
    public List<User> getParentUsers() {
        List<User> users = this.umh.getEntityManager().createNamedQuery("User.findParentAccounts", User.class).getResultList();

        return users;
    }

    @Override
    public long countUsers() throws UsermanagerException {
        return this.umh.getEntityManager().createNamedQuery("User.count", Long.class).getSingleResult();
    }
}
