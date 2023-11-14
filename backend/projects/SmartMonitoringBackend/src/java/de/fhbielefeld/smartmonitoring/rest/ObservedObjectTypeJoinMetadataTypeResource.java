package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.smartmonitoring.jpa.TblOoTypeJoinOoMetadataType;
import de.fhbielefeld.scl.rest.util.ResponseListBuilder;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartmonitoring.config.Configuration;
import java.io.Serializable;
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

@Path("observedobjecttypejoinmetadatatype")
@Tag(name = "ObservedObjectTypeJoinMetadataTypeResource", description = "Webservice for managing connections between observedobjecttypess and metadatatypes")
public class ObservedObjectTypeJoinMetadataTypeResource implements Serializable {

    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    public ObservedObjectTypeJoinMetadataTypeResource() {
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
    public Response create( TblOoTypeJoinOoMetadataType joiner) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        try {
            this.utx.begin();
            this.em.persist(joiner);
            this.utx.commit();
            
            // Set name to metadatatype name if no one is given
            if(joiner.getName() == null) {
                joiner.setName(joiner.getOoMetadataType().getName());
            }

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
                    schema = @Schema(implementation = TblOoTypeJoinOoMetadataType.class),
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
        TblOoTypeJoinOoMetadataType joiner = this.em.find(TblOoTypeJoinOoMetadataType.class, id);
        if (joiner == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Configurationtype with id " + id + " could not be found.");
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
                    schema = @Schema(implementation = TblOoTypeJoinOoMetadataType.class),
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
        List<TblOoTypeJoinOoMetadataType> joiner = this.em.createNamedQuery("TblOoTypeJoinOoMetadataType.findAll", TblOoTypeJoinOoMetadataType.class)
                .getResultList();
        ResponseListBuilder rlb = new ResponseListBuilder();
        for (TblOoTypeJoinOoMetadataType curJoiner : joiner) {
            rlb.add(this.transformJoiner(curJoiner));
        }
        rob.add("list", rlb);
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
                    schema = @Schema(implementation = TblOoTypeJoinOoMetadataType.class),
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
            @Parameter(description = "Observedobjecttype id", required = true) @QueryParam("ootype_id") Long ootype_id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if (ootype_id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Given ootype_id was null");
            return rob.toResponse();
        }
        List<TblOoTypeJoinOoMetadataType> list = 
                this.em.createNamedQuery(
                        "TblOoTypeJoinOoMetadataType.findByObservedObjectTypeId", 
                        TblOoTypeJoinOoMetadataType.class).setParameter("ootype_id", ootype_id)
                        .getResultList();
        
        ResponseListBuilder rlb = new ResponseListBuilder();
        for (TblOoTypeJoinOoMetadataType curJoiner : list) {
            rlb.add(this.transformJoiner(curJoiner));
        }
        rob.add("list", rlb);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @PUT
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
//    @Proxied(required = {"id"})
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
    public Response update( TblOoTypeJoinOoMetadataType joiner) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        try {
            this.utx.begin();
            this.em.merge(joiner);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
            rob.add(joiner);
        } catch (IllegalStateException | SecurityException
                | HeuristicMixedException | HeuristicRollbackException
                | NotSupportedException | RollbackException | SystemException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while accessing the Database");
        }
        return rob.toResponse();
    }

    @DELETE
    @Path("delete")
    @Consumes(MediaType.APPLICATION_JSON)
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
            rob.addErrorMessage("Parameter >id< is required to delete observedobjectTypeJoinMetadataType.");
            return rob.toResponse();
        }

        try {
            this.utx.begin();
            TblOoTypeJoinOoMetadataType joiner = this.em.find(TblOoTypeJoinOoMetadataType.class, id);
            if (joiner == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("ObservedObjectTypeJoinMetadataType with id >" + id + "< does not exists");
                return rob.toResponse();
            }
            this.em.remove(joiner);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not delete ObservedObjectTypeJoinMetadataType " + ex.getLocalizedMessage());
        }

        return rob.toResponse();
    }

    /**
     * Transforms the given joiner to an ResponseObjectBuilder containing all
     * informations form the joiner and from the configurationtype.
     *
     * @param joiner Joiner to transform to response
     * @return
     */
    private ResponseObjectBuilder transformJoiner(TblOoTypeJoinOoMetadataType joiner) {
        ResponseObjectBuilder subrob = new ResponseObjectBuilder();

        subrob.add("id", joiner.getId());
        subrob.add("name", joiner.getName());
        subrob.add("editable", joiner.getEditable());
        if (joiner.getDescription() != null) {
            subrob.add("description", joiner.getDescription());
        }
        return subrob;
    }
}
