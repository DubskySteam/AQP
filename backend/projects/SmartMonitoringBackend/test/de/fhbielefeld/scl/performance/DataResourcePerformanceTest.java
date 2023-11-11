package de.fhbielefeld.scl.performance;

import de.fhbielefeld.smartmonitoring.jpa.TblMeasurementType;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObject;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectType;
import de.fhbielefeld.smartmonitoring.jpa.TblOoTypeJoinMType;
import de.fhbielefeld.scl.rest.testutil.ObjectHelper;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import java.io.StringReader;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.logging.Level;
import java.util.logging.Logger;
import javax.json.Json;
import javax.json.JsonArray;
import javax.json.JsonObject;
import javax.json.JsonObjectBuilder;
import javax.json.JsonReader;
import javax.json.JsonValue;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.json.simple.JSONObject;
import org.junit.After;
import org.junit.AfterClass;
import static org.junit.Assert.*;
import org.junit.Before;
import org.junit.BeforeClass;
import org.junit.Test;

/**
 * Test class for testing the performance of the DataResouce.
 *
 * @author ffehring
 */
public class DataResourcePerformanceTest {

    private static WebTarget webTarget;
    private static WebTarget systemConfigTarget;
    private static final String RESOURCE = "data";
    private static final boolean PRINT_DEBUG_MESSAGES = true;
    private static TblObservedObject notFlattendObject;
    private static TblObservedObject flattendObject;
    private static ObjectHelper helper;
    private static final String DESCRIPTION = "created by DataResourceTest";
    private static LocalDateTime startDateTime;
    private static LocalDateTime endDateTime;
    private static final long TESTLIMIT = 10l;
    private static Long createdSetsNotFlattend = 0L;
    private static Long createdSetsFlattend = 0L;
    private static final Map<Long, List<Map<String, Object>>> createdData = new HashMap<>();

    @BeforeClass
    public static void setUpClass() {
        startDateTime = LocalDateTime.now();
        webTarget = WebTargetCreator.createLocalhostWebTarget(RESOURCE);
        helper = new ObjectHelper();

        createPreExistingTypeFlattend();
        createPreExistingTypeNotFlattend();

        endDateTime = LocalDateTime.now();

        System.out.println("=======================================");
        System.out.println(" END SETUP CLASS");
    }

    /**
     * Creates a TblObservedObject of type 1: With ts, and a view
     * measurementtypes
     *
     * @return
     */
    private static TblObservedObject createPreExistingTypeFlattend() {
        TblMeasurementType mTypeS = new TblMeasurementType();
        mTypeS.setName("varchar testtype");
        mTypeS.setDescription(DESCRIPTION);
        mTypeS.setType("varchar");
        mTypeS = helper.createTblObject(mTypeS);

        TblMeasurementType mTypeU = new TblMeasurementType();
        mTypeU.setName("dataresourcetesttypeU");
        mTypeU.setDescription(DESCRIPTION);
        mTypeU.setType("float8");
        mTypeU = helper.createTblObject(mTypeU);

        TblMeasurementType mTypeI = new TblMeasurementType();
        mTypeI.setName("dataresourcetesttypeI");
        mTypeI.setDescription(DESCRIPTION);
        mTypeI.setType("float8");
        mTypeI = helper.createTblObject(mTypeI);

        //create OoType and Joiner
        TblObservedObjectType oOType = new TblObservedObjectType();
        oOType.setName("flattend ootype");
        oOType.setDescription(DESCRIPTION);
        oOType.setFlatendSets(true);
        helper.createTblObject(oOType);

        TblOoTypeJoinMType mTypeJoin = new TblOoTypeJoinMType();
        mTypeJoin.setMeasurementType(mTypeS);
        mTypeJoin.setObservedobjectType(oOType);
        mTypeJoin = helper.createTblObject(mTypeJoin);
        oOType.addOoTypeJoinMtype(mTypeJoin);

        // Columns for flatten sets
        for (int i = 1; i < 11; i++) {
            TblOoTypeJoinMType mTypeJoinU1 = new TblOoTypeJoinMType();
            mTypeJoinU1.setName("U" + i);
            mTypeJoinU1.setMeasurementType(mTypeU);
            mTypeJoinU1.setObservedobjectType(oOType);
            mTypeJoinU1 = helper.createTblObject(mTypeJoinU1);
            oOType.addOoTypeJoinMtype(mTypeJoinU1);

            TblOoTypeJoinMType mTypeJoinI1 = new TblOoTypeJoinMType();
            mTypeJoinI1.setName("I" + i);
            mTypeJoinI1.setMeasurementType(mTypeI);
            mTypeJoinI1.setObservedobjectType(oOType);
            mTypeJoinI1 = helper.createTblObject(mTypeJoinI1);
            oOType.addOoTypeJoinMtype(mTypeJoinI1);
        }

        flattendObject = new TblObservedObject();
        flattendObject.setName("flattend testobject");
        flattendObject.setDescription(DESCRIPTION);
        flattendObject.setDataCapture(Boolean.TRUE);
        flattendObject.setType(oOType);
        flattendObject = helper.createTblObject(flattendObject);
        return flattendObject;
    }

    private static TblObservedObject createPreExistingTypeNotFlattend() {

        //create MeasurementTypes
        TblMeasurementType mTypeF = new TblMeasurementType();
        mTypeF.setName("float8 testtype");
        mTypeF.setDescription(DESCRIPTION);
        mTypeF.setType("float8");
        mTypeF = helper.createTblObject(mTypeF);

        TblMeasurementType mTypeS = new TblMeasurementType();
        mTypeS.setName("varchar testtype");
        mTypeS.setDescription(DESCRIPTION);
        mTypeS.setType("varchar");
        mTypeS = helper.createTblObject(mTypeS);

        //try to create ts, if exist use avaible ts
        TblMeasurementType mTypeTS = new TblMeasurementType();
        mTypeTS.setName("ts");
        mTypeTS.setDescription(DESCRIPTION);
        mTypeTS.setType("timestamp");
        mTypeTS = helper.createTblObject(mTypeTS);

        //create OoType and Joiner
        TblObservedObjectType oOType = new TblObservedObjectType();
        oOType.setName("notflattend ootype");
        oOType.setDescription(DESCRIPTION);
        helper.createTblObject(oOType);

        TblOoTypeJoinMType mTypeJoinF = new TblOoTypeJoinMType();
        mTypeJoinF.setMeasurementType(mTypeF);
        mTypeJoinF.setObservedobjectType(oOType);
        mTypeJoinF = helper.createTblObject(mTypeJoinF);
        oOType.addOoTypeJoinMtype(mTypeJoinF);

        TblOoTypeJoinMType mTypeJoinS = new TblOoTypeJoinMType();
        mTypeJoinS.setMeasurementType(mTypeS);
        mTypeJoinS.setObservedobjectType(oOType);
        mTypeJoinS = helper.createTblObject(mTypeJoinS);
        oOType.addOoTypeJoinMtype(mTypeJoinS);

        TblOoTypeJoinMType mTypeJoinTS = new TblOoTypeJoinMType();
        mTypeJoinTS.setMeasurementType(mTypeTS);
        mTypeJoinTS.setObservedobjectType(oOType);
        mTypeJoinTS = helper.createTblObject(mTypeJoinTS);
        oOType.addOoTypeJoinMtype(mTypeJoinTS);

        notFlattendObject = new TblObservedObject();
        notFlattendObject.setName("notflattend testobject");
        notFlattendObject.setDescription(DESCRIPTION);
        notFlattendObject.setDataCapture(Boolean.TRUE);
        notFlattendObject.setType(oOType);
        notFlattendObject = helper.createTblObject(notFlattendObject);
        return notFlattendObject;
    }

    @AfterClass
    public static void tearDownClass() {
//        helper.deleteAll();
    }

    @Before
    public void setUp() {
    }

    @After
    public void tearDown() {
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println();
        }
    }

    @Test
    public void testACreateDataNotFlattend() {
        long noOfSets = 10000;
        System.out.println("Create >" + noOfSets + "< sample datasets for oo >" + notFlattendObject.getId() + "<");
        Random rand = new Random();
        WebTarget target = webTarget.path("create");
        List<Long> responseTimes = new ArrayList<>();
        for (int i = 0; i < noOfSets; i++) {
            Map<String, Object> datamap = new HashMap<>();
            float floatdata = rand.nextFloat();
            String timestamp = LocalDateTime.now().toString();
            JsonObjectBuilder builder = Json.createObjectBuilder();
            builder.add("ooid", notFlattendObject.getId());
            builder.add("float8 testtype", floatdata);
            datamap.put("float8 testtype", floatdata);
            builder.add("varchar testtype", "EinString");
            datamap.put("varchar testtype", "EinString");
            builder.add("ts", timestamp);
            datamap.put("ts", timestamp);
            JsonObject dataObject = builder.build();
            Entity<String> dataSet = Entity.json(dataObject.toString());
            long startGetSets = System.currentTimeMillis();
            Response response = target.request(MediaType.APPLICATION_JSON).post(dataSet);
            long endGetSets = System.currentTimeMillis();
            responseTimes.add(endGetSets - startGetSets);
        }
        // Calculate average
        Long sumTimes = 0L;
        for (Long curTime : responseTimes) {
            sumTimes += curTime;
        }
        Double avgTimes = sumTimes.doubleValue() / responseTimes.size();
        System.out.println("Needed " + avgTimes + "ms in average for creating "
                + noOfSets + " datasets with "
                + notFlattendObject.getType().getMeasurementtypes().size()
                + " values each.");
    }

//    @Test
    public void testCreateDataFlattend() {
        long noOfSets = 10000;
        System.out.println("Create >" + noOfSets + "< sample flattend datasets for oo >" + flattendObject.getId() + "<");
        Random rand = new Random();
        WebTarget target = webTarget.path("create");
        List<Long> responseTimes = new ArrayList<>();
        for (int i = 0; i < noOfSets; i++) {
            Map<String, Object> datamap = new HashMap<>();
            JsonObjectBuilder builder = Json.createObjectBuilder();
            builder.add("ooid", flattendObject.getId());
            builder.add("varchar testtype", "EinString");
            datamap.put("varchar testtype", "EinString");
            for (int j = 1; j < 11; j++) {
                Double curUval = rand.nextDouble();
                Double curIval = rand.nextDouble();
                builder.add("U" + j, curUval);
                builder.add("I" + j, curIval);
                datamap.put("U" + j, curUval);
                datamap.put("I" + j, curIval);
            }
            JsonObject dataObject = builder.build();
            Entity<String> dataSet = Entity.json(dataObject.toString());
            long startGetSets = System.currentTimeMillis();
            Response response = target.request(MediaType.APPLICATION_JSON).post(dataSet);
            long endGetSets = System.currentTimeMillis();
            responseTimes.add(endGetSets - startGetSets);
        }
        // Calculate average
        Long sumTimes = 0L;
        for (Long curTime : responseTimes) {
            sumTimes += curTime;
        }
        Double avgTimes = sumTimes.doubleValue() / responseTimes.size();
        System.out.println("Needed " + avgTimes + "ms in average for creating "
                + noOfSets + " flattend datasets with "
                + notFlattendObject.getType().getMeasurementtypes().size()
                + " values each.");
    }

    @Test
    public void testCGetSetsNotFlattend() {
        long noOfRequests = 1000;
        List<Long> responseTimes = new ArrayList<>();
        for (int i = 0; i < noOfRequests; i++) {
            WebTarget target = webTarget.path("getSets")
                    .queryParam("ooid", notFlattendObject.getId());
            long startGetSets = System.currentTimeMillis();
            Response response = target.request(MediaType.APPLICATION_JSON).get();
            long endGetSets = System.currentTimeMillis();
            responseTimes.add(endGetSets - startGetSets);
            try {
                Thread.sleep(15);
            } catch (InterruptedException ex) {
                Logger.getLogger(DataResourcePerformanceTest.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
                // Calculate average
        Long sumTimes = 0L;
        for (Long curTime : responseTimes) {
            sumTimes += curTime;
        }
        Double avgTimes = sumTimes.doubleValue() / responseTimes.size();
        System.out.println("Needed " + avgTimes + "ms in average for getSets."
                + "Tried " + noOfRequests + " times.");
    }

//    @Test
    public void testGetSetsLength() {
        WebTarget target = webTarget.path("getSetsLength")
                .queryParam("ooid", notFlattendObject.getId());
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetSetsLength---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());

        JsonReader jsonReader = Json.createReader(new StringReader(responseText));
        JsonObject rootobj = jsonReader.readObject();
        JsonArray jsonArray = rootobj.getJsonArray("list");

        long expectedCount = createdSetsNotFlattend;

        for (JsonValue curValue : jsonArray) {
            JsonObject curObj = (JsonObject) curValue;
            int curOoid = curObj.getJsonNumber("ooid").intValue();
            if (curOoid == notFlattendObject.getId()) {
                int curLength = curObj.getJsonNumber("length").intValue();
                assertEquals(expectedCount, curLength);
            }
        }
    }

//    @Test
    public void testGetDeflattendSets() {
        WebTarget target = webTarget.path("getSets")
                .queryParam("ooid", flattendObject.getId())
                .queryParam("deflatt", true)
                .queryParam("limit", 1);
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetDeflattendSets---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }

        JsonReader jsonReader = Json.createReader(new StringReader(responseText));
        JsonObject rootobj = jsonReader.readObject();
        JsonArray jsonArray = rootobj.getJsonArray("list");

        int i = 1;
        for (JsonValue curValue : jsonArray) {
            JsonObject curObj = (JsonObject) curValue;
            Double curUval = curObj.getJsonNumber("U").doubleValue();
            Double curIval = curObj.getJsonNumber("I").doubleValue();
            Double expUval = (Double) createdData.get(flattendObject.getId()).get(0).get("U" + i);
            Double expIval = (Double) createdData.get(flattendObject.getId()).get(0).get("I" + i);
            System.out.println("Expected for dataset >" + i + "<: u= " + expUval + " is " + curUval);
            System.out.println("Expected for dataset >" + i + "<: i= " + expIval + " is " + curIval);
            assertEquals(expUval, curUval);
            assertEquals(expIval, curIval);
            i++;
        }
    }

//    @Test
    public void testGetSetsRecursive() {
        String mtypes = "ts";
        WebTarget target = webTarget.path("getSets")
                .queryParam("ooid", flattendObject.getId())
                .queryParam("measurementnames", mtypes)
                .queryParam("limit", 2)
                .queryParam("recursive", true);
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetSetsRecursive---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());
    }

//    @Test
    public void testGetSetsWithLimit() {
        WebTarget target = webTarget.path("getSets")
                .queryParam("ooid", notFlattendObject.getId())
                .queryParam("limit", TESTLIMIT / 2);
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetSetsWithLimit---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());

        JSONParser parser = new JSONParser();
        JSONObject parsedSet = null;
        try {
            parsedSet = (JSONObject) parser.parse(responseText);
        } catch (ParseException ex) {
            Logger.getLogger(DataResourcePerformanceTest.class.getName()).log(Level.SEVERE, null, ex);
        }
        List<JSONObject> list = (List<JSONObject>) parsedSet.get("list");
        assertEquals(TESTLIMIT / 2, list.size());
    }

//    @Test
    public void testGetSetWithStartAndEndDate() {
        WebTarget target = webTarget.path("getSets")
                .queryParam("ooid", notFlattendObject.getId())
                .queryParam("starttime", startDateTime.toString())
                .queryParam("endtime", endDateTime.toString());
        Response response = target.request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        if (PRINT_DEBUG_MESSAGES) {
            System.out.println("---testGetSetsWithStartAndEndDate---");
            System.out.println(response.getStatusInfo());
            System.out.println(responseText);
        }
        assertEquals(Response.Status.OK.getStatusCode(), response.getStatus());

        JSONParser parser = new JSONParser();
        JSONObject parsedSet = null;
        try {
            parsedSet = (JSONObject) parser.parse(responseText);
        } catch (ParseException ex) {
            Logger.getLogger(DataResourcePerformanceTest.class.getName()).log(Level.SEVERE, null, ex);
        }
        List<JSONObject> list = (List<JSONObject>) parsedSet.get("list");
        assertEquals(TESTLIMIT, list.size());
    }
}
