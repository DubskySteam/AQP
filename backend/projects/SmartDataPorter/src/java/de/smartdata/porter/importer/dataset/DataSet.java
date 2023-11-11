package de.smartdata.porter.importer.dataset;

import jakarta.json.JsonObject;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * Represents a dataset
 * 
 * @author Florian Fehring
 */
@XmlRootElement
public abstract class DataSet {

    /**
     * Returns a json representation for this dataset, as flat representation.
     * 
     * e.g.
     * {
     * "key1": "value1",
     * "key2": "value2"
     * }
     * 
     * @return JsonObject
     */
    public abstract JsonObject toJson();
}
