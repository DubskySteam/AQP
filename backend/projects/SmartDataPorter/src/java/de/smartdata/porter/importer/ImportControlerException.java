package de.smartdata.porter.importer;

/**
 * Indicates errors in import control
 * 
 * @author ffehring
 */
public class ImportControlerException extends Exception {

    /**
     * Creates a new instance of <code>ImportControlerException</code> without
     * detail message.
     */
    public ImportControlerException() {
    }

    /**
     * Constructs an instance of <code>ImportControlerException</code> with the
     * specified detail message.
     *
     * @param msg the detail message.
     */
    public ImportControlerException(String msg) {
        super(msg);
    }
}
