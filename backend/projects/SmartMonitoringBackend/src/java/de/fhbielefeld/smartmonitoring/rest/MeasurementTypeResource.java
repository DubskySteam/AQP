package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.smartmonitoring.jpa.TblMeasurementType;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectType;
import de.fhbielefeld.smartmonitoring.jpa.TblOoTypeJoinMType;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartmonitoring.config.Configuration;
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

@Path("measurementtype")
@Tag(name = "MeasurementType", description = "Webservice for managing measurement types")
public class MeasurementTypeResource {

    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    public MeasurementTypeResource() {
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
    @Operation(summary = "Creates a new measurmenttype",
            description = "Creates a new measurementtype stored in database")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created measurementtype.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create measurementtype: Because of ... \"]}"))
    public Response create(
             TblMeasurementType mtr) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        try {
            TblMeasurementType existingType = this.em.createNamedQuery("TblMeasurementType.findByName", TblMeasurementType.class).setParameter("name", mtr.getName()).getSingleResult();
            rob.setStatus(Response.Status.CONFLICT);
            rob.addErrorMessage("A measurementtype with name >" + mtr.getName() + "< already exists");
            rob.add("existing_id", existingType.getId());
            return rob.toResponse();
        } catch (NoResultException ex) {
            // Can go on
        }

        try {
            this.utx.begin();
            this.em.persist(mtr);
            this.utx.commit();
            rob.add(mtr);
            rob.setStatus(Response.Status.CREATED);
        } catch (NotSupportedException | SecurityException | IllegalStateException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not save mesaurementtype. " + ex.getLocalizedMessage());
            try {
                this.utx.rollback();
            } catch (IllegalStateException | SecurityException | SystemException ex1) {
                rob.addErrorMessage("Could not rollback save action: " + ex1.getLocalizedMessage());
            }
        }
        return rob.toResponse();
    }
    
    @GET
    @Path("get")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get a measurementtype",
            description = "Get a measurementtype by id")
    @APIResponse(
            responseCode = "200",
            description = "measurementtype found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblMeasurementType.class),
                    example = "{\"id\" : 1, \"name\" : \"mytype\", \"description\": \"mydescription\", \"type\": \"databasedatatype\", \", \"unit\": \"physicalunit\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get dataset: Because of ... \"]}"))
    public Response get(
            @Parameter(description = "measurementtype id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No id given.");
            return rob.toResponse();
        }

        try {
            TblMeasurementType mtt = this.em.createNamedQuery("TblMeasurementType.findById", TblMeasurementType.class)
                    .setParameter("id", id)
                    .getSingleResult();

            // Adding location information
            rob.add(mtt);
            rob.setStatus(Response.Status.OK);
        } catch (NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Measurementtype with id " + id + " could not be found.");
        }

        return rob.toResponse();
    }
    
    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List measurementtypes",
            description = "List all measurementtypes from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "measurementtype requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblMeasurementType.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get measurementtypes: Because of ... \"]}"))
    public Response list() {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        List<TblMeasurementType> measurementtypes = this.em.createNamedQuery("TblMeasurementType.findAll", TblMeasurementType.class)
                .getResultList();
        rob.add(measurementtypes);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @GET
    @Path("getByName")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get an measurementtypes by name",
            description = "Get an measurementtype from database that matches the name.")
    @APIResponse(
            responseCode = "200",
            description = "measurementtype requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblMeasurementType.class),
                    example = "{\"id\" :  1, \"name\" : \"myname\"}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get measurementtypes: Because of ... \"]}"))
    public Response getByName(
            @Parameter(description = "Measurmenttypes name", required = true) @QueryParam("name") String name) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (name == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >name< is missing.");
            return rob.toResponse();
        }

        try {
            TblMeasurementType mtt = this.em.createNamedQuery("TblMeasurementType.findByName", TblMeasurementType.class)
                    .setParameter("name", name)
                    .getSingleResult();

            // Adding location information
            rob.add(mtt);
            rob.setStatus(Response.Status.OK);
        } catch (NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Measurementtype with name >" + name + "< could not be found.");
        }

        return rob.toResponse();
    }

    @GET
    @Path("listForOoType")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List measurementtypes belonging to an observedobjecttype",
            description = "List all measurementtypes from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "measurementtype requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblMeasurementType.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get measurementtypes: Because of ... \"]}"))
    public Response listForOoType(
            @Parameter(description = "Observedobjecttype id", required = true) @QueryParam("ootype_id") Long ootype_id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        TblObservedObjectType ootype = this.em.find(TblObservedObjectType.class, ootype_id);
        if (ootype == null) {
            rob.setStatus(Response.Status.OK);
            rob.addWarningMessage("ObservedObjectType >" + ootype_id + "< not found.");
            return rob.toResponse();
        }

        // Build list of objects
        rob.add("list", ootype.getOoTypeJoinMtypes());
        rob.add("ootype", ootype_id);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @PUT
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Updates an measurmenttype",
            description = "Updates an existing measurmenttype. Does nothing if the dataset does not exists.")
    @APIResponse(
            responseCode = "200",
            description = "Number of updated datasets",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not update measurmenttype: Because of ... \"]}"))
    public Response update( TblMeasurementType mtr) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Check constriants
        if (mtr.getId() == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No id given for updateable measurementtype");
            return rob.toResponse();
        }

        try {
            this.utx.begin();
            this.em.merge(mtr);
            this.utx.commit();

            rob.add(mtr);
            rob.setStatus(Response.Status.OK);
        } catch (RollbackException | SecurityException | IllegalStateException | NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException ex) {
            try {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Could not safe changes. " + ex.getLocalizedMessage());
                this.utx.rollback();
            } catch (IllegalStateException | SecurityException | SystemException ex1) {
                rob.addErrorMessage("Could not rollback save action: " + ex1.getLocalizedMessage());
            }
        }

        return rob.toResponse();
    }

    @DELETE
    @Path("delete")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Deletes an measurementtype",
            description = "Deletes a measurementtype from database.")
    @APIResponse(
            responseCode = "200"
            )
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete measurementtype: Because of ... \"]}"))
    public Response delete(
            @Parameter(description = "Measurementtype id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >id< is required to delete measurementtype.");
            return rob.toResponse();
        }

        try {
            this.utx.begin();
            TblMeasurementType mtr = this.em.find(TblMeasurementType.class, id);
            if (mtr == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("Measurementtype >" + id + "< not found.");
                return rob.toResponse();
            }
            this.em.remove(mtr);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
        } catch (NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Measurementtype not found");
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Measurementtype could not be deleted. " + ex.getLocalizedMessage());
        }
        return rob.toResponse();
    }

    @GET
    @Path("union")
    @Operation(summary = "Unions two measurementtypes into one",
            description = "Unions two measurmenttypes into one. The second one will be deleted, all references changed to the first one.")
    @APIResponse(
            responseCode = "200",
            description = "Modified measurmenttype",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"id\" :  1, \"name\" : \"myname\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete measurementtype: Because of ... \"]}"))
    public Response union(
            @Parameter(description = "Remaining measurementtypes id", required = true) @QueryParam("id") Long id,
            @Parameter(description = "Removing measurmenttypes id", required = true) @QueryParam("remove_id") Long remove_id) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No id given.");
            return rob.toResponse();
        }

        if (remove_id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No remove_id given.");
            return rob.toResponse();
        }

        TblMeasurementType mtt;
        try {
            mtt = this.em.createNamedQuery("TblMeasurementType.findById", TblMeasurementType.class)
                    .setParameter("id", id)
                    .getSingleResult();
        } catch (NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Measurementtype with id >" + id + "< could not be found.");
            return rob.toResponse();
        }

        TblMeasurementType remove_mtt;
        try {
            remove_mtt = this.em.createNamedQuery("TblMeasurementType.findById", TblMeasurementType.class)
                    .setParameter("id", remove_id)
                    .getSingleResult();
        } catch (NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Measurementtype with remove_id >" + remove_id + "< could not be found.");
            return rob.toResponse();
        }

        if(!remove_mtt.getType().equalsIgnoreCase(mtt.getType())) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("The type of measurementtype >" + mtt.getId() 
                    + "< (" + mtt.getType() + ") does not match the type of measurementtype >" 
                    + remove_mtt.getId() + "< (" + remove_mtt.getType() 
                    + ") only matching types can be unioned.");
            return rob.toResponse();
        }
        
        // Move connections
        for (TblOoTypeJoinMType curJoiner : remove_mtt.getOoTypeJoinMTypes()) {
            mtt.addOoTypeJoinMType(curJoiner);
        }

        // Remove old mtype
        try {
            this.utx.begin();
            TblMeasurementType mtr = this.em.find(TblMeasurementType.class, remove_id);
            this.em.remove(mtr);
            this.utx.commit();
            rob.add(mtt);
            rob.setStatus(Response.Status.OK);
        } catch (NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Measurementtype not found");
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Measurementtype could not be deleted. " + ex.getLocalizedMessage());
        }
        return rob.toResponse();
    }
}
