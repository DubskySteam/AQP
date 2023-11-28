package de.hsbi.smartsocial.Controller;

import de.hsbi.smartsocial.Service.GroupService;
import de.hsbi.smartsocial.Service.QuestService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.core.Response;
import jdk.javadoc.doclet.Reporter;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Path("/quest")
public class QuestController {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager entityManager;

    private QuestService questService;

    /**
     * SLW: This method is called before every request to initialize the GroupService object.
     * This is necessary because the EntityManager is not available during construction of the GroupService object.
     * (Because the EntityManager is injected by the application server after construction.)
     */
    private void init() {
        if (questService == null) {
            questService = new QuestService(entityManager);
        }
    }

    @GET
    public String ping() {
        init();
        return questService.ping();
    }

    @GET
    @Path("/example")
    public Response getExample() {
        init();
        return Response.ok(questService.getExample()).build();
    }

    @GET
    @Path("/getAll")
    public Response getAll() {
        init();
        return Response.ok(questService.getAll()).build();
    }

    @GET
    @Path("/getById/{id}")
    public Response getById(@PathParam("id") Integer id) {
        init();
        return Response.ok(questService.getById(id)).build();
    }

    @GET
    @Path("/getUserQuests/{id}")
    public Response getUserQuests(@PathParam("id") Long id) {
        init();
        return Response.ok(questService.getQuestsByUser(id)).build();
    }



}
