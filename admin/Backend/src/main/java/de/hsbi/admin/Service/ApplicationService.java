package de.hsbi.admin.Service;

import de.hsbi.admin.Config.Manager;
import jakarta.ejb.Stateless;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
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

    public String ping() {
        return "pong";
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

    public boolean isApplicationEnabled(@PathParam("appName") String appName) {
        Client client = ClientBuilder.newClient();
        String url = Manager.PAYARA_SERVER_URL + "management/domain/applications/application/" + appName + "/show-component-status";

        try {
            Response response = client.target(url)
                    .request(MediaType.APPLICATION_JSON)
                    .get();

            if (response.getStatus() == Response.Status.OK.getStatusCode()) {
                String jsonResponse = response.readEntity(String.class);

                JsonReader jsonReader = Json.createReader(new StringReader(jsonResponse));
                JsonObject jsonObject = jsonReader.readObject();
                JsonArray children = jsonObject.getJsonArray("children");

                if (!children.isEmpty()) {
                    JsonObject child = children.getJsonObject(0);
                    JsonObject properties = child.getJsonObject("properties");
                    String state = properties.getString("state");

                    return "enabled".equals(state);
                } else {
                    return false;
                }
            } else {
                throw new RuntimeException("Error fetching application status: " + response.getStatus());
            }
        } finally {
            client.close();
        }
    }

    public boolean toggleApplication(String appName, String action) {
        Client client = ClientBuilder.newClient();
        String url = Manager.PAYARA_SERVER_URL + "management/domain/applications/application/" + appName + "/" + action;

        try {
            Response response = client.target(url)
                    .request(MediaType.APPLICATION_JSON)
                    .header("X-Requested-By", "GlassFish REST HTML interface")
                    .post(Entity.text("{}"));

            if (response.getStatus() == Response.Status.OK.getStatusCode()) {
                return true;
            } else {
                return false;
            }
        } finally {
            client.close();
        }
    }

    public boolean undeployApplication(String appName) {
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

            return response.getStatus() == Response.Status.OK.getStatusCode();
        } finally {
            client.close();
        }
    }

}