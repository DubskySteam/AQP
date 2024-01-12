package de.fhbielefeld.scl.mail;

/**
 * Exception for reporting errors with the mailer
 * 
 * @author Florian Fehring
 */
public class MailerException extends Exception {

    /**
     * Constructs an instance of <code>MailerException</code> with the specified
     * detail message.
     *
     * @param msg the detail message.
     */
    public MailerException(String msg) {
        super(msg);
    }
}
