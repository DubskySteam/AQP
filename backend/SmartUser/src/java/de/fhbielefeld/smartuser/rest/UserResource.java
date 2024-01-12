package de.fhbielefeld.smartuser.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartuser.application.Usermanager;
import de.fhbielefeld.smartuser.application.UsermanagerException;
import de.fhbielefeld.smartuser.application.UsermanagerHandler;
import de.fhbielefeld.smartuser.persistence.jpa.User;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.UserTransaction;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import de.fhbielefeld.smartuser.config.Configuration;
import java.util.ArrayList;
import java.util.List;
import javax.naming.NamingException;
import jakarta.ws.rs.Consumes;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.Map;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.HttpHeaders;
import de.fhbielefeld.smartuser.rest.proxies.DeleteUserInformation;
import jakarta.ws.rs.PUT;

/**
 * REST Service for user management
 *
 * @author Nils Leunig
 */
@Path("user")
@Tag(name = "User", description = "User creation and identifing")
public class UserResource {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    public UserResource() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Logger.getInstance("SmartUser", moduleName);
            Logger.setDebugMode(true);
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@SmartUserAuth Right is checked in this method, because user can allways 
    // access his own data
    @Operation(summary = "Creates a new user",
            description = "Creates a new user stored in database")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created dataset.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create user: Because of ... \"]}"))
    public Response create(
            @Parameter(description = "Data of the user to create") User user,
            @Context HttpHeaders headers) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        Configuration conf = new Configuration();
        
        // Check if required data exist
        if(user.getUsername() == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage(">username< is missing.");
            return rob.toResponse();
        }
        if(user.getPassword() == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage(">password< is missing.");
            return rob.toResponse();
        }
        
        if(!user.isPrivacy_accepted()) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("You must accept the privacy statement.");
            return rob.toResponse();
        }
        
        if(!user.isTerms_accepted()) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("You must accept the terms.");
            return rob.toResponse();
        }
        
        UsermanagerHandler umhandle = new UsermanagerHandler(this.em, this.utx, conf);
        // Get active usermanager
        Usermanager um;
        try {
            um = umhandle.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager is not ready
        if (!umhandle.isReady()) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager is not ready: " + umhandle.getStatusMessage());
            return rob.toResponse();
        }

        // Get requesting user
        User creator = this.getRequestingUser(headers, umhandle);

        Exception lastEx = null;
        do {
            try {
                Message msg = new Message("Try create user with " + um.getClass().getSimpleName(), MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                user = umhandle.getUsermanager().createUser(user, creator);
                rob.setStatus(Response.Status.CREATED);
                rob.add(user);
            } catch (UsermanagerException | UnsupportedOperationException ex) {
                lastEx = ex;
                Message msg = new Message("Create user with >"
                        + um.getClass().getSimpleName() + " failed with message: "
                        + ex.getLocalizedMessage() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } while (umhandle.setNextUsermanagerActive());
        umhandle.resetActiveUsermanager();

        // Get information about error if no user could be created
        if (user.getId() == null && lastEx != null) {
            if (lastEx.getClass().equals(UsermanagerException.class)) {
                if (lastEx.getLocalizedMessage().contains("User allready exists")) {
                    rob.setStatus(Response.Status.NOT_ACCEPTABLE);
                    rob.addErrorMessage(lastEx.getLocalizedMessage());
                } else {
                    rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                    rob.addErrorMessage("Could not create user: " + lastEx.getLocalizedMessage());
                }
                return rob.toResponse();

            }
            if (lastEx.getClass().equals(UnsupportedOperationException.class)) {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Could not create user: " + lastEx.getLocalizedMessage());
                return rob.toResponse();
            }
        }

        return rob.toResponse();
    }

    @GET
    @Path("count")
    @Produces(MediaType.APPLICATION_JSON)
//    @SmartUserAuth
    @Operation(summary = "Count users",
            description = "Count the number of registered users")
    @APIResponse(
            responseCode = "200",
            description = "Number of users",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"count\" : 1}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get users: Because of ... \"]}"))
    public Response count() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        Configuration conf = new Configuration();

        UsermanagerHandler uconf = new UsermanagerHandler(this.em, this.utx, conf);
        Usermanager um;
        try {
            um = uconf.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager could not be loaded
        if (!uconf.isReady()) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Usermanager is not ready: " + uconf.getStatusMessage());
            return rob.toResponse();
        }

        // Request registred users
        int users = 0;
        Exception lastEx = null;
        do {
            try {
                um = uconf.getUsermanager();
                users += um.countUsers();
                break;
            } catch (UnsupportedOperationException | UsermanagerException ex) {
                Message msg = new Message(um.getClass().getSimpleName()
                        + ": Could not get admin users"
                        + ex.getLocalizedMessage(),
                        MessageLevel.ERROR);
                Logger.addDebugMessage(msg);
                lastEx = ex;
            }
        } while (uconf.setNextUsermanagerActive());
        uconf.resetActiveUsermanager();

        if (users == 0 && lastEx != null) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not access users. " + lastEx.getLocalizedMessage());
            return rob.toResponse();
        }

        rob.add("users", users);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    //@SmartUserAuth Right is checked in this method, because user can allways 
    // access his own data
    @Operation(summary = "Lists users",
            description = "Lists all users from database.")
    @APIResponse(
            responseCode = "200",
            description = "Users requested",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"Mustermann\"}]}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get users: Because of ... \"]}"))
    public Response list(@Context HttpHeaders headers) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        Configuration conf = new Configuration();
        UsermanagerHandler umhandle = new UsermanagerHandler(this.em, this.utx, conf);
        // Get active usermanager
        Usermanager um;
        try {
            um = umhandle.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager is not ready
        if (!umhandle.isReady()) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager is not ready: " + umhandle.getStatusMessage());
            return rob.toResponse();
        }

        // Get requsting user
        User requestor = this.getRequestingUser(headers, umhandle);

        List<User> users = new ArrayList<>();
        // Without login no access
        if (requestor == null) {
            rob.setStatus(Response.Status.OK);
            rob.add("records", users);
            rob.addWarningMessage("You are not logged in");
            return rob.toResponse();
        }

        Exception lastEx = null;
        do {
            try {
                um = umhandle.getUsermanager();
                Message msg = new Message("Try list users with " + um.getClass().getSimpleName(), MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                users = um.getUserlist(requestor);
                lastEx = null;
            } catch (UsermanagerException | UnsupportedOperationException ex) {
                lastEx = ex;
                Message msg = new Message("Try list users with >"
                        + um.getClass().getSimpleName() + " failed with message: "
                        + ex.getLocalizedMessage() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } while (umhandle.setNextUsermanagerActive());
        umhandle.resetActiveUsermanager();

        // Get information about error if no userlist could be recived
        if ((users == null || users.isEmpty()) && lastEx != null) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not get list of users. " + lastEx.getLocalizedMessage());
            return rob.toResponse();
        }

        // Write list of users to response
        rob.add("records", users);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @GET
    @Path("{username}")
    @Produces(MediaType.APPLICATION_JSON)
    //@SmartUserAuth Right is checked in this method, because user can allways 
    // access his own data
    @Operation(summary = "Gets users data",
            description = "Returns the users personal data")
    @APIResponse(
            responseCode = "200",
            description = "Users data",
            content = @Content(
                    mediaType = "application/json"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get userdata: Because of ... \"]}"))
    @APIResponse(
            responseCode = "403",
            description = "Not authorized",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" User is not authorized to get users data\"]}"))
    public Response get(
            @Parameter(description = "Username") @PathParam("username") String username,
            @Context HttpHeaders headers) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Load usermanager handler
        Configuration conf = new Configuration();
        UsermanagerHandler umhandle = new UsermanagerHandler(this.em, this.utx, conf);
        Usermanager um;
        try {
            um = umhandle.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager could not be loaded
        if (!umhandle.isReady()) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Usermanager is not ready: " + umhandle.getStatusMessage());
            return rob.toResponse();
        }

        // Get requesting user
        User requestor = this.getRequestingUser(headers, umhandle);
        // Check if user is logged in
        if (requestor == null) {
            rob.setStatus(Response.Status.UNAUTHORIZED);
            rob.addErrorMessage("You are not logged in");
            return rob.toResponse();
        }
        // Request own data if no username is given
        if (username == null) {
            username = requestor.getUsername();
        }

        // Request login from usermanager
        User user = null;
        do {
            try {
                um = umhandle.getUsermanager();
                user = um.getUser(username, requestor);
            } catch (UnsupportedOperationException | UsermanagerException ex) {
                Message msg = new Message(um.getClass().getSimpleName()
                        + ": Could not get user data for user >"
                        + username + "<", MessageLevel.ERROR);
                Logger.addDebugMessage(msg);
            }
            if (user != null) {
                break;
            }
        } while (umhandle.setNextUsermanagerActive());
        umhandle.resetActiveUsermanager();

        if (user == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("User not found");
            return rob.toResponse();
        }
        rob = this.addUserToResponseObject(rob, user);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    /**
     * Allows the login.Updates the authtoken that can be used in further calls
     * to identify the user without giving the password again. Authtokens maybe
     * expire after a while.
     *
     * @param userdata User object created from recived json, with username and
     * password if given in json.
     * @return Returns the users personal data and the current active authtoken
     */
    @POST
    @Path("performLogin")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Performs a login",
            description = "Performs a login with the given userdata")
    @APIResponse(
            responseCode = "200",
            description = "User succsessfull identified",
            content = @Content(
                    mediaType = "application/json"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not indentify user: Because of ... \"]}"))
    public Response performLogin(
            @Parameter(description = "Data of the user to login") User userdata) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        Configuration conf = new Configuration();

        UsermanagerHandler uconf = new UsermanagerHandler(this.em, this.utx, conf);
        Usermanager um;
        try {
            um = uconf.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager could not be loaded
        if (!uconf.isReady()) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Usermanager is not ready: " + uconf.getStatusMessage());
            return rob.toResponse();
        }

        // Request login from usermanager
        User user = null;
        do {
            try {
                um = uconf.getUsermanager();
                user = um.performLogin(userdata.getUsername(), userdata.getPassword());
            } catch (UnsupportedOperationException | UsermanagerException ex) {
                Message msg = new Message(um.getClass().getSimpleName()
                        + ": Could not login user >"
                        + userdata.getUsername() + "<: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
                Logger.addDebugMessage(msg);
            }
            if (user != null) {
                break;
            }
        } while (uconf.setNextUsermanagerActive());
        uconf.resetActiveUsermanager();

        if (user == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("User not found or credatials are wrong.");
            return rob.toResponse();
        }
        
        if(user.isConfirmed()) {
            rob.add("confirmed",true);
        }
        if(user.isPrivacy_accepted()) {
            rob.add("privacy_accepted",true);
        }
        if(user.isTerms_accepted()) {
            rob.add("terms_accepted",true);
        }
        
        rob = this.addUserToResponseObject(rob, user);
        rob.add("authtoken", user.getAuthtoken());
        // Keep login for 12 hours
        rob.addCookie("authtoken", user.getAuthtoken(), 43200);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    /**
     * Performs the logout for the given user
     *
     * @param username username that should be logged out
     * @return Status OK on succsess
     */
    @GET
    @Path("performLogout")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Perform logout",
            description = "Logs the user out and invalidates the authtoken.")
    @APIResponse(
            responseCode = "200",
            description = "User logged out")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not log out user: Because of ... \"]}"))
    public Response performLogout(
            @Parameter(description = "Name of the user to logout", required = true) @QueryParam("username") String username) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        Configuration conf = new Configuration();

        UsermanagerHandler uconf = new UsermanagerHandler(this.em, this.utx, conf);
        Usermanager um;
        try {
            um = uconf.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }
        // Logout on all usermanagers
        boolean loggedout = false;
        do {
            try {
                um.performLogout(username);
                rob.addCookie("authtoken", "loggedout", 1);
                rob.setStatus(Response.Status.OK);
                loggedout = true;
            } catch (UnsupportedOperationException | UsermanagerException ex) {
                Message msg = new Message("Could not logout user >"
                        + username + "< at "
                        + um.getClass().getSimpleName(), MessageLevel.WARNING);
                Logger.addDebugMessage(msg);
            }
        } while (uconf.setNextUsermanagerActive());
        
        if(!loggedout) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("Could not logout user >" + username + "< user my be not found.");
        }
        
        return rob.toResponse();
    }

    /**
     * Lists all available parentUsers in the system.
     *
     * @return List of all available parentUsers
     */
    @GET
    @Path("list/parents")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Lists all parent users",
            description = "Lists all parend users (usergroups) of the given user.")
    @APIResponse(
            responseCode = "200",
            description = "Datasets requested",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"Max Mustermann\"}]}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get users: Because of ... \"]}"))
    public Response parentList() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        Configuration conf = new Configuration();

        UsermanagerHandler uconf = new UsermanagerHandler(this.em, this.utx, conf);
        // Get active usermanager
        Usermanager um;
        try {
            um = uconf.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager is not ready
        if (!uconf.isReady()) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager is not ready: " + uconf.getStatusMessage());
            return rob.toResponse();
        }

        List<User> users = new ArrayList<>();
        Exception lastEx = null;
        do {
            try {
                Message msg = new Message("Try list parents with " + um.getClass().getSimpleName(), MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                users = uconf.getUsermanager().getParentUsers();
            } catch (UsermanagerException | UnsupportedOperationException ex) {
                lastEx = ex;
                Message msg = new Message("Try list parents with >"
                        + um.getClass().getSimpleName() + " failed with message: "
                        + ex.getLocalizedMessage() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } while (uconf.setNextUsermanagerActive());
        uconf.resetActiveUsermanager();

        // Get information about error if no userlist could be recived
        if (users == null && lastEx != null) {
            if (lastEx.getClass().equals(UsermanagerException.class
            )) {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Could not get list of parents. " + lastEx.getLocalizedMessage());
                return rob.toResponse();

            }
            if (lastEx.getClass().equals(UnsupportedOperationException.class
            )) {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Could not get List of parents" + lastEx.getLocalizedMessage());
                return rob.toResponse();
            }
        }

        // Write list of users to response
        rob.add("parentList", users);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @GET
    @Path("confirm")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Confirms a user",
            description = "Confirms a user with his token")
    @APIResponse(
            responseCode = "200",
            description = "User confirmed")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not confirm user: Because of ... \"]}"))
    public Response confirm(@Parameter(description = "Confirmtoken", required = true) @QueryParam("confirmToken") String confirmToken) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        Configuration conf = new Configuration();

        UsermanagerHandler uconf = new UsermanagerHandler(this.em, this.utx, conf);
        // Get active usermanager
        Usermanager um;
        try {
            um = uconf.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager is not ready
        if (!uconf.isReady()) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager is not ready: " + uconf.getStatusMessage());
            return rob.toResponse();
        }

        boolean confirmed = false;
        Exception lastEx = null;
        do {
            try {
                um = uconf.getUsermanager();
            } catch (UsermanagerException ex) {
                lastEx = ex;
                continue;
            }
            try {
                Message msg = new Message("Try confirm with " + um.getClass().getSimpleName(), MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                confirmed = um.confirmUser(confirmToken);
            } catch (UsermanagerException | UnsupportedOperationException ex) {
                lastEx = ex;
                Message msg = new Message("Try confirm user with >"
                        + um.getClass().getSimpleName() + " failed with message: "
                        + ex.getLocalizedMessage() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } while (uconf.setNextUsermanagerActive());
        uconf.resetActiveUsermanager();

        if (!confirmed) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not confirm user");
        } else if (confirmed) {
            rob.setStatus(Response.Status.OK);
        }

        return rob.toResponse();
    }

    @GET
    @Path("requestmaillogin")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Sends the user a mail with login possibility",
            description = "Sends the user a mail with login possibility")
    @APIResponse(
            responseCode = "200",
            description = "Mail was send")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not confirm user: Because of ... \"]}"))
    public Response requestMailLogin(@Parameter(description = "Users name or email", required = true) @QueryParam("usernamemail") String usernamemail) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        Configuration conf = new Configuration();

        UsermanagerHandler uconf = new UsermanagerHandler(this.em, this.utx, conf);
        // Get active usermanager
        Usermanager um;
        try {
            um = uconf.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager is not ready
        if (!uconf.isReady()) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager is not ready: " + uconf.getStatusMessage());
            return rob.toResponse();
        }

        Exception lastEx = null;
        do {
            try {
                um = uconf.getUsermanager();
            } catch (UsermanagerException ex) {
                lastEx = ex;
                continue;
            }
            try {
                Message msg = new Message("Request mailLogin with " + um.getClass().getSimpleName(), MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                uconf.getUsermanager().requestMailLogin(usernamemail);
            } catch (UsermanagerException | UnsupportedOperationException ex) {
                lastEx = ex;
                Message msg = new Message("Request mailLogin user with >"
                        + um.getClass().getSimpleName() + " failed with message: "
                        + ex.getLocalizedMessage() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } while (uconf.setNextUsermanagerActive());
        uconf.resetActiveUsermanager();

        // Do not report errors to the public here
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }
    
    @GET
    @Path("performmaillogin")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Logs in the user with a one time token",
            description = "Logs in the user with a one time token")
    @APIResponse(
            responseCode = "200",
            description = "User was logged in")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not confirm user: Because of ... \"]}"))
    public Response performMailLogin(@Parameter(description = "One time token", required = true) @QueryParam("onetimetoken") String onetimetoken) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        Configuration conf = new Configuration();

        UsermanagerHandler uconf = new UsermanagerHandler(this.em, this.utx, conf);
        // Get active usermanager
        Usermanager um;
        try {
            um = uconf.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager is not ready
        if (!uconf.isReady()) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager is not ready: " + uconf.getStatusMessage());
            return rob.toResponse();
        }

        User user = null;
        Exception lastEx = null;
        do {
            try {
                um = uconf.getUsermanager();
            } catch (UsermanagerException ex) {
                lastEx = ex;
                continue;
            }
            try {
                Message msg = new Message("Try login user with onetime token on " + um.getClass().getSimpleName(), MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                user = uconf.getUsermanager().performMailLogin(onetimetoken);
            } catch (UsermanagerException | UnsupportedOperationException ex) {
                lastEx = ex;
                Message msg = new Message("Login user with onetime token user with >"
                        + um.getClass().getSimpleName() + " failed with message: "
                        + ex.getLocalizedMessage() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } while (uconf.setNextUsermanagerActive());
        uconf.resetActiveUsermanager();

        if (user != null) {
            rob = this.addUserToResponseObject(rob, user);
            rob.add("authtoken", user.getAuthtoken());
            // Keep login for 12 hours
            rob.addCookie("authtoken", user.getAuthtoken(), 43200);
        }
        // Do not report errors to the public here
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    /**
     * Gets the user that made the request from authtoken cookie.
     *
     * @param headers RequestContext for accessing cookie data
     * @param umhandle UsermanagerHandler for accessin usermanagers
     * @return User or null if user is not logged in
     */
    private User getRequestingUser(HttpHeaders headers, UsermanagerHandler umhandle) {
        // Get authtoken
        String authtoken = null;
        Map<String, Cookie> cookies = headers.getCookies();

        if (cookies != null && !cookies.isEmpty() && cookies.containsKey("authtoken")) {
            authtoken = cookies.get("authtoken").getValue();
        }
        // Without authtoken no access to userdata
        if (authtoken == null) {
            return null;
        }

        // Request login from usermanager
        User user = null;
        Usermanager um = null;
        do {
            try {
                um = umhandle.getUsermanager();
                user = um.getUser(authtoken);
            } catch (UnsupportedOperationException | UsermanagerException ex) {
                Message msg = new Message(um.getClass().getSimpleName()
                        + ": Could not get logged in user", MessageLevel.ERROR);
                Logger.addDebugMessage(msg);
            }
            if (user != null) {
                break;
            }
        } while (umhandle.setNextUsermanagerActive());
        umhandle.resetActiveUsermanager();

        return user;
    }

    private ResponseObjectBuilder addUserToResponseObject(ResponseObjectBuilder rob, User user) {
        rob.add("id", user.getId());
        rob.add("username", user.getUsername());
        if (user.getEmail() != null) {
            rob.add("email", user.getEmail());
        }
        if (user.getFirstname() != null) {
            rob.add("firstname", user.getFirstname());
        }
        if (user.getLastname() != null) {
            rob.add("lastname", user.getLastname());
        }
        if (user.getStreet() != null) {
            rob.add("street", user.getStreet());
        }
        if (user.getHouseno() != null) {
            rob.add("houseno", user.getHouseno());
        }
        if (user.getZipcode() != null) {
            rob.add("zipcode", user.getZipcode());
        }
        if (user.getCity() != null) {
            rob.add("city", user.getCity());
        }
        if (user.getCountry() != null) {
            rob.add("country", user.getCountry());
        }
        if (user.getPhone() != null) {
            rob.add("phone", user.getPhone());
        }
        if (user.getLang() != null) {
            rob.add("language", user.getLang());
        }
        return rob;
    }

    @POST
    @Path("delete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@SmartUserAuth Right is checked in this method, because user can allways 
    // access his own data
    @Operation(summary = "Delete a user",
            description = "Delete user stored in database")
    @APIResponse(
            responseCode = "200",
            description = "Deleteds userusername.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "Testmeier"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete user: Because of ... \"]}"))
    public Response delete(
            @Parameter(description = "Username of user to delete, passwort of requestor") DeleteUserInformation delinfo,
            @Context HttpHeaders headers) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        Configuration conf = new Configuration();
        UsermanagerHandler umhandle = new UsermanagerHandler(this.em, this.utx, conf);

        Usermanager um;
        try {
            um = umhandle.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager could not be loaded
        if (!umhandle.isReady()) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Usermanager is not ready: " + umhandle.getStatusMessage());
            return rob.toResponse();
        }

        // Get requsting user
        User requestor = this.getRequestingUser(headers, umhandle);
        if(requestor == null) {
            rob.setStatus(Response.Status.UNAUTHORIZED);
            rob.addErrorMessage("Users can only deleted when logged in.");
            return rob.toResponse();
        }
        
        try {
            // Identify requesting user
            um.performLogin(requestor.getUsername(), delinfo.getRequestorpassword());
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.FORBIDDEN);
            rob.addErrorMessage("User >" + requestor.getUsername() + "< not proven.");
            return rob.toResponse();
        }

        // Try delete
        boolean deleted = false;
        Exception lastEx = null;
        do {
            try {
                um = umhandle.getUsermanager();
                um.deleteUser(delinfo.getUsername(), requestor);
                deleted = true;
            } catch (UnsupportedOperationException | UsermanagerException ex) {
                Message msg = new Message(um.getClass().getSimpleName()
                        + ": Could not delete user >"
                        + delinfo.getUsername() + "<", MessageLevel.ERROR);
                Logger.addDebugMessage(msg);
                lastEx = ex;
            }
        } while (umhandle.setNextUsermanagerActive());
        umhandle.resetActiveUsermanager();
        if (deleted) {
            rob.setStatus(Response.Status.OK);
        } else if (lastEx != null) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage(lastEx.getLocalizedMessage());
        }

        return rob.toResponse();
    }
    
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    //@SmartUserAuth Right is checked in this method, because user can allways 
    // access his own data
    @Operation(summary = "Updates a new user",
            description = "Updates a user stored in database")
    @APIResponse(
            responseCode = "200",
            description = "Primary key of the updated dataset.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not update user: Because of ... \"]}"))
    public Response update(
            @Parameter(description = "Data of the user to update") User user,
            @Context HttpHeaders headers) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        Configuration conf = new Configuration();
        
        // Check if required data exist
        if(user.getUsername() == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage(">username< is missing.");
            return rob.toResponse();
        }
        
        UsermanagerHandler umhandle = new UsermanagerHandler(this.em, this.utx, conf);
        // Get active usermanager
        Usermanager um;
        try {
            um = umhandle.getUsermanager();
        } catch (UsermanagerException ex) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager can't be build: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Report if usermanager is not ready
        if (!umhandle.isReady()) {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("Usermanager is not ready: " + umhandle.getStatusMessage());
            return rob.toResponse();
        }

        // Get requesting user
        User requestor = this.getRequestingUser(headers, umhandle);
        if(requestor == null) {
            rob.setStatus(Response.Status.UNAUTHORIZED);
            rob.addErrorMessage("Could not update users data. Youre not logged in.");
            return rob.toResponse();
        }
        
        Exception lastEx = null;
        do {
            try {
                Message msg = new Message("Try update user with " + um.getClass().getSimpleName(), MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                // Update user informations
                umhandle.getUsermanager().updateUser(user, requestor);
                rob.setStatus(Response.Status.OK);
                rob.add(user);
            } catch (UsermanagerException | UnsupportedOperationException ex) {
                lastEx = ex;
                Message msg = new Message("Create user with >"
                        + um.getClass().getSimpleName() + " failed with message: "
                        + ex.getLocalizedMessage() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } while (umhandle.setNextUsermanagerActive());
        umhandle.resetActiveUsermanager();

        // Get information about error if no user could be created
        if (user.getId() == null && lastEx != null) {
            if (lastEx.getClass().equals(UsermanagerException.class)) {
                if (lastEx.getLocalizedMessage().contains("User allready exists")) {
                    rob.setStatus(Response.Status.NOT_ACCEPTABLE);
                    rob.addErrorMessage(lastEx.getLocalizedMessage());
                } else {
                    rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                    rob.addErrorMessage("Could not create user: " + lastEx.getLocalizedMessage());
                }
                return rob.toResponse();

            }
            if (lastEx.getClass().equals(UnsupportedOperationException.class)) {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Could not create user: " + lastEx.getLocalizedMessage());
                return rob.toResponse();
            }
        }

        return rob.toResponse();
    }
}
