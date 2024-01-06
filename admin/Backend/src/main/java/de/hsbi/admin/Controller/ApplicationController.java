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

    @GET
    @Path("/ping")
    @Produces("text/plain")
    public String ping() {
        return applicationService.ping();
    }

    @GET
    @Path("/getApplications")
    @Produces("application/json")
    public Response getApplications() {
        return Response.ok(applicationService.getApplications()).build();
    }

    @POST
    @Path("/toggle/{appName}/{action}")
    @Produces(MediaType.TEXT_PLAIN)
    public String toggleApplication(@PathParam("appName") String appName, @PathParam("action") String action) {
        return Response.ok(applicationService.toggleApplication(appName, action)).build().toString();
    }

    @POST
    @Path("/undeploy/{appName}")
    @Produces(MediaType.TEXT_PLAIN)
    public String undeployApplication(@PathParam("appName") String appName) {
        return applicationService.undeployApplication(appName);
    }

    /**
     * Fetches the status of the application with the given name.
     * @param appName Name of the application to fetch the status from
     * @return true if the application is enabled, false if not
     * @apiNote Working
     */
    @GET
    @Path("/getStatus/{appName}")
    @Produces("application/json")
    public Response getStatus(@PathParam("appName") String appName) {
        boolean status = applicationService.isApplicationEnabled(appName);
        if (status) {
            return Response.ok("{\"status\": \"enabled\"}").build();
        } else {
            return Response.ok("{\"status\": \"disabled\"}").build();
        }
    }
}
