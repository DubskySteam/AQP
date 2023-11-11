package de.smartdata.porter.importer.parser;

import de.smartdata.porter.importer.ParseImporter;
import java.io.InputStream;

/**
 * A parser that can parse files given as inputstreams
 *
 * @author ffehring
 */
public abstract class Parser {
    
    protected ParseImporter importer;
    protected ParserResult result = new ParserResult();

    /**
     * Sets the importer which uses this parser
     * 
     * @param importer Importer to use and use the parser
     */
    public void setImporter(ParseImporter importer) {
        this.importer = importer;
    }

    /**
     * Returns a description for the parser
     * 
     * @return Parsers description
     */
    public abstract String getDescription();
    
    /**
     * Checks if a file can be parsed with the given file.
     * 
     * @param is InputStream that should be possible parsed
     * @param mimetype MimeType of the InputStreams content
     * @param filename Name of the file the stream comes from
     * @return boolean true if the parser can parse the content, false otherwise
     * @throws ParserException 
     */
    public abstract boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException;
    
    /**
     * Runs directly before the parsing process. This can contain preparing
     * algorithms
     *
     * @throws ParserException
     */
    public abstract void preParse() throws ParserException;

    /**
     * Parses the data from the input stream.
     *
     * @param is InputStream contianing files data
     * @return Result information about parsing process
     * @throws ParserException Thrown on parsing error
     */
    public abstract ParserResult parse(InputStream is) throws ParserException;

}
