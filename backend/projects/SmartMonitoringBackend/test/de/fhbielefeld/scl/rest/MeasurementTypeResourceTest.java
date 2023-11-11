package de.fhbielefeld.scl.rest;

import de.fhbielefeld.scl.database.model.TblObject;
import de.fhbielefeld.smartmonitoring.jpa.TblMeasurementType;
import de.fhbielefeld.scl.rest.converters.ObjectConverter;
import de.fhbielefeld.scl.rest.exceptions.ObjectConvertException;
import de.fhbielefeld.scl.rest.testutil.ObjectHelper;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import javax.json.JsonObject;
import javax.ws.rs.client.Entity;
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
 * Tests the locationResource and creates some example data
 *
 * @author ffehring
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class MeasurementTypeResourceTest {

    private static WebTarget webTarget;
    private static ObjectHelper helper;
    private static final boolean PRINT_DEBUG_MESSAGES = true;

    private static TblMeasurementType preMeasurementType;
    private static TblMeasurementType preMeasurementType2;
    private static TblMeasurementType preMeasurementType3;

    public MeasurementTypeResourceTest() {

    }

    @BeforeClass
    public static void setUpClass() {
        webTarget = WebTargetCreator.createLocalhostWebTarget("measurementtype");
        helper = new ObjectHelper();

        TblMeasurementType preType1 = new TblMeasurementType();
        preType1.setName("Created for MeasurementTypeResourceTest preType1");
        preType1.setType("float8");
        preMeasurementType = helper.createTblObject(preType1);

        TblMeasurementType preType2 = new TblMeasurementType();
        preType2.setName("Created for MeasurementTypeResourceTest preType2");
        preType2.setType("float8");
        preMeasurementType2 = helper.createTblObject(preType2);

        TblMeasurementType preType3 = new TblMeasurementType();
        preType3.setName("Created for MeasurementTypeResourceTest preType3");
        preType3.setType("varchar");
        preMeasurementType3 = helper.createTblObject(preType3);
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
     * Test if an location can be created.
     */
    @Test
    public void testBcreateDuplicate() {
        try {
            TblObject copy = preMeasurementType.copy();
            String jsonObj = ObjectConverter.objectToJson(copy);
            Entity<String> dataSet = Entity.json(jsonObj);

            WebTarget methodTarget = this.webTarget.path("create");
            Response response = methodTarget.request(MediaType.APPLICATION_JSON).post(dataSet);
            String responseText = response.readEntity(String.class);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("---testBcreateDuplicate---");
                System.out.println(methodTarget.getUri());
                System.out.println("response status: " + response.getStatus());
                System.out.println("message body: " + responseText);
            }

            assertEquals(Response.Status.CONFLICT.getStatusCode(), response.getStatus());
        } catch (ObjectConvertException ex) {
            fail("Could not convert object: " + ex.getLocalizedMessage());
        }
    }

    @Test
    public void testCunion() {
        WebTarget target = webTarget.path("union")
                .queryParam("id", preMeasurementType.getId())
                .queryParam("remove_id", preMeasurementType2.getId());
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testUnion---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
    }

    @Test
    public void testDunionNotMatchingType() {
        WebTarget target = webTarget.path("union")
                .queryParam("id", preMeasurementType.getId())
                .queryParam("remove_id", preMeasurementType3.getId());
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testUnionNotMatchingType---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.BAD_REQUEST.getStatusCode(), response.getStatus());
    }

    @Test
    public void testEunionNoId() {
        WebTarget target = webTarget.path("union");
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testUnionNotMatchingType---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.PRECONDITION_FAILED.getStatusCode(), response.getStatus());
    }

    @Test
    public void testFunionNotExistingId() {
        WebTarget target = webTarget.path("union")
                .queryParam("id", preMeasurementType.getId())
                .queryParam("remove_id", "99999");
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testUnionNotMatchingType---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.NOT_FOUND.getStatusCode(), response.getStatus());
    }
}
