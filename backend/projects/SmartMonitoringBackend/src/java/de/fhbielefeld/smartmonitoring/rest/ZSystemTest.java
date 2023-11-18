package de.fhbielefeld.smartmonitoring.rest;

//import de.fhbielefeld.scl.database.system.SystemBean;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.UserTransaction;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("zsystemtest")
@Tag(name = "SystemTest", description = "Live test cases")
public class ZSystemTest {

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
     * This REST method is for testing of the error handling of uncatched errors
     * by the REST provider.
     *
     * @return should never return normally
     */
    @GET
    @Path("provokeError")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Provokes an error to test error handling",
            description = "Provokes an error to test error handling")
    @APIResponse(
            responseCode = "200")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Error checking: Because of ... \"]}"))
    public Response provokeError() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
//        if (!SystemBean.getInstance().isDebugmode()) {
//            rob.setStatus(Response.Status.FORBIDDEN);
//            rob.addErrorMessage("Testing is not activated.");
//            return rob.toResponse();
//        }

        throw new RuntimeException("Yeah this is an unexpected provoked error!");

        //return rob.toResponse();
    }

    @GET
    @Path("testGetEntityManager")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Test the connection to the database",
            description = "Test the connection to the database")
    @APIResponse(
            responseCode = "200")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Error checking: Because of ... \"]}"))
    public Response testGetEntityManager() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
//        if (!SystemBean.getInstance().isDebugmode()) {
//            rob.setStatus(Response.Status.FORBIDDEN);
//            rob.addErrorMessage("Testing is not activated.");
//            return rob.toResponse();
//        }

//        try {
//            EntityManager lem = SystemBean.getInstance().getEntityManager();
//            if (lem != null) {
//                rob.setStatus(Response.Status.OK);
//                rob.addWarningMessage("Der Abruf des EntityManagers war erfolgreich");
//            } else {
//                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
//                rob.addErrorMessage("Es wurde ein null-Objekt als EntityManager zurückgeliefert.");
//            }
//        } catch (Exception ex) {
//            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
//            rob.addErrorMessage("Could not get EntityManager: " + ex.getLocalizedMessage());
//            rob.addException(ex);
//        }

        return rob.toResponse();
    }

    @GET
    @Path("testRobValues")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Test the ability to generate responses",
            description = "Test the ability to generate responses with different datatypes")
    @APIResponse(
            responseCode = "200")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Error checking: Because of ... \"]}"))
    public Response testRobValues() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
//        if (!SystemBean.getInstance().isDebugmode()) {
//            rob.setStatus(Response.Status.FORBIDDEN);
//            rob.addErrorMessage("Testing is not activated.");
//            return rob.toResponse();
//        }

        // Test simple datatype handling
        boolean boolval = true;
        byte byteval = 1;
        char charval = 'a';
        short shortval = 1;
        int intval = 1;
        long longval = 1L;
        float floatval = 3.14195f;
        double doubleval = 3.14195;

        rob.add("boolval", boolval);
        rob.add("byteval", byteval);
        rob.add("charval", charval);
        rob.add("shortval", shortval);
        rob.add("intval", intval);
        rob.add("longval", longval);
        rob.add("floatval", floatval);
        rob.add("doubleval", doubleval);

        rob.add(boolval);
        rob.add(byteval);
        rob.add(charval);
        rob.add(shortval);
        rob.add(intval);
        rob.add(longval);
        rob.add(floatval);
        rob.add(doubleval);

        rob.setStatus(Response.Status.OK);
        rob.addWarningMessage("There should be a warning messages printed to server log.");
        return rob.toResponse();
    }

    @GET
    @Path("testDebugMessages")
    @Produces(MediaType.APPLICATION_JSON)
    @Operation(summary = "Test if debug messages are generated",
            description = "Test if debug messages are generated")
    @APIResponse(
            responseCode = "200")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Error checking: Because of ... \"]}"))
    public Response testDebugMessages() {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
//        if (!SystemBean.getInstance().isDebugmode()) {
//            rob.setStatus(Response.Status.FORBIDDEN);
//            rob.addErrorMessage("Testing is not activated.");
//            return rob.toResponse();
//        }

        Message msg = new Message("This is a message from the testDebugMessages REST interface.", MessageLevel.INFO);
        Logger.addDebugMessage(msg);
        
        rob.setStatus(Response.Status.OK);
        rob.addWarningMessage("There should be a warning message printed to server log.");
        return rob.toResponse();
    }
}
