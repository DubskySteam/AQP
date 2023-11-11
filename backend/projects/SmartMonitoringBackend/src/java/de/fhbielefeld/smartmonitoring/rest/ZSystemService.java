package de.fhbielefeld.smartmonitoring.rest;

//import de.ffehring.iop.persistence.LoadException;
//import de.fhbielefeld.scl.database.system.SystemBean;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
//import de.ffehring.iop.persistence.configuration.Configuration;
//import de.ffehring.iop.persistence.configuration.ConfigurationEntry;
import de.fhbielefeld.smartmonitoring.jpa.TblLocation;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObject;
import de.fhbielefeld.smartmonitoring.jpa.TblSystemConfiguration;
import java.io.StringReader;
import java.time.LocalDateTime;
import java.util.List;
import jakarta.annotation.Resource;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.PersistenceException;
import jakarta.transaction.HeuristicMixedException;
import jakarta.transaction.HeuristicRollbackException;
import jakarta.transaction.NotSupportedException;
import jakarta.transaction.RollbackException;
import jakarta.transaction.SystemException;
import jakarta.transaction.UserTransaction;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("zsystemservice")
@Tag(name = "SystemService", description = "Manage options for the SmartMonitoring and get system status")
public class ZSystemService {

    /**
     * Entity Manager, basierend auf der presitence.xml gepeicherten
     * Datenbankverbindung
     */
    @PersistenceContext(unitName = "SmartMonitoringBackendPU")
    private EntityManager em;

    /**
     * User Transaction zur Kommunikation zur Datenbank
     */
    @Resource
    private UserTransaction utx;

    /**
     * Checks if the REST-API is reachable
     *
     * @return
     */
    @GET
    @Path("apiCheckup")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Checks if SmartMonitoring is running fine",
            description = "Checks if SmartMonitoring is running fine")
    @APIResponse(
            responseCode = "200",
            description = "Everything is ok. Give status information",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"version\": \"3.0 alpha\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Error checking API: Because of ... \"]}"))
    public Response apiCheckup() {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

//        SystemBean systemBean = SystemBean.getInstance();

//        rob.add("version", systemBean.getVersion());
        if (this.em != null) {
            try {
                boolean setupCompleted = false;
//                for (ConfigurationEntry curConf : systemBean.getConfigurationEntries()) {
//                    if (curConf.getKey().equalsIgnoreCase("setupDate")) {
//                        setupCompleted = true;
//                    }
//                }
                if (!setupCompleted) {
                    rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
                    rob.addErrorMessage("Setup is not completed");
                    Response response = rob.toResponse();
                    return response;
                }
            } catch (PersistenceException ex) {
                if (ex.getCause().getMessage().contains("could not extract ResultSet")
                        && ex.getCause().getCause().getClass().getSimpleName().equalsIgnoreCase("PSQLException")
                        && ex.getCause().getCause().getMessage().contains("smartmonitoring.tbl_systemconfiguration")) {
                    rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
                    rob.addErrorMessage("Backend is not setup correctly.");
                    Response response = rob.toResponse();
                    return response;
                }
            }
            rob.setStatus(Response.Status.OK);
        } else {
            rob.setStatus(Response.Status.SERVICE_UNAVAILABLE);
            rob.addErrorMessage("No database connection found");
        }
        return rob.toResponse();
    }

    @GET
    @Path("configuration")
    @Operation(summary = "Returns current configuration",
            description = "Returns current configuration")
    @APIResponse(
            responseCode = "200",
            description = "Configuration JSON",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"version\": \"3.0 alpha\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create location: Because of ... \"]}"))
    public Response getConfiguration() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Get system configuration
//        Configuration conf = SystemBean.getInstance();
//
//        // Get configurations from SystemBean
//        for (ConfigurationEntry curEntry : conf.getConfigurationEntries()) {
//            rob.add(curEntry.getKey(), curEntry.getValue());
//        }

        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    @GET
    @Path("informations")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Returns current configuration",
            description = "Returns current configuration")
    @APIResponse(
            responseCode = "200",
            description = "Configuration JSON",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"version\": \"3.0 alpha\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not create location: Because of ... \"]}"))
    public Response getInformations() {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

//        SystemBean systemBean = SystemBean.getInstance();
//
//        rob.add("version", systemBean.getVersion());
//        rob.add("debugmode", systemBean.isDebugmode());
//        rob.add("startupTime", systemBean.getLoadTime());
//        rob.add("publicIP", systemBean.getPublicIP());
//        rob.add("systemMAC", SystemBean.getSystemMAC());

//        if (systemBean.getAppId() != null) {
//            rob.add("systemId", systemBean.getAppId());
//        } else {
//            rob.add("systemId", "none");
//        }
//        boolean httpsSupport = systemBean.checkHttpsSupport();
//        rob.add("httpsSupported", httpsSupport);
//        String masterURL = systemBean.getEntry("masterURL");
//        if (masterURL != null) {
//            rob.add("masterConnecticity", systemBean.checkMasterConnectivity());
//            rob.add("masterOperability", systemBean.checkMasterOperability());
//        }
//        rob.add("internetConnectivity", systemBean.checkInternetConnectivity());
//        rob.add("supportedMediaFormats", systemBean.supportedMediaFormats());
//
//        // Add configurations
//        // Get system configuration
//        Configuration conf = SystemBean.getInstance();
//
//        // Get configurations from SystemBean
//        for (ConfigurationEntry curEntry : conf.getConfigurationEntries()) {
//            rob.add(curEntry.getKey(), curEntry.getValue());
//        }
//
//        // List loaded native libraries
//        ResponseListBuilder nativeLibList = new ResponseListBuilder();
//        for (Entry<String, String> curNativeLib : SystemBean.getInstance().getLoadedNativeLibraries().entrySet()) {
//            ResponseObjectBuilder nativeLibObj = new ResponseObjectBuilder();
//            nativeLibObj.add(curNativeLib.getKey(), curNativeLib.getValue());
//            nativeLibList.add(nativeLibObj);
//        }
//        rob.add("loadedNativeLibs", nativeLibList);
//
//        //Additional information only delivered in debug mode
//        if (systemBean.isDebugmode()) {
//            rob.add("systemJavaVendor", System.getProperty("java.vendor"));
//            rob.add("systemJavaVersion", System.getProperty("java.version"));
//            rob.add("systemName", System.getProperty("os.name"));
//            rob.add("systemBase", SystemBean.getInstance().getSystemOperatingSystemBase());
//            rob.add("systemVersion", System.getProperty("os.version"));
//            rob.add("systemArchitecture", System.getProperty("os.arch"));
//        }

        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }

    /**
     * REST api for setting configuration entries
     * //TODO change to POST interface
     * @param key Name of the configuration entry
     * @param value Conficurations value
     * @return Status message on change
     */
    @GET
    @Path("configure")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Set configuration",
            description = "Set configuration")
    @APIResponse(
            responseCode = "200",
            description = "Configuration JSON")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not set configuration: Because of ... \"]}"))
    public Response configure(
            @Parameter(description = "Configuration entries name", required = true) @QueryParam("key") String key,
            @Parameter(description = "Configuration entries value", required = true) @QueryParam("value") String value) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        // Get system configurations
        List<TblSystemConfiguration> configs = this.em.createNamedQuery("TblSystemConfiguration.findAll", TblSystemConfiguration.class).getResultList();
        boolean confModified = false;
        for (TblSystemConfiguration curConfig : configs) {
            if (curConfig.getKey().equals(key)) {
                try {
                    curConfig.setValue(value);
                    this.utx.begin();
                    this.em.merge(curConfig);
                    this.utx.commit();
                    confModified = true;
//                    SystemBean systemBean = SystemBean.getInstance();
//                    try {
//                        systemBean.load();
//                    } catch (LoadException ex) {
//                        rob.addWarningMessage("Configuration entry was set but configuration could not be reloaded");
//                    }
                    rob.setStatus(Response.Status.OK);
                } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
                    rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                    rob.addErrorMessage(ex.getLocalizedMessage());
                    rob.addException(ex);
                    return rob.toResponse();
                }
            }
        }
        if(!confModified) {
            rob.setStatus(Response.Status.NOT_FOUND);
            rob.addErrorMessage("Configuration entry >" + key + "< not found.");
        }
        return rob.toResponse();
    }

    @POST
    @Path("finishSetup")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Finish setup process",
            description = "Finish setup process. (One time callable)")
    @APIResponse(
            responseCode = "200",
            description = "Configuration JSON",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"version\": \"3.0 alpha\"}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not finish setup: Because of ... \"]}"))
    public Response finishSetup(
            @Parameter(description = "Setup JSON", required = true) String json) {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        try {
            TblSystemConfiguration setupConfEntry = this.em.createNamedQuery("TblSystemConfiguration.findByCkey", TblSystemConfiguration.class)
                    .setParameter("ckey", "setupDate")
                    .getSingleResult();

            if (setupConfEntry != null) {
                rob.setStatus(Response.Status.CONFLICT);
                rob.addErrorMessage("Setup was allready finished.");
                return rob.toResponse();
            }
        } catch (NoResultException ex) {
            // This is what wie hope
        }

        TblSystemConfiguration conf = new TblSystemConfiguration();
        conf.setKey("setupDate");
        conf.setValue(LocalDateTime.now().toString());

        JsonReader jsonReader = Json.createReader(new StringReader(json));
        JsonObject jsonobject = jsonReader.readObject();
        jsonReader.close();

        TblLocation rootLocation = new TblLocation();
        rootLocation.setName(jsonobject.getJsonString("name").getString());
        rootLocation.setStreet(jsonobject.getJsonString("street").getString());
        rootLocation.setHousenumber(jsonobject.getJsonString("houseno").getString());
        rootLocation.setPostcode(jsonobject.getJsonString("zip").getString());
        rootLocation.setCity(jsonobject.getJsonString("city").getString());

        try {
            this.utx.begin();
            this.em.persist(rootLocation);
            this.utx.commit();
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not save location: " + ex.getLocalizedMessage());
            rob.addException(ex);
            return rob.toResponse();
        }

        // Get observedobjects
        List<TblObservedObject> syncObjects = this.em.createNamedQuery("TblObservedObject.findByNullParent", TblObservedObject.class).getResultList();
        for (TblObservedObject curParent : syncObjects) {
            curParent.setDescription(jsonobject.getJsonString("notice").getString());

            try {
                this.utx.begin();
                this.em.merge(curParent);
                this.utx.commit();
            } catch (RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException | SystemException | NotSupportedException ex) {
                rob.addWarningMessage("Could not save changes to observedobject: " + curParent.getId() + ": " + ex.getLocalizedMessage());
            }
        }

//        try {
//            this.utx.begin();
//            this.em.persist(conf);
//            this.utx.commit();
////            SystemBean.getInstance().load();
//            rob.setStatus(Response.Status.OK);
//        } catch (RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException | SystemException | NotSupportedException | LoadException ex) {
//            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
//            rob.addErrorMessage("Could not complete setup. " + ex.getLocalizedMessage());
//        }

        return rob.toResponse();
    }
}
