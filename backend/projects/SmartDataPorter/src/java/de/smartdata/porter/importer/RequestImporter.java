package de.smartdata.porter.importer;

import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.descriptors.SourceDescriptor;
import java.io.ByteArrayInputStream;
import java.util.Base64;
import jakarta.json.JsonObject;

/**
 * Importer for importing files from a base64 encoded http request. The encoded
 * data is then decoded to the original file and stored on the file system.
 * super.runImport() method of FilesImporter will then run
 *
 *
 * @author fwarzecha jrathert
 */
public class RequestImporter extends StreamImporter {

    private final String base64_encoded_file;
    private final String file_name;

    public RequestImporter(JsonObject config, SourceDescriptor sd) throws ImporterException {
        super(config, sd);
        // Get data from configuration
        this.base64_encoded_file = this.config.getString("content", null);
        this.file_name = this.config.getString("file_name", null);

        // Check if each needed data is there
        if (this.base64_encoded_file == null) {
            Message msg = new Message(">content< is missing in the configuration", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
        }
        
        if (this.file_name == null) {
            Message msg = new Message(">file_name< is missing in the configuration", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
        }
    }

    @Override
    public void run() {
        if (this.base64_encoded_file == null || this.file_name == null) {
            return;
        }
        // Fetching document from http server
        try {
            this.result.filesAvailable++;
            this.sourceDescriptor.setName(this.file_name);
            this.sourceDescriptor.setPath("TODO"); 
            //this.sourceDescriptor.setCreateDateTime(LocalDateTime.ofEpochSecond(connection.getDate(), 0, ZoneOffset.UTC));
            //this.sourceDescriptor.setModifyDateTime(LocalDateTime.ofEpochSecond(connection.getLastModified(), 0, ZoneOffset.UTC));
            
            byte[] decodedString = Base64.getDecoder().decode(this.base64_encoded_file);
            super.importStream(new ByteArrayInputStream(decodedString));
            this.result.filesImported++;
        } catch (ImporterException ex) {
            Message msg = new Message("Could not import from content >" + this.base64_encoded_file + "< ImporterException: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            this.result.addMessage(msg);
            ex.printStackTrace();
        }
    }
}
