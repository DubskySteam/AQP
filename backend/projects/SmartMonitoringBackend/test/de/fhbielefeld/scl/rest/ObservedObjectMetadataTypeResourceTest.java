package de.fhbielefeld.scl.rest;

import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectType;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectMetadataType;
import de.fhbielefeld.smartmonitoring.jpa.TblOoTypeJoinOoMetadataType;
import de.fhbielefeld.scl.rest.testutil.ObjectHelper;
import de.fhbielefeld.scl.rest.testutil.ObjectHelperException;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import java.io.StringReader;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.Json;
import javax.json.JsonReader;
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
 *
 * @author dstarke <dstarke@fh-bielefeld.de>
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ObservedObjectMetadataTypeResourceTest {

    private static WebTarget webTarget;
    private static ObjectHelper helper;
    private static final boolean PRINT_DEBUG_MESSAGES = true;

    private static TblObservedObjectMetadataType preMetadataType;
    private static TblObservedObjectType preOoType;
    private static TblOoTypeJoinOoMetadataType preOoTypeJoinMetadataType;

    public ObservedObjectMetadataTypeResourceTest() {
    }

    @BeforeClass
    public static void setUpClass() {
        webTarget = WebTargetCreator.createLocalhostWebTarget("observedobjectmetadatatype");
        helper = new ObjectHelper();
        try {
            preOoType = helper.generateTblObject(TblObservedObjectType.class, null);
            preOoTypeJoinMetadataType = new TblOoTypeJoinOoMetadataType();
            preOoTypeJoinMetadataType.setName("ObservedObjectMetadataTypeResourceTest-"
                    + helper.getRandomValueForType(String.class, null));
            preOoTypeJoinMetadataType.setObservedObjectType(preOoType);
            preMetadataType = new TblObservedObjectMetadataType();
            preMetadataType.setName("ObservedObjectMetadataTypeResourceTest-"
                    + helper.getRandomValueForType(String.class, null));
            preOoTypeJoinMetadataType.setOoMetadataType(preMetadataType);
            preMetadataType.addOoTypeJoinOoMetadataType(preOoTypeJoinMetadataType);
            preMetadataType = helper.createTblObject(preMetadataType);
            preOoTypeJoinMetadataType = helper.createTblObject(preOoTypeJoinMetadataType);
        } catch (ObjectHelperException ex) {
            Logger.getLogger(TagTypeResourceTest.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

    @AfterClass
    public static void tearDownClass() {
        helper.deleteAll();
    }

    @Before
    public void setUp() {
    }

    @After
    public void tearDown() {
    }

    @Test
    public void testCGetByName() {
        WebTarget methodTarget = webTarget.path("getByName")
                .queryParam("name", preMetadataType.getName());
        
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testCGetByName---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText);
        }
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());

        // Check if list element is there
        JsonReader reader = Json.createReader(new StringReader(responseText));
        Long id = reader.readObject().getJsonNumber("id").longValue();
        reader.close();
        assertEquals(preMetadataType.getId(), id);
    }
}
