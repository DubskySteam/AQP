package de.hsbi.admin.Controller;

import de.hsbi.admin.Service.ApplicationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Author: Clemens Maas
 * Date: 2024/01/04
 */
@Path("/application")
public class ApplicationController {

    @Inject
    private ApplicationService applicationService;

    /**
     * Pings the Payara server.
     * @return String with pong
     * @apiNote Working
     */
    @GET
    @Path("/ping")
    @Produces("text/plain")
    public String ping() {
        return applicationService.ping();
    }

    /**
     * Gets all applications from the Payara server.
     * @return JSON with all applications and their urls
     * @apiNote Working
     */
    @GET
    @Path("/getApplications")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getApplications() {
        return Response.ok(applicationService.getApplications()).build();
    }

    /**
     * Deploys/Un-deploys the application with the given name.
     * @param appName Name of the application to deploy
     * @param action Action to perform (deploy/undeploy)
     * @return String with success message
     * @apiNote Not working
     */
    @POST
    @Path("/toggle/{appName}/{action}")
    @Produces(MediaType.TEXT_PLAIN)
    public String toggleApplication(@PathParam("appName") String appName, @PathParam("action") String action) {
        return Response.ok(applicationService.toggleApplication(appName, action)).build().toString();
    }

    /**
     * Un-deploys the application with the given name.
     *
     * @param appName Name of the application to deploy
     * @return String with success message
     * @apiNote Working, but still throws an exception in the Payara server log. TODO: Fix exception
     */
    @POST
    @Path("/undeploy/{appName}")
    @Produces(MediaType.APPLICATION_JSON)
    public String undeployApplication(@PathParam("appName") String appName) {
        boolean status = applicationService.isApplicationEnabled(appName);
        if (status) {
            return Response.ok(applicationService.undeployApplication(appName)).build().toString();
        } else {
            return Response.ok("Application is already disabled").build().toString();
        }
    }

    /**
     * Fetches the status of the application with the given name.
     * @param appName Name of the application to fetch the status from
     * @return True if the application is enabled, False if not
     * @apiNote Working
     */
    @GET
    @Path("/getStatus/{appName}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getStatus(@PathParam("appName") String appName) {
        boolean status = applicationService.isApplicationEnabled(appName);
        if (status) {
            return Response.ok("{\"status\": \"enabled\"}").build();
        } else {
            return Response.ok("{\"status\": \"disabled\"}").build();
        }
    }
}
