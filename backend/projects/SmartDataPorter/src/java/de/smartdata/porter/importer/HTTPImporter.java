package de.smartdata.porter.importer;

import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.descriptors.SourceDescriptor;
import java.io.IOException;
import java.io.InputStream;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import jakarta.json.JsonObject;

/**
 * Importer for importing files that are stored on a HTTP server. Downloads the
 * HTTP files to the working directory and than delivers them to the
 * super.runImport() method of FilesImporter.
 *
 * Expectations to the configuration file: http_url = URL of the file to
 * download, may include parameters
 *
 * @author ffehring
 */
public class HTTPImporter extends StreamImporter {

    private final String http_url;

    public HTTPImporter(JsonObject config, SourceDescriptor sd) throws ImporterException {
        super(config, sd);
        // Get data from configuration
        this.http_url = this.config.getString("url", null);

        // Check if each needed data is there
        if (http_url == null) {
            Message msg = new Message(">url< is missing in the configuration", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
        }
    }

    @Override
    public void run() {
        if (http_url == null) {
            return;
        }
        // Fetching document from http server
        URLConnection con = null;
        try {
            URL url = new URL(this.http_url);
            con = url.openConnection();
            try ( InputStream is = con.getInputStream()) {
                // Check if file is compressed
                if (this.http_url.endsWith(".zip") || this.http_url.endsWith(".gz")) {
                    String source_dir = this.config.getString("sourcedir", "source");

                    Message msg = new Message("file under >" + http_url
                            + "< can not be processed directly from stream. Downloading to >"
                            + source_dir + "< and unzipping.", MessageLevel.INFO);
                    this.result.addMessage(msg);

                    // Save stream to file
                    Path outputDir = Paths.get(source_dir);
                    Path outputFile = Paths.get(url.getFile()).getFileName();
                    Path downloadFile = outputDir.resolve(outputFile);
                    // Create directories
                    Files.createDirectories(downloadFile.getParent());
                    // Copy stream into file
                    Files.copy(is, downloadFile, StandardCopyOption.REPLACE_EXISTING);
                    // Delegate to files importer
                    FilesImporter fi = new FilesImporter(config, sourceDescriptor);
                    fi.run();
                    this.result.merge(fi.result);
                } else {
                    this.result.filesAvailable++;
                    this.sourceDescriptor.setName(url.getFile());
                    this.sourceDescriptor.setPath(url.getPath());
                    this.sourceDescriptor.setCreateDateTime(LocalDateTime.ofEpochSecond(con.getDate(), 0, ZoneOffset.UTC));
                    this.sourceDescriptor.setModifyDateTime(LocalDateTime.ofEpochSecond(con.getLastModified(), 0, ZoneOffset.UTC));
                    super.importStream(is);
                    this.result.filesImported++;
                }
            }
        } catch (MalformedURLException ex) {
            Message msg = new Message("url >" + http_url + "< is not correct.", MessageLevel.ERROR);
            this.result.addMessage(msg);
        } catch (IOException ex) {
            Message msg = new Message("Could not import from url >" + http_url + "< IOException: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            ex.printStackTrace();
            this.result.addMessage(msg);
        } catch (ImporterException ex) {
            Message msg = new Message("Could not import from url >" + http_url + "< ImporterException: " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            this.result.addMessage(msg);
            ex.printStackTrace();
        } finally {
            
        }
    }
}
