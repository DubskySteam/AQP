package de.smartdata.porter.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.logger.message.Message;
import de.smartdata.porter.config.Configuration;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartuser.annotations.SmartUserAuth;
import de.smartdata.porter.importer.ImportControler;
import de.smartdata.porter.importer.ImportControlerException;
import de.smartdata.porter.importer.ImporterResult;
import java.io.Serializable;
import javax.naming.NamingException;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * REST interface for executeing imports
 *
 * @author ffehring
 */
@Path("import")
@Tag(name = "Import", description = "Import data")
public class ImportResource implements Serializable {

    public ImportResource() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Configuration conf = new Configuration(); 
            Logger.getInstance("SmartDataPorter", moduleName);
            boolean debugmode = Boolean.parseBoolean(conf.getProperty("debugmode"));
            Logger.setDebugMode(debugmode);
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @SmartUserAuth
    @Operation(summary = "Executes an import",
            description = "Executes an import as specified in the given configuration")
    @APIResponse(
            responseCode = "200",
            description = "Import started")
    @APIResponse(
            responseCode = "404",
            description = "Import source, importer or parser not found")
    @APIResponse(
            responseCode = "500",
            description = "Internal error")
    public Response execute(
            @Parameter(description = "JSON Import Configuration", required = true) String configuration,
            @Parameter(description = "ID from client for asynchrone execution", required = false) @QueryParam("processid") String processid) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        // Check configuration
        if(!configuration.startsWith("{") || !configuration.endsWith("}")) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("Given configuration is no valid JSON object.");
            System.out.println("Invalid JSON configuration:");
            System.out.println(configuration);
            return rob.toResponse();
        }
        
        ImportControler ih = new ImportControler(configuration);
        
        try {
            ImporterResult ir = ih.run();        
            rob.add(ir);
            for(Message curMsg : ir.getMessages()) {
                if(null != curMsg.getLevel()) switch (curMsg.getLevel()) {
                    case WARNING:
                        rob.addWarningMessage(curMsg.getMessage());
                        break;
                    case ERROR:
                        rob.addErrorMessage(curMsg.getMessage());
                        rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                        break;
                    case USER_ERROR:
                        rob.addErrorMessage(curMsg.getMessage());
                        rob.setStatus(Response.Status.BAD_REQUEST);
                        break;
                    default:
                        break;
                }
            }
            rob.setStatus(Response.Status.OK);
        } catch (ImportControlerException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addException(ex);
        }

        return rob.toResponse();
    }
    
    @Path("write")
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @SmartUserAuth
    @Operation(summary = "Write key-value pairs into database",
            description = "Writes key-value pairs into database")
    @APIResponse(
            responseCode = "200",
            description = "Import started")
    @APIResponse(
            responseCode = "404",
            description = "Import source, importer or parser not found")
    @APIResponse(
            responseCode = "500",
            description = "Internal error")
    public Response write(
            @Parameter(description = "JSON Import Configuration", required = true) String configuration,
            @Parameter(description = "ID from client for asynchrone execution", required = false) @QueryParam("processid") String processid) {
        
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        
        rob.addErrorMessage("This interface is not implemented yet");
        rob.setStatus(Response.Status.NOT_IMPLEMENTED);
        // TODO use ValueImporter to write and update single key-value pairs or array of key-value pairs into database
        return rob.toResponse();
    }
}
