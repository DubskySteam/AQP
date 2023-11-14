package de.fhbielefeld.scl.rest;

import de.fhbielefeld.scl.rest.testutil.ObjectHelper;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObject;
import de.fhbielefeld.scl.rest.converters.ObjectConverter;
import de.fhbielefeld.scl.rest.exceptions.ObjectConvertException;
import de.fhbielefeld.scl.rest.testutil.ObjectHelperException;
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
 * Tests the ObservedObjectResource and creates some example data
 *
 * @author dstarke <dstarke@fh-bielefeld.de>, ffehring
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ObservedObjectResourceTest {

    private static WebTarget webTarget;
    private static ObjectHelper helper;
    private static final boolean PRINT_DEBUG_MESSAGES = true;

    private static TblObservedObject preOo;
    private static TblObservedObject preOo2;

    public ObservedObjectResourceTest() {

    }

    @BeforeClass
    public static void setUpClass() {
        webTarget = WebTargetCreator.createLocalhostWebTarget("observedobject");
        helper = new ObjectHelper();
        try {
            preOo = helper.generateTblObject(TblObservedObject.class, null);
            preOo2 = helper.generateTblObject(TblObservedObject.class, null);
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

    /**
     * Test if an ObservedObject can be created.
     */
    @Test
    public void testACreateWithParent() {
        try {
            TblObservedObject childOo = new TblObservedObject();
            childOo.setType(preOo.getType());
            childOo.setDescription("JUNIT_Test from ObservedObjectResource with Parent");
            childOo.setManualCapture(false);
            childOo.setName("ObservedObjectResourceTest-" + helper.getRandomValueForType(String.class, null));
            childOo.setParent(preOo);

            String jsonObj = ObjectConverter.objectToJson(childOo);
            Entity<String> dataSet = Entity.json(jsonObj);
            WebTarget createTarget = webTarget.path("create");
            Response response = createTarget.request(MediaType.APPLICATION_JSON).post(dataSet);
            String responseText = response.readEntity(String.class);
            JSONParser parser = new JSONParser();
            JSONObject createdId = (JSONObject) parser.parse(responseText);
            Long id = (Long) createdId.get("id");

            if (id == null) {
                fail("Object >" + childOo.getClass().getSimpleName() + "< was not created. "
                        + "Interface does not return a id.");
            }

            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("Send object:");
                System.out.println(childOo);
                System.out.println("StatusInfo:");
                System.out.println(response.getStatusInfo());
                System.out.println("ResponseText:");
                System.out.println(responseText);
                System.out.println("Created id:");
                System.out.println(id);
            }

            assertEquals(Response.Status.CREATED.getStatusCode(), helper.getStatus());
        } catch (ObjectHelperException ex) {
            fail(ex.getLocalizedMessage());
            ex.printStackTrace();
        } catch (ObjectConvertException ex) {
            fail(ex.getLocalizedMessage());
        } catch (ParseException ex) {
            fail("Could not understand response: " + ex.getLocalizedMessage());
        }
    }

    /**
     * Tests if an ObservedObjectcould be recived by Name(list)
     */
    @Test
    public void testBGetByName() {
        WebTarget methodTarget = webTarget.path("getByName");
        //testACreate();
        methodTarget = methodTarget.queryParam("name", preOo.getName());
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetByName " + preOo.getName() + "---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
    }

    /**
     * Tests if a list of Typenames could be recieved
     */
    @Test
    public void testCListForTypeName() {
        WebTarget methodTarget = webTarget.path("listForTypename");
        methodTarget = methodTarget.queryParam("typename", preOo.getType().getName());
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testListForTypename " + preOo.getType().getName() + "---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
    }

    /**
     * Tests if a list of observedobject (childs) could be recived
     */
    @Test
    public void testDListChilds() {
        WebTarget methodTarget = webTarget.path("listChilds");
        methodTarget = methodTarget.queryParam("parent_id", preOo.getId());
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testListChilds " + preOo.getId() + "---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
    }

    /**
     * Tests if an list of observedobject (parents) could be recived
     */
    @Test
    public void testEListParents() {
        WebTarget methodTarget = webTarget.path("listParents");
        methodTarget = methodTarget.queryParam("id", preOo.getId());
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testListParents " + preOo.getId() + "---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
    }

    /**
     * Tests if an object can by found by its name
     */
    @Test
    public void testFSearchForObjectname() {
        String test = "JUNIT_Test";
        WebTarget methodTarget = webTarget.path("search");
        methodTarget = methodTarget.queryParam("searchexpression", test);
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---TestSearch " + test + "---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
    }

    /**
     * Tests if an ObservedObject Manual capture can be set to true/false
     */
    @Test
    public void testGManualCaptureUpdate() {
        boolean newManualCapture = true;
        preOo.setManualCapture(newManualCapture);
        WebTarget methodTarget = webTarget.path("update");
        try {
            String jsonObj = ObjectConverter.objectToJson(preOo);
            Response response = methodTarget.request(MediaType.APPLICATION_JSON).put(Entity.json(jsonObj));
            String responseText = response.readEntity(String.class);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("---testGManualCaptureUpdate " + preOo.getId() + ": " + preOo.getManualCapture() + "---");
                System.out.println(methodTarget.getUri());
                System.out.println("response status: " + response.getStatus());
                System.out.println("message body: " + responseText + "\n");
            }
            assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        } catch (ObjectConvertException ex) {
            fail("Parsing json object failed.");
        }
    }

    /**
     * Tests if an Observedobject adds a child
     */
    @Test
    public void testHAddChild() {
        WebTarget methodTarget = webTarget.path("addChild");
        methodTarget = methodTarget.queryParam("id", preOo2.getId());
        methodTarget = methodTarget.queryParam("parent_id", preOo.getId());
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).post(null);
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testAddChild " + "parent:" + preOo.getId() + " child:" + preOo2.getId() + "---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
    }
}
