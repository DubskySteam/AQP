package de.hsbi.smartsocial.Controller;

import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.IOException;
import java.io.InputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.jar.Attributes;
import java.util.jar.Manifest;

@Path("/utility")
public class UtilityController {

    @GET
    @ApiResponse(responseCode = "200", description = "Returns pong. Used to check if the utility controller is working")
    public String ping() {
        return "pong";
    }

    @GET
    @Path("/info")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Returns info about the API")
    public Response getProjectInfo() {
        Properties props = new Properties();
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("project-info.properties")) {
            if (is == null) {
                return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                        .entity("Properties file not found")
                        .build();
            }
            props.load(is);
            return Response.ok(props).build();
        } catch (IOException e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error reading properties: " + e.getMessage())
                    .build();
        }
    }

    private static Map<String, String> getStringStringMap(String manifestPath) throws IOException {
        Manifest manifest = new Manifest(new URL(manifestPath).openStream());
        Attributes attr = manifest.getMainAttributes();
        Map<String, String> info = new HashMap<>();
        info.put("Implementation-Title", attr.getValue("Implementation-Title"));
        info.put("Implementation-Version", attr.getValue("Implementation-Version"));
        info.put("Java-Version", attr.getValue("Java-Version"));
        info.put("Gradle-Version", attr.getValue("Gradle-Version"));
        return info;
    }

    @GET
    @Path("/refreshData")
    @Produces(MediaType.APPLICATION_JSON)
    @ApiResponse(responseCode = "200", description = "Refreshes the travel data by pulling it from SmartData")
    public Response refreshData() {

    }


}
