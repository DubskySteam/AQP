package de.fhbielefeld.smartmonitoring.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.smartmonitoring.jpa.TblLocation;
import de.fhbielefeld.smartmonitoring.jpa.TblLocationJoinOo;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObject;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectType;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectMetadata;
import de.fhbielefeld.smartmonitoring.jpa.TblOoTypeJoinMType;
import de.fhbielefeld.scl.rest.util.ResponseListBuilder;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartmonitoring.config.Configuration;
import de.fhbielefeld.smartmonitoring.jpaproxy.TblObservedObjectProxy;
import de.fhbielefeld.smartmonitoring.jpaproxy.TblObservedObjectTblLocationProxy;
import java.io.Serializable;
import java.math.BigInteger;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.HeuristicMixedException;
import jakarta.transaction.HeuristicRollbackException;
import jakarta.transaction.NotSupportedException;
import jakarta.transaction.RollbackException;
import jakarta.transaction.SystemException;
import jakarta.transaction.UserTransaction;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import javax.naming.NamingException;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceException;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response.ResponseBuilder;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.parameters.RequestBody;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("observedobject")
@Tag(name = "ObservedObjectResource", description = "Webservice for manageing observedobjects")
public class ObservedObjectResource implements Serializable {

    private Configuration conf;

    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;

    @Resource
    private UserTransaction utx;

    public ObservedObjectResource() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            this.conf = new Configuration();
            Logger.getInstance("SmartMonitoring", moduleName);
            Logger.setDebugMode(Boolean.parseBoolean(this.conf.getProperty("debugmode")));
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }

    @POST
    @Path("create")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
//    @Proxied()
    @Operation(summary = "Creates a new observedobject",
            description = "Creates a new observedobject stored in database. "
            + "Currently creates a table data_X where X is the id of the observedobject.\n"
            + "     * This is to be removed in future releases, scince an observedobject can\n"
            + "     * now bound to any table.")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created observedobject.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create observedobject: Because of ... \"]}"))
    public Response create(@RequestBody(description = "ObservedObjects definition based on a ObservedObjectType", required = true,
            content = @Content(
                    schema = @Schema(implementation = TblObservedObjectProxy.class))) TblObservedObjectProxy ooProxy) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Find type
        if (ooProxy.getType() == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("Type is missing.");
            return rob.toResponse();
        }
        TblObservedObjectType type = this.em.find(TblObservedObjectType.class,
                ooProxy.getType());

        TblObservedObject oo = new TblObservedObject();
        oo.setMac(ooProxy.getMac());
        oo.setName(ooProxy.getName());
        oo.setDescription(ooProxy.getDescription());
        oo.setCollection(ooProxy.getCollection());
        oo.setIcon(ooProxy.getIcon());
        oo.setManualCapture(ooProxy.getManualCapture());
        oo.setType(type);
        oo.setCompleted(ooProxy.getCompleted());

        // Set collecting data to true, if there is data expected
        if (!type.getOoTypeJoinMtypes().isEmpty()) {
            oo.setDataCapture(true);

            // Build table createion JSON
            JsonObjectBuilder builder = Json.createObjectBuilder();
            JsonArrayBuilder colarr = Json.createArrayBuilder();

            // Name column
            for (TblOoTypeJoinMType curJoiner : type.getOoTypeJoinMtypes()) {
                JsonObjectBuilder namecol = Json.createObjectBuilder();
                String name = curJoiner.getName();
                if (name == null) {
                    name = curJoiner.getMeasurementType().getName();
                }
                if (name == null || name.isEmpty()) {
                    rob.setStatus(Response.Status.BAD_REQUEST);
                    rob.addErrorMessage("Could not create observedobject, because at least one attribute has no name.");
                    return rob.toResponse();
                }
                namecol.add("name", name);
                namecol.add("type", curJoiner.getMeasurementType().getType());
                colarr.add(namecol);
            }

            // Create attribute array
            builder.add("attributes", colarr);
            JsonObject dataObject = builder.build();

            // Create target of SmartData
            Client client = ClientBuilder.newClient();
            WebTarget webTarget = client.target(this.conf.getProperty("smartdata.url"));
            webTarget = webTarget.path("smartdata");
            webTarget = webTarget.path("collection");
            webTarget = webTarget.path(oo.getCollection());
            if (this.conf.getProperty("smartdata.storage") != null) {
                webTarget = webTarget.queryParam("storage", this.conf.getProperty("smartdata.storage"));
            }
            Entity<String> coldef = Entity.json(dataObject.toString());

            Response response = webTarget.request(MediaType.APPLICATION_JSON).post(coldef);
            String responseText = response.readEntity(String.class);
            if (response.getStatus() >= 400) {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Created no collection, because there was an error: " + responseText);
                return rob.toResponse();
            } else if (response.getStatus() == 304) {
                if (this.conf.getProperty("collections.allowreuse").equalsIgnoreCase("true")) {
                    rob.addWarningMessage("Reusing existing collection >" + oo.getCollection() + "<");
                } else {
                    rob.setStatus(Response.Status.PRECONDITION_FAILED);
                    rob.addErrorMessage("Collection allready exists, reuse not permitted");
                    return rob.toResponse();
                }
            }
        } else {
            rob.addWarningMessage("Created no collection, because there are no mesurementtypes");
        }

        try {
            this.utx.begin();
            this.em.persist(oo);
            this.em.flush();
            this.utx.commit();
            rob.setStatus(Response.Status.CREATED);
//            rob.add(oo);
            rob.add("id", oo.getId());
            Response.Status status = Response.Status.OK;
            ResponseBuilder rb = Response.status(status);
            rb.entity(oo.getId());
            return rb.build();
        } catch (RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException | SystemException | NotSupportedException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while saveing observedobject: " + ex.getLocalizedMessage());
        }
        return rob.toResponse();
    }

    @POST
    @Path("createWithLocation")
    @Produces(MediaType.APPLICATION_JSON)
    @Consumes(MediaType.APPLICATION_JSON)
//    @Proxied()
    @Operation(summary = "Creates a new observedobject, a new location object and connects them ",
            description = "Creates a new observedobject, a new location object and connector stored in database. "
            + "Currently creates a table data_X where X is the id of the observedobject.\n"
            + "     * This is to be removed in future releases, scince an observedobject can\n"
            + "     * now bound to any table.")
    @APIResponse(
            responseCode = "201",
            description = "Primary key of the new created observedobject.",
            content = @Content(
                    mediaType = "text/plain",
                    example = "1"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create observedobject: Because of ... \"]}"))
    public Response createWithLocation(@RequestBody TblObservedObjectTblLocationProxy request) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (request.getLocName() == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("Location Name is missing.");
            return rob.toResponse();
        }

        if (request.getLocLatitude() == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("Latitude is missing.");
            return rob.toResponse();
        }

        if (request.getLocLongitude() == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("Longitude is missing.");
            return rob.toResponse();
        }

        // Find type
        if (request.getOoType() == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("Type is missing.");
            return rob.toResponse();
        }
        TblObservedObjectType type = this.em.find(TblObservedObjectType.class,
                request.getOoType());

        TblObservedObject oo = new TblObservedObject();
        oo.setName(request.getOoName());
        oo.setDescription(request.getOoDescription());
        oo.setCollection(request.getOoCollection());
        oo.setIcon(request.getIcon());
        oo.setManualCapture(request.getManualCapture());
        oo.setType(type);
        oo.setCompleted(request.getOoCompleted());

        TblLocation loc = new TblLocation();
        loc.setName(request.getLocName());
        loc.setApartment(request.getLocApartment());
        loc.setCity(request.getLocCity());
        loc.setCountry(request.getLocCountry());
        loc.setDescription(request.getLocDescription());
        loc.setFloor(request.getLocFloor());
        loc.setHousenumber(request.getLocHousenumber());
        loc.setPostcode(request.getLocPostcode());
        loc.setRoom(request.getLocRoom());
        loc.setStreet(request.getLocStreet());
        loc.setCoordinates(request.getGeoObject());

        TblLocationJoinOo ooJoinLoc = new TblLocationJoinOo();
        ooJoinLoc.setOo(oo);
        ooJoinLoc.setLoc(loc);

        if (request.getValid_from() == null) {
            ooJoinLoc.setValid_from(LocalDateTime.now());
        } else {
            ooJoinLoc.setValid_from(request.getValid_from());
        }
        ooJoinLoc.setValid_until(request.getValid_until());

        if (oo.getCollection() != null ) {
            // Set collecting data to true, if there is data expected
            if (!type.getOoTypeJoinMtypes().isEmpty()) {
                oo.setDataCapture(true);

                // Build table createion JSON
                JsonObjectBuilder builder = Json.createObjectBuilder();
                JsonArrayBuilder colarr = Json.createArrayBuilder();

                // Name column
                for (TblOoTypeJoinMType curJoiner : type.getOoTypeJoinMtypes()) {
                    JsonObjectBuilder namecol = Json.createObjectBuilder();
                    String name = curJoiner.getName();
                    if (name == null) {
                        name = curJoiner.getMeasurementType().getName();
                    }
                    namecol.add("name", name);
                    namecol.add("type", curJoiner.getMeasurementType().getType());
                    colarr.add(namecol);
                }

                // Create attribute array
                builder.add("attributes", colarr);
                JsonObject dataObject = builder.build();

                // Check if configuration exists
                String smartdataURL = this.conf.getProperty("smartdata.url");
                if(smartdataURL == null) {
                    rob.addErrorMessage("Configuration is missing entry >smartdata.url<");
                    rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                    return rob.toResponse();
                }
                
                // Create target of SmartData
                Client client = ClientBuilder.newClient();
                WebTarget webTarget = client.target(smartdataURL);
                webTarget = webTarget.path("smartdata");
                webTarget = webTarget.path("collection");
                webTarget = webTarget.path(oo.getCollection());
                if (this.conf.getProperty("smartdata.storage") != null) {
                    webTarget = webTarget.queryParam("storage", this.conf.getProperty("smartdata.storage"));
                }
                Entity<String> coldef = Entity.json(dataObject.toString());

                Response response = webTarget.request(MediaType.APPLICATION_JSON).post(coldef);
                String responseText = response.readEntity(String.class);
                if (response.getStatus() >= 400) {
                    rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                    rob.addErrorMessage("Created no collection, because there was an error: " + responseText);
                    return rob.toResponse();
                } else if (response.getStatus() == 304) {
                    if (this.conf.getProperty("collections.allowreuse").equalsIgnoreCase("true")) {
                        rob.addWarningMessage("Reusing existing collection >" + oo.getCollection() + "<");
                    } else {
                        rob.setStatus(Response.Status.PRECONDITION_FAILED);
                        rob.addErrorMessage("Collection allready exists, reuse not permitted");
                        return rob.toResponse();
                    }
                }
            } else {
                rob.addWarningMessage("Created no collection, because there are no mesurementtypes");
            }
        }

        try {
            this.utx.begin();
            this.em.persist(oo);
            this.em.persist(loc);
            this.em.persist(ooJoinLoc);
            this.em.flush();
            this.utx.commit();
            rob.setStatus(Response.Status.CREATED);
            rob.add("ooId", oo.getId());
            rob.add("locId", loc.getId());
            rob.setStatus(Response.Status.OK);
            return rob.toResponse();
        } catch (RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException | SystemException | NotSupportedException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while saveing observedobject: " + ex.getLocalizedMessage());
        }
        return rob.toResponse();
    }

    @POST
    @Path("addChild")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Add a new child to an observedobject",
            description = "Add a new child to an observedobject")
    @APIResponse(
            responseCode = "201")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not add child observedobject: Because of ... \"]}"))
    public Response addChild(
            @Parameter(description = "Parent observedobjects id", required = true) @QueryParam("parent_id") Long parent_id,
            @Parameter(description = "Child observedobjects id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        TblObservedObject parent;
        TblObservedObject child;
        if (parent_id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >parent_id< is not given");
            return rob.toResponse();
        }
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >id< (childs id) is not given");
            return rob.toResponse();

        }
        try {
            parent = this.em.find(TblObservedObject.class,
                    parent_id);
            if (parent == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("Parentid not found");
                return rob.toResponse();

            }
            child = this.em.find(TblObservedObject.class,
                    id);
            if (child == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("Childid not found");
                return rob.toResponse();
            }

            parent.addChild(child);
            child.setParent(parent);

            this.utx.begin();
            this.em.merge(child);
            this.em.merge(parent);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);

        } catch (NotSupportedException | SystemException | RollbackException
                | HeuristicMixedException | HeuristicRollbackException
                | SecurityException | IllegalStateException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Save Error: " + ex.getLocalizedMessage());

        } catch (PersistenceException ex) {
            rob.setStatus(Response.Status.UNAUTHORIZED);
            rob.addErrorMessage("No Database access");
        }
        return rob.toResponse();
    }

    @GET
    @Path("get")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get a observedobject",
            description = "Get a observedobject by id")
    @APIResponse(
            responseCode = "200",
            description = "observedobject found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"id\" : 1, \"name\" : \"myname\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobject: Because of ... \"]}"))
    public Response get(
            @Parameter(description = "Observedobjects id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Check if id is null
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("There was no id given.");
            return rob.toResponse();
        }

        TblObservedObject oo = this.em.find(TblObservedObject.class,
                id);
        if (oo == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("ObservedObject with id " + id + " could not be found.");
            return rob.toResponse();
        }
        rob.add(oo);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @GET
    @Path("getByMAC")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get an observedobject by MAC Address",
            description = "Get an observedobject by MAC Address")
    @APIResponse(
            responseCode = "200",
            description = "observedobject found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"id\" : 1, \"name\" : \"myname\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobject: Because of ... \"]}"))
    public Response getByMAC(
            @Parameter(description = "Observedobjects MAC", required = true) @QueryParam("mac") String mac) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        List<TblObservedObject> oo = this.em.createNamedQuery("TblObservedObject.findByMAC", TblObservedObject.class)
                .setParameter("mac", mac)
                .getResultList();
        rob.add(oo);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }
    
    @GET
    @Path("getByName")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get an observedobject by name",
            description = "Get an observedobject by name")
    @APIResponse(
            responseCode = "200",
            description = "observedobject found and delivered",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"id\" : 1, \"name\" : \"myname\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobject: Because of ... \"]}"))
    public Response getByName(
            @Parameter(description = "Observedobjects name", required = true) @QueryParam("name") String name) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        List<TblObservedObject> oo = this.em.createNamedQuery("TblObservedObject.findByName", TblObservedObject.class)
                .setParameter("name", name)
                .getResultList();
        rob.add(oo);
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @GET
    @Path("list")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List observedobject",
            description = "List all observedobjects from database that are matching the parameters.")
    @APIResponse(
            responseCode = "200",
            description = "observedobjects requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjects: Because of ... \"]}"))
    public Response list() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        List<TblObservedObject> tblobservedobjects = this.em.createNamedQuery("TblObservedObject.findAll", TblObservedObject.class).getResultList();
        rob.add("list", tblobservedobjects);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Path("listForTypename")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Gets observedobject for a type",
            description = "Lists all observedobject for a type identified by its name")
    @APIResponse(
            responseCode = "200",
            description = "observedobjects requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjects: Because of ... \"]}"))
    public Response listForTypename(
            @Parameter(description = "Observedobjecttypes name", required = true) @QueryParam("typename") String typename) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if (typename == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("parameter >typename< is not set ");
            return rob.toResponse();
        }

        try {
            TblObservedObjectType ootype = this.em.createNamedQuery("TblObservedObjectType.findByName", TblObservedObjectType.class)
                    .setParameter("name", typename)
                    .getSingleResult();
            try {
                List<TblObservedObject> observedobjects = this.em.createNamedQuery("TblObservedObject.findByType", TblObservedObject.class)
                        .setParameter("type", ootype)
                        .getResultList();

                rob.add(observedobjects);
                rob.setStatus(Response.Status.OK);
            } catch (NoResultException ex) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addException(ex);

                rob.addErrorMessage("There are no observedobjects with type >" + typename + "<.");
            }
        } catch (NoResultException ex) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addException(ex);
            rob.addErrorMessage("The observedobjecttype >" + typename + "< was not found.");
        }

        return rob.toResponse();
    }

    @GET
    @Path("listForMetadataVal")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Gets observedobjects by its metadata value",
            description = "Lists all observedobject with a specific metadata value")
    @APIResponse(
            responseCode = "200",
            description = "observedobjects requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjects: Because of ... \"]}"))
    public Response listForMetadataVal(
            @Parameter(description = "Metadata value", required = true) @QueryParam("val") String val) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        List<TblObservedObjectMetadata> ooconfs = this.em.createNamedQuery("TblObservedObjectMetadata.findByValue",
                TblObservedObjectMetadata.class)
                .setParameter("val", val).getResultList();

        rob.add("list", ooconfs);

        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    /**
     * Delivers a list of observedobjects that are collection data.
     *
     * @return List of observedobjects collecting data
     */
    @GET
    @Path("listHierarchyOos")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Lists all observedobjects with hiearchy function",
            description = "Lists all observedobjects with hiearchy function")
    @APIResponse(
            responseCode = "200",
            description = "observedobjects requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjects: Because of ... \"]}"))
    public Response listHierarchyOos() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Get available observedobjects
        List<TblObservedObject> oolist = this.em.createNamedQuery("TblObservedObject.findAll", TblObservedObject.class).getResultList();
        List<TblObservedObject> list = new ArrayList<>();
        for (TblObservedObject curObj : oolist) {
            if (curObj.getType().getMeasurementtypes().isEmpty()) {
                list.add(curObj);
            }
        }
        rob.add("list", list);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Path("listDataOos")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List all observedobjects that can collect data",
            description = "List all observedobjects that can collect data")
    @APIResponse(
            responseCode = "200",
            description = "observedobjects requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjects: Because of ... \"]}"))
    public Response listDataOos() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Get available observedobjects
        List<TblObservedObject> oolist = this.em.createNamedQuery("TblObservedObject.findAll", TblObservedObject.class).getResultList();
        List<TblObservedObject> list = new ArrayList<>();
        for (TblObservedObject curObj : oolist) {
            if (!curObj.getType().getMeasurementtypes().isEmpty()) {
                list.add(curObj);
            }
        }
        rob.add("list", list);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Path("listChilds")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List childs for an observedobject",
            description = "List childs for an observedobject")
    @APIResponse(
            responseCode = "200",
            description = "observedobjects requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjects: Because of ... \"]}"))
    public Response listChilds(
            @Parameter(description = "Parent observedobject id", required = true) @QueryParam("parent_id") Long parent_id,
            @Parameter(description = "If true lists also sub childs", required = true) @QueryParam("recursive") boolean recursive) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        // Redirect to list method
        if (parent_id == null && recursive == true) {
            return this.list();
        }
        List<TblObservedObject> tblobservedobjects = this.listChilds(parent_id, null, recursive);
        rob.add(tblobservedobjects);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    /**
     * List for loading all childs in one flat list
     *
     * @param parent_id Id of the parent, where to get childs from, if null,
     * parent must be set
     * @param parent Parent object, if null, parent_id must be set
     * @param recursive Set to true, if childs childs should be listed aswell
     * @return List of found childs
     */
    private List<TblObservedObject> listChilds(Long parent_id, TblObservedObject parent, boolean recursive) {

        List<TblObservedObject> tblobservedobjects;
        // Load parent if not done
        if (parent == null && parent_id != null && parent_id >= 1) {
            parent = this.em.createNamedQuery("TblObservedObject.findById", TblObservedObject.class).setParameter("id", parent_id).getSingleResult();
        }

        // Load childs
        if (parent != null) {
            tblobservedobjects = this.em.createNamedQuery("TblObservedObject.findByParent", TblObservedObject.class)
                    .setParameter("parent", parent)
                    .getResultList();
        } else {
            tblobservedobjects = this.em.createNamedQuery("TblObservedObject.findByNullParent", TblObservedObject.class).getResultList();
        }

        if (recursive) {
            List<TblObservedObject> subchildslist = new ArrayList<>();
            for (TblObservedObject curObj : tblobservedobjects) {
                subchildslist.addAll(this.listChilds(null, curObj, recursive));
            }
            tblobservedobjects.addAll(subchildslist);
        }
        return tblobservedobjects;
    }

    @GET
    @Path("listParents")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "List all parents for an observedobject",
            description = "List all parents for an observedobject")
    @APIResponse(
            responseCode = "200",
            description = "observedobjects requested",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "observedobjects not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjects: Because of ... \"]}"))
    public Response listParents(
            @Parameter(description = "Observedobject id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        TblObservedObject oo = this.em.find(TblObservedObject.class, id);
        if (oo == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("ObservedObject with id " + id + " was not found.");
            return rob.toResponse();
        }
        TblObservedObject parentOo = oo.getParent();
        List<TblObservedObject> parents = new ArrayList<>();
        while (parentOo != null) {
            parents.add(parentOo);
            // Get next parent
            parentOo = parentOo.getParent();
        }
        Collections.reverse(parents);
        ResponseListBuilder rlb = new ResponseListBuilder();
        for (TblObservedObject curParent : parents) {
            ResponseObjectBuilder oorob = new ResponseObjectBuilder();
            oorob.add("id", curParent.getId());
            oorob.add("name", curParent.getName());
            rlb.add(oorob);
        }
        rob.add("list", rlb);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Path("search")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Search for observedobjects",
            description = "Search for observedobjects with a search expression. Searches the given value in observedobjects name and metadata.")
    @APIResponse(
            responseCode = "200",
            description = "observedobjects matching the search expression",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = TblObservedObject.class),
                    example = "{\"records\" : [{\"id\" :  1, \"name\" : \"myname\"}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "observedobjects not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get observedobjects: Because of ... \"]}"))
    public Response search(
            @Parameter(description = "search expression", required = true) @QueryParam("searchexpression") String searchexpression) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        if (searchexpression == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("No search condition given");
            return rob.toResponse();
        }

        String[] sexps = searchexpression.split(" \\+");
        Map<Long, TblObservedObject> oomap = new HashMap<>();
        for (int i = 0; i < sexps.length; i++) {
            // Search for objects with name
            List<TblObservedObject> partlist
                    = this.em.createNamedQuery("TblObservedObject.findByNamePart", TblObservedObject.class
                    )
                            .setParameter("name", "%" + sexps[i] + "%")
                            .getResultList();
            for (TblObservedObject curObj : partlist) {
                oomap.put(curObj.getId(), curObj);
            }
            // Search for metadata with value
            List<TblObservedObjectMetadata> metadatalist = this.em.createNamedQuery("TblObservedObjectMetadata.findByValuePart", TblObservedObjectMetadata.class)
                    .setParameter("valuepart", "%" + sexps[i] + "%").getResultList();
            for (TblObservedObjectMetadata curMetadata : metadatalist) {
                oomap.put(curMetadata.getObservedObject().getId(), curMetadata.getObservedObject());
            }
            //TODO implement search for location name
        }

        ResponseListBuilder rlb = new ResponseListBuilder();
        for (Map.Entry<Long, TblObservedObject> curOoEntry : oomap.entrySet()) {
            TblObservedObject curOo = curOoEntry.getValue();
            ResponseObjectBuilder oorob = new ResponseObjectBuilder();
            oorob.add("id", curOo.getId());
            oorob.add("name", curOo.getName());
            if (curOo.getDescription() != null) {
                oorob.add("description", curOo.getDescription());
            }
            if (curOo.getParent() != null) {
                oorob.add("parent_id", curOo.getParent().getId());
                oorob.add("parent_name", curOo.getParent().getName());
                if (curOo.getParent().getParent() != null) {
                    oorob.add("parent_parent_id", curOo.getParent().getParent().getId());
                    oorob.add("parent_parent_name", curOo.getParent().getParent().getName());
                }
            }

            rlb.add(oorob);
        }
        rob.add("list", rlb);
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    /**
     * Lists all observedobjects with their current state. This state contains
     * information about activity, number of datasets and object based options.
     * Because this is calculated this can take some time.
     *
     * @return json list of observedobjects with stati
     * @deprecated To be replaced by SmartDataLyser in combination with
     * SmartData
     */
    @GET
    @Path("listStatus")
    @Produces(MediaType.APPLICATION_JSON)
    @Deprecated
    public Response listStatus() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        long startTime = System.currentTimeMillis();

        // Get available observedobjects
        List<TblObservedObject> oolist = this.em.createNamedQuery("TblObservedObject.findAll", TblObservedObject.class).getResultList();

        LocalDateTime nowdate = LocalDateTime.now();

        ResponseListBuilder rlb = new ResponseListBuilder();
        int i = 0;
        for (TblObservedObject curObj : oolist) {
            ResponseObjectBuilder robObj = new ResponseObjectBuilder();
            robObj.add("id", curObj.getId());
            if (curObj.getParent() != null) {
                robObj.add("parent", curObj.getParent());
            }
            robObj.add("name", curObj.getName());

            if (!curObj.getType().getOoTypeJoinMtypes().isEmpty()) {
                Boolean manCap = curObj.getManualCapture();
                if (manCap == null) {
                    manCap = false;
                }
                robObj.add("manualCapture", manCap);
                robObj.add("collectsData", true);

                // Get number of datasets
                BigInteger noOfRows = (BigInteger) this.em.createNativeQuery("SELECT COUNT(id) FROM smartmonitoring.data_" + curObj.getId()).getSingleResult();
                robObj.add("setsTotal", noOfRows.longValue());

                // Get data (ordered by ts if available or by id)
                String orderColumn = "id";
                if (curObj.getType().isOoTypeJoinMTypeExisting("ts")) {
                    orderColumn = "ts";
                }
                List<Map<String, Object>> dataMap = new ArrayList<>();
//                try {
//                    DynamicTable dt = new DynamicTable(this.em, this.utx, curObj);
//                    dataMap = dt.getData(null, null, null, null, null, 0, 1, orderColumn, "DESC", false);
//                } catch (PersistenceException ex) {
//                    String errmsg = "Could not get dataset. " + ex.getLocalizedMessage();
//                    errmsg = errmsg.replace("\n", "").replace("\r", "");
//                    robObj.add("status", errmsg);
//                }

                // Analyse last dataset
                if (!dataMap.isEmpty()) {
                    // Add first result to response
                    Map<String, Object> resultList = dataMap.get(0);
                    ResponseObjectBuilder valRob = new ResponseObjectBuilder();
                    for (Map.Entry<String, Object> curEntry : resultList.entrySet()) {
                        // Convert BigInteger value to long
                        Object value;
                        if (curEntry.getValue() instanceof BigInteger) {
                            value = ((BigInteger) curEntry.getValue()).longValue();
                        } else {
                            value = curEntry.getValue();
                        }
                        valRob.add(curEntry.getKey(), value);

                        // Check last sets date
                        if (curEntry.getKey().equalsIgnoreCase("ts")) {
                            LocalDateTime tsldt = ((Timestamp) value).toLocalDateTime();
                            robObj.add("lastSetFrom", tsldt);
                            // Calculate if the the device is active or not
                            long difference = ChronoUnit.MINUTES.between(tsldt, nowdate);
                            robObj.add("lastMinutesPast", difference);
//                            Configuration conf = SystemBean.getInstance();
//                            Long deviceInactivityTime = conf.getEntry("deviceInactivityTime", Long.class);
//                            if (difference > deviceInactivityTime) {
//                                robObj.add("active", false);
//                            } else {
//                                robObj.add("active", true);
//                            }
                        }
                    }
                    robObj.add("lastvalues", valRob);
                } else if (noOfRows.longValue() == 0) {
                    robObj.add("active", false);
                }

            } else {
                robObj.add("collectsData", false);
            }

            rlb.add(robObj);
        }
        rob.add("list", rlb);

        long endTime = System.currentTimeMillis();
        rob.add("executiontime", (endTime - startTime));

        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    /**
     * Gets the state of the observedobject with the given id.This state
     * contains information about activity, number of datasets and object based
     * options. Because this is calculated this can take some time.
     *
     * @param id Id of the observedobject to get the status from
     * @return json list of observedobjects with stati
     * @deprecated To be replaced by SmartDataLyser in combination with
     * SmartData
     */
    @GET
    @Path("getStatus")
    @Produces(MediaType.APPLICATION_JSON)
    @Deprecated
    public Response getStatus(
            @QueryParam("id") Long id) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Check if id is null
        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("There was no id given.");
            return rob.toResponse();

        }

        // Get observedobject
        TblObservedObject oo = this.em.find(TblObservedObject.class, id);

        if (oo == null) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("There is no object with id >" + id + "<");
            return rob.toResponse();
        }

        LocalDateTime nowdate = LocalDateTime.now();

        rob.add("id", oo.getId());
        if (oo.getParent() != null) {
            rob.add("parent_id", oo.getParent().getId());
        }
        rob.add("name", oo.getName());

        if (!oo.getType().getOoTypeJoinMtypes().isEmpty()) {
            rob.add("manualCapture", oo.getManualCapture());
            rob.add("collectsData", true);

            // Get number of datasets
            BigInteger noOfRows = (BigInteger) this.em.createNativeQuery("SELECT COUNT(*) FROM smartmonitoring.data_" + oo.getId()).getSingleResult();
            rob.add("setsTotal", noOfRows.longValue());

            // Get data (ordered by ts if available or by id)
            List<Map<String, Object>> dataMap = new ArrayList<>();
            String sortByColumnName = "ts";
            if (!oo.getType().isOoTypeJoinMTypeExisting("ts")) {
                sortByColumnName = "id";
            }
//            try {
//                DynamicTable dt = new DynamicTable(this.em, this.utx, oo);
//                dataMap = dt.getData(null, null, null, null, null, 0, 1, sortByColumnName, "DESC", false);
//            } catch (PersistenceException ex) {
//                rob.add("status", "could not get dataset. " + ex.getLocalizedMessage());
//                System.err.println(ex.getLocalizedMessage());
//                ex.printStackTrace();
//            }

            // Analyse last dataset
            if (!dataMap.isEmpty()) {
                // Add first result to response
                Map<String, Object> resultList = dataMap.get(0);
                ResponseObjectBuilder valRob = new ResponseObjectBuilder();
                for (Map.Entry<String, Object> curEntry : resultList.entrySet()) {
                    // Convert BigInteger value to long
                    Object value;
                    if (curEntry.getValue() instanceof BigInteger) {
                        value = ((BigInteger) curEntry.getValue()).longValue();
                    } else {
                        value = curEntry.getValue();
                    }
                    valRob.add(curEntry.getKey(), value);

                    // Check last sets date
                    if (curEntry.getKey().equalsIgnoreCase("ts")) {
                        java.sql.Timestamp ts = (java.sql.Timestamp) value;
                        LocalDateTime ldt = ts.toLocalDateTime();
                        rob.add("lastSetFrom", ldt);
                        // Calculate if the the device is active or not
                        long difference = ChronoUnit.MINUTES.between(ldt, nowdate);
                        rob.add("lastMinutesPast", difference);
//                        Configuration conf = SystemBean.getInstance();
//                        Long deviceInactivityTime = conf.getEntry("deviceInactivityTime", Long.class);
//                        if (difference > deviceInactivityTime) {
//                            rob.add("active", false);
//                        } else {
//                            rob.add("active", true);
//                        }
                    }
                }
                rob.add("lastvalues", valRob);
            } else if (noOfRows.longValue() == 0) {
                rob.add("active", false);
            }

        } else {
            rob.add("collectsData", false);
        }

        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @PUT
    @Path("update")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
//    @Proxied(required = {"id"})
    @Operation(summary = "Updates an observedobject",
            description = "Updates an existing location. Does nothing if the dataset does not exists.")
    @APIResponse(
            responseCode = "200",
            description = "Updated observedobject",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"id\" :  1, \"name\" : \"myname\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not update observedobject: Because of ... \"]}"))
    public Response update(TblObservedObject oo) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        try {
            this.utx.begin();
            this.em.merge(oo);
            this.utx.commit();
            rob.add(oo);
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while accessing the database!");
        } catch (PersistenceException ex) {
            rob.setStatus(Response.Status.UNAUTHORIZED);
            rob.addErrorMessage("No Database access");
        }
        return rob.toResponse();
    }

    @DELETE
    @Path("delete")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Deletes an observedobject",
            description = "Deletes a observedobject from database.")
    @APIResponse(
            responseCode = "200"
    )
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not delete observedobject: Because of ... \"]}"))
    public Response delete(
            @Parameter(description = "Observedobject id", required = true) @QueryParam("id") Long id) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        if (id == null) {
            rob.setStatus(Response.Status.PRECONDITION_FAILED);
            rob.addErrorMessage("Parameter >id< is required to delete observedobject.");
            return rob.toResponse();
        }

        try {
            this.utx.begin();
            TblObservedObject oo = this.em.find(TblObservedObject.class,
                    id);
            if (oo == null) {
                rob.setStatus(Response.Status.NOT_FOUND);
                rob.addErrorMessage("ObservedObject with id >" + id + "< does not exists.");
                return rob.toResponse();
            }
            this.em.remove(oo);
            this.utx.commit();
            rob.setStatus(Response.Status.OK);
        } catch (NotSupportedException | SystemException | HeuristicMixedException | HeuristicRollbackException | RollbackException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Error while accessing the database!");
        } catch (PersistenceException ex) {
            rob.setStatus(Response.Status.UNAUTHORIZED);
            rob.addErrorMessage("No Database access");
        }
        return rob.toResponse();
    }
}
