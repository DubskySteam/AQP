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

    public String ping() {
        return "pggo";
    }

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

}
