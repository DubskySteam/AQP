package de.smartdata.porter.streamconverter;

/**
 * Exception that indicates an error while converting.
 * 
 * @author ffehring
 */
public class ConvertException extends Exception {

    /**
     * Creates a new instance of <code>ConvertException</code> without detail
     * message.
     */
    public ConvertException() {
    }

    /**
     * Constructs an instance of <code>ConvertException</code> with the
     * specified detail message.
     *
     * @param msg the detail message.
     */
    public ConvertException(String msg) {
        super(msg);
    }
}
