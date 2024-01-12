package de.fhbielefeld.smartuser.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.scl.security.hash.MD5;
import de.fhbielefeld.smartuser.config.Configuration;
import de.fhbielefeld.smartuser.persistence.jpa.User;
import java.io.IOException;
import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.URL;
import java.net.URLConnection;
import java.net.UnknownHostException;
import java.util.Map.Entry;
import de.fhbielefeld.smartuser.persistence.jpa.Resource;
import de.fhbielefeld.smartuser.persistence.jpa.UserRight;
import javax.naming.NamingException;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.HeuristicMixedException;
import jakarta.transaction.HeuristicRollbackException;
import jakarta.transaction.NotSupportedException;
import jakarta.transaction.RollbackException;
import jakarta.transaction.SystemException;
import jakarta.transaction.UserTransaction;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * REST Web Service for accessing system options and informations
 *
 * @author Florian Fehring
 */
@Path("system")
@Tag(name = "System", description = "SmartData system informations and configuration")
public class SystemResource {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager em;

    @jakarta.annotation.Resource
    private UserTransaction utx;

    /**
     * Creates a new instance of RootResource
     */
    public SystemResource() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Logger.getInstance("SmartUser", moduleName);
            Logger.setDebugMode(true);
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }

    @GET
    @Path("config")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get configuration",
            description = "Lists all configuration options.")
    @APIResponse(
            responseCode = "200",
            description = "Objects with configuration informations",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"list\" : [ { \"name\" : \"value\"} ]}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not load configuration: Because of ... \"]}"))
    public Response getConfig() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Init config
        Configuration conf = new Configuration();

        rob.add("modulname", conf.getModuleName());
        rob.add("filename", conf.getFileName());
        rob.add("propsloaded", conf.isPropsloaded());
        for (Entry<Object, Object> curEntry : conf.getAllProperties()) {
            String curKey = curEntry.getKey().toString();
            if (!curKey.startsWith("ldap_") && !curKey.equals("passwordsalt")
                    && !curKey.equals("authtokensalt")) {
                rob.add(curKey, curEntry.getValue().toString());
            }
        }
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }

    @GET
    @Path("info")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Get system information",
            description = "Gets information about the SmartData system and environment.")
    @APIResponse(
            responseCode = "200",
            description = "Objects with system informations",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"list\" : [ { \"name\" : \"value\"} ]}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get system informations: Because of ... \"]}"))
    public Response info() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Init config
        Configuration conf = new Configuration();

        rob.add("version", "19.05.2023");
        // IP adress
        try {
            rob.add("publicip", InetAddress.getLocalHost().getHostAddress());
        } catch (UnknownHostException ex) {
            rob.add("publicip", "UnknwonIP Adress" + ex.getLocalizedMessage());
        }
        // MAC address
        String MAC = null;
        try {
            InetAddress localhost = InetAddress.getLocalHost();
            NetworkInterface ntInterface = NetworkInterface.getByInetAddress(localhost);
            if (ntInterface == null) {//Raspberry
                ntInterface = NetworkInterface.getByName("eth0");
            }
            if (ntInterface == null) {//Linux Server
                ntInterface = NetworkInterface.getByName("venet0");
            }
            if (ntInterface == null) {//Raspberry-WLAN
                ntInterface = NetworkInterface.getByName("wlan0");
            }
            if (ntInterface == null) {//No HW Address Found
                throw new UnknownHostException();
            }
            byte[] adr = ntInterface.getHardwareAddress();
            MAC = String.format("%02X:%02X:%02X:%02X:%02X:%02X", adr[0], adr[1], adr[2], adr[3], adr[4], adr[5]);
            rob.add("mac", MAC);
        } catch (UnknownHostException | SocketException | NullPointerException ex) {
            rob.add("mac", "Unknon MAC: " + ex.getLocalizedMessage());
        }
        //AppID
        if (conf.getProperty("appid") != null) {
            rob.add("appid", conf.getProperty("appid"));
        } else {
            rob.add("appid", MAC);
        }
        // HTTPS support check
        try {
            URL masterURL = new URL("https://google.de");
            final URLConnection conn = masterURL.openConnection();
            conn.setConnectTimeout(1000);
            conn.connect();
            rob.add("httpsSupported", true);
        } catch (IOException ex) {
            rob.add("httpsSupported", false);
            System.err.println("DEBUG (SystemBean): There is no https support, because of: " + ex.getLocalizedMessage());
        } catch (NoSuchMethodError ex) {
            rob.add("httpsSupported", false);
            System.err.println("DEBUG (SystemBean): There is no https support, because of missing method: " + ex.getLocalizedMessage());
        }
        // Internet conectivity check
        try {
            final URL url = new URL("http://www.google.de");
            final URLConnection conn = url.openConnection();
            conn.setConnectTimeout(1000);
            conn.connect();
            rob.add("internetConnectivity", true);
        } catch (IOException ex) {
            rob.add("internetConnectivity", false);
            System.err.println("Could not connect to google.de " + ex.getLocalizedMessage());
        }

        // Check database conectivity
        if (this.em == null) {
            rob.add("databaseConnectivity", false);
        } else {
            rob.add("databaseConnectivity", true);
        }

        rob.add("systemJavaVendor", System.getProperty("java.vendor"));
        rob.add("systemJavaVersion", System.getProperty("java.version"));
        rob.add("systemName", System.getProperty("os.name"));
        String OS = System.getProperty("os.name").toLowerCase();
        if (OS.startsWith("win")) {
            rob.add("systemBase", "Windows");
        } else {
            rob.add("systemBase", "Linux");
        }
        rob.add("systemVersion", System.getProperty("os.version"));
        rob.add("systemArchitecture", System.getProperty("os.arch"));
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }
    
    @GET
    @Path("setup")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Setup for SmartUser",
            description = "Once runnable. Creates the default admin user and the AppUser group.")
    @APIResponse(
            responseCode = "200",
            description = "Setup executed")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not excute setup: Because of ... \"]}"))
    public Response setup() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Init config
        Configuration conf = new Configuration();
        
        // Greate general users
        User allUser = new User();
        allUser.setUsername("*");
        allUser.setPassword("*");
        
        User adminUser = new User();
        adminUser.setUsername("admin");
        String md5password = MD5.generateMD5Hash(conf.getProperty("passwordsalt")
                + "admin");
        adminUser.setPassword(md5password);
        
        // Create user for apps
        User appUser = new User();
        appUser.setUsername("AppUser");
        String md5password2 = MD5.generateMD5Hash(conf.getProperty("passwordsalt")
                + "SmartPassword1298!");
        appUser.setPassword(md5password2);
        String apptoken = MD5.generateMD5Hash(conf.getProperty("authtokensalt")
                + "ThisTokenIdentifiesTheApp");
        appUser.setAuthtoken(apptoken);
        
        // Create overall ressource
        Resource allRes = new Resource();
        allRes.setPath("*");
        
        // Create SmartUser resources
        Resource userRes = new Resource();
        userRes.setPath("de.fhbielefeld.scl.smartuser.user");
        
        Resource rightsRes = new Resource();
        rightsRes.setPath("de.fhbielefeld.scl.smartuser.userright");
        
        UserRight adminRight = new UserRight();
        adminRight.setResource(allRes);
        adminRight.setAction("*");
        adminRight.setUser(adminUser);
        
        UserRight createUserRightAll = new UserRight();
        createUserRightAll.setResource(userRes);
        createUserRightAll.setAction("CREATE");
        createUserRightAll.setUser(allUser);
        
        UserRight createUserRightAdm = new UserRight();
        createUserRightAdm.setResource(userRes);
        createUserRightAdm.setAction("CREATE");
        createUserRightAdm.setUser(adminUser);
        
        // Apps can grant rights
        UserRight appRight = new UserRight();
        appRight.setResource(allRes);
        appRight.setAction("GRANT");
        appRight.setUser(appUser);
        
        try {
            this.utx.begin();
            this.em.persist(allUser);
            this.em.persist(adminUser);
            this.em.persist(appUser);
            this.em.persist(allRes);
            this.em.persist(userRes);
            this.em.persist(rightsRes);
            this.em.persist(adminRight);
            this.em.persist(createUserRightAll);
            this.em.persist(createUserRightAdm);
            this.em.persist(appRight);
            this.utx.commit();
        } catch (NotSupportedException | SystemException | RollbackException | HeuristicMixedException | HeuristicRollbackException | SecurityException | IllegalStateException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not complete setup: " + ex.getLocalizedMessage());
            rob.addException(ex);
            return rob.toResponse();
        }
        
        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }
    
    @GET
    @Path("airtest")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Test endpoint",
            description = "Test enpoint")
    @APIResponse(
            responseCode = "200",
            description = "Objects with configuration informations",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"list\" : [ { \"name\" : \"value\"} ]}"
            ))
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not load configuration: Because of ... \"]}"))
    public Response getTest() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Init config
        Configuration conf = new Configuration();

        rob.add("project", "air quality");
        
        rob.setStatus(Response.Status.OK);

        return rob.toResponse();
    }
}
