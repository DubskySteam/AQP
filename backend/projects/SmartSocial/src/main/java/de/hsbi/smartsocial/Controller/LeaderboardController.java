package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Model.Leaderboard;
import de.hsbi.smartsocial.Service.LeaderboardService;
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

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

    private LeaderboardService leaderboardService;

    /**
     * SLW: This method is called before every request to initialize the GroupService object.
     * This is necessary because the EntityManager is not available during construction of the GroupService object.
     * (Because the EntityManager is injected by the application server after construction.)
     */
    private void init() {
        if (leaderboardService == null) {
            leaderboardService = new LeaderboardService(entityManager);
        }
    }

    @GET
    public String ping() {
        init();
        return leaderboardService.ping();
    }

    @GET
    @Path("/getList/{length}")
    public Response getTopXUsersByKilometers(@PathParam("length") Long length) {
        init();
        return Response.ok(leaderboardService.getTopXUsersByKilometers(length)).build();
    }

    @GET
    @Path("/getListByQuests/{length}")
    public Response getTopXUsersByFinishedQuests(@PathParam("length") Long length) {
        init();
        return Response.ok(leaderboardService.getTopXUsersByFinishedQuests(length)).build();
    }

}
