package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.smartmonitoring.jpa.TblLocation;
import de.fhbielefeld.smartmonitoring.jpa.emtools.SearchTools;
import de.fhbielefeld.smartmonitoring.jpa.emtools.EntityToolsException;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
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
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.DELETE;
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

@Path("location")
@Tag(name = "LocationResource", description = "Webservice for accessing location data")
public class LocationResource implements Serializable {

    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    public LocationResource() {
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
//    @Proxied
    @Operation(summary = "Creates a new location",
            description = "Creates a new location stored in database")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created location.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create location: Because of ... \"]}"))
    public Response create( TblLocation location) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        SearchTools et = new SearchTools(this.em, this.utx);
        try {
            List<TblLocation> locations = et.findEqualInformation(location);
            // If locations exists, use first
            if (!locations.isEmpty()) {
                rob.add(locations.get(0));
                rob.setStatus(Response.Status.OK);
                rob.addWarningMessage("Found similar locations. Use that with id: " + locations.get(0).getId());
                return rob.toResponse();
            }
        } catch (EntityToolsException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not check if similar location exists.");
        }

        // Save new location
        try {
            this.utx.begin();
            this.em.persist(location);
            this.utx.commit();
            rob.add(location);
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
    @Operation(summary = "Get a location",
            description = "Get a location by id")
    @APIResponse(
            responseCode = "200",
            description = "Dataset found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblLocation.class),
                    example = "{\"id\" : 1, \"value\" : 12.4}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get dataset: Because of ... \"]}"))
    public Response get(
            @Parameter(description = "Location id", required = true, example = "1") @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Missing location id.");
            return rob.toResponse();
        }

        TblLocation tblLocation = this.em.find(TblLocation.class, id);
        if (tblLocation == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Location with id " + id + " could not be found.");
        } else {
            // Adding location information
            rob.add(tblLocation);
            rob.setStatus(Response.Status.OK);
        }

        return rob.toResponse();
    }
    
    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List locations",
            description = "List all locations from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "Datasets requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblLocation.class),
                    example = "{\"records\" : [{\"id\" :  1, \"lat\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get locations: Because of ... \"]}"))
    public Response list() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        List<TblLocation> locs = this.em.createNamedQuery("TblLocation.findAll", TblLocation.class)
                .getResultList();
        rob.add(locs);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @PUT
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
//    @Proxied(required = {"id"})
    @Operation(summary = "Updates a location",
            description = "Updates an existing location. Does nothing if the dataset does not exists.")
    @APIResponse(
            responseCode = "200",
            description = "Updated location",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"id\": 1, \"name\": \"myname\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not update datasets: Because of ... \"]}"))
    public Response update( TblLocation location) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (location.getId() == null || location.getId() < 1) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("To update an location, the location must have an id.");
        }

        try {
            this.utx.begin();
            this.em.merge(location);
            this.utx.commit();

            rob.add(location);
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while accessing the database!");
        }

        return rob.toResponse();
    }

    @DELETE
    @Path("delete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Deletes a location",
            description = "Deletes a location from database.")
    @APIResponse(
            responseCode = "200"
            )
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete location: Because of ... \"]}"))
    public Response delete(
            @Parameter(description = "Location id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >id< is required to delete location.");
            return rob.toResponse();
        }

        try {
            this.utx.begin();
            TblLocation location = this.em.find(TblLocation.class, id);
            if (location == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("Location >" + id + "<not exists");
                return rob.toResponse();
            }
            this.em.remove(location);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while accessing the database!");
        }
        return rob.toResponse();
    }
}
