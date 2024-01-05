package de.hsbi.admin.Service;

import de.hsbi.admin.Config.Manager;
import de.hsbi.admin.Controller.ApplicationController;
import jakarta.ejb.Stateless;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
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
     * Disables an application on the Payara server.
     *
     * @param applicationName name of the application to disable
     * @return true if the application was disabled successfully, false otherwise
     */
    public boolean disableApplication(String applicationName) {
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target(Manager.PAYARA_SERVER_URL + "management/domain/applications/application/" + applicationName);

        try {
            Response response = target.request().header("Accept", "application/json").delete();
            if (response.getStatus() == Response.Status.OK.getStatusCode()) {
                return true;
            } else {
                throw new RuntimeException("Error disabling application: " + response.getStatus());
            }
        } finally {
            client.close();
        }
    }

}
