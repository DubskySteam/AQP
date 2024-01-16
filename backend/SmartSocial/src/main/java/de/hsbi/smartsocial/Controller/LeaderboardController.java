package de.hsbi.smartsocial.Controller;

import de.fhbielefeld.smartuser.annotations.SmartUserAuth;
import de.hsbi.smartsocial.Model.Leaderboard;
import de.hsbi.smartsocial.Service.LeaderboardService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;

import static de.hsbi.smartsocial.Service.UtilityService.isUserValid;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Path("/leaderboard")
public class LeaderboardController {

    @Inject
    private LeaderboardService leaderboardService;

    @GET
    public String ping() {
        return leaderboardService.ping();
    }

    @GET
    @Path("/getList/{length}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns the top x users")
    public Response getTopXUsersByKilometers(@PathParam("length") Long length) {
        return Response.ok(leaderboardService.getTopXUsersByKilometers(length)).build();
    }

    @GET
    @Path("/getListByQuests/{length}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns the top x users by finished quests")
    public Response getTopXUsersByFinishedQuests(@PathParam("length") Long length) {
        return Response.ok(leaderboardService.getTopXUsersByFinishedQuests(length)).build();
    }

    @SmartUserAuth
    @GET
    @Path("/getPersonalStats/{id}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns the personal stats of a user")
    public Response getPersonalStats(@PathParam("id") Long id, @Context ContainerRequestContext requestContext) {
        if (isUserValid(id, requestContext)) {
            Leaderboard leaderboard = leaderboardService.getPersonalStats(id);
            if (leaderboard == null) {
                //TODO: Custom UserNotFoundException
                return Response.status(Response.Status.NOT_FOUND).build();
            }
            return Response.ok(leaderboard).build();
        } else
            return Response.status(Response.Status.FORBIDDEN).build();
    }

    @POST
    @Path("/addKilometers/{id}/{kilometers}")
    @ApiResponse(responseCode = "200", description = "Adds kilometers to a user")
    public Response addKilometers(@PathParam("id") Long id, @PathParam("kilometers") double kilometers) {
        leaderboardService.addKilometers(id, kilometers);
        return Response.ok().build();
    }


}
