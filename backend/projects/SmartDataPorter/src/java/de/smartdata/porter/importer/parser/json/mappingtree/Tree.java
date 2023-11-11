package de.smartdata.porter.importer.parser.json.mappingtree;

import java.util.LinkedHashMap;

/**
 * Tree structure used for mapping data and for saving data from json source
 * file
 *
 * @author Team Jpars
 */
public class Tree {

    private Tree parent;

    /**
     * LinkedHashMap for keeping the input order.
     * mapping tree : < json key        , database column (String)>
     * data tree    : < database column , json data (JsonValue)>
     */
    private LinkedHashMap<String, Object> valuesMap;
    // children     : < json key, child tree >
    private LinkedHashMap<String, Tree> childrenMap;

    public Tree(Tree parent) {
        this.parent = parent;
    }

    public Tree getParent() {
        return parent;
    }

    public LinkedHashMap<String, Object> getValuesMap() {
        return valuesMap;
    }

    public LinkedHashMap<String, Tree> getChildrenMap() {
        return childrenMap;
    }

    /**
     * adds new value
     * creates new map if first entry
     * 
     * @param key: LinkedHashMap key
     * @param value: LinkedHashMap value
     */
    public void addValue(String key, Object value) {
        if (valuesMap == null) {
            valuesMap = new LinkedHashMap();
        }

        valuesMap.put(key, value);
    }

    /**
     * adds new child
     * creates new child if first entry
     *
     * @param  key LinkedHashMap key
     * @retrun new created child tree
     */
    public Tree addChild(String key) {
        if (childrenMap == null) {
            childrenMap = new LinkedHashMap();
        }

        if (!childrenMap.containsKey(key)) {
            childrenMap.put(key, new Tree(this));
        }

        return childrenMap.get(key);
    }

}
