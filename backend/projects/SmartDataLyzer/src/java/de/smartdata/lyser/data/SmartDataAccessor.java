package de.smartdata.lyser.data;

import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonValue;
import jakarta.json.stream.JsonParser;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.io.StringReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Methods for accessing a SmartData instance to get data. Aims to simplify the
 * access of SmartData from other Java programs
 *
 * @author Florian Fehring
 */
public class SmartDataAccessor {

    /**
     * Gets the number of available datasets
     *
     * @param smartdataurl SmartDatas URL
     * @param collection Collections name
     * @param storage Storages name
     *
     * @return Number of available datasets
     * @throws de.smartdata.lyser.data.SmartDataAccessorException
     */
    public int fetchCount(String smartdataurl, String collection, String storage) throws SmartDataAccessorException {
        return this.fetchCount(smartdataurl, collection, storage, null, null, null);
    }
    
    /**
     * Gets the number of available datasets
     *
     * @param smartdataurl SmartDatas URL
     * @param collection Collections name
     * @param storage Storages name
     * @param dateattr Date values holding attribute name
     * @param start     Startdate
     * @param end       Enddate
     *
     * @return Number of available datasets
     * @throws de.smartdata.lyser.data.SmartDataAccessorException
     */
    public int fetchCount(String smartdataurl, String collection, String storage, String dateattr, LocalDateTime start, LocalDateTime end) throws SmartDataAccessorException {

        // Get information about file from SmartData
        WebTarget webTarget = WebTargetCreator.createWebTarget(
                smartdataurl + "/smartdata", "records")
                .path(collection)
                .queryParam("storage", storage)
                .queryParam("countonly", true);
        if(start != null && end != null) {
            webTarget = webTarget.queryParam("filter", dateattr + ",gt," + start);
            webTarget = webTarget.queryParam("filter", dateattr + ",lt," + end);
        }
        Response response = webTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (Response.Status.OK.getStatusCode() == response.getStatus()) {
            JsonParser parser = Json.createParser(new StringReader(responseText));
            parser.next();
            JsonArray records = parser.getObject().getJsonArray("records");
            if (records == null) {
                throw new SmartDataAccessorException("Could not get data from >" + webTarget.getUri() + "< retuned no >records<");
            }
            JsonObject cobj = records.getJsonObject(0);
            if (cobj == null) {
                throw new SmartDataAccessorException("Could not get data from >" + webTarget.getUri() + "< retuned no >data<");
            }
            return cobj.getInt("count");
        }
        throw new SmartDataAccessorException("Could not access >" + webTarget.getUri() + "< returned status: " + response.getStatus());
    }

    /**
     * Get data from the SmartData and return it as JSON
     * 
     * @param smartdataurl SmartDatas URL
     * @param collection Collections name
     * @param storage Storages name
     * @param includes  List of attributes that should be returned
     * @param dateattr  Attribute that stores date information (if start and end should be used)
     * @param start     Startdate to look at
     * @param end       Enddate to look at
     * @param order   Attribute name to order by
     * @param limit     Number of datasets to fetch
     * @return          JSON with available data
     * @throws de.smartdata.lyser.data.SmartDataAccessorException
     */
    public JsonArray fetchData(String smartdataurl, String collection, 
            String storage, String includes, 
            String dateattr, LocalDateTime start, LocalDateTime end,
            String order, Long limit) throws SmartDataAccessorException {
        // Get information about file from SmartData
        WebTarget webTarget = WebTargetCreator.createWebTarget(
                smartdataurl + "/smartdata", "records")
                .path(collection)
                .queryParam("storage", storage);
        if (includes != null) {
            webTarget = webTarget.queryParam("includes", includes);
        }
        if (start != null && end != null) {
            webTarget = webTarget.queryParam("filter", dateattr + ",gt," + start);
            webTarget = webTarget.queryParam("filter", dateattr + ",lt," + end);
        }
        if(order != null) {
            webTarget = webTarget.queryParam("order", order);
        }
        if(limit != null) {
            webTarget = webTarget.queryParam("size", limit);
        }

        Response response = webTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (Response.Status.OK.getStatusCode() == response.getStatus()) {
            JsonParser parser = Json.createParser(new StringReader(responseText));
            parser.next();
            JsonArray records = parser.getObject().getJsonArray("records");
            if (records == null) {
                throw new SmartDataAccessorException("Could not get data from >" + webTarget.getUri() + "< retuned no >records<");
            }
            return records;
        } else {
            throw new SmartDataAccessorException("Could not access >" + webTarget.getUri() + "< returned status: " + response.getStatus());
        }
    }
    
    /**
     * Gets a list of available collections on the smartdata
     * 
     * @param smartdataurl  URL to the SmartData instance
     * @param storage Name of the storage to look at
     * @return List of collection names
     * @throws de.smartdata.lyser.data.SmartDataAccessorException
     */
    public List<String> fetchCollectons(String smartdataurl, String storage) throws SmartDataAccessorException {
        // Get information about file from SmartData
        WebTarget webTarget = WebTargetCreator.createWebTarget(
                smartdataurl + "/smartdata", "storage")
                .path("getCollections")
                .queryParam("name", storage);
System.out.println("get collections from: " + webTarget.getUri().toString());
        Response response = webTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (Response.Status.OK.getStatusCode() == response.getStatus()) {
            JsonParser parser = Json.createParser(new StringReader(responseText));
            parser.next();
            JsonArray list = parser.getObject().getJsonArray("list");
            if (list == null) {
                throw new SmartDataAccessorException("Could not get storages from >" + webTarget.getUri() + "< retuned no >list<");
            }
            List<String> collections = new ArrayList<>();
            for(JsonValue curVal : list) {
                collections.add(curVal.asJsonObject().getString("name"));
            }
            return collections;
        } else {
            throw new SmartDataAccessorException("Could not access >" + webTarget.getUri() + "< returned status: " + responseText);
        }
    }
}
