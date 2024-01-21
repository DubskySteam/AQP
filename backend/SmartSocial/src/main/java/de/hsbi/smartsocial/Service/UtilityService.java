package de.hsbi.smartsocial.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.javadocmd.simplelatlng.LatLng;
import com.javadocmd.simplelatlng.LatLngTool;
import com.javadocmd.simplelatlng.util.LengthUnit;
import de.fhbielefeld.smartuser.securitycontext.SmartPrincipal;
import de.hsbi.smartsocial.Config.ConfigLoader;
import de.hsbi.smartsocial.Exceptions.APICallException;
import de.hsbi.smartsocial.Exceptions.AchievementNotFoundException;
import de.hsbi.smartsocial.Exceptions.ParseJsonArrayException;
import de.hsbi.smartsocial.Exceptions.RefreshException;
import de.hsbi.smartsocial.Model.*;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;
import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.lang.reflect.Array;
import java.math.BigDecimal;
import java.net.HttpURLConnection;
import java.net.URL;
import java.time.LocalDate;
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

    @Inject
    QuestService questService;

    public Response refreshData() {

        List<ProfileSetting> valid_users = profileSettingsService.getAllProfileSettings();

        if (valid_users == null || valid_users.isEmpty()) {
            throw new RefreshException("Error: No valid users found");
        }

        for (ProfileSetting user : valid_users) {
            if (user.getDevice() == null) {
                continue;
            }
            ConfigLoader configLoader = ConfigLoader.getInstance();
            String baseUrl = configLoader.getProperty("api.base.url");
            String jsonArrayString = makeApiCall(baseUrl + "SmartDataAirquality/smartdata/records/" + user.getDevice());
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

            if (distance < 2.0) {
                totalDistance += distance;
            }
        }

        return totalDistance;
    }


    public ArrayList<DataPoint> getRoute(Long userId) {
        ArrayList<DataPoint> route = new ArrayList<>();
        ProfileSetting profileSetting = profileSettingsService.getSettings(userId);
        if (profileSetting == null) {
            return route;
        }

        if (profileSetting.getDevice() == null) {
            return route;
        }
        ConfigLoader configLoader = ConfigLoader.getInstance();
        String baseUrl = configLoader.getProperty("api.base.url");
        String jsonArrayString = makeApiCall(baseUrl + "SmartDataAirquality/smartdata/records/" + profileSetting.getDevice());
        List<DataPoint> dataPoints = parseJsonArray(jsonArrayString);

        int start = dataPoints.size() - 20;
        if (start < 0) {
            start = 0;
        }
        for (int i = start; i < dataPoints.size(); i++) {
            route.add(dataPoints.get(i));
        }

        return route;
    }

    public boolean checkQuests(Long userId) {
        List<Userquest> userquests = questService.getByUserId(userId);

        if (userquests == null || userquests.isEmpty()) {
            return false;
        }

        for (Userquest userquest : userquests) {
            if (userquest.getCompletionDate() == null) {
                if (userquest.getQuest().getType().equals("distance")) {
                    BigDecimal distance = leaderboardService.getPersonalStats(userId).getKilometers();
                    if (userquest.getQuest().getAmount() <= distance.doubleValue()) {
                        userquest.setCompletionDate(LocalDate.now());
                    }
                }
            }
        }
        return true;
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

    /**
     * Checks if the user is valid
     * TODO: SmartUserAuth is semi-broken at the moment. If it's fixes, reverse the return values.
     */
    public static boolean isUserValid(Long userId, ContainerRequestContext requestContext) {
        SecurityContext sc = requestContext.getSecurityContext();
        if (sc != null) {
            SmartPrincipal sp = (SmartPrincipal) sc.getUserPrincipal();
            if (sp != null) {
                for (Long curSet : sp.getContextRight().getIds()) {
                    if (curSet.equals(userId)) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
}