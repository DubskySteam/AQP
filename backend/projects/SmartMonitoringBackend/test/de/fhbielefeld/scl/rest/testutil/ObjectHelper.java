package de.fhbielefeld.scl.rest.testutil;

import de.fhbielefeld.reflection.attributes.AttributeReflection;
import de.fhbielefeld.scl.database.model.TblObject;
import de.fhbielefeld.smartmonitoring.jpa.TblMeasurementType;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectType;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObject;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectMetadata;
import de.fhbielefeld.smartmonitoring.jpa.TblObservedObjectMetadataType;
import de.fhbielefeld.smartmonitoring.jpa.TblOoTypeJoinOoMetadataType;
import de.fhbielefeld.smartmonitoring.jpa.TblOoTypeJoinMType;
import de.fhbielefeld.scl.database.model.jpa.TblTagType;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.rest.converters.ObjectConverter;
import de.fhbielefeld.scl.rest.exceptions.ObjectConvertException;
import de.fhbielefeld.scl.rest.proxy.jpa.JPAClassAnalyzer;
import de.fhbielefeld.scl.rest.register.InterfaceRegister;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import java.io.StringReader;
import java.lang.reflect.Field;
import java.util.List;
import java.util.ArrayList;
import java.net.MalformedURLException;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.URL;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Random;
import java.util.Set;
import javax.json.Json;
import javax.json.JsonNumber;
import javax.json.JsonObject;
import javax.json.JsonReader;
import javax.persistence.Id;
import javax.ws.rs.client.Client;
import javax.ws.rs.client.Entity;
import javax.ws.rs.client.WebTarget;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import static org.junit.Assert.assertNotNull;
import static org.junit.Assert.fail;

/**
 * Helper for testing. Generic methods to create, update, get, list and delete
 * TblObjects. Create Template TblObjects with all dependencies.
 *
 * @author ssteinmeyer
 */
public class ObjectHelper {

    private HashMap<Class, WebTarget> webTargetMap = new HashMap<>();

    private String BASE_URI = "http://localhost:8080/SmartMonitoringBackend/";

    private List<TblObject> tblObjects;
    private WebTarget lastTarget;
    private Response lastResponse;
    private String lastResponseText;

    /**
     * The name for all automatic created TblObjects.
     */
    private final String name;

    /**
     * The description for all automatic created TblObjects.
     */
    private final String description;

    public ObjectHelper() {
        tblObjects = new ArrayList<>();
        name = "ObjectHelper";
        description = "A test Object by ObjectHelper";

        try {
            // Activate logger
            Logger.getInstance("ObjectHelper", "SmartMonitoringBackendJUnit");
        } catch (LoggerException ex) {
            System.out.println("Could not start logger.");
        }
        
        try {
            URL url = new URL(BASE_URI);
            URI uri = new URI(url.getProtocol(), url.getUserInfo(), url.getHost(), url.getPort(), url.getPath(), url.getQuery(), url.getRef());
            InterfaceRegister.buildUp();
            for (Entry<Class, Set<String>> curEntry : InterfaceRegister.getJpaInterfacePath().entrySet()) {
                // Get path from class
                Client client = javax.ws.rs.client.ClientBuilder.newClient();
                for (String curPath : curEntry.getValue()) {
                    webTargetMap.put(
                            curEntry.getKey(),
                            client.target(uri.toASCIIString()).path(curPath));
                }
            }
        } catch (MalformedURLException | URISyntaxException ex) {
            
        }
    }

    /**
     * Returns the automatic generated list of all available webtargets
     *
     * @return List with webtargets
     */
    public HashMap<Class, WebTarget> getWebTargets() {
        return this.webTargetMap;
    }

    /**
     * Returns the Status Code of the last aktion the helper has done.
     *
     * @return the WebStatus Code
     */
    public int getStatus() {
        return this.lastResponse.getStatus();
    }

    public String getLastResponseText() {
        return this.lastResponseText;
    }

    /**
     * Print the information of the last Response.
     */
    public void printLastResponseInfo() {
        System.out.println(lastTarget.getUri());
        System.out.println("response status: " + this.lastResponse.getStatus());
        System.out.println("message body: " + this.lastResponseText);
    }

    /**
     * Create a TblObject.
     *
     * @param <T> an object that implements the TblObject interface
     * @param obj TblObject
     * @return the given TblObject with it's id in the database
     */
    public <T extends TblObject> T createTblObject(T obj) {
        try {
            WebTarget targetForClass = this.lastTarget = this.webTargetMap.get(obj.getClass());
            if (targetForClass == null) {
                System.out.println("There is no webTarget for >" + obj.getClass().getSimpleName() + "<");
//            throw new ObjectHelperException("There is no webTarget for >" + obj.getClass().getSimpleName() + "<");
                return null;
            }

            String jsonObj = ObjectConverter.objectToJson(obj);
            System.out.println("ObjectHelper send:");
            System.out.println(jsonObj);
            Entity<String> dataSet = Entity.json(jsonObj);

            WebTarget createTarget = targetForClass.path("create");
            this.lastResponse = createTarget.request(MediaType.APPLICATION_JSON).post(dataSet);
            this.lastResponseText = this.lastResponse.readEntity(String.class);
            System.out.println("ObjectHelper recived: " + this.lastResponseText + " from " + this.lastTarget.getUri());
            if (this.lastResponseText.contains("<h1>HTTP Status 404 - Not Found</h1>")) {
                System.out.println((char) 27 + "[33m Mach das Backend an! ;)" + (char) 27 + "[30m");
            }
            JsonReader reader = Json.createReader(new StringReader(this.lastResponseText));
            JsonObject responseObj = reader.readObject();
            reader.close();
            
            if (responseObj != null) {
                // Check if object was created
                JsonNumber created_number = responseObj.getJsonNumber("id");
                if(created_number != null) {
                    Long id = created_number.longValue();
                    obj.setId(id);
                    this.tblObjects.add(obj);
                }
                
                // Check if there is an existing id delivered
                JsonNumber existing_number = responseObj.getJsonNumber("existing_id");
                if (existing_number != null) {
                    Long existing_id = responseObj.getJsonNumber("existing_id").longValue();
                    WebTarget getTarget = targetForClass.path("get");
                    getTarget = getTarget.queryParam("id", existing_id);
                    this.lastResponse = getTarget.request(MediaType.APPLICATION_JSON).get();
                    this.lastResponseText = this.lastResponse.readEntity(String.class);
                    obj.setId(existing_id);
                    System.out.println("Use id >" + existing_id + "< from existing object");
                }
            } else {
                System.err.println("Did not recived id from create.");
                return null;
            }            
            return obj;
        } catch (ObjectConvertException ex) {
            System.err.println("Could not send object because could not convert it to json: "
                    + ex.getLocalizedMessage());
        }
        return null;
    }

    /**
     * Delete a TblObject and all dependencies, which were created by
     * ObjectHelper.
     *
     * @param obj the TblObject which schould be create
     */
    public void deleteTblObject(TblObject obj) {
        int deleteIndex = -1;
        for (int i = 0; i < this.tblObjects.size(); i++) {
            if (obj.getId().equals(this.tblObjects.get(i).getId())
                    && obj.getClass().getSimpleName().equals(this.tblObjects.get(i).getClass().getSimpleName())) {
                deleteIndex = i;
            }
        }
        if (deleteIndex > -1) {
            for (int i = this.tblObjects.size() - 1; i >= deleteIndex; i--) {
                this.delete(this.tblObjects.get(i));
                this.tblObjects.remove(i);
            }
        }
    }

    /**
     * Delete a TblObject.
     *
     * @param obj the TblObject to delete
     */
    public <T extends TblObject> void delete(T obj) {
        this.lastTarget = this.webTargetMap.get(obj.getClass()).path("delete");
        this.lastTarget = this.lastTarget.queryParam("id", obj.getId());
        this.lastResponse = this.lastTarget.request(MediaType.APPLICATION_JSON).delete();
        this.lastResponseText = this.lastResponse.readEntity(String.class);
    }

    /**
     * Update a TblObject.
     *
     * @param obj the TblObject to update
     */
    public <T extends TblObject> void updateTblObject(T obj) {
        this.lastTarget = this.webTargetMap.get(obj.getClass()).path("update");
        this.lastResponse = this.lastTarget.request(MediaType.APPLICATION_JSON).put(Entity.json(obj));
        this.lastResponseText = this.lastResponse.readEntity(String.class);
    }

    /**
     * List all TblObject of a specific type.
     *
     * @param tblObjectClass name of the TblClass
     */
    public void list(Class tblObjectClass) {
        this.lastTarget = this.webTargetMap.get(tblObjectClass).path("list");
        this.lastResponse = this.lastTarget.request(MediaType.APPLICATION_JSON).get();
        this.lastResponseText = this.lastResponse.readEntity(String.class);
    }

    /**
     * Get a TblObject.
     *
     * @param obj the TblObject, it must contain the id
     */
    public void getTblObject(TblObject obj) {
        this.lastTarget = this.webTargetMap.get(obj.getClass()).path("get");
        this.lastTarget = this.lastTarget.queryParam("id", obj.getId());
        this.lastResponse = this.lastTarget.request(MediaType.APPLICATION_JSON).get();
        this.lastResponseText = this.lastResponse.readEntity(String.class);
    }

    /**
     * Generates an object of the given class with random values on each field.
     * Works recursively so that if there is a reference field to another
     * <T extends TblObject> field such field is generated too.
     *
     * @param <T> Subtype of TblObject
     * @param classt Class of the object to generate
     * @param caller Object calling the method for detection of bidirectional
     * references
     * @return Generated object with random data of type T
     */
    public <T extends TblObject> T generateTblObject(Class<T> classt, String callerpath) throws ObjectHelperException {
        if (callerpath != null && callerpath.contains(classt.getSimpleName() + "/")) {
            System.out.println("callerpath >" + callerpath + "< contains >" + classt.getSimpleName() + "<");
            return null;
        } else if (callerpath == null) {
            callerpath = "";
        }
        callerpath += classt.getSimpleName() + "/";
        System.out.println("callerpath is now: " + callerpath);
        try {
            T obj = classt.newInstance();
            for (Field curField : JPAClassAnalyzer.getRequiredFieldsMap(obj.getClass()).values()) {
                Class fieldtype = curField.getType();
                Object randomValue = this.getRandomValueForType(fieldtype, callerpath);
                curField.setAccessible(true);
                curField.set(obj, randomValue);
                curField.setAccessible(false);
            }
            // Persist generated object
            obj = this.createTblObject(obj);
            return obj;
        } catch (InstantiationException | IllegalAccessException ex) {
            ObjectHelperException ohe = new ObjectHelperException(
                    "Could not automatically generate >" + classt.getSimpleName()
                    + "< : " + ex.getLocalizedMessage());
            ohe.addSuppressed(ex);
            throw ohe;
        }
    }

    /**
     * Changes a number of attributes
     *
     * @param <T> Type extending TblObject
     * @param object Object where to change
     * @param count Number of attributes to change
     * @return Map with all name value pairs of all changed attributes
     * @throws ObjectHelperException
     */
    public <T extends TblObject> Map<String, Object> changeTblObject(T object, int count) throws ObjectHelperException {
        Map<String, Object> changeMap = new HashMap<>();
        try {
            int done = 0;
            for (Field curField : AttributeReflection.getAllFields(object.getClass())) {
                // Skip serialUID field
                if (curField.getName().endsWith("serialVersionUID")) {
                    continue;
                }
                // Skip id field
                if (curField.isAnnotationPresent(Id.class)) {
                    continue;
                }
                curField.setAccessible(true);
                // Skip fields with value
                if (curField.get(object) == null) {
                    curField.setAccessible(false);
                    continue;
                }

                Object randomValue = this.getRandomValueForType(curField.getType(), null);
                curField.set(object, randomValue);
                changeMap.put(curField.getName(), randomValue);
                curField.setAccessible(false);
                done++;
                if (done > count) {
                    break;
                }
            }
        } catch (IllegalArgumentException | IllegalAccessException ex) {
            ObjectHelperException ohe = new ObjectHelperException("Could not get or change field. " + ex.getLocalizedMessage());
            ohe.addSuppressed(ex);
            throw ohe;
        }
        return changeMap;
    }

    /**
     * Fills all available attributes of the given object with random values.
     * Does not fill fields annotated with @Id
     *
     * @param <T> Type extending TblObject
     * @param object The object to fill
     * @return Map with name value pairs of all filled attributes
     */
    public <T extends TblObject> Map<String, Object> fillTblObject(T object) throws ObjectHelperException {
        Map<String, Object> fillMap = new HashMap<>();
        try {
            for (Field curField : AttributeReflection.getAllFields(object.getClass())) {
                // Skip id field
                if (curField.isAnnotationPresent(Id.class)) {
                    continue;
                }
                curField.setAccessible(true);
                // Skip fields with value
                if (curField.get(object) != null) {
                    curField.setAccessible(false);
                    continue;
                }

                Object randomValue = this.getRandomValueForType(curField.getType(), null);
                curField.set(object, randomValue);
                fillMap.put(curField.getName(), randomValue);
                curField.setAccessible(false);
            }
        } catch (IllegalArgumentException | IllegalAccessException ex) {
            ObjectHelperException ohe = new ObjectHelperException("Could not get or change field. " + ex.getLocalizedMessage());
            ohe.addSuppressed(ex);
            throw ohe;
        }
        return fillMap;
    }

    /**
     * Generates a random value for the given type. In case the type is
     * extending TblObject it creates new subobjects recursivly until a loop is
     * detected.
     *
     * @param type Type of the random value to generate
     * @param callerpath Path of the calling objects
     * @return Random object
     * @throws ObjectHelperException
     */
    public Object getRandomValueForType(Class type, String callerpath) throws ObjectHelperException {
        // Fill with random content
        Random rand = new Random();
        if (type == Integer.class) {
            return rand.nextInt(255);
        } else if (type == Long.class) {
            return rand.nextLong();
        } else if (type == Float.class) {
            return rand.nextFloat();
        } else if (type == Double.class) {
            return rand.nextDouble();
        } else if (type == Boolean.class) {
            return rand.nextBoolean();
        } else if (type == String.class) {
            return "gen by ObjectHelper " + ObjectHelper.getRandomChars();
        } else if (TblObject.class.isAssignableFrom(type)) {
            // Create subobj
            Object obj = this.generateTblObject(type, callerpath);
            return obj;
        } else if (type == LocalDateTime.class) {
            LocalDateTime start = LocalDateTime.of(1500, Month.JANUARY, 1, 1, 1);
            long seconds = ChronoUnit.DAYS.between(start, LocalDateTime.now());
            long randomnum = new Random().nextInt((int) seconds + 1);
            return start.plusDays(randomnum);
        }
        System.out.println("Could not create random value for >" + type.getSimpleName() + "<");
        return null;
    }

    /**
     * Create a TblObservedObject with all dependencies.
     *
     * @return a TblObservedObject
     */
    public TblObservedObject createObservedObject() {
        TblObservedObject newOo = new TblObservedObject();
        newOo.setName(this.name + "oo");
        newOo.setDescription(this.description);
        newOo.setType(this.createObservedObjectType());
        List<TblObservedObjectMetadata> configs = new ArrayList<>();
        configs.add(createTblObservedObjectMetadata());
        newOo.setMetadatas(configs);
        return this.createTblObject(newOo);
    }

    /**
     * Create a simple, empty TblObservedObjectType.
     *
     * @return a TblObservedObjectType
     */
    public TblObservedObjectType createEmptyObservedObjectType() {
        TblObservedObjectType newOoType = new TblObservedObjectType();
        Random ran = new Random();
        newOoType.setName(this.name + "emptyootype" + ran.nextDouble());
        newOoType.setDescription(this.description);
        return this.createTblObject(newOoType);
    }

    /**
     * Create a TblObservedObjectMetadata with all dependencies.
     *
     * @return a TblObservedObjectMetadata
     */
    public TblObservedObjectMetadata createTblObservedObjectMetadata() {
        TblObservedObjectMetadata config = new TblObservedObjectMetadata();
        config.setType(createTblObservedObjectMetadataType());
        config.setVal("TestConf");
        return this.createTblObject(config);
    }

    /**
     * Create a TblObservedObjectMetadataType.
     *
     * @return a TblObservedObjectMetadataType
     */
    public TblObservedObjectMetadataType createTblObservedObjectMetadataType() {
        TblObservedObjectMetadataType confType = new TblObservedObjectMetadataType();
        confType.setName(this.name + "metadatatype");
        confType.setDescription(this.description);
        return this.createTblObject(confType);
    }

    public TblOoTypeJoinOoMetadataType createEmptyTblOoTypeJoinOoMetadataType() {
        TblOoTypeJoinOoMetadataType ooJoinConf = new TblOoTypeJoinOoMetadataType();
        ooJoinConf.setName(this.name + "ootypejoinmetadatatype");
        ooJoinConf.setDescription(description);
        return this.createTblObject(ooJoinConf);
    }

    /**
     * Create a TblObservedObjectType with all dependencies.
     *
     * @return a TblObservedObjectType
     */
    public TblObservedObjectType createObservedObjectType() {
        List<TblOoTypeJoinMType> mTypes = new ArrayList<>();
        mTypes.add(this.createTblOoTypeJoinMType());
        TblObservedObjectType newOoType = new TblObservedObjectType();
        newOoType.setOoTypeJoinMtypes(mTypes);
        Random rand = new Random();
        newOoType.setName(this.name + "ootype" + rand.nextDouble());
        newOoType.setDescription(this.description);
        return this.createTblObject(newOoType);
    }

    /**
     * Create a TblOoTypeJoinMType with all dependencies.
     *
     * @return a TblOoTypeJoinMType
     */
    public TblOoTypeJoinMType createTblOoTypeJoinMType() {
        TblOoTypeJoinMType newOoTypeJoinMType = new TblOoTypeJoinMType();
        newOoTypeJoinMType.setName(this.name + "ootypejoinmtype");
        newOoTypeJoinMType.setDescription(this.description);
        newOoTypeJoinMType.setMeasurementType(this.createTblMeasurementType());
        return this.createTblObject(newOoTypeJoinMType);
    }

    /**
     * Create a TblMeasurementType.
     *
     * @return a TblMeasurementType
     */
    public TblMeasurementType createTblMeasurementType() {
        TblMeasurementType newMType = new TblMeasurementType();
        newMType.setName(this.name + "mtype");
        newMType.setDescription(this.description);
        newMType.setType("float8");
        return this.createTblObject(newMType);
    }

    public TblTagType createFileTag() {
        TblTagType newTag = new TblTagType();
        newTag.setName(this.name + "FileTag");
        newTag.setFileTag(Boolean.TRUE);
        return this.createTblObject(newTag);
    }

    public TblTagType createMediaTag() {
        TblTagType newTag = new TblTagType();
        newTag.setName(this.name + "MediaTag");
        newTag.setMediaTag(Boolean.TRUE);
        return this.createTblObject(newTag);
    }

    /**
     * Delete all TblObjects which were created by ObjectHelper.
     */
    public void deleteAll() {
        for (int i = this.tblObjects.size() - 1; i > -1; i--) {
            this.delete(this.tblObjects.get(i));
            this.tblObjects.remove(i);
        }
        this.tblObjects = new ArrayList<>();
    }

    public static String getRandomChars() {
        StringBuilder sb = new StringBuilder();
        Random r = new Random();

        String alphabet = "0123456789abcdefghijklmnopqrstuvwxyz";
        for (int i = 0; i < 20; i++) {
            sb.append(alphabet.charAt(r.nextInt(alphabet.length())));
        }
        return sb.toString();
    }

    /**
     * Sets the systems configuration value
     *
     * @param key Key of the value to set
     * @param value Value to set
     */
    public void setSystemConfigurationValue(String key, String value) {
        WebTarget systemConfigTarget = WebTargetCreator.createLocalhostWebTarget("zsystemservice");
        WebTarget target = systemConfigTarget.path("configure")
                .queryParam("key", key)
                .queryParam("value", value);
        target.request(MediaType.APPLICATION_JSON).get();
    }

    /**
     * Gets the current value of a configuration
     *
     * @param key Key of the value to get
     * @return Values key
     */
    public String getSystemConfigurationValue(String key) {
        WebTarget systemConfigTarget = WebTargetCreator.createLocalhostWebTarget("zsystemservice");
        Response response = systemConfigTarget.path("configuration")
                .request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);

        JsonReader reader = Json.createReader(new StringReader(responseText));
        JsonObject object = reader.readObject();
        reader.close();
        return object.getString(key);
    }

    public void checkForWarnings(String responseText) {
        JSONParser parser = new JSONParser();
        JSONArray warnings = null;
        try {
            JSONObject parsedSet = (JSONObject) parser.parse(responseText);
            warnings = (JSONArray) parsedSet.get("warnings");
        } catch (ParseException ex) {
            fail("DataSet couldn't be parsed.");
        }
        assertNotNull(warnings);
    }
}
