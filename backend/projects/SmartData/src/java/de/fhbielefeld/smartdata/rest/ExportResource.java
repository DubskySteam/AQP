package de.fhbielefeld.smartdata.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import de.fhbielefeld.smartdata.config.Configuration;
import de.fhbielefeld.smartdata.dbo.Attribute;
import de.fhbielefeld.smartdata.dyn.DynFactory;
import de.fhbielefeld.smartdata.dyncollection.DynCollection;
import de.fhbielefeld.smartdata.dynrecords.filter.Filter;
import de.fhbielefeld.smartdata.dynrecords.filter.FilterException;
import de.fhbielefeld.smartdata.dynrecords.filter.FilterParser;
import de.fhbielefeld.smartdata.dynrecords.DynRecords;
import de.fhbielefeld.smartdata.exceptions.DynException;
import de.fhbielefeld.smartuser.annotations.SmartUserAuth;
import de.fhbielefeld.smartuser.securitycontext.SmartPrincipal;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.StringJoiner;
import javax.naming.NamingException;
import org.eclipse.microprofile.openapi.annotations.Operation;
import static org.eclipse.microprofile.openapi.annotations.enums.SchemaType.STRING;
import org.eclipse.microprofile.openapi.annotations.media.Content;
import org.eclipse.microprofile.openapi.annotations.media.Schema;
import org.eclipse.microprofile.openapi.annotations.parameters.Parameter;
import org.eclipse.microprofile.openapi.annotations.responses.APIResponse;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

/**
 * REST Web Service for exporting data
 *
 * @author Florian Fehring
 */
@Path("export")
@Tag(name = "Export", description = "Exporting data to various formats and targets.")
public class ExportResource {

    private static Map<String, DynCollection> dynColCache = new HashMap<>();
    private static Map<String, DynRecords> dynRecCache = new HashMap<>();

    public ExportResource() {
        // Init logging
        try {
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Configuration conf = new Configuration();
            Logger.getInstance("SmartData", moduleName);
            Logger.setDebugMode(Boolean.parseBoolean(conf.getProperty("debugmode")));
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
    }

    @GET
    @Path("{collection}/toSmartData")
    @Produces(MediaType.APPLICATION_JSON)
    @SmartUserAuth
    @Operation(summary = "Export the selected data to another SmartData",
            description = "Exports the data fetched with the given parameters to another SmartData instance.")
    @APIResponse(
            responseCode = "200",
            description = "Datasets exported",
            content = @Content(
                    mediaType = "application/json",
                    example = "{\"records\" : [{\"id\" :  1, \"value\" : 12.4}]}"
            ))
    @APIResponse(
            responseCode = "404",
            description = "Table not found")
    @APIResponse(
            responseCode = "500",
            description = "Error mesage",
            content = @Content(mediaType = "application/json",
                    example = "{\"errors\" : [ \" Could not get datasets: Because of ... \"]}"))
    public Response list(
            @Parameter(description = "Name of the collection to get data from (Tablename, Documentspace)", required = true, example = "mycollection") @PathParam("collection") String collection,
            @Parameter(description = "Name of the storage to look at (public, smartdata_xyz, ...)",
                    schema = @Schema(type = STRING, defaultValue = "public")) @QueryParam("storage") String storage,
            @Parameter(description = "Attributes to include, comata separated", example = "id,value") @QueryParam("includes") String includes,
            @Parameter(description = "Definition of an filter <a href=\"http://git04-ifm-min.ad.fh-bielefeld.de/forschung/smartecosystem/smartdata/-/wikis/Funktionen/Uebersicht\" target=\"_new\">See filter documentation</a>", example = "id,eq,1") @QueryParam("filter") List<String> filtersStrings,
            @Parameter(description = "Maximum number of datasets", example = "1") @QueryParam("size") int size,
            @Parameter(description = "Page no to recive", example = "1") @QueryParam("page") String page,
            @Parameter(description = "Datasets order column and order kind", example = "column[,desc]") @QueryParam("order") String order,
            @Parameter(description = "If datasets should only be counted") @QueryParam("countonly") boolean countonly,
            @Parameter(description = "Attribute to get uniqe values for (untested)", example = "value") @QueryParam("unique") String unique,
            @Parameter(description = "Name of the geo column that contains geo information, for reciving the data in geojson format") @QueryParam("geojsonattr") String geojsonattr,
            @Parameter(description = "Coordinate system in which geometry information schould be deliverd. Can be an EPSG code or 'latlon'") @QueryParam("geotransform") String geotransform,
            @Parameter(description = "Names of join tables, to make natural join.", example = "bindtable,endtable") @QueryParam("join") List<String> joins,
            @Context ContainerRequestContext requestContext) {

        if (storage == null) {
            storage = "public";
        }

        // Catch negative limits
        if (size < 0) {
            size = 0;
        }

        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        List<Filter> filters = new ArrayList<>();

        try ( DynCollection dync = DynFactory.getDynCollection(storage, collection)) {
            // Check if there is a request context and user has restricted rights
            if (requestContext != null) {
                boolean max_right = false;
                String contextInfo = null;
                SecurityContext sc = requestContext.getSecurityContext();
                if (sc != null) {
                    SmartPrincipal sp = (SmartPrincipal) sc.getUserPrincipal();
                    if (sp != null) {
                        StringJoiner sb = new StringJoiner(",");
                        for (Long curSet : sp.getContextRight().getIds()) {
                            if (curSet == Long.MAX_VALUE) {
                                max_right = true;
                                break;
                            }
                            sb.add(curSet.toString());
                        }
                        // Get identity column (only first identity supported)
                        Attribute idattr = dync.getIdentityAttributes().get(0);
                        if (sb.length() > 0) {
                            // Write filter
                            filtersStrings.add(idattr.getName() + ",in," + sb.toString());
                        } else if(!max_right) {
                            // User has no right so shold get a empty list
                            filtersStrings.add(idattr.getName() + ",in,-1");
                        }
                    }
                } else {
                    contextInfo = "No SecurityContext in Requestcontext found!";
                    Message msg = new Message(contextInfo, MessageLevel.INFO);
                    Logger.addDebugMessage(msg);
                    rob.setStatus(Response.Status.UNAUTHORIZED);
                    return rob.toResponse();
                }
            } // End security check
            // Build filters from strings given by parameter or by security context
            if (filtersStrings != null && !filtersStrings.isEmpty()) {
                try {
                    // Build filter objects
                    for (String curFilterStr : filtersStrings) {
                        Filter filt = FilterParser.parse(curFilterStr, dync);
                        if (filt != null) {
                            filters.add(filt);
                        }
                    }
                } catch (FilterException ex) {
                    rob.setStatus(Response.Status.BAD_REQUEST);
                    rob.addErrorMessage("Could not parse filter rule >" + filtersStrings + "<: " + ex.getLocalizedMessage());
                    rob.addException(ex);
                    return rob.toResponse();
                }
            }
        } catch (DynException ex) {
            rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
            rob.addErrorMessage("Could not get identity column.");
            return rob.toResponse();
        }

        try ( DynRecords dynr = DynFactory.getDynRecords(storage, collection)) {
            String json = dynr.get(includes, filters, size, page, order, countonly, unique, false, geojsonattr, geotransform, joins);
            if (json.equals("{}")) {
                json = "[]";
            }
            // Convert to utf8
            byte[] u8 = json.getBytes(StandardCharsets.UTF_8);
            if (geojsonattr != null) {
                Response.ResponseBuilder rb = Response.status(Response.Status.OK);
                rb.entity(json);
                return rb.build();
            } else {
                rob.add("records", new String(u8));
            }
            for (String curWarn : dynr.getWarnings()) {
                rob.addWarningMessage(curWarn);
            }
        } catch (DynException ex) {
            String msg = ex.getLocalizedMessage();
            if (msg.contains("Table") && msg.contains("does not exist")) {
                rob.setStatus(Response.Status.NOT_FOUND);
                Message msge = new Message(msg+ " Check table ownership.",MessageLevel.ERROR);
                Logger.addDebugMessage(msge);
            } else {
                rob.setStatus(Response.Status.INTERNAL_SERVER_ERROR);
                rob.addErrorMessage("Could not get data: " + msg);
                rob.addException(ex);
            }
            return rob.toResponse();
        }
        rob.setStatus(Response.Status.OK);

        return rob.toResponseStream();
    }
}
