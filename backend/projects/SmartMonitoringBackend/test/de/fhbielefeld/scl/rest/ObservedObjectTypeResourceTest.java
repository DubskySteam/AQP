package de.fhbielefeld.scl.rest;

import de.fhbielefeld.scl.database.model.TblObject;
import de.fhbielefeld.smartmonitoring.jpa.TblMeasurementType;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObject;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectType;
import de.fhbielefeld.scl.rest.converters.ObjectConverter;
import de.fhbielefeld.scl.rest.exceptions.ObjectConvertException;
import de.fhbielefeld.scl.rest.testutil.ObjectHelper;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.JsonObject;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.FixMethodOrder;
import org.junit.runners.MethodSorters;

/**
 * Tests the locationResource and creates some example data
 *
 * @author ffehring
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ObservedObjectTypeResourceTest {

    private static WebTarget webTarget;
    private static ObjectHelper helper;
    private static final boolean PRINT_DEBUG_MESSAGES = true;

    private static TblObservedObjectType preOoType1;
    private static TblObservedObjectType preOoType2;
    private static TblObservedObject preOo;

    public ObservedObjectTypeResourceTest() {

    }

    @BeforeClass
    public static void setUpClass() {
        webTarget = WebTargetCreator.createLocalhostWebTarget("observedobjecttype");
        helper = new ObjectHelper();

        TblObservedObjectType preType1 = new TblObservedObjectType();
        preType1.setName("Created for ObservedObjectTypeResourceTest preType1");
        preOoType1 = helper.createTblObject(preType1);

        TblObservedObjectType preType2 = new TblObservedObjectType();
        preType2.setName("Created for ObservedObjectTypeResourceTest preType2");
        preOoType2 = helper.createTblObject(preType2);

        TblObservedObject oo = new TblObservedObject();
        oo.setType(preType2);
        oo.setName("Created for ObservedObjectTypeResourceTest Oo1");
        preOo = helper.createTblObject(oo);
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
    public void testGetOoTypeByName() {
        try {
            WebTarget target = webTarget.path("getByName")
                    .queryParam("name", preOoType1.getName());
            Response response = target.request(MediaType.APPLICATION_JSON).get();
            String responseText = response.readEntity(String.class);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("---testGetByName---");
                System.out.println(response.getStatusInfo());
                System.out.println(responseText);
            }
            assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
            
            JSONParser parser = new JSONParser();
            JSONObject createdId = (JSONObject) parser.parse(responseText);
            Long typeid = (Long) createdId.get("id");
            
            assertEquals(preOoType1.getId(), typeid);
        } catch (ParseException ex) {
            Logger.getLogger(ObservedObjectTypeResourceTest.class.getName()).log(Level.SEVERE, null, ex);
            assertTrue(false);
        }
    }

    @Test
    public void testGetByNameNotFound() {
        WebTarget target = webTarget.path("getByName")
                .queryParam("name", "gibtsNicht");
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetByNameNotFound---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.NOT_FOUND.getStatusCode(), response.getStatus());
    }

    @Test
    public void testGetByNameNoNameGiven() {
        WebTarget target = webTarget.path("getByName");
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetByNameNoNameGiven---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.PRECONDITION_FAILED.getStatusCode(), response.getStatus());
    }

    @Test
    public void testGetByObservedObject() {
        try {
            WebTarget target = webTarget.path("getByObservedObject")
                    .queryParam("ooid", preOo.getId());
            Response response = target.request(MediaType.APPLICATION_JSON).get();
            String responseText = response.readEntity(String.class);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("---testGetByObservedObject---");
                System.out.println(response.getStatusInfo());
                System.out.println(responseText);
            }
            assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());

            JSONParser parser = new JSONParser();
            JSONObject createdId = (JSONObject) parser.parse(responseText);
            Long typeid = (Long) createdId.get("id");

            assertEquals(preOo.getType().getId(), typeid);
        } catch (ParseException ex) {
            Logger.getLogger(ObservedObjectTypeResourceTest.class.getName()).log(Level.SEVERE, null, ex);
            assertTrue(false);
        }
    }

    @Test
    public void testGetByObservedObjectNotExistingOoid() {
        WebTarget target = webTarget.path("getByObservedObject")
                .queryParam("ooid", "99999");
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetByObservedObjectNotExistingOoid---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.NOT_FOUND.getStatusCode(), response.getStatus());
    }

    @Test
    public void testGetByObservedObjectNoOoidGiven() {
        WebTarget target = webTarget.path("getByObservedObject");
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetByObservedObjectNotOoidGiven---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.PRECONDITION_FAILED.getStatusCode(), response.getStatus());
    }
}
