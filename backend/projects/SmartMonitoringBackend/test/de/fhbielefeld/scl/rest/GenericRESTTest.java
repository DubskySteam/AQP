/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.fhbielefeld.scl.rest;

import de.fhbielefeld.scl.database.model.TblObject;
import de.fhbielefeld.scl.database.model.jpa.TblDataview;
import de.fhbielefeld.scl.database.model.jpa.TblDataviewColorRange;
import de.fhbielefeld.scl.database.model.jpa.TblExchangeConfiguration;
import de.fhbielefeld.smartmonitoring.jpa.TblLocation;
import de.fhbielefeld.smartmonitoring.jpa.TblMedia;
import de.fhbielefeld.scl.database.model.jpa.TblVisualmodel;
import de.fhbielefeld.scl.database.model.jpa.TblVisualmodelElement;
import de.fhbielefeld.scl.database.model.jpa.TblVisualmodelRelation;
import de.fhbielefeld.scl.rest.converters.ObjectConverter;
import de.fhbielefeld.scl.rest.exceptions.ObjectConvertException;
import de.fhbielefeld.scl.rest.proxy.jpa.JPAClassAnalyzer;
import de.fhbielefeld.scl.rest.testutil.ObjectHelper;
import de.fhbielefeld.scl.rest.testutil.ObjectHelperException;
import java.io.StringReader;
import java.lang.reflect.Field;
import java.lang.reflect.InvocationTargetException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Random;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonNumber;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.json.JsonString;
import javax.json.JsonValue;
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
import org.junit.runner.RunWith;
import org.junit.runners.MethodSorters;
import org.junit.runners.Parameterized;
import org.junit.runners.Parameterized.Parameters;

/**
 *
 * @author ffehring, ssteinmeyer
 */
@RunWith(Parameterized.class)
@FixMethodOrder(MethodSorters.NAME_ASCENDING)
public class GenericRESTTest {

    private static final ObjectHelper HELPER = new ObjectHelper();
    private static final boolean PRINT_DEBUG_MESSAGES = true;
    private static final List<Class> EXCLUDE_FROM_TEST = new ArrayList<>();
    private static final Map<Class, TblObject> CREATED_OBJECTS = new HashMap<>();
    private static int counter = -1;
    private static Integer runOnlyById;
    private static Class runOnlyByClass;

    private final Map.Entry<Class, WebTarget> target;
    private final TblObject obj;

    public GenericRESTTest(Map.Entry<Class, WebTarget> target, TblObject obj) {
        this.target = target;
        this.obj = obj;
    }

    /**
     * Set some test configuration. Exclude resource tests. Run only explicit
     * test class.
     */
    private static void configure() {
        // Set excluded resources by matching TblObject.
        EXCLUDE_FROM_TEST.add(TblMedia.class);
        EXCLUDE_FROM_TEST.add(TblVisualmodelElement.class);
        EXCLUDE_FROM_TEST.add(TblVisualmodel.class);
        EXCLUDE_FROM_TEST.add(TblVisualmodelRelation.class);

        // Run only explicit test class by id. Use null to run all.
        runOnlyById = null;

        // Run only explicit test class for given TblObject. Use null to run all.
        // Use the the TblClass associated with the resource.
        runOnlyByClass = null;
    }

    @BeforeClass
    public static void setUpClass() {
    }

    @AfterClass
    public static void tearDownClass() {
        HELPER.deleteAll();
        CREATED_OBJECTS.keySet().forEach((cur) -> {
            HELPER.delete(CREATED_OBJECTS.get(cur));
            CREATED_OBJECTS.remove(cur);
        });
    }

    @Before
    public void setUp() {
    }

    @After
    public void tearDown() {
    }

    /**
     * Generate the test parameter for all rest ressources. To ignore ressources
     * or run only explicit see the method configure.
     *
     * @return the parameter list
     */
    @Parameters
    public static List<Object[]> data() {
        configure();

        List<Object[]> data = new ArrayList<>();
        for (Map.Entry<Class, WebTarget> curTarget : HELPER.getWebTargets().entrySet()) {
            // Check if class is excluded
            if (EXCLUDE_FROM_TEST.contains(curTarget.getKey())) {
                if (PRINT_DEBUG_MESSAGES) {
                    System.out.println("=======================================================");
                    System.out.println("Skipping tests for >" + curTarget.getKey().getSimpleName() + "<"
                            + " with api: " + curTarget.getValue().getUri());
                }
                continue;
            }
            if (!TblObject.class.isAssignableFrom(curTarget.getKey())) {
                if (PRINT_DEBUG_MESSAGES) {
                    System.out.println("=======================================================");
                    System.out.println("Skipping tests for >" + curTarget.getKey().getSimpleName() + "<"
                            + " with api: " + curTarget.getValue().getUri()
                            + " only RESTmethods with a param extending TblObject can be automatically tested."
                    );
                }
                continue;
            }
            try {
                TblObject obj = (TblObject) curTarget.getKey().getDeclaredConstructor().newInstance();
                // Look at each possible field
                for (Field curField : JPAClassAnalyzer.getRequiredFieldsMap(obj.getClass()).values()) {
                    // Set field value
                    Class fieldtype = curField.getType();
                    curField.setAccessible(true);
                    // Fill with random content
                    Random rand = new Random();
                    if (fieldtype == Integer.class) {
                        curField.set(obj, rand.nextInt(255));
                    }
                    if (fieldtype == Long.class) {
                        curField.set(obj, rand.nextLong());
                    }
                    if (fieldtype == Float.class) {
                        curField.set(obj, rand.nextFloat());
                    }
                    if (fieldtype == Double.class) {
                        curField.set(obj, rand.nextDouble());
                    }
                    if (fieldtype == Boolean.class) {
                        curField.set(obj, rand.nextBoolean());
                    }
                    if (fieldtype == String.class) {
                        curField.set(obj, "gen by " + GenericRESTTest.class.getSimpleName()
                                + " " + ObjectHelper.getRandomChars());
                    }
                    if (TblObject.class.isAssignableFrom(fieldtype)) {
                        TblObject refObj = HELPER.generateTblObject(fieldtype, null);
                        if (refObj == null || refObj.getId() == null) {
                            fail("Could not execute test because a"
                                    + " depending object could not be created."
                                    + " see serverlog for details.");
                        }
                        curField.set(obj, refObj);
                    }
                    curField.setAccessible(false);
                }
                Object[] object = {curTarget, obj};
                data.add(object);
            } catch (InvocationTargetException | NoSuchMethodException | InstantiationException | IllegalAccessException ex) {
                fail("Could not initialize >" + curTarget.getKey().getSimpleName() + "< :" + ex.getLocalizedMessage());
            } catch (ObjectHelperException ex) {
                fail(ex.getLocalizedMessage());
                ex.printStackTrace();
            }
        }
        if (runOnlyById == null && runOnlyByClass == null) {
            return data;
        } else {
            List<Object[]> explicit = new ArrayList<>();
            if (runOnlyById != null) {
                explicit.add(data.get(runOnlyById));
            }
            if (runOnlyByClass != null) {
                data.forEach((Object[] val) -> {
                    Map.Entry<Class, WebTarget> cur = (Map.Entry<Class, WebTarget>) val[0];
                    if (runOnlyByClass.equals(cur.getKey())) {
                        explicit.add(val);
                    }
                });
            }
            return explicit;
        }
    }

    /**
     * Checks if both values match.
     *
     * @param jval the value to check
     * @param expected the ecpected value to match
     */
    private static void match(JsonValue jval, Object expected) {
        String responseval;
        if (jval.getValueType() == JsonValue.ValueType.STRING) {
            JsonString jstr = (JsonString) jval;
            responseval = jstr.getString();
            responseval = responseval.replace("\"", "");
            // Special case for references
            if (responseval.startsWith("ref://")) {
                String refIdStr = null;
                Long refId = null;
                Pattern p = Pattern.compile("[0-9]+$");
                Matcher m = p.matcher(responseval);
                if (m.find()) {
                    refIdStr = m.group();
                }
                try {
                    refId = Long.parseLong(refIdStr);
                } catch (NumberFormatException ex) {
                    fail("Id of ref string \"" + responseval + "\"");
                }
                TblObject curFilledObj = (TblObject) expected;
                assertEquals(curFilledObj.getId(), refId);
            } else if (expected.getClass() == LocalDateTime.class) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm");
                String expectedval = formatter.format((LocalDateTime) expected);
                assertEquals(expectedval, responseval);
            } else {
                assertEquals(expected.toString(), responseval);
            }
        } else if (jval.getValueType() == JsonValue.ValueType.NUMBER) {
            if (expected.getClass() == Long.class) {
                Long recived = ((JsonNumber) jval).longValue();
                assertEquals(expected, recived);
            } else if (expected.getClass() == Integer.class) {
                Integer recived = ((JsonNumber) jval).intValue();
                assertEquals(expected, recived);
            } else if (expected.getClass() == Double.class) {
                Double recived = ((JsonNumber) jval).doubleValue();
                assertEquals(expected, recived);
            }
        } else if (expected == null) {
            // nothing to do
        } else if (expected.getClass() == Boolean.class) {
            Boolean expectedval = (Boolean) expected;
            Boolean recived = false;
            if (jval.getValueType() == JsonValue.ValueType.TRUE) {
                recived = true;
            }
            assertEquals(expectedval, recived);
        } else {
            fail("No Match case found");
        }
    }

    /**
     * Tests the create methods of all known REST interfaces.
     */
    @Test
    public void testACreates() {
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("=======================================================");
            counter++;
            System.out.println("TestClass[" + counter + "]");
            System.out.println("Running create test for >" + this.target.getKey().getSimpleName() + "<"
                    + " with api: " + this.target.getValue().getUri());
        }
        try {
            String jsonObj = ObjectConverter.objectToJson(this.obj);
            Entity<String> dataSet = Entity.json(jsonObj);
            WebTarget createTarget = this.target.getValue().path("create");
            Response response = createTarget.request(MediaType.APPLICATION_JSON).post(dataSet);
            String responseText = response.readEntity(String.class);
            JSONParser parser = new JSONParser();
            JSONObject createdId = (JSONObject) parser.parse(responseText);
            Long id = (Long) createdId.get("id");

            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("Send object:");
                System.out.println(dataSet.getEntity());
                System.out.println("StatusInfo:");
                System.out.println(response.getStatusInfo());
                System.out.println("ResponseText:");
                System.out.println(responseText);
                System.out.println("Created id:");
                System.out.println(id);
            }
            if (id == null) {
                fail("Object >" + obj.getClass().getSimpleName() + "< was not created. "
                        + "Interface does not return a id.");
            }
            obj.setId(id);
            CREATED_OBJECTS.put(obj.getClass(), obj);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("Created " + CREATED_OBJECTS.size() + " objects.");
            }
            assertEquals(Response.Status.CREATED.getStatusCode(), response.getStatus());
        } catch (ObjectConvertException ex) {
            fail(ex.getLocalizedMessage());
        } catch (ParseException ex) {
            fail("Could not understand response: " + ex.getLocalizedMessage());
        }
    }

    @Test
    public void testBCreateWithNull() {
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("=======================================================");
            System.out.println("Running createWithNull test for >" + this.target.getKey().getSimpleName() + "<"
                    + " with api: " + this.target.getValue().getUri());
        }
        try {
            TblObject object = (TblObject) this.target.getKey().getDeclaredConstructor().newInstance();

            String jsonObj = ObjectConverter.objectToJson(object);
            Entity<String> dataSet = Entity.json(jsonObj);
            WebTarget createTarget = this.target.getValue().path("create");
            Response response = createTarget.request(MediaType.APPLICATION_JSON).post(dataSet);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("sended: " + dataSet);
                System.out.println("response code: " + response.getStatus());
                System.out.println("response text: " + response.readEntity(String.class));
            }
            assertEquals(Response.Status.PRECONDITION_FAILED.getStatusCode(), response.getStatus());
            System.out.println("testBCreateWithNull created " + CREATED_OBJECTS.size() + " objects.");
        } catch (InvocationTargetException | NoSuchMethodException | InstantiationException | IllegalAccessException ex) {
            fail("Could not initialize >" + this.target.getKey().getSimpleName() + "< :" + ex.getLocalizedMessage());
        } catch (ObjectConvertException ex) {
            fail(ex.getLocalizedMessage());
        }
    }

    /**
     * Tests the get method of all known REST interfaces where is kown that
     * there is a data available
     */
    @Test
    public void testCgetExisting() {
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("=======================================================");
            System.out.println("Running get test for >" + this.target.getKey().getSimpleName() + "<"
                    + " with api: " + this.target.getValue().getUri());
        }
        WebTarget getWebTarget = this.target.getValue().path("get")
                .queryParam("id", obj.getId());
        Response response = getWebTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        JSONParser parser = new JSONParser();
        try {
            JSONObject parsedSet = (JSONObject) parser.parse(responseText);
            Long id = (Long) parsedSet.get("id");
            assertEquals(id, this.obj.getId());
        } catch (ParseException ex) {
            fail("response couldn't be parsed. " + ex.getLocalizedMessage());
        }
    }

    @Test
    public void testDgetNotExisting() {
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("=======================================================");
            System.out.println("Running getNotExisting test for >" + this.target.getKey().getSimpleName() + "<"
                    + " with api: " + this.target.getValue().getUri());
        }

        // Get the matching rest resource
        WebTarget getWebTarget = this.target.getValue().path("get")
                .queryParam("id", Long.MAX_VALUE);
        Response response = getWebTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testDGetNotExisting---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.NOT_FOUND.getStatusCode(), response.getStatus());
    }

    /**
     * Tests the get method of all known REST interfaces how they react when a
     * object is requested but no id is given
     */
    @Test
    public void testEGetWithNoId() {
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("=======================================================");
            System.out.println("Running getWithNoId test for >" + this.target.getKey().getSimpleName() + "<"
                    + " with api: " + this.target.getValue().getUri());
        }

        // Get the matching rest resource
        WebTarget getWebTarget = this.target.getValue().path("get");
        Response response = getWebTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testEGetWithNoId---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.PRECONDITION_FAILED.getStatusCode(), response.getStatus());
    }

    /**
     * Test the list method of every kown REST interface
     */
    @Test
    public void testFList() {
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("=======================================================");
            System.out.println("Running list test for >" + this.target.getKey().getSimpleName() + "<"
                    + " with api: " + this.target.getValue().getUri());
        }

        // Get the matching rest resource
        WebTarget getWebTarget = this.target.getValue().path("list");
        Response response = getWebTarget.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testFList---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
        JsonArray list;
        try ( // Check if list element is there
                JsonReader reader = Json.createReader(new StringReader(responseText))) {
            list = reader.readObject().getJsonArray("list");
        }
        assertEquals(true, list != null);

        // Check if (at least) the created object is in list
        TblObject createdObj = CREATED_OBJECTS.get(this.target.getKey());
        if (createdObj != null) {
            boolean createdFound = false;
            for (JsonValue jsonVal : list) {
                JsonObject curListObj = (JsonObject) jsonVal;
                Long curId = curListObj.getJsonNumber("id").bigIntegerValue().longValue();
                if (Objects.equals(curId, createdObj.getId())) {
                    createdFound = true;
                }
            }
            assertEquals(true, createdFound);
        } else {
            fail("Created object not found.");
        }
    }

    @Test
    public void testGupdate() {
        CREATED_OBJECTS.values().forEach((curObj) -> {
            try {
                // Get the matching rest resource
                WebTarget curWebTarget = HELPER.getWebTargets().get(curObj.getClass());
                WebTarget updateTarget = curWebTarget.path("update");
                if (PRINT_DEBUG_MESSAGES) {
                    System.out.println("==============================================");
                    System.out.println("Running update test for >"
                            + curObj.getClass().getSimpleName() + "< with api: "
                            + updateTarget.getUri());
                }
                Map<String, Object> changed = HELPER.changeTblObject(curObj, 1);
                Map<String, Object> filled = HELPER.fillTblObject(curObj);

                String jsonObj = ObjectConverter.objectToJson(curObj);
                Entity<String> dataSet = Entity.json(jsonObj);

                Response response = updateTarget.request(MediaType.APPLICATION_JSON).put(dataSet);
                String responseText = response.readEntity(String.class);
                if (PRINT_DEBUG_MESSAGES) {
                    System.out.println("---testGUpdate---");
                    System.out.println(response.getStatusInfo());
                    System.out.println(responseText);
                }
                assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
                JsonObject responseObj;
                try (JsonReader reader = Json.createReader(new StringReader(responseText))) {
                    responseObj = reader.readObject();
                }
                // Should return the modified object
                assertTrue(responseObj != null);
                // Should contain the id
                assertTrue(responseObj.getJsonNumber("id") != null);
                // Id should not be changed
                Long id = responseObj.getJsonNumber("id").longValue();
                assertEquals(id, curObj.getId());
                // Changed values should be changed
                changed.entrySet().forEach((curChanged) -> {
                    JsonValue jval = responseObj.get(curChanged.getKey());
                    if (curChanged.getValue() != null && jval == null) {
                        fail("Did not found expected >" + curChanged.getKey() + "< in response. "
                                + curObj.getClass().getSimpleName() + " >" + curObj.getId() + "<");
                    }
                    match(jval, curChanged.getValue());
                });
                // Filled values should be there
                filled.entrySet().forEach((curFilled) -> {
                    JsonValue jval = responseObj.get(curFilled.getKey());
                    System.out.println("check >" + curFilled.getKey() + "<");
                    System.out.println("for >" + curFilled.getValue() + "<");
                    if (curFilled.getValue() != null) {
                        if (jval == null) {
                            fail("Did not found expected >" + curFilled.getKey() + "< in response. ");
                        } else {
                            match(jval, curFilled.getValue());
                        }
                    }
                });
            } catch (ObjectHelperException ex) {
                ex.printStackTrace();
                fail("Could not change object >" + curObj.getClass().getSimpleName() + "< " + ex.getLocalizedMessage());
            } catch (ObjectConvertException ex) {
                fail("Could not convert object >" + curObj.getClass().getSimpleName() + "< " + ex.getLocalizedMessage());
            }
        });
    }

    @Test
    public void testVDeleteWithNotExistingId() {
        for (TblObject curObj : CREATED_OBJECTS.values()) {
            // Get the matching rest resource
            WebTarget curWebTarget = HELPER.getWebTargets().get(curObj.getClass());
            WebTarget deleteTarget = curWebTarget.path("delete");
            deleteTarget = deleteTarget.queryParam("id", Long.MAX_VALUE);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("==============================================");
                System.out.println("Running deleteWithNotExistingId test for >"
                        + curObj.getClass().getSimpleName() + "< with api: "
                        + deleteTarget.getUri());
            }
            Response response = deleteTarget.request(MediaType.APPLICATION_JSON).delete();
            String responseText = response.readEntity(String.class);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("---testVDeleteWithoutId---");
                System.out.println(response.getStatusInfo());
                System.out.println(responseText);
            }
            assertEquals(Response.Status.NOT_FOUND.getStatusCode(), response.getStatus());
        }
    }

    @Test
    public void testWDeleteWithoutId() {
        for (TblObject curObj : CREATED_OBJECTS.values()) {
            // Get the matching rest resource
            WebTarget curWebTarget = HELPER.getWebTargets().get(curObj.getClass());
            WebTarget deleteTarget = curWebTarget.path("delete");
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("==============================================");
                System.out.println("Running deleteWithoutId test for >"
                        + curObj.getClass().getSimpleName() + "< with api: "
                        + deleteTarget.getUri());
            }
            Response response = deleteTarget.request(MediaType.APPLICATION_JSON).delete();
            String responseText = response.readEntity(String.class);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("---testWDeleteWithoutId---");
                System.out.println(response.getStatusInfo());
                System.out.println(responseText);
            }
            assertEquals(Response.Status.PRECONDITION_FAILED.getStatusCode(), response.getStatus());
        }
    }

    @Test
    public void testXDelete() {
        for (Class curKey : CREATED_OBJECTS.keySet()) {
            TblObject curObj = CREATED_OBJECTS.get(curKey);
            if (curObj.getId() == null) {
                fail("Can't run test for deleteing " + curObj.getClass().getSimpleName() + " it has no id.");
            }

            // Get the matching rest resource
            WebTarget curWebTarget = HELPER.getWebTargets().get(curObj.getClass());
            WebTarget deleteTarget = curWebTarget.path("delete");
            deleteTarget = deleteTarget.queryParam("id", curObj.getId());
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("==============================================");
                System.out.println("Running delete test for >"
                        + curObj.getClass().getSimpleName() + "<  >" + curObj.getId() + "< with api: "
                        + deleteTarget.getUri());
            }
            Response response = deleteTarget.request(MediaType.APPLICATION_JSON).delete();
            String responseText = response.readEntity(String.class);
            if (PRINT_DEBUG_MESSAGES) {
                System.out.println("---testXDelete---");
                System.out.println(response.getStatusInfo());
                System.out.println(responseText);
            }
            assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
            CREATED_OBJECTS.remove(curKey);
        }
    }
}
