package de.fhbielefeld.smartuser.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.ResponseListBuilder;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartuser.application.Usermanager;
import de.fhbielefeld.smartuser.application.UsermanagerException;
import de.fhbielefeld.smartuser.application.UsermanagerHandler;
import de.fhbielefeld.smartuser.persistence.jpa.User;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.UserTransaction;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import de.fhbielefeld.smartuser.config.Configuration;
import de.fhbielefeld.smartuser.persistence.jpa.Resource;
import java.time.LocalDateTime;
import javax.naming.NamingException;
import jakarta.ws.rs.Consumes;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.HttpHeaders;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;

/**
 * REST Service for managing resources
 *
 * @author Florian Fehring
 */
@Path("resources")
@Tag(name = "Resources", description = "Create and delete resources")
public class ResourceResource {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager em;

    @jakarta.annotation.Resource
    private UserTransaction utx;

    private Map<String, User> users = new HashMap<>();
    private LocalDateTime usersts;
    private Map<String,Exception> lastExceptions = new HashMap<>();

    public ResourceResource() {
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
    @Operation(summary = "Creates a new resource",
            description = "Creates a new resource stored in database")
    @APIResponse(
            responseCode = "200",
            description = "Primary key of the new created resource.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create userright: Because of ... \"]}"))
    public Response create(
            @RequestBody(
                    description = "Resource to create with path",
                    required = true) Resource resource,
            @Context HttpHeaders headers) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        // Check neccessery variables
        if (resource.getPath() == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage(">path< is missing.");
            return rob.toResponse();
        }

        Configuration conf = new Configuration();
        UsermanagerHandler umh = new UsermanagerHandler(this.em, this.utx, conf);

        // Get user by authtoken for check if user is logged in
        String reqtoken = null;
        Map<String, Cookie> cookies = headers.getCookies();
        if (cookies != null && !cookies.isEmpty() && cookies.containsKey("authtoken")) {
            reqtoken = cookies.get("authtoken").getValue();
        }

        Map<String, Exception> exceptions = new HashMap<>();
        boolean reqFound = false;
        do {
            Usermanager um;
            try {
                um = umh.getUsermanager();
            } catch (UsermanagerException ex) {
                exceptions.put("Usermanager init", ex);
                continue;
            }

            try {
                User requestor = null;
                // Get authenticated user
                if (requestor == null) {
                    requestor = this.getUserByAuthtoken(reqtoken, um);
                }
                // Break if requestor is not idetified
                if (requestor == null) {
                    continue;
                }
                reqFound = true;
                Message msg = new Message("Try create users right with " + um.getClass().getSimpleName(), MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                um.createResource(reqtoken, requestor);
                rob.setStatus(Response.Status.CREATED);
            } catch (UsermanagerException | UnsupportedOperationException ex) {
                exceptions.put(um.getClass().getSimpleName(), ex);
                Message msg = new Message("Create users right with >"
                        + um.getClass().getSimpleName() + " failed with message: "
                        + ex.getLocalizedMessage() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } while (umh.setNextUsermanagerActive());
        umh.resetActiveUsermanager();

        // Create error on failed requestor right
        if (!reqFound) {
            umh.resetActiveUsermanager();
            rob.setStatus(Response.Status.FORBIDDEN);
            rob.addErrorMessage("You have no right to create a resource.");
        }

        // Get information about error if no userlist could be recived
        for (Entry<String, Exception> curEx : exceptions.entrySet()) {
            if (curEx.getValue().getClass().equals(UsermanagerException.class)) {
                if (curEx.getValue().getLocalizedMessage().contains("not allowed")) {
                    rob.setStatus(Response.Status.FORBIDDEN);
                } else {
                    rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                }
                rob.addErrorMessage("Could not create users right: " + curEx.getValue().getLocalizedMessage());
                return rob.toResponse();
            } else if (curEx.getValue().getClass().equals(UnsupportedOperationException.class)) {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Could not create users right: " + curEx.getValue().getLocalizedMessage());
                return rob.toResponse();
            }
        }

        return rob.toResponse();
    }

    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List resources",
            description = "Lists all resources accessable to the requestor")
    @APIResponse(
            responseCode = "200",
            description = "Resources requested",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"records\" : [{\"id\" :  1, \"path\" : \"my.path.to.resource.1\"}]}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get resources: Because of ... \"]}"))
    public Response list(
            @Parameter(description = "Username") @QueryParam("username") String username,
            @Parameter(description = "Resource the user want to access") @QueryParam("resource") String resource,
            @Parameter(description = "Action the user want to perform") @QueryParam("action") String action,
            @Parameter(description = "Users authtoken") @QueryParam("authtoken") String authtoken,
            @Parameter(description = "App token") @QueryParam("apptoken") String apptoken,
            @Context HttpHeaders headers) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        Configuration conf = new Configuration();
        UsermanagerHandler umh = new UsermanagerHandler(this.em, this.utx, conf);

        User requestor = this.findRequestingUser(headers, umh, apptoken);
        // Create error on failed requestor right
        if (requestor == null) {
            rob.setStatus(Response.Status.FORBIDDEN);
            rob.addErrorMessage("You have no right to list resources");
            return rob.toResponse();
        }

        Usermanager um = requestor.getManageingum();
        Message msg = new Message("Try get user rights with " + um.getClass().getSimpleName(), MessageLevel.INFO);
        Logger.addDebugMessage(msg);
        List<Resource> resources;
        try {
            resources = um.userListResources(username, resource, action);
        } catch (UsermanagerException ex) {
            rob.addException(ex);
            rob.addErrorMessage("Could not get users rights: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }

        // Get information about error if no userlist could be recived
        for (Entry<String, Exception> curEx : this.lastExceptions.entrySet()) {
            if (curEx.getValue().getClass().equals(UsermanagerException.class)) {
                if (curEx.getValue().getLocalizedMessage().contains("not allowed")) {
                    rob.setStatus(Response.Status.FORBIDDEN);
                } else {
                    rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                }
                rob.addErrorMessage("Could not create users right: " + curEx.getValue().getLocalizedMessage());
                return rob.toResponse();
            } else if (curEx.getValue().getClass().equals(UnsupportedOperationException.class)) {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Could not create users right: " + curEx.getValue().getLocalizedMessage());
                return rob.toResponse();
            }
        }

        // Write list of rights
        ResponseListBuilder rlb = new ResponseListBuilder();
        for (Resource curRes : resources) {
            ResponseObjectBuilder crob = new ResponseObjectBuilder();
            crob.add("path", curRes.getPath());
            rlb.add(crob);
        }
        rob.add("list", rlb);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @DELETE
    @Operation(summary = "Delete a resource",
            description = "Deletes a resource")
    @APIResponse(
            responseCode = "200",
            description = "Resource deleted")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete resource: Because of ... \"]}"))
    public Response delete(@Parameter(description = "Resource that should be deleted") @QueryParam("resource") String resource,
            @Parameter(description = "Users authtoken") @QueryParam("authtoken") String authtoken,
            @Parameter(description = "App token") @QueryParam("apptoken") String apptoken,
            @Context HttpHeaders headers) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        Configuration conf = new Configuration();
        UsermanagerHandler umh = new UsermanagerHandler(this.em, this.utx, conf);

        User requestor = this.findRequestingUser(headers, umh, apptoken);
        // Create error on failed requestor right
        if (requestor == null) {
            rob.setStatus(Response.Status.FORBIDDEN);
            rob.addErrorMessage("You have no right to delete this resource.");
        }
        
        Usermanager um = requestor.getManageingum();
        Message msg = new Message("Try delete user rights with " + um.getClass().getSimpleName(), MessageLevel.INFO);
        Logger.addDebugMessage(msg);
        try {
            // Revoke right
            um.deleteResource(resource, requestor);
        } catch (UsermanagerException ex) {
            rob.addException(ex);
            rob.addErrorMessage("Could not get users rights: " + ex.getLocalizedMessage());
            return rob.toResponse();
        }
        
        // Get information about error if no userlist could be recived
        for (Entry<String, Exception> curEx : this.lastExceptions.entrySet()) {
            if (curEx.getValue().getClass().equals(UsermanagerException.class)) {
                if (curEx.getValue().getLocalizedMessage().contains("not allowed")) {
                    rob.setStatus(Response.Status.FORBIDDEN);
                } else {
                    rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                }
                rob.addErrorMessage("Could not create users right: " + curEx.getValue().getLocalizedMessage());
                return rob.toResponse();
            } else if (curEx.getValue().getClass().equals(UnsupportedOperationException.class)) {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Could not create users right: " + curEx.getValue().getLocalizedMessage());
                return rob.toResponse();
            }
        }

        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    private User findRequestingUser(HttpHeaders headers, UsermanagerHandler umh, String apptoken) {
        // Get user by authtoken for check if user is logged in
        String reqtoken = null;
        Map<String, Cookie> cookies = headers.getCookies();
        if (cookies != null && !cookies.isEmpty() && cookies.containsKey("authtoken")) {
            reqtoken = cookies.get("authtoken").getValue();
        }

        User requestor = null;
        do {
            Usermanager um;
            try {
                um = umh.getUsermanager();
            } catch (UsermanagerException ex) {
                this.lastExceptions.put("Usermanager init", ex);
                continue;
            }

            try {
                // Get requesting app
                if (apptoken != null) {
                    requestor = this.getUserByAuthtoken(apptoken, um);
                }
                // Get authenticated user
                if (requestor == null) {
                    requestor = this.getUserByAuthtoken(reqtoken, um);
                }
                // Break if requestor is not idetified
                if (requestor == null) {
                    break;
                }
                requestor.setManageingum(um);
            } catch (UsermanagerException | UnsupportedOperationException ex) {
                this.lastExceptions.put(um.getClass().getSimpleName(), ex);
                Message msg = new Message("Try list user rights with >"
                        + um.getClass().getSimpleName() + " failed with message: "
                        + ex.getLocalizedMessage() + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } while (umh.setNextUsermanagerActive());
        umh.resetActiveUsermanager();
        return requestor;
    }

    /**
     * Get a user by authtoken
     *
     * @param authtoken Authtoken that identifies the user
     * @param umh Usermanager to use
     * @return User or null if not found
     */
    private User getUserByAuthtoken(String authtoken, Usermanager um) throws UsermanagerException {
        // Clear cache after 30 mins
        if (this.usersts != null && this.usersts.isBefore(LocalDateTime.now().minusMinutes(30))) {
            this.users = new HashMap<>();
            this.usersts = LocalDateTime.now();
        }
        // Try get user from cache
        User user = this.users.get(authtoken);
        if (user != null) {
            return user;
        }
        user = um.getUser(authtoken);
        this.users.put(authtoken, user);
        return user;
    }
}
