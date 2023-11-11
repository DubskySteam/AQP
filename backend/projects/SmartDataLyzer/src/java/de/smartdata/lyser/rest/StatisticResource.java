package de.smartdata.lyser.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.ResponseListBuilder;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartuser.annotations.SmartUserAuth;
import de.smartdata.lyser.data.SmartDataAccessor;
import de.smartdata.lyser.data.SmartDataAccessorException;
import de.smartdata.lyser.threads.ActivindexThread;
import de.smartdata.lyser.threads.CountThread;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import javax.naming.NamingException;
import org.eclipse.microprofile.openapi.annotations.Operation;
import static org.eclipse.microprofile.openapi.annotations.enums.SchemaType.STRING;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * REST interface for executeing imports
 *
 * @author ffehring
 */
@Path("statistic")
@Tag(name = "Statistic", description = "Statistic data")
public class StatisticResource implements Serializable {

    // Stores last calculated values
    public static Map<String, ResponseObjectBuilder> cache_count = new HashMap();
    public static Map<String, ResponseObjectBuilder> cache_activeindex = new HashMap();

    public StatisticResource() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Logger.getInstance("SmartDataLyser", moduleName);
            Logger.setDebugMode(true);
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }

    @GET
    @Path("count")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @SmartUserAuth
    @Operation(summary = "Count",
            description = "Count the number of datasets over collections")
    @APIResponse(
            responseCode = "200",
            description = "Compare result")
    @APIResponse(
            responseCode = "404",
            description = "One of the collections could not be found")
    @APIResponse(
            responseCode = "500",
            description = "Internal error")
    public Response count(
            @Parameter(description = "SmartData URL", required = true, example = "/SmartData") @QueryParam("smartdataurl") String smartdataurl,
            @Parameter(description = "Collections name", example = "col1,col2") @QueryParam("collections") String collections,
            @Parameter(description = "Storage name",
                    schema = @Schema(type = STRING, defaultValue = "public")) @QueryParam("storage") String storage,
            @Parameter(description = "Date attribute", example = "ts") @QueryParam("dateattribute") String dateattribute,
            @Parameter(description = "Start date", example = "2020-12-24T18:00") @QueryParam("start") String start,
            @Parameter(description = "End date", example = "2020-12-24T19:00") @QueryParam("end") String end,
            @Parameter(description = "Last X hours", example = "72") @QueryParam("lasthours") int lasthours) {

        CountThread ct = new CountThread(smartdataurl, collections, storage, dateattribute, start, end, lasthours);
        ct.start();

        try {
            Thread.sleep(1500);
        } catch (Exception ex) {
            System.err.println("Error while sleep: " + ex.getLocalizedMessage());
        }

        // Check if data is available in cache
        if (cache_count.containsKey(smartdataurl + collections)) {
            return cache_count.get(smartdataurl + collections).toResponse();
        } else {
            ResponseObjectBuilder rob = new ResponseObjectBuilder();
            rob.add("count",0);
            rob.add("tables","");
            rob.add("time", LocalDateTime.now());
            rob.addWarningMessage("Statistic calculation needs more time.");
            rob.setStatus(Response.Status.ACCEPTED);
            return rob.toResponse();
        }
    }

    @GET
    @Path("activeindex")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @SmartUserAuth
    @Operation(summary = "Activeindex",
            description = "Calculates the active and inactive collections")
    @APIResponse(
            responseCode = "200",
            description = "Result")
    @APIResponse(
            responseCode = "404",
            description = "One of the collections could not be found")
    @APIResponse(
            responseCode = "500",
            description = "Internal error")
    public Response activindex(
            @Parameter(description = "SmartData URL", required = true, example = "/SmartData") @QueryParam("smartdataurl") String smartdataurl,
            @Parameter(description = "Collections name", example = "col1,col2") @QueryParam("collections") String collections,
            @Parameter(description = "Storage name",
                    schema = @Schema(type = STRING, defaultValue = "public")) @QueryParam("storage") String storage,
            @Parameter(description = "Date attribute", example = "ts") @QueryParam("dateattribute") String dateattribute,
            @Parameter(description = "Start date", example = "2020-12-24T18:00") @QueryParam("start") String start,
            @Parameter(description = "End date", example = "2020-12-24T19:00") @QueryParam("end") String end,
            @Parameter(description = "Last X hours", example = "72") @QueryParam("lasthours") int lasthours,
            @Parameter(description = "Threshold minimum datasets", example = "10") @QueryParam("end") Integer threshold) {

        ActivindexThread at = new ActivindexThread(smartdataurl, collections, storage, dateattribute, start, end, lasthours, threshold);
        at.start();

        try {
            System.out.println("Now sleep for 1500 ms");
            Thread.sleep(1500);
        } catch (Exception ex) {
            System.err.println("Error while sleep: " + ex.getLocalizedMessage());
        }
        System.out.println("Wakeing up");

        // Check if data is available in cache
        if (cache_activeindex.containsKey(smartdataurl + collections)) {
            System.out.println("Useing activindex from cache");
            return cache_activeindex.get(smartdataurl + collections).toResponse();
        } else {
            ResponseObjectBuilder rob = new ResponseObjectBuilder();
            rob.add("inactive",0);
            rob.add("active",0);
            rob.add("inactives", new ResponseListBuilder());
            rob.add("actives", new ResponseListBuilder());
            rob.add("time", LocalDateTime.now());
            rob.addWarningMessage("Statistic calculation needs more time.");
            rob.setStatus(Response.Status.ACCEPTED);
            return rob.toResponse();
        }
    }

    @GET
    @Path("whole")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @SmartUserAuth
    @Operation(summary = "Whole statistic",
            description = "Whole statistic for one collection")
    @APIResponse(
            responseCode = "200",
            description = "Compare result")
    @APIResponse(
            responseCode = "404",
            description = "Collection could not be found")
    @APIResponse(
            responseCode = "500",
            description = "Internal error")
    public Response whole(
            @Parameter(description = "SmartData URL", required = true, example = "/SmartData") @QueryParam("smartdataurl") String smartdataurl,
            @Parameter(description = "Collection name", example = "col1") @QueryParam("collection") String collection,
            @Parameter(description = "Storage name",
                    schema = @Schema(type = STRING, defaultValue = "public")) @QueryParam("storage") String storage,
            @Parameter(description = "Date attribute", example = "ts") @QueryParam("dateattribute") String dateattribute) {

        ResponseObjectBuilder rob = new ResponseObjectBuilder();

        SmartDataAccessor acc = new SmartDataAccessor();

        if (smartdataurl.startsWith("/")) {
            smartdataurl = "http://localhost:8080" + smartdataurl;
        }

        if (collection == null) {
            rob.setStatus(Response.Status.BAD_REQUEST);
            rob.addErrorMessage("Parameter >collection> is missing.");
            return rob.toResponse();
        }

        try {
            // Get number of all datasets
            rob.add("count", acc.fetchCount(smartdataurl, collection, storage));
            
            JsonArray firstSets = acc.fetchData(smartdataurl, collection, storage, dateattribute, dateattribute, null, null, dateattribute + ",asc", 1L);
            if(firstSets != null) {
                JsonObject firstSet = firstSets.getJsonObject(0);
                if(firstSet != null && firstSet.containsKey(dateattribute)) {
                    rob.add("firstset", firstSet.getString(dateattribute));
                } else {
                    Message msg = new Message("Dataset does not contain atttronite >" + dateattribute + "<",MessageLevel.ERROR);
                    Logger.addMessage(msg);
                }
            }
            
            JsonArray lastSets = acc.fetchData(smartdataurl, collection, storage, dateattribute, dateattribute, null, null, dateattribute + ",desc", 1L);
            if(lastSets != null) {
                JsonObject lastSet = lastSets.getJsonObject(0);
                if(lastSet != null && lastSet.containsKey(dateattribute)) {
                    rob.add("lastset", lastSet.getString(dateattribute));
                } else {
                    Message msg = new Message("Dataset does not contain atttronite >" + dateattribute + "<",MessageLevel.ERROR);
                    Logger.addMessage(msg);
                }
            }
        } catch (SmartDataAccessorException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not get data for >" + collection + "<: " + ex.getLocalizedMessage());
        }

        rob.setStatus(Response.Status.OK);
        return rob.toResponse();
    }
}
