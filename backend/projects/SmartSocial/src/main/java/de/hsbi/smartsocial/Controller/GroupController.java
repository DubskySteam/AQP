package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Model.Group;
import de.hsbi.smartsocial.Service.GroupService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.time.LocalDate;
import java.util.List;

@Path("/group")
public class GroupController {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

    private GroupService groupService;

    private void init() {
        if (groupService == null) {
            groupService = new GroupService(entityManager);
        }
    }

    @GET
    public String ping() {
        init();
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
        group.setId(1);
        group.setName("Bike Club Minden");
        group.setDescription("We are a group of people who like to ride bikes.");
        group.setCreationDate(LocalDate.now());
        group.setAdminUser(null);
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
        init();
        List<Group> groups = groupService.findAllGroups();
        return Response.ok(groups).build();
    }


}
