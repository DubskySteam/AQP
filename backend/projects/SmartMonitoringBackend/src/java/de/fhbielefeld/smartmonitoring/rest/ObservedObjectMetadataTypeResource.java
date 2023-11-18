package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectMetadataType;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartmonitoring.config.Configuration;
import java.io.Serializable;
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
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.DELETE;
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

@Path("observedobjectmetadatatype")
@Tag(name = "ObservedObjectMetadataTypeResource", description = "Webservice for managing metadata types")
public class ObservedObjectMetadataTypeResource implements Serializable {

    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    public ObservedObjectMetadataTypeResource() {
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
    @Operation(summary = "Creates a new metadatatype",
            description = "Creates a new metadatatype stored in database")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created metadatatype.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create metadatatype: Because of ... \"]}"))
    public Response create(TblObservedObjectMetadataType metadatatype) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        try {
            this.utx.begin();
            this.em.persist(metadatatype);
            this.utx.commit();
            rob.add(metadatatype);
            rob.setStatus(Response.Status.CREATED);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not save configurationtype");
            try {
                this.utx.rollback();
            } catch (IllegalStateException | SecurityException | SystemException ex1) {
                rob.addErrorMessage("Could not rollback save action: " + ex.getLocalizedMessage());
            }
        }

        return rob.toResponse();
    }
    
    @GET
    @Path("get")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get a metadatatype",
            description = "Get a metadatatype by id")
    @APIResponse(
            responseCode = "200",
            description = "metadatatype found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectMetadataType.class),
                    example = "{\"id\" : 1, \"value\" : 12.4}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get metadatatype: Because of ... \"]}"))
    public Response get(
            @Parameter(description = "Observedobjectmetadatas id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No id given.");
            return rob.toResponse();
        }
        TblObservedObjectMetadataType conf = this.em.find(TblObservedObjectMetadataType.class, id);
        if (conf == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Configurationtype with id " + id + " could not be found!");
            return rob.toResponse();
        }
        rob.add(conf);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }
    
    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List metadatatype",
            description = "List all metadatatype from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "metadatatype requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectMetadataType.class),
                    example = "{\"records\" : [{\"id\" :  1, \"lat\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get metadatatype: Because of ... \"]}"))
    public Response list() {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        List<TblObservedObjectMetadataType> metadatas = this.em.createNamedQuery(
                "TblObservedObjectMetadataType.findAll",
                TblObservedObjectMetadataType.class)
                .getResultList();
        rob.add(metadatas);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Path("getByName")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get a metadatatype by its name",
            description = "Get a metadatatype from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "metadatatype requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectMetadataType.class),
                    example = "{{\"id\" :  1, \"lat\" : 12.4}}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get metadatatype: Because of ... \"]}"))
    public Response getByName(
            @Parameter(description = "Observedobjectmetadatatypes name", required = true) @QueryParam("name") String name) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        try {
            TblObservedObjectMetadataType metadatatype = this.em.createNamedQuery(
                    "TblObservedObjectMetadataType.findByName",
                    TblObservedObjectMetadataType.class)
                    .setParameter("name", name).getSingleResult();
            rob.add(metadatatype);
            rob.setStatus(Response.Status.OK);
        } catch (NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Configurationtype with name " + name + " could not be found!");
        }
        return rob.toResponse();
    }

    @PUT
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
//    @Proxied(required = {"id"})
    @Operation(summary = "Updates a metadatatype",
            description = "Updates an existing metadatatype. Does nothing if the dataset does not exists.")
    @APIResponse(
            responseCode = "200",
            description = "Updated metadatatype",
            content = @Content(
                    mediaType = "application/json",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not update metadatatype: Because of ... \"]}"))
    public Response update( TblObservedObjectMetadataType metadatatype) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        try {
            this.utx.begin();
            this.em.merge(metadatatype);
            this.utx.commit();

            rob.add(metadatatype);
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not update configurationtype. " + ex.getLocalizedMessage());
        }

        return rob.toResponse();
    }

    @DELETE
    @Path("delete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Deletes a metadatatype",
            description = "Deletes a metadatatype from database.")
    @APIResponse(
            responseCode = "200"
            )
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete metadatatype: Because of ... \"]}"))
    public Response delete(
            @Parameter(description = "Observedobjectmetadatatype id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >id< is required to delete observedobject.");
            return rob.toResponse();
        }

        try {
            this.utx.begin();
            TblObservedObjectMetadataType metaType = this.em.find(TblObservedObjectMetadataType.class, id);
            if (metaType == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("ObservedObjectMetadataType >" + id + "< was not found.");
                return rob.toResponse();
            }
            this.em.remove(metaType);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);

        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not delete configurationtype");
        }
        return rob.toResponse();
    }
}
