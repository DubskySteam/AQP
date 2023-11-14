package de.smartdata.porter.importer.parser.json.mappingtree;

import java.util.ArrayList;

/**
 * on create separates the path string for the json value in substrings
 * represents the json path in an ArrayList<String>
 * adds key for the json value
 * 
 * @author Team Jpars
 */
public class PathSplitter {

    private String jsonKey;
    private ArrayList<String> pathStringList;

    /**
     * constructor needs a pathString in following format
     * example root: /name
     * example subobject person: /person/name
     * 
     * @param pathString: path as String seperated by "/"
     */
    public PathSplitter(String pathString) {
        if (pathString != null) {
            pathStringList = new ArrayList();
            buildPath(pathString);
        }
    }

    /**
     * separates strings between forward slashes "/"
     * puts separted string in pathStringList
     * adds key
     * 
     * @param pathString: path as String seperated by "/"
     */
    private void buildPath(String pathString) {

        String objectName = null;

        // separate strings between forward slashes "/"
        for (int index = 0; index < pathString.length(); index++) {
            char character = pathString.charAt(index);
            if (character == '/') {
                if (objectName != null) {
                    pathStringList.add(objectName);
                }
                objectName = "";
            } else {
                objectName += character;
            }
        }

        // last path string is json key
        jsonKey = objectName;
    }

    public String getJsonKey() {
        return jsonKey;
    }

    public ArrayList getPathStringList() {
        return pathStringList;
    }

}
