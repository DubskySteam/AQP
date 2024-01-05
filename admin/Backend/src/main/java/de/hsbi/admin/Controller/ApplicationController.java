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
        return applicationService.toggleApplication(appName, action);
    }
}
