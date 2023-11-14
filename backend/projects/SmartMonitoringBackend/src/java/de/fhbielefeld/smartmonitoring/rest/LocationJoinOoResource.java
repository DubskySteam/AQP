package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.smartmonitoring.jpa.TblLocation;
import de.fhbielefeld.smartmonitoring.jpa.TblLocationJoinOo;
import de.fhbielefeld.smartmonitoring.jpa.emtools.SearchTools;
import de.fhbielefeld.smartmonitoring.jpa.emtools.EntityToolsException;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartmonitoring.config.Configuration;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObject;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.annotation.Resource;
import javax.naming.NamingException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.NonUniqueResultException;
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
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import static org.geolatte.geom.builder.DSL.g;
import static org.geolatte.geom.builder.DSL.point;
import static org.geolatte.geom.crs.CoordinateReferenceSystems.WGS84;

@Path("locationjoinoo")
@Tag(name = "LocationJoinOoResource", description = "Managing connections between locations and observedobjects")
public class LocationJoinOoResource implements Serializable {
    
    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;
    
    @Resource
    private UserTransaction utx;
    
    public LocationJoinOoResource() {
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
    @Operation(summary = "Creates a new connection",
            description = "Creates a new connection between observedobject and location")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created connection.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create connection: Because of ... \"]}"))
    public Response create(
            @RequestBody(description = "Location object from", required = true,
                    content = @Content(schema = @Schema(implementation = TblLocationJoinOo.class))) TblLocationJoinOo con) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        SearchTools et = new SearchTools(this.em, this.utx);
        try {
            List<TblLocationJoinOo> locations = et.findEqualInformation(con);
            // If locations exists, use first
            if (!locations.isEmpty()) {
                rob.add(locations.get(0));
                rob.setStatus(Response.Status.OK);
                rob.addWarningMessage("Found similar connection. Use that with id: " + locations.get(0).getId());
                return rob.toResponse();
            }
        } catch (EntityToolsException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not check if similar connection exists.");
        }

        // Save new location
        try {
            this.utx.begin();
            this.em.persist(con);
            this.utx.commit();
            rob.add(con);
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
    @Operation(summary = "Get a connection",
            description = "Get a connection between observedobject and location by id")
    @APIResponse(
            responseCode = "200",
            description = "Dataset found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblLocationJoinOo.class),
                    example = "{\"id\" : 1, \"loc_id\" : 1, \"oo_id\": 1}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get connection: Because of ... \"]}"))
    public Response get(
            @Parameter(description = "Joiners id", required = true) @QueryParam("id") Long id) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Missing location id.");
            return rob.toResponse();
        }
        
        TblLocationJoinOo con = this.em.find(TblLocationJoinOo.class, id);
        if (con == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("TblLocationJoinOo with id " + id + " could not be found.");
        } else {
            rob.add(con);
            rob.setStatus(Response.Status.OK);
        }
        
        return rob.toResponse();
    }
    
    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List connection",
            description = "List all connections from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "Connections requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblLocationJoinOo.class),
                    example = "{\"records\" : [{\"id\" :  1, \"loc_id\" : 1}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get connections: Because of ... \"]}"))
    public Response list() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        List<TblLocation> locs = this.em.createNamedQuery("TblLocationJoinOo.findAll", TblLocation.class)
                .getResultList();
        rob.add(locs);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }
    
    @GET
    @Path("listForObservedObject")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get connections for observedobject",
            description = "List all connections for a specific obsereved object")
    @APIResponse(
            responseCode = "200",
            description = "Connections requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblLocationJoinOo.class),
                    example = "{\"records\" : [{\"id\" :  1, \"loc_id\" : 1}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "ObservedObject not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get connections: Because of ... \"]}"))
    public Response listForObservedObject(
            @Parameter(description = "Observedobjects id", required = true) @QueryParam("id") Long id) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Missing observedobject id.");
        }

        //TODO integrate inheritance of locatons
        List<TblLocationJoinOo> cons = this.em.createNamedQuery("TblLocationJoinOo.findByObservedObject", TblLocationJoinOo.class).setParameter("oo", id).getResultList();
        if (cons.isEmpty()) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("TblLocationJoinOo for ObservedObject with id " + id + " could not be found.");
            return rob.toResponse();
        }

        // Adding location information
        rob.add(cons);
        rob.setStatus(Response.Status.OK);
        
        return rob.toResponse();
    }
    
    @GET
    @Path("listForLocation")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get connections for location",
            description = "List all connections for a specific location")
    @APIResponse(
            responseCode = "200",
            description = "Connections requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblLocationJoinOo.class),
                    example = "{\"records\" : [{\"id\" :  1, \"loc_id\" : 1}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Location not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get connections: Because of ... \"]}"))
    public Response listForLocation(
            @Parameter(description = "Locations id", required = true) @QueryParam("id") Long id) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Missing observedobject id.");
        }

        //TOTO integrate location inheritance.
        //If at timepoint X the object has a location this is active and no one of the locations maybe at parents
        //If at timepoint Y the object has no location a location at a parent is active
        List<TblLocationJoinOo> cons = this.em.createNamedQuery("TblLocationJoinOo.findByLocation", TblLocationJoinOo.class).setParameter("loc", id).getResultList();
        if (cons.isEmpty()) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("TblLocationJoinOo for ObservedObject with id " + id + " could not be found.");
            return rob.toResponse();
        }

        // Adding location information
        rob.add(cons);
        rob.setStatus(Response.Status.OK);
        
        return rob.toResponse();
    }
    
    @PUT
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
//    @Proxied(required = {"id"})
    @Operation(summary = "Updates a connection",
            description = "Updates an existing connection. Does nothing if the connection does not exists.")
    @APIResponse(
            responseCode = "200",
            description = "Updated connection",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"id\": 1, \"loc_id\": 1}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not update connection: Because of ... \"]}"))
    public Response update(
            @RequestBody(description = "Location object from", required = true,
                    content = @Content(schema = @Schema(implementation = TblLocationJoinOo.class))) TblLocationJoinOo con) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        if (con.getId() == null || con.getId() < 1) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("To update an location, the location must have an id.");
        }
        
        try {
            this.utx.begin();
            this.em.merge(con);
            this.utx.commit();
            
            rob.add(con);
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
    @Operation(summary = "Delete a connection",
            description = "Delete a connection from database.")
    @APIResponse(
            responseCode = "200"
    )
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete connection: Because of ... \"]}"))
    public Response delete(
            @Parameter(description = "Joiners id", required = true) @QueryParam("id") Long id) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >id< is required to delete location.");
            return rob.toResponse();
        }
        
        try {
            this.utx.begin();
            TblLocationJoinOo con = this.em.find(TblLocationJoinOo.class, id);
            if (con == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("Location >" + id + "<not exists");
                return rob.toResponse();
            }
            this.em.remove(con);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while accessing the database!");
        }
        return rob.toResponse();
    }
    
    @PUT
    @Path("updatePosition")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "update and create a connection", description = "Update and Create a connection from database.")
    @APIResponse(responseCode = "200")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json", example = "{\"errors\" : [ \" Could not update/create connection: Because of ... \"]}")
    )
    public Response updatePosition(
            @Parameter(description = "ID of the observed object", required = true) @QueryParam("ooID") Long ooID,
            @Parameter(description = "ID of the location", required = true) @QueryParam("locID") Long locID,
            @Parameter(description = "the new longitude", required = true) @QueryParam("longitude") String longitude,
            @Parameter(description = "the new latitude", required = true) @QueryParam("latitude") String latitude) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if (ooID == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Missing observedobject id.");
            return rob.toResponse();
        }
        if (locID == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Missing location id.");
            return rob.toResponse();
        }
        if (longitude == null || longitude.isEmpty()) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Missing longitude id.");
            return rob.toResponse();
        }
        if (latitude == null || latitude.isEmpty()) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Missing latitude id.");
            return rob.toResponse();
        }
        
        try {
            this.utx.begin();
            //get old objects
            TblLocation oldLocation = this.em.find(TblLocation.class, locID);
            TblObservedObject oo = this.em.find(TblObservedObject.class, ooID);
            if (oldLocation == null) {
                rob.setStatus(Response.Status.PRECONDITION_FAILED);
                rob.addErrorMessage("Missing oldLocation with id >" + locID + "<.");
                return rob.toResponse();
            }
            if (oo == null) {
                rob.setStatus(Response.Status.PRECONDITION_FAILED);
                rob.addErrorMessage("Missing observed obejct with id >" + ooID + "<.");
                return rob.toResponse();
            }

            //create new location
            TblLocation newLocation = new TblLocation();
            newLocation.setApartment(oldLocation.getApartment());
            newLocation.setCity(oldLocation.getCity());
            newLocation.setCountry(oldLocation.getCountry());
            newLocation.setDescription(oldLocation.getDescription());
            newLocation.setFloor(oldLocation.getFloor());
            newLocation.setHousenumber(oldLocation.getHousenumber());
            newLocation.setName(oldLocation.getName());
            newLocation.setPostcode(oldLocation.getPostcode());
            newLocation.setRoom(oldLocation.getRoom());
            newLocation.setStreet(oldLocation.getStreet());
            newLocation.setCoordinates(point(WGS84, g(Double.parseDouble(longitude), Double.parseDouble(latitude))));
            
            LocalDateTime time = LocalDateTime.now();
            TblLocationJoinOo oldJoined = this.em.createNamedQuery("TblLocationJoinOo.findByObservedObjectAndLocation", TblLocationJoinOo.class)
                    .setParameter("loc", oldLocation).setParameter("oo", oo).getSingleResult();
            oldJoined.setValid_until(time);
            
            TblLocationJoinOo newJoined = new TblLocationJoinOo();
            newJoined.setLoc(newLocation);
            newJoined.setOo(oo);
            newJoined.setValid_from(time);

            //save new objects
            this.em.merge(oldJoined);
            this.em.persist(newLocation);
            this.em.persist(newJoined);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while accessing the database!");
        } catch (NonUniqueResultException | NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Can not find the correct TblLocationJoinOo!");
        }
        return rob.toResponse();
    }
    
}
