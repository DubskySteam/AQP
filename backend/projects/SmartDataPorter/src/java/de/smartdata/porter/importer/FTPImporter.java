package de.smartdata.porter.importer;

import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.descriptors.SourceDescriptor;
import java.io.File;
import java.io.IOException;
import jakarta.json.JsonObject;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;

/**
 * Importer for importing files that are stored on a FTP server. Downloads the
 * FTP files to the working directory and than delivers them to the
 * super.runImport() method of FilesImporter.
 *
 * Expectations to the configuration file: ftp_host = Hostname of the ftp server
 * ftp_user = Username for accessing the ftp server ftp_pwd = Password for
 * accessing the ftp server ftp_dir = Directory on the ftp server, where to find
 * the files
 *
 * @author ffehring
 */
public class FTPImporter extends FilesImporter {
    private final String ftp_host;
    private final String ftp_user;
    private final String ftp_pwd;
    private final String ftp_dir;
    
    public FTPImporter(JsonObject config, SourceDescriptor sd) throws ImporterException {
        super(config, sd);
        // Get data from configuration
        ftp_host = this.config.getString("ftp_host",null);
        ftp_user = this.config.getString("ftp_user",null);
        ftp_pwd = this.config.getString("ftp_pwd",null);
        ftp_dir = this.config.getString("ftp_dir",null);

        // Check if each needed data is there
        if (ftp_host == null) {
            Message msg = new Message(">ftp_host< is missing in the configuration", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
        }
        if (ftp_user == null) {
            Message msg = new Message(">ftp_user< is missing in the configuration", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
        }
        if (ftp_pwd == null) {
            Message msg = new Message(">ftp_pwd< is missing in the configuration", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
        }
        if (ftp_dir == null) {
            Message msg = new Message(">ftp_dir< is missing in the configuration", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
        }
    }

    /**
     * Imports files over FTP connection as configured in the import configuration
     * 
     */
    @Override
    public void run() {
        // Check if something is missing
        if(ftp_host == null || ftp_user == null || ftp_pwd == null || ftp_dir == null) {
            return;
        }
        
        try {
            // Aufruf des FTP Servers und Download noch nicht bekannter Daten
            FTPClient client = new FTPClient();
            client.connect(ftp_host);
            client.login(ftp_user, ftp_pwd);
            FTPFile[] files = client.listFiles(ftp_dir);
            File archivedDirectory = new File(source_dir);
            boolean archived;
            for (FTPFile file : files) {
                if (file.getName().contains(".zip")) {
                    archived = false;
                    for (File cur_file : archivedDirectory.listFiles()) {
                        if (cur_file.getName().equals(file.getName())) {
                            archived = true;
                        }
                    }
                    if (archived == false) {
//                        FileLoader(filcurImportConfig.getEntry("import.importer")e.getName().substring(0, file.getName().length() - 4), working_dir);
                    }
                }
            }
            //TODO save files in working_dir
            // Run FilesImporter with downloaded files
            super.run();
        } catch (IOException ex) {
            Message msg = new Message("Could not import from FTP >" + ftp_host + "<: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            this.result.addMessage(msg);
        }
    }
}
