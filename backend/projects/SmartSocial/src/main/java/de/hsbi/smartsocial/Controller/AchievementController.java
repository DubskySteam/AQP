package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Model.Achievement;
import de.hsbi.smartsocial.Service.AchievementService;
import de.hsbi.smartsocial.Service.LeaderboardService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Path("/achievements")
public class AchievementController {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

    private AchievementService achievementService;

    /**
     * SLW: This method is called before every request to initialize the GroupService object.
     * This is necessary because the EntityManager is not available during construction of the GroupService object.
     * (Because the EntityManager is injected by the application server after construction.)
     */
    private void init() {
        if (achievementService == null) {
            achievementService = new AchievementService(entityManager);
        }
    }

    @GET
    @Path("/getAllAchievements")
    @Produces("application/json")
    public Response getAllAchievements() {
        init();
        return Response.ok(achievementService.getAllAchievements()).build();
    }

    @GET
    @Path("/getById/{id}")
    @Produces("application/json")
    public Response getAchievementById(Long id) {
        init();
        return Response.ok(achievementService.findById(id)).build();
    }

    @GET
    @Path("/getByName/{name}")
    @Produces("application/json")
    public Response getAchievementByName(String name) {
        init();
        return Response.ok(achievementService.findByName(name)).build();
    }

}
