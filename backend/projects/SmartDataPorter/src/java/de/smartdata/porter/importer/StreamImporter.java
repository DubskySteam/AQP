package de.smartdata.porter.importer;

import de.smartdata.porter.importer.descriptors.SourceDescriptor;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import java.io.InputStream;
import jakarta.json.JsonObject;

/**
 * Importer for importing file data from stream. This importer is used by other
 * importers that transfers files into stream.
 *
 * @author ffehring
 */
public abstract class StreamImporter extends ParseImporter {

    public StreamImporter(JsonObject config, SourceDescriptor sd) throws ImporterException {
        super(config, sd);
    }

    /**
     * Runs the import of date from the given stream.
     *
     * @param is InputStream whichs contents to import
     * @return ImporterResult
     * @throws ImporterException
     */
    public ImporterResult importStream(InputStream is) throws ImporterException {
        try {
            // Log starting parse
            Message msg = new Message("Starting StreamImporter with parser >" 
                    + this.parser.getClass().getSimpleName() + "<", MessageLevel.INFO);
            Logger.addDebugMessage(msg);
            // Start count time
            long startTime = System.currentTimeMillis();
            // Parse
            ParserResult presult = this.parser.parse(is);
            // Stop count time
            long stopTime = System.currentTimeMillis();
            long elapsedTime = stopTime - startTime;
            Message timeMsg = new Message("Parser took " + elapsedTime + "ms.", MessageLevel.INFO);
            Logger.addDebugMessage(timeMsg);
            if (presult == null) {
                throw new ImporterException("Parser >" + this.parser.getClass().getSimpleName() + "< returned no ParserResult.");
            }
            result.addParserResult(presult);
            return this.saveDatasets();
        } catch (ParserException ex) {
            ImporterException iex = new ImporterException(ex.getLocalizedMessage());
            iex.addSuppressed(ex);
            throw iex;
        } catch (Exception ex) {
            ImporterException iex = new ImporterException(
                    "Unhandled >" + ex.getClass().getSimpleName() + "< in Parser >"
                    + this.parser.getClass().getSimpleName() + "< :" + ex.getLocalizedMessage());
            iex.addSuppressed(ex);
            ex.printStackTrace();
            throw iex;
        }
        //return result;
    }
}
