package de.smartdata.porter.importer.parser.json.mappingtree;

import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import java.util.ArrayList;
import java.util.LinkedHashMap;

/**
 * Builds a tree structure based on the given JsonArray from the config file.
 * JsonArray contains collection arrays.
 * Each collection array contains JsonObjects with target database column 
 * and a path for the json source file
 *
 * @author Team Jpars
 */
public class MappingTreeBuilder {

    // config keyword: target table in database
    private final String COLLECTION_NAME = "collection";
    // config keyword: contains json structure and ruleset for parsing
    private final String MAPPING_DATA = "mappingdata";
    // config keyword: target column in database table
    private final String OBJECT_COLUMN = "dbcolumn";
    // config keyword: data path for the json source file
    private final String OBJECT_PATH = "path";

    private LinkedHashMap<String, Tree> mappingTreeMap = new LinkedHashMap();

    /**
     * creates a tree structure according to the paths from the config file
     *
     * @param jsonMapping: JsonArray from the config file
     * @return LinkedHashMap< collection name, mapping tree >
     */
    public LinkedHashMap<String, Tree> createTree(JsonArray jsonMapping) {

        if (jsonMapping == null) {
            return null;
        }

        // iterates through all collections in the config array
        for (int collectionIndex = 0; collectionIndex < jsonMapping.size(); collectionIndex++) {

            // loads collection name and mapping data
            JsonObject curCollection = jsonMapping.getJsonObject(collectionIndex);
            String collectionName = curCollection.getJsonString(COLLECTION_NAME).getString();
            JsonArray mappingDataArray = curCollection.getJsonArray(MAPPING_DATA);

            // creates new tree for each collection
            Tree mappingTree = new Tree(null);

            // iterates through all objects in current collection
            for (int index = 0; index < mappingDataArray.size(); index++) {

                JsonObject curMappingObject = mappingDataArray.getJsonObject(index);
                addObject(curMappingObject, mappingTree);

            }

            mappingTreeMap.put(collectionName, mappingTree);

        }

        return mappingTreeMap;
    }

    /**
     * reads mapping object values
     * adds child trees according to the path
     * adds <json key , column > as value to the mapping tree
     *
     * @param mappingObject: current mapping object
     * @param mappingTree: mapping tree for the current collection
     */
    private void addObject(JsonObject mappingObject, Tree mappingTree) {
        String column = mappingObject.getString(OBJECT_COLUMN);
        String pathString = mappingObject.getString(OBJECT_PATH);

        // splitts the path string
        PathSplitter path = new PathSplitter(pathString);

        ArrayList<String> pathList = path.getPathStringList();
        String valueKey = path.getJsonKey();

        Tree child = mappingTree;

        // iterates the tree according to the path
        for (int index = 0; index < pathList.size(); index++) {
            child = child.addChild(pathList.get(index));
        }

        // adds < json key , database column > to the tree value 
        child.addValue(valueKey, column);

    }

}
