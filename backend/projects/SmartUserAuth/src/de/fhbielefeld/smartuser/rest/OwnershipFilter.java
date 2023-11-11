package de.fhbielefeld.smartuser.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import de.fhbielefeld.smartuser.annotations.SmartUserAuth;
import de.fhbielefeld.smartuser.config.Configuration;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.stream.JsonParser;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerResponseContext;
import jakarta.ws.rs.container.ContainerResponseFilter;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.io.IOException;
import java.io.StringReader;
import java.util.Map;
import javax.naming.NamingException;

/**
 * This filter excepts calls to the REST api and checks if the requested source is owned by the requestor
 * 
 * @author Florian Fehring
 */
@Provider
@SmartUserAuth
public class OwnershipFilter implements ContainerResponseFilter {

    @Override
    public void filter(ContainerRequestContext requestContext, ContainerResponseContext responseContext) throws IOException {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        Configuration conf = new Configuration();
        String authmode = conf.getProperty("authmode");
        if (authmode == null || authmode.equals("off")) {
            Message msga = new Message("Authentication not activated", MessageLevel.INFO);
            Logger.addDebugMessage(msga);
            return;
        }
        try {
            // Get general parameter
            String moduleName = moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            String path = requestContext.getUriInfo().getPath();
            path = path.replaceAll("/", ".");
            String resource = "rest." + moduleName + "." + path;
            String action = requestContext.getMethod();
            // Print request information if debugmode
            Message dmsg = new Message("Createing response for resource >" + resource
                    + "< with action >" + action + "<", MessageLevel.INFO);
            Logger.addDebugMessage(dmsg);

            // Get authtoken
            String authtoken = null;
            Map<String, Cookie> cookies = requestContext.getCookies();
            if (cookies != null && !cookies.isEmpty() && cookies.containsKey("authtoken")) {
                authtoken = cookies.get("authtoken").getValue();
            }
            // If there is no authtoken
            if (authtoken == null) {
                responseContext.setStatus(401);
                return;
            }

            this.filterWithREST(conf, authtoken, resource, action, requestContext, responseContext);
            
            // Creation of rights should be normally everytime possible over REST
//            switch (authmode) {
//                case "jdbc":
//                    this.filterWithJDBC(conf, authtoken, resource, action, requestContext, responseContext);
//                    break;
//                case "rest":
//                    this.filterWithREST(conf, authtoken, resource, action, requestContext, responseContext);
//                    break;
//                default:
//                    Message msg = new Message("Unknown authmode >" + authmode + "<", MessageLevel.ERROR);
//                    Logger.addDebugMessage(msg);
//            }
        } catch (NamingException ex) {
            Message emsg = new Message("Could not get application name: " + ex.getExplanation(), MessageLevel.ERROR);
            Logger.addMessage(emsg);
        }
    }

    private void filterWithJDBC(Configuration conf, String authtoken, String resource, String action, ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
        // Handling for deleting sets
        if (requestContext.getMethod().equals("DELETE") && responseContext.getStatus() == 200) {

        } else if (responseContext.getStatus() == 201) {

        }
    }

    private void filterWithREST(Configuration conf, String authtoken, String resource, String action, ContainerRequestContext requestContext, ContainerResponseContext responseContext) {
        String server = conf.getProperty("smartuser.url");
        // No need to to something if there is no usermanagement
        if (server == null) {
            return;
        }

        // Auto correct smartuser subpath if missing
        if (!server.contains("smartuser")) {
            server += "/smartuser";
        }
        if (!server.startsWith("http")) {
            server = requestContext.getUriInfo().getBaseUri() + server;
        }

        // Handling for deleting sets
        if (requestContext.getMethod().equals("DELETE") && responseContext.getStatus() == 200) {
            this.deleteResourceREST(conf, authtoken, resource, action, requestContext, responseContext, server);
        } else if (responseContext.getStatus() == 201) {
            // Creator get full rights on dataset
            this.createRightREST(conf, authtoken, resource, "*", requestContext, responseContext, server);
        }
    }

    private void createRightREST(Configuration conf, String authtoken, String resource, String action, ContainerRequestContext requestContext, ContainerResponseContext responseContext, String server) {
        // Print request information if debugmode
        Message dmsg = new Message("Creating right for resource >" + resource
                + "< with action >" + action + "<", MessageLevel.INFO);
        Logger.addDebugMessage(dmsg);

        String responseText = (String) responseContext.getEntity();
        // According to the original TreeQL spec CREATE datasets delivers no json
        // but only the created id. Therefore warnings can only be added if
        // SmartData runs with spec.version = 2020fhbi, than json is returned
        if (responseText.startsWith("{")) {
            JsonParser parserQ = Json.createParser(new StringReader(responseText));
            parserQ.next();
            JsonObject responseObj = parserQ.getObject();
            // Cannot create a right if there is no identified user createing
            if (authtoken == null) {
                JsonArray warnings = responseObj.getJsonArray("warnings");
                JsonArrayBuilder newwarns;
                if (warnings == null) {
                    newwarns = Json.createArrayBuilder();
                } else {
                    newwarns = Json.createArrayBuilder(warnings);
                }
                newwarns.add("No right created because creation was not done by logged in user.");
                responseObj.put("warnings", newwarns.build());

                responseContext.setEntity(responseObj);
                return;
            }
        } else {
            // Try use response as dataset_id (could be a number or a string)
            resource += "." + responseText;
            // No right could be created but there is no way to inform user (original TreeQL spec)
            if (authtoken == null) {
                return;
            }
        }

        // Build user right
        JsonObjectBuilder builder = Json.createObjectBuilder();
        builder.add("resource", resource);
        builder.add("action", action);
        builder.add("authtoken", authtoken);
        String apptoken = conf.getProperty("smartuser.apptoken");
        if (apptoken != null) {
            builder.add("apptoken", apptoken);
        }
        JsonObject dataObject = builder.build();
        Entity<String> dataset = Entity.json(dataObject.toString());

        // Send right to SmartUser
        WebTarget webTarget = WebTargetCreator.createWebTarget(server, "userrights");
        Response response = webTarget.request(MediaType.APPLICATION_JSON).post(dataset);
        if (response.getStatus() != 201) {
            String responseCreation = response.readEntity(String.class);
            Message msg = new Message("UserRight creation returned >"
                    + response.getStatus() + "< with >" + responseCreation + "<",
                    MessageLevel.INFO);
            Logger.addDebugMessage(msg);
            ResponseObjectBuilder rob = new ResponseObjectBuilder();
            switch (response.getStatus()) {
                case 401:
                    rob.setStatus(Response.Status.UNAUTHORIZED);
                    break;
                case 403:
                    rob.setStatus(Response.Status.FORBIDDEN);
                    break;
                case 404:
                    rob.setStatus(Response.Status.NOT_FOUND);
                    rob.addErrorMessage("Interface >" + server
                            + "< for rights checking was not found");
                    break;
                default:
                    rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                    rob.addErrorMessage(responseCreation);
                    break;
            }

            throw new WebApplicationException(rob.toResponse());
        }
    }

    private void deleteResourceREST(Configuration conf, String authtoken, String resource, String action, ContainerRequestContext requestContext, ContainerResponseContext responseContext, String server) {
        // Print request information if debugmode
        Message dmsg = new Message("Deleteing resource >" + resource + "<", MessageLevel.INFO);
        Logger.addDebugMessage(dmsg);

        // Check rights at SmartUser REST interface
        WebTarget webTarget = WebTargetCreator.createWebTarget(server, "resources");
        WebTarget target = webTarget
                .queryParam("resource", resource)
                .queryParam("authtoken", authtoken)
                .queryParam("apptoken", conf.getProperty("smartuser.apptoken"));
        Response response = null;
        try {
            response = target.request(MediaType.APPLICATION_JSON).delete();
        } catch (ProcessingException pex) {
            Message emsg1 = new Message("ProcessingException occured on request. Error: " + pex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(emsg1);
        }
        if (response != null && response.getStatus() != 200) {
            Message emsg1 = new Message("Error revoking right >" + action + "< on resource >" + resource + "<", MessageLevel.ERROR);
            Logger.addMessage(emsg1);
        }
    }

    private void revokeRightREST(Configuration conf, String authtoken, String resource, String action, ContainerRequestContext requestContext, ContainerResponseContext responseContext, String server) {
        // Print request information if debugmode
        Message dmsg = new Message("Creating right for resource >" + resource
                + "< with action >" + action + "<", MessageLevel.INFO);
        Logger.addDebugMessage(dmsg);

        // Check rights at SmartUser REST interface
        WebTarget webTarget = WebTargetCreator.createWebTarget(server, "userrights");
        WebTarget target = webTarget
                .queryParam("resource", resource)
                .queryParam("action", action)
                .queryParam("authtoken", authtoken)
                .queryParam("apptoken", conf.getProperty("smartuser.apptoken"));
        Response response = null;
        try {
            response = target.request(MediaType.APPLICATION_JSON).delete();
        } catch (ProcessingException pex) {
            Message emsg1 = new Message("ProcessingException occured on request. Error: " + pex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(emsg1);
        }
        if (response != null && response.getStatus() != 200) {
            Message emsg1 = new Message("Error revoking right >" + action + "< on resource >" + resource + "<", MessageLevel.ERROR);
            Logger.addMessage(emsg1);
        }
    }
}
