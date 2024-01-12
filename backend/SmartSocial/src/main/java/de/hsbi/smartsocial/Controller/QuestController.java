package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Exceptions.QuestInvalidException;
import de.hsbi.smartsocial.Model.Quest;
import de.hsbi.smartsocial.Service.QuestService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
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

    @POST
    @Path("/create")
    @Consumes("application/json")
    @Produces("application/json")
    @ApiResponse(responseCode = "201", description = "Creates a new quest")
    public Response create(Quest nquest) {
        Quest quest = questService.create(nquest);
        if (quest != null) {
            return Response.status(Response.Status.CREATED).entity(quest).build();
        } else {
            throw new QuestInvalidException("Quest is invalid");
        }
    }

    @DELETE
    @Path("/delete/{id}")
    @ApiResponse(responseCode = "204", description = "Deletes a quest by id")
    public Response delete(@PathParam("id") Integer id) {
        Quest q = questService.delete(id);
        if (q == null) {
            Response.status(Response.Status.NO_CONTENT).build();
        }
        return Response.status(Response.Status.OK).entity(q).build();
    }


}
