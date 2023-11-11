package de.smartdata.porter.importer.parser.json;

import de.smartdata.porter.importer.ImporterException;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import de.smartdata.porter.importer.parser.json.mappingtree.MappingTreeBuilder;
import de.smartdata.porter.importer.parser.json.mappingtree.Tree;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonArrayBuilder;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import jakarta.json.JsonValue;
import java.io.InputStream;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Parser for all JSON files
 * Needs mapping information in the config file to work
 *
 * @author Team Jpars
 */
public class JSONParser extends Parser {

    // config keyword: mapping data from the config file
    private final String CONFIG_MAPPING = "json_mapping";

    // contains the source data from the json file
    private JsonArray jsonDataArray;

    // contains the mapping tree for each collection
    // < collection name , mapping tree >
    private LinkedHashMap<String, Tree> mappingTreeMap;

    // current collection name
    private String curCollection;

    // contains the extracted data from the json file
    private Tree dataTree;

    @Override
    public String getDescription() {
        return "Imports data from a JSON file";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        //TODO implement check if parser is applicable
        return true;
    }

    @Override
    public void preParse() throws ParserException {
        //Nothing todo here
    }

    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        try {

            // creates JSON-Objects and reads stream
            JsonReader reader = Json.createReader(is);
            Object jsonData = reader.read();

            // checks if first element is an array
            if (jsonData instanceof JsonArray) {
                jsonDataArray = (JsonArray) jsonData;
            } else {
                // if JsonObject, converts to JsonArray
                JsonArrayBuilder builder = Json.createArrayBuilder();
                jsonDataArray = builder.add((JsonObject) jsonData).build();
            }

            // loads json mapping from config file
            JsonArray mappingData = this.importer.getConfig().getJsonArray(CONFIG_MAPPING);


            if (jsonDataArray != null || mappingData != null) {
                // creates the mapping tree
                mappingTreeMap = new MappingTreeBuilder().createTree(mappingData);
                startParsing();

            }

        } catch (Exception ex) {
            ParserException pe = new ParserException("Could not add values. Exception: " + ex.getLocalizedMessage());
            ex.printStackTrace();
            pe.addSuppressed(ex);
            throw pe;
        }

        return result;
    }

    /**
     * Starts the parsing process.
     * Applies mapping and
     * parses datasets to the importer.
     * 
     * @throws ImporterException
     */
    private void startParsing() throws ImporterException {

        // iterates through all collections in the mapping tree map
        for (Map.Entry<String, Tree> treeEntry : mappingTreeMap.entrySet()) {
            curCollection = treeEntry.getKey();
            Tree curMappingTree = treeEntry.getValue();

            // iterates through all objects from the json source data
            for (int jsonIndex = 0; jsonIndex < jsonDataArray.size(); jsonIndex++) {

                JsonObject curObject = jsonDataArray.getJsonObject(jsonIndex);

                // creates a new data tree for each object in the json data array
                dataTree = new Tree(null);

                applyMapping(curObject, curMappingTree, dataTree);
                readDataTree(dataTree);

            }
        }
    }
    
    /**
     * recursive iteration through the json source data with the help from mapping tree
     *
     * @param curObject: current object in the json source data structure
     * @param mappingTree: current tree branch in the mapping tree
     * @param dataTree: current tree branch in the data tree
     */
    private void applyMapping(JsonObject curObject, Tree mappingTree, Tree dataTree) {
        // values in the mapping tree < json key , database column (String)>
        LinkedHashMap<String, Object> mappingValues = mappingTree.getValuesMap();
        LinkedHashMap<String, Tree> mappingChildrenMap = mappingTree.getChildrenMap();

        // add data if current mapping tree branch has values
        if (mappingValues != null) {
            writeDataTree(mappingValues, curObject, dataTree);
        }

        // if current tree branch has no children, reached one end of the mapping tree
        if (mappingChildrenMap == null) {
            return;
        }

        // iterates through all children in the current mapping tree branch
        for (Map.Entry<String, Tree> mappingChildrenEntry : mappingChildrenMap.entrySet()) {

            String jsonKey = mappingChildrenEntry.getKey();
            Tree childTree = mappingChildrenEntry.getValue();

            if (!curObject.containsKey(jsonKey)) {
                return;
            }

            Object nextObject = curObject.get(jsonKey);

            // current object is JsonArray
            if (nextObject instanceof JsonArray) {
                JsonArray subArray = (JsonArray) nextObject;
                // iterates through all objects in the array
                for (int arrayIndex = 0; arrayIndex < subArray.size(); arrayIndex++) {
                    // with multiple values adds a child to the data tree for correct data allocation
                    Tree tempTree = dataTree.addChild(String.valueOf(arrayIndex));
                    applyMapping(subArray.getJsonObject(arrayIndex), childTree, tempTree);
                }
                // current object is JsonObject
            } else {
                applyMapping((JsonObject) nextObject, childTree, dataTree);
            }

        }

    }

    /**
     * writes values from jason source data to the data tree
     *
     * @param mappingValues: contains information what must be read < json key , column >
     * @param curObject: current object to read values from
     * @param dataTree: current data tree branch for save the values
     */
    private void writeDataTree(LinkedHashMap<String, Object> mappingValues, JsonObject curObject, Tree dataTree) {
        for (Map.Entry<String, Object> mappingValueEntry : mappingValues.entrySet()) {
            String jsonKey = mappingValueEntry.getKey();
            String column = mappingValueEntry.getValue().toString();

            if (curObject.containsKey(jsonKey)) {

                Object valuesObject = curObject.get(jsonKey);

                if (valuesObject instanceof JsonArray) {
                    JsonArray valuesArray = (JsonArray) valuesObject;
                    for (int arrayIndex = 0; arrayIndex < valuesArray.size(); arrayIndex++) {

                        Tree childTree = dataTree.addChild(String.valueOf(arrayIndex));
                        childTree.addValue(column, valuesArray.get(arrayIndex));
                    }

                } else {
                    dataTree.addValue(column, (JsonValue) valuesObject);
                }

            }
        }
    }

    /**
     * Recursive method to iterate the data tree.
     * Uses the bottom-up approach
     *
     * @param dataTree: data tree to traverse
     * @throws ImporterException
     */
    private void readDataTree(Tree dataTree) throws ImporterException {
        LinkedHashMap<String, Tree> children = dataTree.getChildrenMap();

        // goes to the last chldren in the tree
        if (children != null) {
            // iterates through all children in current tree branch
            for (Map.Entry<String, Tree> childEntry : children.entrySet()) {
                Tree child = childEntry.getValue();
                readDataTree(child);
            }

        } else {
            parseDataTree(dataTree);
        }
    }

    /**
     * iterates from bottom to top of the tree
     * creates datasets
     * parses data to the importer
     *
     * @param dataTreeBottom: last child from the data tree
     * @throws ImporterException
     */
    private void parseDataTree(Tree dataTreeBottom) throws ImporterException {
        
        JsonObjectBuilder jsonObject = Json.createObjectBuilder();
        Tree curTree = dataTreeBottom;
        boolean isDataEmpty = true;

        // goes from bottom to the top of the tree
        do {
            LinkedHashMap<String, Object> values = curTree.getValuesMap();
            if (values != null) {
                isDataEmpty = false;
                // iterates through all values in the current data tree branch
                for (Map.Entry<String, Object> databaseEntry : values.entrySet()) {
                    String column = databaseEntry.getKey();
                    JsonValue data = (JsonValue) databaseEntry.getValue();
                    jsonObject.add(column, data);
                }
            }

            curTree = curTree.getParent();
        } while (curTree != null);

        // check to not try to parse empty datasets
        if (!isDataEmpty) {
            // adds the target collection
            jsonObject.add("import.collection", curCollection);

            this.importer.addDataSet(jsonObject.build());
            result.datasetsParsed++;
        }

    }

}
