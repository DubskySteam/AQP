package de.fhbielefeld.smartmonitoring.system;

import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import de.fhbielefeld.smartmonitoring.config.Configuration;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.stream.JsonParser;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.StringReader;
import javax.naming.NamingException;

/**
 * Service executed at startup of the application. If configured in
 * _config.properties registers the application online.
 *
 * @author ffehring
 */
@Singleton
@Startup
public class StartService {

    public StartService() {
        String moduleName = "none";
        try {
            moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
        } catch (NamingException ex) {
        }

        if (!moduleName.equals("none")) {
            registerOnline();
        }
    }

    /**
     * Registers the application online
     *
     */
    public static void registerOnline() {
        String mac = NetworkInformation.getMAC();
        // Load configuration
        Configuration conf = new Configuration();
        String smartdataurl = conf.getProperty("remote.smartdata.url");
        if (smartdataurl == null) {
            return;
        }
        smartdataurl += "/smartdata";
        String storage = conf.getProperty("remote.smartdata.storage");
        if (storage == null) {
            storage = "smartmonitoring";
        }
        String resource = "records";
        String collection = "tbl_observedobject";
        WebTarget webTarget = WebTargetCreator.createWebTarget(smartdataurl, resource);

        Response getOoResponse;
        try {
            WebTarget getOoTarget = webTarget
                    .path(collection)
                    .queryParam("storage", storage)
                    .queryParam("filter", "mac,eq," + mac);
            getOoResponse = getOoTarget.request(MediaType.APPLICATION_JSON).get();
        } catch (Exception ex) {
            // Could not register online
            return;
        }
        String getOoTxt = getOoResponse.readEntity(String.class);
        Integer ooid;
        if (Response.Status.OK.getStatusCode() == getOoResponse.getStatus()) {
            JsonParser parser = Json.createParser(new StringReader(getOoTxt));
            parser.next();
            JsonObject dataObj = parser.getObject();
            JsonArray ooArr = dataObj.getJsonArray("records");
            if (ooArr == null) {
                System.out.println("Error getting ObservedObject information for MAC >" + mac + "<: >records< attribute is missing.");
                System.out.println("Response text: " + getOoTxt);
                return;
            }
            if(ooArr.size() == 0) {
                System.out.println("Error getting ObservedObject information for MAC >" + mac + "<: There is no information about this MAC. Is it missing in the parent instance?");
                System.out.println("Response text: " + getOoTxt);
                return;
            }
            JsonObject ooObj = ooArr.getJsonObject(0);
            ooid = ooObj.getInt("id");
        } else {
            System.out.println("Error getting ObservedObject information for MAC >" + mac + "<: Response Status: " + getOoResponse.getStatus());
            System.out.println("Response text: " + getOoTxt);
            return;
        }

        // Build update set
        JsonObjectBuilder builder = Json.createObjectBuilder();
        builder.add("id", ooid);
        builder.add("ip", NetworkInformation.getPublicIpAddress());
        JsonObject dataObject = builder.build();
        Entity<String> coldef = Entity.json(dataObject.toString());
        // Send online information to server
        WebTarget target = webTarget
                .path(collection)
                .queryParam("storage", storage);
        target.request(MediaType.APPLICATION_JSON).put(coldef);
    }
}
