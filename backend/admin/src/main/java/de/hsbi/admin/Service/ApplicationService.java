package de.hsbi.admin.Service;

import de.hsbi.admin.Config.Manager;
import de.hsbi.admin.Controller.ApplicationController;
import jakarta.ejb.Stateless;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.Response;

/**
 * Author: Clemens Maas
 * Date: 2024/01/04
 */
@Stateless
public class ApplicationService {

    public String ping() {
        return "pggo";
    }

    public String getApplications() {
        Client client = ClientBuilder.newClient();
        WebTarget target = client.target(Manager.PAYARA_SERVER_URL + "management/domain/applications/application");


        try {
            Response response = target.request().header("Accept", "application/json").get();
            if (response.getStatus() == Response.Status.OK.getStatusCode()) {
                String output = response.readEntity(String.class);
                return output;
            } else {
                return "Error: " + response.getStatus();
            }
        } finally {
            client.close();
        }
    }

}
