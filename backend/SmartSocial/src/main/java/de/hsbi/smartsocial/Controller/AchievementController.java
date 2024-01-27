package de.hsbi.smartsocial.Controller;

import de.fhbielefeld.smartuser.annotations.SmartUserAuth;
import de.hsbi.smartsocial.Exceptions.AchievementNotFoundException;
import de.hsbi.smartsocial.Exceptions.CreateException;
import de.hsbi.smartsocial.Model.Achievement;
import de.hsbi.smartsocial.Model.Userachievement;
import de.hsbi.smartsocial.Service.AchievementService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;

import java.util.List;

import static de.hsbi.smartsocial.Service.UtilityService.isUserValid;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Path("/achievement")
public class AchievementController {

    @Inject
    private AchievementService achievementService;

    @GET
    public String ping() {
        return achievementService.ping();
    }

    @GET
    @Path("/example")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns an example achievement")
    public Response getExample() {
        return Response.ok(achievementService.getExample()).build();
    }

    @GET
    @Path("/getAll")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns all achievements")
    public Response getAllAchievements() {
        return Response.ok(achievementService.getAllAchievements()).build();
    }

    @GET
    @Path("/getById/{id}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns achievement by id")
    public Response getAchievementById(@PathParam("id") Long id) {
        Achievement achievement = achievementService.findById(id);
        if (achievement == null) {
            throw new AchievementNotFoundException(id);
        }
        return Response.ok(achievement).build();
    }

    @GET
    @Path("/getByName/{name}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns achievement by name")
    public Response getAchievementByName(@PathParam("name") String name) {
        Achievement achievement = achievementService.findByName(name);
        if (achievement == null) {
            throw new AchievementNotFoundException(name);
        }
        return Response.ok(achievement).build();
    }

    @SmartUserAuth
    @GET
    @Path("/getByUserId/{id}")
    @Produces("application/json")
    @ApiResponse(responseCode = "200", description = "Returns all achievements of a user")
    public Response getByUserId(@PathParam("id") Long id, @Context ContainerRequestContext requestContext) {
        if (isUserValid(id, requestContext)) {
            List<Userachievement> userachievement = achievementService.getByUserId(id);
            if (userachievement == null || userachievement.isEmpty()) {
                throw new AchievementNotFoundException(id);
            }
            return Response.ok(userachievement).build();
        }
        return Response.status(Response.Status.FORBIDDEN).build();
    }

    @POST
    @Path("/create")
    @Consumes("application/json")
    @Produces("application/json")
    @ApiResponse(responseCode = "201", description = "Creates a new achievement")
    public Response createAchievement(Achievement achievement) {
        Achievement newAchievement = achievementService.createAchievement(achievement);
        if (newAchievement == null) {
            throw new CreateException("Achievement could not be created");
        }
        return Response.status(Response.Status.CREATED).entity(newAchievement).build();
    }

    @POST
    @Path("/createUserAchievement")
    @Consumes("application/json")
    @Produces("application/json")
    @ApiResponse(responseCode = "201", description = "Creates a userachievement")
    public Response createUserAchievement(Userachievement userachievement) {
        Userachievement newUserachievement = achievementService.createAchievement(userachievement);
        if (newUserachievement == null) {
            throw new CreateException("Userachievement could not be created");
        }
        return Response.status(Response.Status.CREATED).entity(newUserachievement).build();
    }

}