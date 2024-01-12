package de.fhbielefeld.smartuser.application;

import de.fhbielefeld.smartuser.persistence.jpa.Resource;
import de.fhbielefeld.smartuser.persistence.jpa.User;
import de.fhbielefeld.smartuser.persistence.jpa.UserRight;
import java.util.List;
import java.util.Random;

/**
 * Defines basic methods for registering, identifiing and saveing user.
 *
 * @author ffehring
 */
public abstract class Usermanager {

    protected UsermanagerHandler umh;

    public Usermanager(UsermanagerHandler umh) throws UsermanagerException {
        this.umh = umh;
    }

    /**
     * Tryies to identify an user.
     *
     * @param username Users username
     * @param password Users password
     * @return TblUser object if login was succsessfull
     * @throws UsermanagerException Thrown on identification error
     */
    public abstract User performLogin(String username, String password) throws UsermanagerException;

    /**
     * Performs an logout to the given user.
     *
     * @param username TblUser to logout
     * @return True if logout is global (e.g. logout on webservice)
     * @throws UsermanagerException
     */
    public abstract boolean performLogout(String username) throws UsermanagerException;

    /**
     * Gets users data
     *
     * @param username username
     * @param requestor User that requests the data
     * @return User object holding users data
     * @throws UsermanagerException Thrown if userdata could not recived
     */
    public abstract User getUser(String username, User requestor) throws UsermanagerException;

    /**
     * Gets an user with its authtoken.
     *
     * @param authtoken
     * @return User or null, if no user was found
     * @throws UsermanagerException
     */
    public abstract User getUser(String authtoken) throws UsermanagerException;

    /**
     * Returns an collection of all available users knwon to this service, and
     * visible to the requesting user.
     *
     * @param requestor User requesting the list
     * @return List of users visible to requesting user
     * @throws UsermanagerException
     */
    public abstract List<User> getUserlist(User requestor) throws UsermanagerException;

    /**
     * Create user
     *
     * @param user User object containing new users data
     * @param creator User that created the user
     * @return Created user maybe with a set id
     * @throws UsermanagerException Thrown if userdata could not be saved
     */
    public abstract User createUser(User user, User creator) throws UsermanagerException;

    /**
     * Confirms a unconfirmed user
     *
     * @param confirmToken Token that was created for confirmation
     * @return true if user could be confirmed
     * @throws UsermanagerException
     */
    public abstract boolean confirmUser(String confirmToken) throws UsermanagerException;
    
    /**
     * Sends an email with login possibility to the user or logs the user in
     * useing a one time token
     *
     * @param usermailname Users email, username or logintoken
     * @return true if mail was send
     * @throws UsermanagerException
     */
    public abstract boolean requestMailLogin(String usermailname) throws UsermanagerException;

    /**
     * Performs the login for the user on base of the one time token previous send by mail
     * 
     * @param onelogintoken One time token to login
     * @return User that was logged in
     * @throws UsermanagerException 
     */
    public abstract User performMailLogin(String onelogintoken) throws UsermanagerException;
    
    /**
     * Saves userdata.
     *
     * @param user TblUser object containing new users data
     * @param requestor User requesting the save operation
     * @return Created user maybe with a set id
     * @throws UsermanagerException Thrown if userdata could not be saved
     */
    public abstract User updateUser(User user, User requestor) throws UsermanagerException;

    /**
     * Deletes a user
     * 
     * @param username  Users name
     * @param requestor Requesting user
     * 
     * @throws UsermanagerException Thrown if user could not be deleted
     */
    public abstract void deleteUser(String username, User requestor) throws UsermanagerException;
    
    /**
     * Creates a new resource
     * 
     * @param resource  Name / Path of the resource to create
     * @param requestor User requesting the creation
     * @return Resource stored in database
     * @throws UsermanagerException 
     */
    public abstract Resource createResource(String resource, User requestor) throws UsermanagerException;
    
    /**
     * List all resources the user has access to.
     * List can be narrowed by giving one or booth of the optional parameters (resources and action)
     * 
     * @param username Users name
     * @param resource  A part of the resouce path to get all resources from
     * @param action    Action the user should have on the resource
     * @return  List of resources the user has access too
     * @throws UsermanagerException 
     */
    public abstract List<Resource> userListResources(String username, String resource, String action) throws UsermanagerException;
    
    /**
     * Delete a resource
     * 
     * @param resource  Name / Path of the resource to delete
     * @param requestor User requesting the deletion
     * @throws UsermanagerException 
     */
    public abstract void deleteResource(String resource, User requestor) throws UsermanagerException;
            
    /**
     * Checks if the user has the right to access an resource and perform the
     * given action.
     *
     * @param username Username of the user to check rights for
     * @param resource Resource the user want to access
     * @param action Action the user want to perform
     * @return True if the user has the right, false otherwise
     * @throws UsermanagerException
     */
    public abstract boolean userHasRight(String username, String resource, String action) throws UsermanagerException;

    /**
     * Get a list of all rights specified. List can be narrowed by giving the
     * optional resources and / or action.
     *
     * @param username Username of the user to check rights for
     * @param resource Resource the user want to access (optional)
     * @param action Action the user want to perform (optional)
     * @return List of UserRight
     * @throws UsermanagerException
     */
    public abstract List<UserRight> userListRights(String username, String resource, String action) throws UsermanagerException;

    /**
     * Grants an right on an specific resource to an user.
     *
     * @param username TblUser name, who gets the right
     * @param resource Resource path to grant right on
     * @param action Action to grant right on
     * @param requestor User requesting the operation
     * @return True if right was granted
     * @throws UsermanagerException
     */
    public abstract boolean grantRight(String username, String resource, String action, User requestor) throws UsermanagerException;

    /**
     * Revokes an right on an specific resource and action from user.
     *
     * @param username Users name, where to revoke right
     * @param resource Resource path where to revoke right
     * @param action Action to revoke right on
     * @param requestor User requestion the revoke
     * @return True if right was revoked
     * @throws UsermanagerException
     */
    public abstract boolean revokeRight(String username, String resource, String action, User requestor) throws UsermanagerException;

    /**
     * Returns a list of all users that are parent users (user groups)
     *
     * @return Available parent users (user groups)
     * @throws UsermanagerException
     */
    public abstract List<User> getParentUsers() throws UsermanagerException;

    /**
     * Returns the number of available users
     *
     * @return Number of registred users
     * @throws de.fhbielefeld.smartuser.application.UsermanagerException
     */
    public abstract long countUsers() throws UsermanagerException;

    /**
     * Create a random alphanumerical string
     * 
     * @return random string
     */
    public String randomString() {
        int leftLimit = 48; // numeral '0'
        int rightLimit = 122; // letter 'z'
        int targetStringLength = 23;
        Random random = new Random();

        String generatedString = random.ints(leftLimit, rightLimit + 1)
                .filter(i -> (i <= 57 || i >= 65) && (i <= 90 || i >= 97))
                .limit(targetStringLength)
                .collect(StringBuilder::new, StringBuilder::appendCodePoint, StringBuilder::append)
                .toString();

        return generatedString;
    }
}
