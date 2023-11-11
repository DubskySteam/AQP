package de.smartdata.porter.importer;

import de.bytefish.pgbulkinsert.PgBulkInsert;
import de.bytefish.pgbulkinsert.util.PostgreSqlUtils;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import de.smartdata.porter.importer.dataset.DataSet;
import de.smartdata.porter.importer.descriptors.DataSetMapping;
import de.smartdata.porter.importer.descriptors.SourceDescriptor;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonValue;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.Json;
import jakarta.json.JsonArrayBuilder;
import jakarta.ws.rs.ProcessingException;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
import java.sql.Connection;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map.Entry;
import java.util.regex.Pattern;

/**
 * Class for reciving values, order them to the requesting devices and writing
 * the data into database.
 *
 * @author ffehring
 */
public abstract class Importer implements Runnable {

    protected JsonObject config;
    protected SourceDescriptor sourceDescriptor;
    protected String collection;
    protected String storage;
    protected DataSetMapping datasetmapping;
    protected final Collection<DataSet> datasetsbulk = new ArrayList<>();
    protected final List<JsonObject> datasets = new ArrayList<>();
    protected final ImporterResult result = new ImporterResult();
    protected long startTime = 0L;

    public Importer(JsonObject config) throws ImporterException {
        this.startTime = System.currentTimeMillis();
        this.config = config;
        collection = this.config.getString("collection", null);
        storage = this.config.getString("storage", null);
        this.result.setImporter(this);
        this.result.setTarget(storage + "/" + collection);
        if (collection == null) {
            Message msg = new Message(">collection< is missing in configuration", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
            this.result.datasetsImported = 0;
        }
        if (storage == null) {
            Message msg = new Message(">storage< is missing in configuration", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
            this.result.datasetsImported = 0;
        }

        if (collection != null && storage != null) {
            datasetmapping = new DataSetMapping<DataSet>(storage, collection);
        }
    }

    /**
     * Returns the configuration of this import
     *
     * @return
     */
    public JsonObject getConfig() {
        return this.config;
    }

    /**
     * Returns the descriptor of the source that should be imported. This usualy
     * contains informations about filename, date, etc.
     *
     * @return SourceDescriptor with source information
     */
    public SourceDescriptor getSourceDescriptor() {
        return sourceDescriptor;
    }

    public void setDatasetMapping(DataSetMapping mapping) {
        this.datasetmapping = mapping;
    }

    /**
     * Returns the datasetmapping of dataset attributes to columns
     *
     * @return
     */
    public DataSetMapping getDatasetMapping() {
        return datasetmapping;
    }

    /**
     * Returns the collections name where the data should be imported to
     *
     * @param sourcename Source of data
     * @return collection name
     */
    public String getDatasourceMapping(String sourcename) {
        // Start count time
//        long st = System.currentTimeMillis();

        JsonArray filemap = this.config.getJsonArray("sourcemapping");
        // If there is no sourcemapping specified
        if (filemap == null) {
            return collection;
        }
        // Search collection for file
        for (JsonValue curMappingJV : filemap) {
            JsonObject curMapping = curMappingJV.asJsonObject();
            String namepattern = curMapping.getString("namepattern", null);
            if (namepattern == null) {
                continue;
            }
            if (Pattern.matches(namepattern, sourcename)) {
                String col = curMapping.getString("collection", null);
                if (col != null) {
                    return col;
                }
            }
        }
//        // Stop count time
//        long et = System.currentTimeMillis();
//        long elapsedTime = et - st;
//        System.out.println("needet time: " + (elapsedTime/1000));

        return this.collection;
    }

    /**
     * Add Collection of DataSets Use JSON based datasets instead
     *
     * @param datasts Collection of datasets
     * @throws ImporterException
     * @deprecated
     */
    @Deprecated
    public void addDataSets(Collection<DataSet> datasts) throws ImporterException {
        this.datasetsbulk.addAll(datasts);
    }

    /**
     * Imports an single dataset. If there is an open import process, this will
     * import useing that open process. If there is no open import process, it
     * will create an process for this one dataset only.
     *
     * @param dataset Dataset to save
     * @throws ImporterException
     */
    public void addDataSet(JsonObject dataset) throws ImporterException {
        this.datasets.add(dataset);
        //Check maximum hold and than send data if exceded
        if (this.datasets.size() >= 100) {
            this.saveDatasets();
        }
    }

    /**
     * Imports an list of datasets. If there is an open import process, this
     * will import useing that open process. If there is no open import process,
     * it will create an process for all of the given datasets.
     *
     * @param datasets
     * @throws ImporterException
     */
    public void addDataSets(List<JsonObject> datasets) throws ImporterException {
        for (JsonObject curSet : datasets) {
            this.addDataSet(curSet);
        }
    }

    /**
     * Adds an datatable in form of a list (table) of maps (dataset) with
     * strings (columnnames) and objects (values)
     *
     * @param datatable Table of data to add
     * @throws ImporterException
     */
    public void addDataTable(List<Map<String, Object>> datatable) throws ImporterException {
        if (datatable.isEmpty()) {
            return;
        }
        for (Map<String, Object> curDatamap : datatable) {
            //TODO implement
            //this.addDataSet(dataset);
        }

    }

    /**
     * Saves the datasts useing the bulk mechanism Directly inserts data into
     * the database useing performant COPY-Statement
     *
     * @return
     * @throws ImporterException
     */
    protected ImporterResult saveDatasetsBulk() throws ImporterException {
        String jndi = this.config.getString("jndi", null);

        try {
            InitialContext ctx = new InitialContext();
            DataSource ds = (DataSource) ctx.lookup(jndi);
            Connection con = ds.getConnection();
            // Create the BulkInserter
            PgBulkInsert<DataSet> bulkInsert = new PgBulkInsert<>(datasetmapping);

            // Now save all entities of a given stream:
            bulkInsert.saveAll(PostgreSqlUtils.getPGConnection(con), datasetsbulk);
            con.commit();
            con.close();
            this.result.datasetsImported += datasetsbulk.size();
        } catch (NamingException ex) {
            Message msg = new Message("", MessageLevel.ERROR, "Could not access connection pool: " + ex.getLocalizedMessage());
            Logger.addMessage(msg);
            ImporterException dex = new ImporterException("Could not access connection pool: " + ex.getLocalizedMessage());
            dex.addSuppressed(ex);
            throw dex;
        } catch (SQLException ex) {
            Message msg = new Message("", MessageLevel.ERROR, "Could not conntect to database: " + ex.getLocalizedMessage());
            Logger.addMessage(msg);
            ImporterException dex = new ImporterException("Could not conntect to database: " + ex.getLocalizedMessage());
            dex.addSuppressed(ex);
            throw dex;
        }
        return this.result;
    }

    /**
     * Saves the imported values to database useing a SmartData instance.
     *
     * @return ResultObject for importing with added information about save
     * status
     * @throws de.smartdata.porter.importer.ImporterException
     */
    protected ImporterResult saveDatasetsSmartData() throws ImporterException {
        String serverpath = this.config.getString("server", "http://127.0.0.1:8080/");
        String smartdata = this.config.getString("smartdata", "SmartData");
        boolean transformgeo = this.config.getBoolean("geo.transform", false);
        String latattr = this.config.getString("geo.latAttr", "lat");
        String lonattr = this.config.getString("geo.lonAttr", "lon");
        String srid = this.config.getString("geo.srid", "4326");
        String dbattr = this.config.getString("geo.dbattr", "geom");

        // extract default values
        JsonObject defaultValueConfig = this.config.getJsonObject("defaults");
        Map<String, JsonValue> defaultValues = new HashMap<>();
        if (defaultValueConfig != null) {
            boolean defaultValuesEnabled = defaultValueConfig.getBoolean("enabled", false);
            if (defaultValuesEnabled) {
                for (JsonObject valueConfig : defaultValueConfig.getJsonArray("values").getValuesAs(JsonObject.class)) {
                    defaultValues.put(valueConfig.getString("column"), valueConfig.get("value"));
                }
            }
        }

        // Build map for datasets of different tables
        Map<String, JsonArrayBuilder> importMap = new HashMap<>();

        String col = this.collection;
        // Check for sourcemapping if source is defined
        if (this.sourceDescriptor != null) {
            col = this.getDatasourceMapping(this.sourceDescriptor.getName());
        }

        importMap.put(col, Json.createArrayBuilder());
        int i = -1;
        for (JsonObject curSet : this.datasets) {
            i++;

            // Add default values for missing columns
            for (Entry<String, JsonValue> providedDefault : defaultValues.entrySet()) {
                if (!curSet.containsKey(providedDefault.getKey())) {
                    JsonObjectBuilder newSet = Json.createObjectBuilder(curSet);
                    newSet.add(providedDefault.getKey(), providedDefault.getValue());
                    curSet = newSet.build();
                }
            }

            //Detect empty datasets
            if (curSet.entrySet().isEmpty()) {
                Message msg = new Message("Dataset " + i + " is empty.", MessageLevel.WARNING);
                this.result.addMessage(msg);
                continue;
            }
            // Transform geo point information
            if (transformgeo && curSet.containsKey(latattr) && curSet.containsKey(lonattr)) {
                JsonObjectBuilder newSet = Json.createObjectBuilder(curSet);
                newSet.add(dbattr, Json.createValue("SRID=" + srid + ";POINT(" + curSet.getJsonNumber(latattr) + " " + curSet.getJsonNumber(lonattr) + ")"));
                curSet = newSet.build();
            }

            // Sort into list of table
            String targetCollection = curSet.getString("import.collection", null);
            if (targetCollection != null) {
                // Create JsonArrayBuilder if not exists
                if (!importMap.containsKey(targetCollection)) {
                    importMap.put(targetCollection, Json.createArrayBuilder());
                }
                JsonObjectBuilder newSet = Json.createObjectBuilder(curSet);
                newSet.remove("import.collection");
                importMap.get(targetCollection).add(newSet.build());
            } else {
                importMap.get(col).add(curSet);
            }
        }

        // Start count time
        long st = System.currentTimeMillis();

        WebTarget baseTarget = WebTargetCreator.createWebTarget(serverpath, smartdata + "/smartdata/records");
        this.result.smartdataErrors = 0;
        for (Entry<String, JsonArrayBuilder> curImportArray : importMap.entrySet()) {
            // Check if collection is given
            if (curImportArray.getKey() == null) {
                Message msg = new Message("Missing collection name in config", MessageLevel.ERROR);
                this.result.datasetsNotImported += this.datasets.size();
                this.datasets.clear();
                this.result.addMessage(msg);
                return result;
            }

            // Build array and send to SmartData
            JsonArray dataarray = curImportArray.getValue().build();
            if (dataarray.isEmpty() && !curImportArray.getKey().startsWith("meta_")) {
                Message msg = new Message("There is no data to save for >" + curImportArray.getKey() + "<", MessageLevel.WARNING);
                this.result.addMessage(msg);
                continue;
            }
            Entity<String> dataset = Entity.json(dataarray.toString());

            WebTarget target = baseTarget.path(curImportArray.getKey());
            if (storage != null) {
                target = target.queryParam("storage", storage);
            }
            try (Response response = target.request(MediaType.APPLICATION_JSON).post(dataset)) {
                String responseText = response.readEntity(String.class);
                if (Response.Status.CREATED.getStatusCode() != response.getStatus()) {
                    Message msg = new Message("Could not import data. SmartData >" + target.getUri() + "< returend with: " + response.getStatusInfo() + " " + responseText, MessageLevel.USER_ERROR);
                    this.result.addMessage(msg);
                    this.result.smartdataErrors++;
                    this.result.datasetsNotImported += this.datasets.size();
                    this.datasets.clear();
                    return this.result;
                }
                this.result.datasetsImported += dataarray.size();
            } catch (ProcessingException ex) {
                Message msg = new Message("Could not send data to >" + target.getUri().toString() + "<: " + ex.getLocalizedMessage(), MessageLevel.USER_ERROR);
                this.result.addMessage(msg);
                this.result.smartdataErrors++;
                this.result.datasetsNotImported += this.datasets.size();
                this.datasets.clear();
                return this.result;
            }
        }
        // Stop count time
        long et = System.currentTimeMillis();
        long elapsedTime = et - st;
        Message timeMsg = new Message("Send to SmartData took " + elapsedTime + "ms.", MessageLevel.INFO);
        Logger.addDebugMessage(timeMsg);

        //TODO rollback even before send data if an error occures in the later chunks
        //TODO count sended chunks
        this.datasets.clear();
        return result;
    }

    /**
     * Saves the datasets into database. Chooses the save strategy (SmartData or
     * bulk) depending on the options
     *
     * @return
     * @throws ImporterException
     */
    protected ImporterResult saveDatasets() throws ImporterException {
        String jndi = this.config.getString("jndi", null);
        if (jndi != null) {
            return this.saveDatasetsBulk();
        } else {
            // Convert bulk datasets into json datasets
            if (this.datasets.isEmpty() && !this.datasetsbulk.isEmpty()) {
                Message msg = new Message("Transform bulk datasets to json", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                for (DataSet curSet : this.datasetsbulk) {
                    this.datasets.add(curSet.toJson());
                }
            }

            return this.saveDatasetsSmartData();
        }
    }

    public ImporterResult getResult() {
        long stopTime = System.currentTimeMillis();
        result.timeUsed = (stopTime - startTime) / 1000;
        return result;
    }
}
