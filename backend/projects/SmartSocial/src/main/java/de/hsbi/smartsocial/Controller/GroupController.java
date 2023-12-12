package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Exceptions.GroupForMemberNotFoundException;
import de.hsbi.smartsocial.Exceptions.GroupJoinException;
import de.hsbi.smartsocial.Exceptions.GroupNotFoundException;
import de.hsbi.smartsocial.Exceptions.InvalidGroupDataException;
import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Model.Groupmember;
import de.hsbi.smartsocial.Model.User;
import de.hsbi.smartsocial.Service.GroupService;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.inject.Inject;
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

    @GET
    @Path("/example")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Returns an example group")
    public Response getExample() {
        Group group = new Group();
        group.setId(1L);
        group.setName("Bike Club Minden");
        group.setDescription("We are a group of people who like to ride bikes.");
        group.setCreationDate(LocalDate.now());
        group.setAdminUser(null);
        return Response.ok(group).build();
    }

    @GET
    @Path("/getGroupById/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Returns group by id")
    public Response getGroupById(@PathParam("id") Long id) {
        Group group = groupService.findGroupById(id);
        if (group == null) {
            throw new GroupNotFoundException(id);
        }
        return Response.ok(group).build();
    }

    @GET
    @Path("/getGroupByName/{name}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Returns group by name")
    public Response getGroupByName(@PathParam("name") String name) {
        Group group = groupService.findGroupByName(name);
        if (group == null) {
            throw new GroupNotFoundException(name);
        }
        return Response.ok(group).build();
    }

    @GET
    @Path("/getGroupByUser/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Returns all for a user")
    public Response getAllGroupsByUser(@PathParam("id") Long id) {
        Groupmember groupmember = groupService.findGroupmemberByUserId(id);
        if (groupmember == null) {
            throw new GroupForMemberNotFoundException(id);
        }
        return Response.ok(groupmember).build();
    }

    @GET
    @Path("/getMembersByGroup/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Returns members of a group")
    public Response getMembersByGroup(@PathParam("id") Long id) {
        List<Groupmember> groupmembers = groupService.findGroupmembersByGroupId(id);
        if (groupmembers == null) {
            throw new GroupNotFoundException(id);
        }
        return Response.ok(groupmembers).build();
    }

    @GET
    @Path("/getMembersByGroup_SV/{id}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Returns members of a group")
    public Response getMembersByGroup_SV(@PathParam("id") Long id) {
        List<User> groupmembers = groupService.findUsersByGroupId_SV(id);
        if (groupmembers == null) {
            throw new GroupNotFoundException(id);
        }
        return Response.ok(groupmembers).build();
    }

    @GET
    @Path("/getAllGroups")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Returns all groups")
    public Response getAllGroups() {
        List<Group> groups = groupService.findAllGroups();
        return Response.ok(groups).build();
    }

    @GET
    @Path("/joinGroup/{userId}/{code}")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Joins a group")
    public Response joinGroup( @PathParam("userId") Long userId, @PathParam("code") String code) {
        Group group = groupService.joinGroup(userId, code);
        if (group == null) {
            throw new GroupJoinException("Couldn't find group or wrong code");
        }
        return Response.ok(group).build();
    }

    @POST
    @Path("/createGroup")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "201", description = "Returns created group")
    public Response createGroup(Group group) {
        Group createdGroup = groupService.createGroup(group);
        if (createdGroup == null) {
            throw new InvalidGroupDataException("Invalid group data");
        }
        return Response.status(Response.Status.CREATED).entity(createdGroup).build();
    }

    @POST
    @Path("/updateGroup")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Returns updated group")
    public Response updateGroup(Group group) {
        Group updatedGroup = groupService.updateGroup(group);
        if (updatedGroup == null) {
            throw new InvalidGroupDataException("Invalid group data");
        }
        return Response.ok(updatedGroup).build();
    }

    @DELETE
    @Path("/deleteGroup/{id}")
    @ApiResponse(responseCode = "204", description = "Deletes group")
    public Response deleteGroup(@PathParam("id") Long id) {
        groupService.deleteGroup(id);
        return Response.status(Response.Status.NO_CONTENT).build();
    }


}
