package de.fhbielefeld.scl.rest.network;

/**
 * Exception that indicates an error with the connection to rest webservices
 * 
 * @author ffehring
 */
public class RestNetworkException extends Exception {

    /**
     * Creates a new instance of <code>RestNetworkException</code> without
     * detail message.
     */
    public RestNetworkException() {
    }

    /**
     * Constructs an instance of <code>RestNetworkException</code> with the
     * specified detail message.
     *
     * @param msg the detail message.
     */
    public RestNetworkException(String msg) {
        super(msg);
    }
}
