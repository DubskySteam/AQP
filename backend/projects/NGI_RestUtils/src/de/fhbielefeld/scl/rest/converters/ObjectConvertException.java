package de.fhbielefeld.scl.rest.exceptions;

/**
 * Exception that indicates an error while converting an object to
 * jaxs compilant format.
 * 
 * @author ffehring
 */
public class ObjectConvertException extends Exception {
     
    public ObjectConvertException(String message) {
        super(message);
    }
}
