package de.smartdata.porter.importer;

import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserFactory;
import de.smartdata.porter.importer.descriptors.SourceDescriptor;
import jakarta.json.JsonObject;

/**
 * Class for importing data with parsing.
 *
 * @author ffehring
 */
public abstract class ParseImporter extends Importer {

    // Use Parser
    protected Parser parser;

    public ParseImporter(JsonObject config, SourceDescriptor sd) throws ImporterException {
        super(config);
        this.sourceDescriptor = sd;
        // Get Parser based on data found in configuration
        String importParserName = config.getString("parser",null);

        // Check constraints
        if (importParserName == null || importParserName.isEmpty()) {
            Message msg = new Message("The configuration entry >parser< is missing. "
                    + "You have to specify which parser you want to use.", MessageLevel.USER_ERROR);
            this.result.addMessage(msg);
            return;
        }

        try {
            this.parser = ParserFactory.getParser(importParserName);
            this.parser.setImporter(this);
        } catch (ParserException ex) {
            ImporterException iex = new ImporterException("Error while building parser: " + ex.getLocalizedMessage());
            iex.addSuppressed(ex);
            throw iex;
        }
    }
}
