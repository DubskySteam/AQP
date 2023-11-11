package de.fhbielefeld.smartmonitoring.jpa.emtools;

/**
 * Exeption thrown when an error in an entitytool occures.
 * 
 * @author ffehring
 */
public class EntityToolsException extends Exception {

    /**
     * Creates a new instance of <code>EntityToolsException</code> without
     * detail message.
     */
    public EntityToolsException() {
    }

    /**
     * Constructs an instance of <code>EntityToolsException</code> with the
     * specified detail message.
     *
     * @param msg the detail message.
     */
    public EntityToolsException(String msg) {
        super(msg);
    }
}
