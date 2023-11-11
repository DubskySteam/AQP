package de.fhbielefeld.scl.rest;

import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectMetadata;
import de.fhbielefeld.scl.rest.testutil.ObjectHelper;
import de.fhbielefeld.scl.rest.testutil.ObjectHelperException;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import java.io.StringReader;
import java.util.Objects;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.JsonValue;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.FixMethodOrder;
import org.junit.runners.MethodSorters;

/**
 * Test the ConfigurationResource
 *
 * @author dstarke <dstarke@fh-bielefeld.de>, ffehring
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ObservedObjectMetadataResourceTest {

    private static WebTarget webTarget;
    private static ObjectHelper helper;
    private static final boolean PRINT_DEBUG_MESSAGES = true;

//    private static TblObservedObjectType preObservedObjectType;
//    private static TblObservedObject preObservedObject;
    private static TblObservedObjectMetadata preMetadata;

    public ObservedObjectMetadataResourceTest() {
    }

    @BeforeClass
    public static void setUpClass() {
        webTarget = WebTargetCreator.createLocalhostWebTarget("observedobjectmetadata");
        helper = new ObjectHelper();
        try {
            preMetadata = helper.generateTblObject(TblObservedObjectMetadata.class, null);
        } catch (ObjectHelperException ex) {
            Logger.getLogger(TagTypeResourceTest.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @AfterClass
    public static void tearDownClass() {
    }

    @Before
    public void setUp() {
    }

    @After
    public void tearDown() {
    }

    /**
     * Tests if ObservedObjectMetadata can be recived by id of an ObservedObject
     */
    @Test
    public void testListForObservedObject() {
        WebTarget methodTarget = webTarget.path("listForObservedObject");
        methodTarget = methodTarget.queryParam("ooid", preMetadata.getObservedObject().getId());
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testListForObservedObject---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());

        // Check if list element is there
        JsonReader reader = Json.createReader(new StringReader(responseText));
        JsonArray list = reader.readObject().getJsonArray("list");
        reader.close();
        assertEquals(true, list != null);

        // Check if (at least) the predefined object is in list
        boolean createdFound = false;
        for (JsonValue jsonVal : list) {
            JsonObject curListObj = (JsonObject) jsonVal;
            Long curId = curListObj.getJsonNumber("id").bigIntegerValue().longValue();
            System.out.println(curId + " => " + preMetadata.getId());
            if (Objects.equals(curId, preMetadata.getId())) {
                createdFound = true;
            }
        }
        assertEquals(true, createdFound);
    }
    
    @Test
    public void testListForObservedObjectNoOoid() {
        WebTarget methodTarget = webTarget.path("listForObservedObject");
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testListForObservedObject---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }
        
        assertEquals(Response.Status.PRECONDITION_FAILED.getStatusCode(), response.getStatus());
    }
}
