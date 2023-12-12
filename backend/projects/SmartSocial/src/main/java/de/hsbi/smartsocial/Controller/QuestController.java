package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Service.QuestService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Path("/quest")
public class QuestController {

    @Inject
    private QuestService questService;

    @GET
    public String ping() {
        return questService.ping();
    }

    @GET
    @Path("/example")
    public Response getExample() {
        return Response.ok(questService.getExample()).build();
    }

    @GET
    @Path("/getAll")
    public Response getAll() {
        return Response.ok(questService.getAll()).build();
    }

    @GET
    @Path("/getById/{id}")
    public Response getById(@PathParam("id") Integer id) {
        return Response.ok(questService.getById(id)).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns all quests by user id")
    @GET
    @Path("/getByUserId/{id}")
    public Response getByUserId(@PathParam("id") Long id) {
        return Response.ok(questService.getByUserId(id)).build();
    }


}
