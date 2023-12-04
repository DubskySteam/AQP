package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Model.Groupmember;
import de.hsbi.smartsocial.Model.User;
import de.hsbi.smartsocial.Service.GroupService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Path("/group")
public class GroupController {

    @Inject
    private GroupService groupService;

    @GET
    public String ping() {
        return groupService.ping();
    }

    @ApiResponse(responseCode = "200", description = "Returns an example group")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/example")
    public Response getExample() {
        Group group = new Group();
        group.setId(1L);
        group.setName("Bike Club Minden");
        group.setDescription("We are a group of people who like to ride bikes.");
        group.setCreationDate(LocalDate.now());
        group.setAdminUser(null);
        return Response.ok(group).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns group by id")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getGroupById/{id}")
    public Response getGroupById(@PathParam("id") Long id) {
        Group group = groupService.findGroupById(id);
        return Response.ok(group).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns group by name")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getGroupByName/{name}")
    public Response getGroupByName(@PathParam("name") String name) {
        Group group = groupService.findGroupByName(name);
        return Response.ok(group).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns all for a user")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getGroupByUser/{id}")
    public Response getAllGroupsByUser(@PathParam("id") Long id) {
        Groupmember groupmember = groupService.findGroupmemberByUserId(id);
        return Response.ok(groupmember).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns members of a group")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getMembersByGroup/{id}")
    public Response getMembersByGroup(@PathParam("id") Long id) {
        List<Groupmember> groupmembers = groupService.findGroupmembersByGroupId(id);
        return Response.ok(groupmembers).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns members of a group")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getMembersByGroup_SV/{id}")
    public Response getMembersByGroup_SV(@PathParam("id") Long id) {
        List<User> groupmembers = groupService.findUsersByGroupId_SV(id);
        return Response.ok(groupmembers).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns all groups")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getAllGroups")
    public Response getAllGroups() {
        List<Group> groups = groupService.findAllGroups();
        return Response.ok(groups).build();
    }

    @ApiResponse(responseCode = "201", description = "Returns created group")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/createGroup")
    public Response createGroup(Group group) {
        Group createdGroup = groupService.createGroup(group);
        return Response.status(Response.Status.CREATED).entity(createdGroup).build();
    }

    @ApiResponse(responseCode = "200", description = "Returns deleted group")
    @DELETE
    @Path("/deleteGroup/{id}")
    public Response deleteGroup(@PathParam("id") Long id) {
        groupService.deleteGroup(id);
        return Response.status(Response.Status.NO_CONTENT).build();
    }


}
