package de.hsbi.admin.Service;

import de.hsbi.admin.Config.Manager;
import jakarta.ejb.Stateless;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.StringReader;
import java.util.HashMap;

/**
 * Author: Clemens Maas
 * Date: 2024/01/04
 */
@Stateless
public class ApplicationService {

    /**
     * Pings the server.
     *
     * @return "pong"
     */
    public String ping() {
        return "pong";
    }

    /**
     * Fetches all applications from the Payara server.
     *
     * @return HashMap with application name as key and application URL as value
     */
    public HashMap<String, String> getApplications() {
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target(Manager.PAYARA_SERVER_URL + "management/domain/applications/application");

        try {
            Response response = target.request().header("Accept", "application/json").get();
            if (response.getStatus() == Response.Status.OK.getStatusCode()) {
                String jsonResponse = response.readEntity(String.class);

                JsonReader jsonReader = Json.createReader(new StringReader(jsonResponse));
                JsonObject jsonObject = jsonReader.readObject();
                JsonObject extraProperties = jsonObject.getJsonObject("extraProperties");
                JsonObject childResources = extraProperties.getJsonObject("childResources");

                HashMap<String, String> applications = new HashMap<>();
                for (String appName : childResources.keySet()) {
                    applications.put(appName, childResources.getString(appName));
                }
                return applications;
            } else {
                throw new RuntimeException("Error fetching applications: " + response.getStatus());
            }
        } finally {
            client.close();
        }
    }

    /**
     * Toggles the application with the given name.
     *
     * @param appName Name of the application to toggle
     * @return String with success message
     * <p>
     * TODO: Currently not working
     */
    public String toggleApplication(String appName, String action) {
        Client client = ClientBuilder.newClient();
        String url = "http://localhost:4848/management/domain/applications/application/" + appName + "/" + action;

        try {
            Response response = client.target(url)
                    .request()
                    .post(Entity.text(""));

            if (response.getStatus() == Response.Status.OK.getStatusCode()) {
                return appName + " " + action + "d successfully";
            } else {
                return "Failed to " + action + " " + appName + ": " + response.getStatus();
            }
        } finally {
            client.close();
        }
    }

    /**
     * Un-deploys the application with the given name.
     *
     * @param appName Name of the application to deploy
     * @return String with success message
     * @apiNote Working, but still throws an exception in the Payara server log. TODO: Fix exception
     */
    public String undeployApplication(String appName) {
        Client client = ClientBuilder.newClient();
        String url = Manager.PAYARA_SERVER_URL + "management/domain/applications/undeploy";

        try {
            JsonObject jsonBody = Json.createObjectBuilder()
                    .add("id", appName)
                    .build();

            Response response = client.target(url)
                    .request(MediaType.APPLICATION_JSON)
                    .header("X-Requested-By", "GlassFish REST HTML interface")
                    .post(Entity.json(jsonBody.toString()));

            if (response.getStatus() == Response.Status.OK.getStatusCode()) {
                return appName + " undeployed successfully";
            } else {
                return "Failed to undeploy " + appName + ": " + response.getStatus();
            }
        } finally {
            client.close();
        }
    }


}