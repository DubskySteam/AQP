package de.hsbi.admin.Controller;

import de.hsbi.admin.Service.ApplicationService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
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

}
