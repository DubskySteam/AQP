package de.smartdata.porter.importer.parser.json;

import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import java.io.InputStream;

/**
 *
 * @author Team JPars
 */
public class ConfigSaver extends Parser {

    @Override
    public String getDescription() {
        return "Imports configs";
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
    
    /**
     * Saves a config into the database.
     * 
     * This method looks for the keywords "file_name" and "content" and saves the data into the table "configfiles".
     */
    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        try {
            // Read config for "file_name"
            String fileName = this.importer.getConfig().getString("file_name");
            
            // Create JSON-Objects and read stream, stream contains "content"
            JsonReader reader = Json.createReader(is);
            String content = reader.readObject().toString();
            JsonObject jsonSet = createDataset(fileName, content);

            this.importer.addDataSet(jsonSet);
            result.datasetsAvailable = 1;
            result.datasetsParsed = 1;
            
            return result;
        } catch (Exception ex) {
            ParserException pe = new ParserException("Could not add values " + ex.getLocalizedMessage());
            pe.addSuppressed(ex);
            throw pe;
        }
    }
    
    private JsonObject createDataset(String fileName, String content) {
        // Create dataset
        JsonObjectBuilder dataset = Json.createObjectBuilder();
        dataset.add("file_name", fileName);
        dataset.add("content", content);

        dataset.add("import.collection", "configfiles");
        
        return dataset.build();
    }
    
}
