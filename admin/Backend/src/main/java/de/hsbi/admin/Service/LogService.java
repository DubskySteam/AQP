package de.hsbi.admin.Service;

import de.hsbi.admin.Config.Manager;
import RequestBuilder;
import jakarta.ejb.Stateless;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Author: Clemens Maas
 * Date: 2024/01/06
 */
@Stateless
public class LogService {

    public String getLogNew() {
        RequestBuilder requestBuilder = new RequestBuilder();
        requestBuilder.setTarget("http://localhost:4848/management/domain/view-log");
        return requestBuilder.send();
    }

    public String getLog() {
        String url = Manager.PAYARA_SERVER_URL + "management/domain/view-log";
        Client client = ClientBuilder.newClient();

        try {
            Response response = client.target(url)
                    .request(MediaType.TEXT_PLAIN)
                    .get();

            if (response.getStatus() == Response.Status.OK.getStatusCode()) {
                return response.readEntity(String.class);
            } else {
                return "Failed to get log: HTTP status " + response.getStatus();
            }
        } finally {
            client.close();
        }
    }

}
