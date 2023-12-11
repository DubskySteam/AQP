package de.hsbi.smartsocial.Controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javadocmd.simplelatlng.LatLng;
import com.javadocmd.simplelatlng.LatLngTool;
import com.javadocmd.simplelatlng.util.LengthUnit;
import de.hsbi.smartsocial.Exceptions.APICallException;
import de.hsbi.smartsocial.Exceptions.ParseJsonArrayException;
import de.hsbi.smartsocial.Model.DataPoint;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.*;
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
    public Response refreshData() {
        String jsonArrayString = makeApiCall("http://localhost:8080/SmartDataAirquality/smartdata/records/airquality_a1");

        List<DataPoint> dataPoints = parseJsonArray(jsonArrayString);

        double totalDistance = calculateTotalDistance(dataPoints);

        return Response.ok(dataPoints).build();
    }

    private String makeApiCall(String apiUrl) {
        StringBuilder response = new StringBuilder();

        try {
            URL url = new URL(apiUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();

            connection.setRequestMethod("GET");

            int responseCode = connection.getResponseCode();

            if (responseCode == HttpURLConnection.HTTP_OK) {
                BufferedReader in = new BufferedReader(new InputStreamReader(connection.getInputStream()));
                String inputLine;

                while ((inputLine = in.readLine()) != null) {
                    response.append(inputLine);
                }

                in.close();
            } else {
                throw new APICallException("Error: API call failed with response code " + responseCode);
            }

            connection.disconnect();
        } catch (IOException e) {
            throw new APICallException("Error: API call failed with message " + e.getMessage());
        }

        return response.toString();
    }

    private List<DataPoint> parseJsonArray(String jsonArrayString) {
        List<DataPoint> dataPoints = new ArrayList<>();

        try {
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(jsonArrayString);

            if (root.has("records")) {
                JsonNode recordsNode = root.get("records");

                for (JsonNode recordNode : recordsNode) {
                    DataPoint simpleDataPoint = new DataPoint();
                    simpleDataPoint.setLatitude(recordNode.get("latitude").asText());
                    simpleDataPoint.setLongitude(recordNode.get("longitude").asText());
                    simpleDataPoint.setTs(recordNode.get("ts").asText());
                    dataPoints.add(simpleDataPoint);
                }
            } else {
                throw new ParseJsonArrayException("Error: JSON array does not contain records");
            }
        } catch (IOException e) {
            throw new ParseJsonArrayException("Error: JSON array could not be parsed with message " + e.getMessage());
        }

        return dataPoints;
    }


    private double calculateTotalDistance(List<DataPoint> dataPoints) {
        double totalDistance = 0;

        for (int i = 0; i < dataPoints.size() - 1; i++) {
            DataPoint startDataPoint = dataPoints.get(i);
            DataPoint endDataPoint = dataPoints.get(i + 1);

            LatLng startLatLng = new LatLng(Double.parseDouble(startDataPoint.getLatitude()),
                    Double.parseDouble(startDataPoint.getLongitude()));

            LatLng endLatLng = new LatLng(Double.parseDouble(endDataPoint.getLatitude()),
                    Double.parseDouble(endDataPoint.getLongitude()));

            double distance = LatLngTool.distance(startLatLng, endLatLng, LengthUnit.KILOMETER);

            totalDistance += distance;
        }

        return totalDistance;
    }

}
