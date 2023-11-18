package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartmonitoring.config.Configuration;
import de.fhbielefeld.smartmonitoring.system.NetworkInformation;
import java.io.IOException;
import javax.naming.NamingException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.net.*;
import java.util.Map;
import java.util.StringTokenizer;

@Path("system")
@Tag(name = "System", description = "Gives information about the SmartMonitoringBackend")
public class SystemResource {

    public SystemResource() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Configuration conf = new Configuration();
            Logger.getInstance("SmartMonitoring", moduleName);
            Logger.setDebugMode(Boolean.parseBoolean(conf.getProperty("debugmode")));
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }

    @GET
    @Path("config")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get configuration",
            description = "Lists all configuration options.")
    @APIResponse(
            responseCode = "200",
            description = "Objects with configuration informations",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"list\" : [ { \"name\" : \"value\"} ]}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not load configuration: Because of ... \"]}"))
    public Response getConfig() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Init config
        Configuration conf = new Configuration();

        rob.add("modulname", conf.getModuleName());
        rob.add("filename", conf.getFileName());
        rob.add("propsloaded", conf.isPropsloaded());
        for (Map.Entry<Object, Object> curEntry : conf.getAllProperties()) {
            rob.add(curEntry.getKey().toString(), curEntry.getValue().toString());
        }
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @GET
    @Path("info")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Returns current configuration",
            description = "Returns current configuration")
    @APIResponse(
            responseCode = "200",
            description = "Configuration JSON",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"version\": \"3.0 alpha\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create location: Because of ... \"]}"))
    public Response info(@Context HttpServletRequest request) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Init config
        Configuration conf = new Configuration();
        
        // Get client addr
        String clientaddr = "";
        String xForwardedForHeader = request.getHeader("X-Forwarded-For");
        if (xForwardedForHeader == null) {
            clientaddr = request.getRemoteAddr();
        } else {
            // As of https://en.wikipedia.org/wiki/X-Forwarded-For
            // The general format of the field is: X-Forwarded-For: client, proxy1, proxy2 ...
            // we only want the client
            clientaddr = new StringTokenizer(xForwardedForHeader, ",").nextToken().trim();
        }

        rob.add("version", "3.0.0. Alpha 2");
        rob.add("publicIP", NetworkInformation.getPublicIpAddress());
        rob.add("clientIP", clientaddr);
        rob.add("backendHasInternet", this.isInternetAvailable());
        rob.add("systemMAC", NetworkInformation.getMAC());

        if (conf.getProperty("debugmode").equalsIgnoreCase("true")) {
            rob.add("debugmode", true);
            rob.add("systemJavaVendor", System.getProperty("java.vendor"));
            rob.add("systemJavaVersion", System.getProperty("java.version"));
            rob.add("systemName", System.getProperty("os.name"));
            rob.add("systemVersion", System.getProperty("os.version"));
            rob.add("systemArchitecture", System.getProperty("os.arch"));
        } else {
            rob.add("debugmode", false);
        }

        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    /**
     * Checks if internet is available for backend
     *
     * @return true if available
     */
    public boolean isInternetAvailable() {
        try (Socket socket = new Socket()) {
            int port = 80;
            InetSocketAddress socketAddress = new InetSocketAddress("fh-bielefeld.de", port);
            socket.connect(socketAddress, 3000);
            return true;
        } catch (IOException ex) {
            return false;
        }
    }
}
