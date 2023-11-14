package de.fhbielefeld.smartuser.application;

/**
 * Indicates an error while working with userdata.
 * 
 * @author ffehring
 */
public class UsermanagerException extends Exception {

    /**
     * Creates a new instance of <code>UsermanagerException</code> without
     * detail message.
     */
    public UsermanagerException() {
    }

    /**
     * Constructs an instance of <code>UsermanagerException</code> with the
     * specified detail message.
     *
     * @param msg the detail message.
     */
    public UsermanagerException(String msg) {
        super(msg);
    }
}
