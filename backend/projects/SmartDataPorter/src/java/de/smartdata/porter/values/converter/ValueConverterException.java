package de.smartdata.porter.values.converter;

/**
 * Indicateing errors with value conversion
 * 
 * @author Florian Fehring
 */
public class ValueConverterException extends Exception {

    /**
     * Creates a new instance of <code>ValuesConverterException</code> without
     * detail message.
     */
    public ValueConverterException() {
    }

    /**
     * Constructs an instance of <code>ValuesConverterException</code> with the
     * specified detail message.
     *
     * @param msg the detail message.
     */
    public ValueConverterException(String msg) {
        super(msg);
    }
}
