package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Service.GroupService;
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

    /**
     * SLW: This method is called before every request to initialize the GroupService object.
     * This is necessary because the EntityManager is not available during construction of the GroupService object.
     * (Because the EntityManager is injected by the application server after construction.)
     */

    @GET
    public String ping() {
        return groupService.ping();
    }

    /**
     * Get an example group
     * @return Response
     */
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

    //Get by id
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getGroupById/{id}")
    public Response getGroupById(@PathParam("id") Long id) {
        Group group = groupService.findGroupById(id);
        return Response.ok(group).build();
    }

    //Get by name
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getGroupByName/{name}")
    public Response getGroupByName(@PathParam("name") String name) {
        Group group = groupService.findGroupByName(name);
        return Response.ok(group).build();
    }

    /**
     * Get all groups
     * @return Response
     */
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/getAllGroups")
    public Response getAllGroups() {
        List<Group> groups = groupService.findAllGroups();
        return Response.ok(groups).build();
    }

    /**
     * Create a group
     * @param group
     * @return Response
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Path("/createGroup")
    public Response createGroup(Group group) {
        Group createdGroup = groupService.createGroup(group);
        return Response.status(Response.Status.CREATED).entity(createdGroup).build();
    }

    /**
     * Delete a group
     * @param id
     * @return Response
     */
    @DELETE
    @Path("/deleteGroup/{id}")
    public Response deleteGroup(@PathParam("id") Long id) {
        groupService.deleteGroup(id);
        return Response.status(Response.Status.NO_CONTENT).build();
    }


}
