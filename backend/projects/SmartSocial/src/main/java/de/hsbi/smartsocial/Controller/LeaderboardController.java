package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Model.Leaderboard;
import de.hsbi.smartsocial.Service.LeaderboardService;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;

import java.util.List;

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
    public Response getTopXUsersByKilometers(@PathParam("length") Long length) {
        return Response.ok(leaderboardService.getTopXUsersByKilometers(length)).build();
    }

    @GET
    @Path("/getListByQuests/{length}")
    public Response getTopXUsersByFinishedQuests(@PathParam("length") Long length) {
        return Response.ok(leaderboardService.getTopXUsersByFinishedQuests(length)).build();
    }

}
