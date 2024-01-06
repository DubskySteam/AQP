package de.hsbi.admin.Controller;

import de.hsbi.admin.Service.LogService;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

/**
 * Author: Clemens Maas
 * Date: 2024/01/06
 */
@Path("/log")
public class LogController {

    @Inject
    private LogService logService;

    @GET
    @Path("/getLog")
    @Produces("text/plain")
    public Response getLog() {
        String log = logService.getLog();
        if (log != null) {
            return Response.ok(log).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).entity("{\"message\": \"error\"}").build();
        }
    }

    @GET
    @Path("/getLog2")
    @Produces("text/plain")
    public Response getLog2() {
        String log = logService.getLogNew();
        if (log != null) {
            return Response.ok(log).build();
        } else {
            return Response.status(Response.Status.BAD_REQUEST).entity("{\"message\": \"error\"}").build();
        }
    }

}
