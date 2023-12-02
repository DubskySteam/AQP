package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Service.AchievementService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Response;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Path("/achievements")
public class AchievementController {

    @Inject
    private AchievementService achievementService;

    @GET
    public String ping() {
        return achievementService.ping();
    }

    @ApiResponse(responseCode = "200", description = "Returns all achievements")
    @GET
    @Path("/getAllAchievements")
    @Produces("application/json")
    public Response getAllAchievements() {
        return Response.ok(achievementService.getAllAchievements()).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns achievement by id")
    @GET
    @Path("/getById/{id}")
    @Produces("application/json")
    public Response getAchievementById(Long id) {
        return Response.ok(achievementService.findById(id)).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns achievement by name")
    @GET
    @Path("/getByName/{name}")
    @Produces("application/json")
    public Response getAchievementByName(String name) {
        return Response.ok(achievementService.findByName(name)).build();
    }

}
