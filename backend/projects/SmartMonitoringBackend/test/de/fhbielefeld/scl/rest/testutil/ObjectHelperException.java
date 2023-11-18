package de.fhbielefeld.scl.rest.testutil;

/**
 * Indicates a error while executing the ObjectHelper
 * 
 * @author ffehring
 */
public class ObjectHelperException extends Exception {

    /**
     * Creates a new instance of <code>ObjectHelperException</code> without
     * detail message.
     */
    public ObjectHelperException() {
    }

    /**
     * Constructs an instance of <code>ObjectHelperException</code> with the
     * specified detail message.
     *
     * @param msg the detail message.
     */
    public ObjectHelperException(String msg) {
        super(msg);
    }
}
