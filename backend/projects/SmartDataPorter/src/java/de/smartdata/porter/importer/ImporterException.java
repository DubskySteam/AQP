package de.smartdata.porter.importer;

/**
 * Exception indicateing an problem with the importer.
 * 
 * @author ffehring
 */
public class ImporterException extends Exception {

    /**
     * Creates a new instance of <code>ImporterException</code> without detail
     * message.
     */
    public ImporterException() {
    }

    /**
     * Constructs an instance of <code>ImporterException</code> with the
     * specified detail message.
     *
     * @param msg the detail message.
     */
    public ImporterException(String msg) {
        super(msg);
    }
}
