package de.hsbi.smartsocial.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javadocmd.simplelatlng.LatLng;
import com.javadocmd.simplelatlng.LatLngTool;
import com.javadocmd.simplelatlng.util.LengthUnit;
import de.hsbi.smartsocial.Exceptions.APICallException;
import de.hsbi.smartsocial.Exceptions.ParseJsonArrayException;
import de.hsbi.smartsocial.Exceptions.RefreshException;
import de.hsbi.smartsocial.Model.DataPoint;
import de.hsbi.smartsocial.Model.ProfileSetting;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.ArrayList;
import java.util.List;

/**
 * Author: Clemens Maas
 * Date: 2023/11/27
 */
@Stateless
public class UtilityService {

    @Inject
    private LeaderboardService leaderboardService;

    @Inject
    private ProfileSettingsService profileSettingsService;

    public Response refreshData() {

        List<ProfileSetting> valid_users = profileSettingsService.getAllProfileSettings();

        if (valid_users == null || valid_users.isEmpty()) {
            throw new RefreshException("Error: No valid users found");
        }

        for (ProfileSetting user : valid_users) {
            if (user.getDevice() == null) {
                continue;
            }
            String jsonArrayString = makeApiCall("http://localhost:8080/SmartDataAirquality/smartdata/records/" + user.getDevice());
            List<DataPoint> dataPoints = parseJsonArray(jsonArrayString);
            double totalDistance = calculateTotalDistance(dataPoints);
            leaderboardService.addKilometers(user.getId(), totalDistance);
        }

        return Response.ok("Leaderboard data has refreshed :)").build();
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

    /**
     * TODO: Implement
     */
    public Response remapQuests() {
        return Response.ok(Response.Status.NOT_IMPLEMENTED).build();
    }

    /**
     * TODO: Implement
     */
    public Response awardUsers() {
        return Response.ok(Response.Status.NOT_IMPLEMENTED).build();
    }

}
