package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObject;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectType;
import de.fhbielefeld.smartmonitoring.jpa.TblOoTypeJoinMType;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartmonitoring.config.Configuration;
import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;
import jakarta.annotation.Resource;
import javax.naming.NamingException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.HeuristicMixedException;
import jakarta.transaction.HeuristicRollbackException;
import jakarta.transaction.NotSupportedException;
import jakarta.transaction.RollbackException;
import jakarta.transaction.SystemException;
import jakarta.transaction.UserTransaction;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("observedobjecttype")
@Tag(name = "ObservedObjectTypeResource", description = "Webservice for managing observedobjecttypes")
public class ObservedObjectTypeResource implements Serializable {

    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    public ObservedObjectTypeResource() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Configuration conf = new Configuration();
            Logger.getInstance("SmartMonitoring", moduleName);
            Logger.setDebugMode(Boolean.parseBoolean(conf.getProperty("debugmode")));
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }
    
    @POST
    @Path("create")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
//    @Proxied()
    @Operation(summary = "Creates a new observedobjecttype",
            description = "Creates a new observedobjecttype stored in database")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created observedobjecttype.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create observedobjecttype: Because of ... \"]}"))
    public Response create( TblObservedObjectType toot) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        try {
            this.utx.begin();
            this.em.persist(toot);
            this.utx.commit();
            rob.add(toot);
            rob.setStatus(Response.Status.CREATED);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not create observedobjecttype. " + ex.getLocalizedMessage());
        }
        return rob.toResponse();
    }
    
    @GET
    @Path("get")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get a observedobjecttype",
            description = "Get a observedobjecttype by id")
    @APIResponse(
            responseCode = "200",
            description = "Dataset found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"id\" : 1, \"value\" : 12.4}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectType.class),
                    example = "{\"errors\" : [ \" Could not get observedobjecttype: Because of ... \"]}"))
    public Response get(
            @Parameter(description = "Observedobjecttypes id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No id given.");
            return rob.toResponse();
        }
        TblObservedObjectType ootype = this.em.find(TblObservedObjectType.class, id);
        if (ootype == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("ObservedObjectType >" + id + "< could not be found!");
            return rob.toResponse();
        }
        rob.add(ootype);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }
    
    @GET
    @Path("getByName")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get an observedobjecttypes by name",
            description = "Get the observedobjecttype that have the given name.")
    @APIResponse(
            responseCode = "200",
            description = "observedobjecttype requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectType.class),
                    example = "{\"id\" :  1, \"lat\" : 12.4}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjecttypes: Because of ... \"]}"))
    public Response getByName(
            @Parameter(description = "Observedobjecttypes name", required = true) @QueryParam("name") String name) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if(name==null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("There was no name given.");
            return rob.toResponse();
        }
        try {
            //Es kann auch eine Abwandlung im SMAC namen geben, dieser wird als observedobjectname mitgeliefert z.B. (Heiztemperatur und wandtemperatur sensoren)
            TblObservedObjectType ootype = this.em.createNamedQuery("TblObservedObjectType.findByName", TblObservedObjectType.class)
                    .setParameter("name", name).getSingleResult();
            rob.add(ootype);
            rob.setStatus(Response.Status.OK);
        } catch (NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Could not find observedobjecttype by given Name " + name);
            return rob.toResponse();
        }
        return rob.toResponse();
    }

    @GET
    @Path("getByObservedObject")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get the observedobjecttype that belongs to a observedobject",
            description = "Get the observedobjecttype that belongs to a observedobject")
    @APIResponse(
            responseCode = "200",
            description = "observedobjecttype requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectType.class),
                    example = "{\"id\" :  1, \"lat\" : 12.4}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjecttypes: Because of ... \"]}"))
    public Response getByObservedObject(
            @Parameter(description = "Observedobject id", required = true) @QueryParam("ooid") Long ooid) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if(ooid==null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("There was no ooid given.");
            return rob.toResponse();
        }
        // Get the object
        TblObservedObject oo = this.em.find(TblObservedObject.class, ooid);
        if (oo == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("ObservedObject with id >" + ooid + "< not found");
            return rob.toResponse();
        }
        rob.add(oo.getType());
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }
    
    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
        @Operation(summary = "List observedobjecttypes",
            description = "List all observedobjecttypes from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "observedobjecttypes requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectType.class),
                    example = "{\"records\" : [{\"id\" :  1, \"lat\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjecttypes: Because of ... \"]}"))
    public Response list() {

        List<TblObservedObjectType> ootype;
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        ootype = this.em.createNamedQuery("TblObservedObjectType.findAll", TblObservedObjectType.class)
                .getResultList();
        rob.add("list", ootype);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }
    
    @GET
    @Path("listMeasureing")
    @Produces(MediaType.APPLICATION_JSON)
        @Operation(summary = "List measureing observedobjecttypes",
            description = "List all observedobjecttypes from database that are able to collect data.")
    @APIResponse(
            responseCode = "200",
            description = "observedobjecttypes requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectType.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myOO\"}]}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjecttypes: Because of ... \"]}"))
    public Response listMeasureing() {

        List<TblObservedObjectType> ootypes;
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        ootypes = this.em.createNamedQuery("TblObservedObjectType.findAll", TblObservedObjectType.class)
                .getResultList();
        List<TblObservedObjectType> measureingTypes = new ArrayList<>();
        for(TblObservedObjectType curType : ootypes) {
            if(!curType.getMeasurementtypes().isEmpty()) {
                measureingTypes.add(curType);
            }
        }
        
        rob.add("list", measureingTypes);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @PUT
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
//    @Proxied(required = {"id"})
    @Operation(summary = "Updates an observedobjecttype",
            description = "Updates an existing observedobjecttype. Does nothing if the dataset does not exists.")
    @APIResponse(
            responseCode = "200",
            description = "Updated observedobjecttype",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"id\": 1, \"name\": \"myname\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not update observedobjecttype: Because of ... \"]}"))
    public Response update(TblObservedObjectType toot) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Compare old types and new ones (Use in Proxy-Pattern, will not effect until now)
        for (TblOoTypeJoinMType curJoiner : toot.getOoTypeJoinMtypes()) {
            TblOoTypeJoinMType oldJoiner = this.em.find(TblOoTypeJoinMType.class, curJoiner.getId());
            // Check if alias name has changed
            if (curJoiner.getName() != null && !curJoiner.getName().equals(oldJoiner.getName())) {
                // Lookup all observedobjects that used this observedobjecttype
                List<TblObservedObject> oos = this.em.createNamedQuery("TblObservedObject.findByType", TblObservedObject.class)
                        .setParameter("type", oldJoiner.getObservedobjectType())
                        .getResultList();
                //TODO Refactor colum name over SmartData
//                for (TblObservedObject curOo : oos) {
//                    DynamicTable dynTab = new DynamicTable(this.em, this.utx, curOo);
//                    try {
//                        dynTab.refactorColumn(oldJoiner.getName(), curJoiner.getName());
//                    } catch (PersistenceException ex) {
//                        rob.setStatus(Response.Status.PARTIAL_CONTENT);
//                        rob.addErrorMessage(ex.getLocalizedMessage());
//                        return rob.toResponse();
//                    }
//                }
            }
        }

        try {
            this.utx.begin();
            this.em.merge(toot);
            this.utx.commit();

            rob.add(toot);
            rob.setStatus(Response.Status.OK);
        } catch (RollbackException | SecurityException | IllegalStateException | NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not update observedobjecttype. " + ex.getLocalizedMessage());
            try {
                this.utx.rollback();
            } catch (IllegalStateException | SecurityException | SystemException ex1) {
                rob.addErrorMessage("Could not rollback save action: " + ex1.getLocalizedMessage());
            }
        }

        return rob.toResponse();
    }

    @DELETE
    @Path("delete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Operation(summary = "Deletes a observedobjecttype",
            description = "Deletes a observedobjecttype from database.")
    @APIResponse(
            responseCode = "200"
            )
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete observedobjecttype: Because of ... \"]}"))
    public Response delete(
            @Parameter(description = "Observedobjecttypes id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >id< is required to delete observedobjecttype.");
            return rob.toResponse();
        }
        
        try {
            this.utx.begin();
            TblObservedObjectType toot = this.em.find(TblObservedObjectType.class, id);
            if (toot == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("Observedobjecttype with id >" + id + "< does not exists");
                return rob.toResponse();
            }
            this.em.remove(toot);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not delete observedobjecttype " + ex.getLocalizedMessage());
        }

        return rob.toResponse();
    }
}
