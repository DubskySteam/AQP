package de.smartdata.porter.importer.parser;

/**
 * Indicates an error while loading or executing an parser
 * 
 * @author ffehring
 */
public class ParserException extends Exception {
    
    public ParserException(String message) {
        super(message);
    }
}
