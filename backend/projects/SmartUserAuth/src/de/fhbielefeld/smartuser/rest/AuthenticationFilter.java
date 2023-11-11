package de.fhbielefeld.smartuser.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import java.io.IOException;
import de.fhbielefeld.smartuser.config.Configuration;
import de.fhbielefeld.smartuser.annotations.SmartUserAuth;
import de.fhbielefeld.smartuser.db.DatabaseAccess;
import de.fhbielefeld.smartuser.securitycontext.SmartPrincipal;
import de.fhbielefeld.smartuser.securitycontext.SmartPrincipalRight;
import de.fhbielefeld.smartuser.securitycontext.SmartSecurityContext;
import jakarta.annotation.Priority;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.stream.JsonParser;
import jakarta.ws.rs.Priorities;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.container.ContainerRequestFilter;
import jakarta.ws.rs.core.Cookie;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;
import java.io.StringReader;
import java.util.Map;
import java.util.concurrent.Semaphore;
import javax.naming.NamingException;

/**
 * AuthenticationFilter for filtering requests and checking access rights.
 *
 * @author ffehring
 */
@Provider
@SmartUserAuth
@Priority(Priorities.AUTHENTICATION)
public class AuthenticationFilter implements ContainerRequestFilter {

    private static final Semaphore sem = new Semaphore(1);
    private Response.Status restStatus = null;

    @Override
    public void filter(ContainerRequestContext requestContext) throws IOException {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        Configuration conf = new Configuration();
        String authmode = conf.getProperty("authmode");
        if (authmode == null || authmode.equals("off")) {
            Message msga = new Message("Authentication not activated", MessageLevel.INFO);
            Logger.addDebugMessage(msga);
            return;
        }
        try {
            sem.acquire();
            // Get general parameter
            String moduleName = moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            String path = requestContext.getUriInfo().getPath();
            path = path.replaceAll("/", ".");
            String resource = "rest." + moduleName + "." + path;
            String action = requestContext.getMethod();
            // Print request information if debugmode
            Message dmsg = new Message("Accessing resource >" + resource
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
                rob.setStatus(Response.Status.UNAUTHORIZED);
                requestContext.abortWith(rob.toResponse());
                sem.release();
                return;
            }

            // Check for rights on cache
            SmartPrincipalRight cacheright = RightsCache.getInstance().get(authtoken + "/" + resource + "/" + action);
            if (cacheright != null) {
                this.createSecurityContext(requestContext, cacheright);
                sem.release();
                return;
            }

            // Check if user exists
            Long userid = null;
            switch (authmode) {
                case "jdbc":
                    userid = findUserWithJDBC(conf, authtoken);
                    if (userid == null) {
                        rob.setStatus(Response.Status.UNAUTHORIZED);
                        requestContext.abortWith(rob.toResponse());
                        sem.release();
                        return;
                    }
                    break;
                case "rest":
                    break;
                default:
                    Message msg = new Message("Unknown authmode >" + authmode + "<", MessageLevel.ERROR);
                    Logger.addDebugMessage(msg);
            }

            SmartPrincipalRight right = null;
            switch (authmode) {
                case "jdbc":
                    right = this.filterWithJDBC(conf, authtoken, resource, action);
                    break;
                case "rest":
                    right = this.filterWithREST(conf, authtoken, resource, action, requestContext);
                    break;
                default:
                    Message msg = new Message("Unknown authmode >" + authmode + "<", MessageLevel.ERROR);
                    Logger.addDebugMessage(msg);
            }
            // No right found
            if (right == null) {
                if (this.restStatus != null) {
                    rob.setStatus(this.restStatus);
                } else {
                    rob.setStatus(Response.Status.FORBIDDEN);
                }
                requestContext.abortWith(rob.toResponse());
            } else {
                this.createSecurityContext(requestContext, right);
            }
        } catch (NamingException ex) {
            Message emsg = new Message("Could not get application name: " + ex.getExplanation(), MessageLevel.ERROR);
            Logger.addMessage(emsg);
        } catch (InterruptedException ex) {
            Message emsg = new Message("Require semaphore interrupted: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(emsg);
        } finally {
            sem.release();
        }
    }

    private Long findUserWithJDBC(Configuration conf, String authtoken) {
        DatabaseAccess dba = new DatabaseAccess(conf);
        return dba.getUserid(authtoken);
    }

    private SmartPrincipalRight filterWithJDBC(Configuration conf, String authtoken, String resource, String action) {
        DatabaseAccess dba = new DatabaseAccess(conf);
        String username = dba.getUsername(authtoken);
        // Check special right
        if (dba.hasRight(authtoken, resource, action)) {
            String rightsJSON = "{\"list\": [{\"path\": \"" + resource + "\", \"action\": \"" + action + "\"}]}";
            return RightsCache.getInstance().addRights(username, authtoken, rightsJSON);
        }
        // Get rights on sets of source
        String rightsJSON = dba.listRights(authtoken, resource, action);
        if (rightsJSON != null) {
            return RightsCache.getInstance().addRights(username, authtoken, rightsJSON);
        }
        return null;
    }

    private SmartPrincipalRight filterWithREST(Configuration conf, String authtoken, String resource, String action, ContainerRequestContext requestContext) {
        String server = conf.getProperty("smartuser.url");
        if (server == null) {
            Message msg = new Message("Authentication not activated >smartuser.url< entry not in configuration >" + conf.getFileName() + "<", MessageLevel.INFO);
            Logger.addDebugMessage(msg);
            return null;
        }

        // Auto correct smartuser subpath if missing
        if (!server.contains("smartuser")) {
            server += "/smartuser";
        }
        if (!server.startsWith("http")) {
            server = requestContext.getUriInfo().getBaseUri() + server;
        }

        try {
            String moduleName = moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            String requestid = moduleName + "_" + System.nanoTime();
            // Check rights at SmartUser REST interface
            WebTarget webTarget = WebTargetCreator.createWebTarget(server, "userrights");
            WebTarget target = webTarget
                    .queryParam("resource", resource)
                    .queryParam("action", action)
                    .queryParam("authtoken", authtoken)
                    .queryParam("apptoken", conf.getProperty("smartuser.apptoken"))
                    .queryParam("requestid", requestid);
            Response response = null;
            String responseText = null;
            try {
                Message msg = new Message("Send request: " + requestid, MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                response = target.request(MediaType.APPLICATION_JSON).get();
                responseText = response.readEntity(String.class);
            } catch (ProcessingException pex) {
                Message emsg1 = new Message("ProcessingException occured on request: " + requestid + " Error: " + pex.getLocalizedMessage(), MessageLevel.ERROR);
                Logger.addMessage(emsg1);
                return null;
            }
            // Get users name from userright check
            JsonParser parser = Json.createParser(new StringReader(responseText));
            parser.next();
            JsonObject responseObj = parser.getObject();
            // Report identification errors
            JsonArray errormsgs = responseObj.getJsonArray("errors");
            if (errormsgs != null) {
                String firsterr = errormsgs.getJsonString(0).getString();
                if (firsterr.contains("not logged in")) {
                    Message loginmsg = new Message("User >" + authtoken + "< is currently not logged in.", MessageLevel.INFO);
                    Logger.addDebugMessage(loginmsg);
                } else {
                    Message chkerr = new Message("Error checking access right: " + firsterr, MessageLevel.ERROR);
                    Logger.addDebugMessage(chkerr);
                }
                return null;
            }
            String username = responseObj.getString("username");
            if (response.getStatus() == 200) {
                SmartPrincipalRight right = RightsCache.getInstance().addRight(username, authtoken, resource, action);
                return right;
            } else {
                // Check the status and decide if a test on single set rights should be done
                Message msg = new Message("Authentification returned >"
                        + response.getStatus() + "< with >" + responseText + "<",
                        MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                boolean setCheck = false;
                switch (response.getStatus()) {
                    case 401:
                        this.restStatus = Response.Status.UNAUTHORIZED;
                        break;
                    case 403:
                        setCheck = true;
                        this.restStatus = Response.Status.FORBIDDEN;
                        break;
                    case 404:
                        this.restStatus = Response.Status.NOT_FOUND;
                        break;
                    default:
                }
                if (!setCheck) {
                    return null;
                }
                // Check rights for datasets at SmartUser REST interface
                WebTarget webTarget2 = WebTargetCreator.createWebTarget(server, "userrights/list");
                WebTarget target2 = webTarget2
                        .queryParam("resource", resource)
                        .queryParam("action", action)
                        .queryParam("authtoken", authtoken)
                        .queryParam("apptoken", conf.getProperty("smartuser.apptoken"));
                Response response2 = target2.request(MediaType.APPLICATION_JSON).get();
                if (response2.getStatus() != 200) {
                    return null;
                }

                String rightsResponseText = response2.readEntity(String.class);
                // Cache
                return RightsCache.getInstance().addRights(responseObj.getString("username"), authtoken, rightsResponseText);
            }
        } catch (Exception ex) {
            ex.printStackTrace();
            throw new WebApplicationException("Exception while checking access right for >" + resource + "<: " + ex.getClass().getSimpleName() + " " + ex.getLocalizedMessage());
        }
    }

    public void createSecurityContext(ContainerRequestContext requestContext, SmartPrincipalRight right) {
        // Create Principal
        SmartPrincipal principal = new SmartPrincipal(right.getUsername());
        // Create and set security context
        SmartSecurityContext secContext = new SmartSecurityContext(requestContext, principal);
        requestContext.setSecurityContext(secContext);
        principal.setContextRight(right);
    }
}
