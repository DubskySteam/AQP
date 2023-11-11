package de.fhbielefeld.scl.rest;

import org.junit.FixMethodOrder;
import de.fhbielefeld.scl.rest.testutil.ObjectHelper;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.junit.After;
import org.junit.AfterClass;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;
import static org.junit.Assert.*;
import org.junit.runners.MethodSorters;

/**
 * Calls the tests on the zSystemTest resource. For checking REST interface
 * behavior.
 *
 *
 * @author ffehring
 */
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class ZSystemTestResourceTest {

    private static WebTarget webTarget;
    private static ObjectHelper helper;
    private static final boolean PRINT_DEBUG_MESSAGES = true;

    public ZSystemTestResourceTest() {
    }

    @BeforeClass
    public static void setUpClass() {
        webTarget = WebTargetCreator.createLocalhostWebTarget("zsystemtest");
        helper = new ObjectHelper();
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
     * Test if a list of TagTypes listed by Type can be recieved
     *
     */
    @Test
    public void testProvokeError() {

        WebTarget methodTarget = webTarget.path("provokeError");
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testProvokeError---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(500, response.getStatus());
    }

    @Test
    public void testGetEntityManager() {

        WebTarget methodTarget = webTarget.path("testGetEntityManager");
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetEntityManager---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(200, response.getStatus());
    }

    @Test
    public void testRobValues() {

        WebTarget methodTarget = webTarget.path("testRobValues");
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testRobValues---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(200, response.getStatus());
    }

    @Test
    public void testDebugMessages() {

        WebTarget methodTarget = webTarget.path("testDebugMessages");
        Response response = methodTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testDebugMessages---");
            System.out.println(methodTarget.getUri());
            System.out.println("response status: " + response.getStatus());
            System.out.println("message body: " + responseText + "\n");
        }

        assertEquals(200, response.getStatus());
    }
}
