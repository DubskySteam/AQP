package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectMetadata;
//import de.fhbielefeld.scl.rest.proxy.Proxied;
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

@Path("observedobjectmetadata")
@Tag(name = "ObservedObjectMetadataResource", description = "Webservice for managing metadata about observed objects")
public class ObservedObjectMetadataResource implements Serializable {
    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    public ObservedObjectMetadataResource() {
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
    @Operation(summary = "Creates a new metadata",
            description = "Creates a new metadata stored in database")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created metadata.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create metadata: Because of ... \"]}"))
    public Response create( TblObservedObjectMetadata oom) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        try {
            // When not found save as new one
            this.utx.begin();
            this.em.persist(oom);
            this.utx.commit();

            rob.add(oom);
            rob.setStatus(Response.Status.CREATED);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while accessing the database!");
        }

        return rob.toResponse();
    }
    
    @GET
    @Path("get")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get a metadata",
            description = "Get a metadata by id")
    @APIResponse(
            responseCode = "200",
            description = "metadata found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectMetadata.class),
                    example = "{\"id\" : 1, \"value\" : 12.4}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get metadata: Because of ... \"]}"))
    public Response get(
            @Parameter(description = "Metadata id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No id given.");
            return rob.toResponse();
        }
        TblObservedObjectMetadata metadata = this.em.find(TblObservedObjectMetadata.class, id);
        if (metadata == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("ObservedObjectMetadata >" + id + "< is not available.");
        }
        rob.add(metadata);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }
    
    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List metadata",
            description = "List all metadata from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "metadata requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectMetadata.class),
                    example = "{\"records\" : [{\"id\" :  1, \"lat\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Metadata not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get metadata: Because of ... \"]}"))
    public Response list() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        List<TblObservedObjectMetadata> metadatas = this.em.createNamedQuery("TblObservedObjectMetadata.findAll", TblObservedObjectMetadata.class)
                .getResultList();
        rob.add("list", metadatas);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Path("listForObservedObject")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List metadata for specific observedobject",
            description = "List all metadata from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "metadata requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectMetadata.class),
                    example = "{\"records\" : [{\"id\" :  1, \"lat\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Metadata not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get metadata: Because of ... \"]}"))
    public Response listForObservedObject(
            @Parameter(description = "Observedobject id", required = true) @QueryParam("ooid") Long ooid) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if(ooid==null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("The parameter id is missing.");
        }
        
        List<TblObservedObjectMetadata> metadatas = this.em.createNamedQuery("TblObservedObjectMetadata.findByObservedObjectId", TblObservedObjectMetadata.class)
                .setParameter("ooid", ooid)
                .getResultList();

        // Create sublist here, because there is some referenced information
        // that must be delivered with the response
        //IMPORTANT: Do not use simple rob.add(list) here (21.11.2018 ffehring)
        ResponseListBuilder rlb = new ResponseListBuilder();
        for (TblObservedObjectMetadata curMetadata : metadatas) {
            ResponseObjectBuilder curMetadataRob = new ResponseObjectBuilder();
            curMetadataRob.add("id", curMetadata.getId());
            curMetadataRob.add("type", curMetadata.getType().getId());
            curMetadataRob.add("val", curMetadata.getVal());
            curMetadataRob.add("name", curMetadata.getName());
            curMetadataRob.add("description", curMetadata.getDescription());
            rlb.add(curMetadataRob);
        }

        rob.add("list", rlb);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @GET
    @Path("listForValue")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List metadata that have a specific value",
            description = "List all metadata from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "metadata requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObjectMetadata.class),
                    example = "{\"records\" : [{\"id\" :  1, \"lat\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Metadata not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get metadata: Because of ... \"]}"))
    public Response listForValue(
            @Parameter(description = "Value to search", required = true) @QueryParam("val") String val) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        //Abfangen, ob es das observedObject mit der SMAC schon gibt, redundanzvermeidung
        List<TblObservedObjectMetadata> metadatas = null;
        metadatas = this.em.createNamedQuery("TblObservedObjectMetadata.findByValue", TblObservedObjectMetadata.class)
                .setParameter("val", val).getResultList();
        rob.add(metadatas);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @PUT
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
//    @Proxied(required = {"id"})
    @Operation(summary = "Updates a metadata",
            description = "Updates an existing metadata. Does nothing if the dataset does not exists.")
    @APIResponse(
            responseCode = "200",
            description = "Updated metadata",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"id\": 1, \"value\": 1.23}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not update metadata: Because of ... \"]}"))
    public Response update(TblObservedObjectMetadata oom) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        try {
            this.utx.begin();
            this.em.merge(oom);
            this.utx.commit();
            rob.add(oom);
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            rob.addErrorMessage(ex.getLocalizedMessage());
            rob.addException(ex);
            rob.setStatus(Response.Status.fromStatusCode(512));
        }
        return rob.toResponse();
    }

    @DELETE
    @Path("delete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Deletes a metadata",
            description = "Deletes a metadata from database.")
    @APIResponse(
            responseCode = "200"
            )
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete metadata: Because of ... \"]}"))
    public Response delete(
            @Parameter(description = "Metadata id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >id< is required to delete observedobjectmetadata.");
            return rob.toResponse();
        }

        try {
            this.utx.begin();
            TblObservedObjectMetadata metadata = this.em.find(TblObservedObjectMetadata.class, id);
            if (metadata == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("ObservedObjectMetadata with id >" + id + "< not found.");
                return rob.toResponse();
            }
            this.em.remove(metadata);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while accessing the database!");
        }

        return rob.toResponse();
    }
}
