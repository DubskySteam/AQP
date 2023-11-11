package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObject;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectType;
import de.fhbielefeld.smartmonitoring.jpa.TblOoTypeJoinMType;
import de.fhbielefeld.scl.rest.util.ResponseListBuilder;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartmonitoring.config.Configuration;
import java.util.List;
import jakarta.annotation.Resource;
import javax.naming.NamingException;
import jakarta.persistence.EntityManager;
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

@Path("observedobjecttypejoinmeasurementtype")
@Tag(name = "ObservedObjectTypeJoinMeasurementTypeResource", description = "Webservice for managing connections between observedobjecttypess and measurementtypes")
public class ObservedObjectTypeJoinMeasurementTypeResource {

    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    public ObservedObjectTypeJoinMeasurementTypeResource() {
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
    @Operation(summary = "Creates a new joiner",
            description = "Creates a new joiner stored in database")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created joiner.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create joiner: Because of ... \"]}"))
    public Response create(TblOoTypeJoinMType joiner) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        try {
            this.utx.begin();
            //TODO avoid this workaround for detatched objects
            joiner.setMeasurementType(this.em.merge(joiner.getMeasurementType()));
            joiner.setObservedobjectType(this.em.merge(joiner.getObservedobjectType()));

            // Set name to measurementsname if there is no name given
            if(joiner.getName() == null) {
                joiner.setName(joiner.getMeasurementType().getName());
            }
            
            this.em.persist(joiner);
            this.utx.commit();
            rob.add(joiner);
            rob.setStatus(Response.Status.CREATED);
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not save tag to observedobject reference. " + ex.getLocalizedMessage());
        }
        return rob.toResponse();
    }
    
    @GET
    @Path("get")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get a joiner",
            description = "Get a joiner by id")
    @APIResponse(
            responseCode = "200",
            description = "joiner found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblOoTypeJoinMType.class),
                    example = "{\"id\" : 1, \"ootype_id\" : 12, \"mtype_id\": 2}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get joiner: Because of ... \"]}"))
    public Response get(
            @Parameter(description = "Joiners id", required = true) @QueryParam("id") Long id) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No id given.");
            return rob.toResponse();
        }
        TblOoTypeJoinMType joiner = this.em.find(TblOoTypeJoinMType.class, id);
        if (joiner == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Joiner between observedobjecttype and measurementtype with id " + id + " could not be found.");
            return rob.toResponse();
        }
        rob.add(joiner);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List joiners",
            description = "List all joiners from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "joiners requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblOoTypeJoinMType.class),
                    example = "{\"records\" : [{\"id\" :  1, \"lat\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get joiners: Because of ... \"]}"))
    public Response list() {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        List<TblOoTypeJoinMType> joiner = this.em.createNamedQuery("TblOoTypeJoinMType.findAll", TblOoTypeJoinMType.class)
                .getResultList();
        rob.add("list", joiner);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Path("listForObservedObjectType")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List joiners for an observerdobjecttype",
            description = "List all joiners from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "joiners requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblOoTypeJoinMType.class),
                    example = "{\"records\" : [{\"id\" :  1, \"lat\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get joiners: Because of ... \"]}"))
    public Response listForObservedObjectType(
            @Parameter(description = "Observedobjecttypes id", required = true) @QueryParam("ootype_id") Long ootype_id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        TblObservedObjectType ootype = this.em.find(TblObservedObjectType.class, ootype_id);
        if (ootype == null) {
            rob.setStatus(Response.Status.OK);
            rob.addWarningMessage("No measurementtypes found for observedobjecttype " + ootype_id);
            return rob.toResponse();
        }
        rob.add(ootype.getOoTypeJoinMtypes());
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @GET
    @Path("listForObservedObject")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List joiners for an observerdobject",
            description = "List all joiners from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "joiners requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblOoTypeJoinMType.class),
                    example = "{\"records\" : [{\"id\" :  1, \"lat\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get joiners: Because of ... \"]}"))
    public Response listForObservedObject(
            @Parameter(description = "Observedobjects id", required = true) @QueryParam("ooid") Long ooid) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (ooid == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No ooid given");
            return rob.toResponse();
        }

        // Get observed object
        TblObservedObject oo = this.em.find(TblObservedObject.class, ooid);

        if (oo == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Observedobject with id " + ooid + " was not found.");
            return rob.toResponse();
        }

        ResponseListBuilder rlb = new ResponseListBuilder();
        for(TblOoTypeJoinMType curJoiner : oo.getType().getOoTypeJoinMtypes()) {
            ResponseObjectBuilder jrob = new ResponseObjectBuilder();
            if(curJoiner.getName() != null) {
            jrob.add("name", curJoiner.getName());
            } else {
                jrob.add("name", curJoiner.getMeasurementType().getName());
            }
            jrob.add("description", curJoiner.getDescription());
            jrob.add("unit", curJoiner.getMeasurementType().getUnit());
            rlb.add(jrob);
        }
        rob.add("list", rlb);

        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @PUT
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
//    @Proxied
    @Operation(summary = "Updates a joiner",
            description = "Updates an existing joiner. Does nothing if the dataset does not exists.")
    @APIResponse(
            responseCode = "200",
            description = "Updated joiner",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"id\": 1, \"name\": \"myname\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not update datasets: Because of ... \"]}"))
    public Response update( TblOoTypeJoinMType joiner) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (joiner.getId() == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No id given for updateable joiner");
            return rob.toResponse();
        }

        // Load joiner from database to get the connections
        TblOoTypeJoinMType oldJoiner = this.em.find(TblOoTypeJoinMType.class, joiner.getId());

        // Check if name has changed
        if (!joiner.getName().equals(oldJoiner.getName())) {
            // Lookup all observedobjects that used this observedobjecttype
            List<TblObservedObject> oos = this.em.createNamedQuery("TblObservedObject.findByType", TblObservedObject.class)
                    .setParameter("type", oldJoiner.getObservedobjectType())
                    .getResultList();
            //TODO Refactor colum name over SmartData
//            for (TblObservedObject curOo : oos) {
//                DynamicTable dynTab = new DynamicTable(this.em, this.utx, curOo);
//                try {
//                    dynTab.refactorColumn(oldJoiner.getName(), joiner.getName());
//                } catch (PersistenceException ex) {
//                    rob.setStatus(Response.Status.PARTIAL_CONTENT);
//                    rob.addErrorMessage(ex.getLocalizedMessage());
//                    return rob.toResponse();
//                }
//            }
        }

        try {
            this.utx.begin();
            this.em.merge(joiner);
            this.utx.commit();
            rob.add(joiner);
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not save tag to observedobject reference. " + ex.getLocalizedMessage());
        }
        return rob.toResponse();

    }

    @DELETE
    @Path("delete")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Deletes a joiner",
            description = "Deletes a joiner from database.")
    @APIResponse(
            responseCode = "200"
            )
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete joiner: Because of ... \"]}"))
    public Response delete(
            @Parameter(description = "Joiners id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >id< is required to delete observedobjecttype join measurementtype.");
            return rob.toResponse();
        }

        try {
            this.utx.begin();
            TblOoTypeJoinMType joiner = this.em.find(TblOoTypeJoinMType.class, id);
            if (joiner == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("Joiner with id >" + id + "< not found");
                return rob.toResponse();
            }
            this.em.remove(joiner);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Joiner with id >" + id + "< could not be deleted. " + ex.getLocalizedMessage());
        }
        return rob.toResponse();
    }
}
