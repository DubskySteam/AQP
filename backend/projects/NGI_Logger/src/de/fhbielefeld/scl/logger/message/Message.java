package de.fhbielefeld.scl.logger.message;

import de.fhbielefeld.scl.logger.process.Process;
import de.fhbielefeld.scl.logger.application.Application;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

/*
 * Diese Klasse repräsentiert eine Zeile in der Tabelle "message", d.h. einen
 * Fehler mit Fehlernachricht, Fehlerlevel, Anlagen-ID, Fehlerherkunft und
 * Zeitstempel. Der Zeitstempel kann im Konstruktor übergeben oder ausgelassen werden
 * (dann wird automatisch selbst generiert). Weiterhin stehen Methoden zum Prüfen bereit,
 * ob diese Nachricht in bestimmtes Wort enthält, alle Wörter einer Liste enthält
 * oder mindestens ein Wort einer Liste enthält (es werden die Felder message und
 * origin geprüft).
 *
 * @author Ruben Hockemeyer, Ruben Grest, Florian Fehring (Ergänzungen)
 */
public class Message {

    // Message details
    private long id;
    private LocalDateTime dateTime;    // When the message was generated
    private MessageLevel level;            // MessageLevel of message
    private String modifier;        // Modifier (DEBUG)
    private String message;         // Message
    private String originPath;      // Code identifier (stack trace)
    private Process messageProcess;       // Process id of the process this message is related to.

    // Objects effected
    private Collection<String> effectedObjects;
    // Application effected
    private Application application;
    private List<Throwable> exceptions = new ArrayList<>();

    public Message() {
        
    }
    
    /**
     * Creates an message relating to a list of observedobjects.
     *
     * @param message Message text
     * @param level MessageLevel of message (info, error, etc.)
     * @param effectedObjects List of string representations of objects appling to this message
     */
    public Message(String message, MessageLevel level, Collection<String> effectedObjects) {
        this.message = message;
        this.level = level;
        this.effectedObjects = effectedObjects;
        // Aktuellen StackTrace holen
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        this.originPath = stackTrace[2].getClassName() + "/" + stackTrace[2].getMethodName() + "/" + stackTrace[2].getLineNumber();
        this.dateTime = LocalDateTime.now();
    }

    /**
     * Creates an message relating to one observedObject.
     *
     * @param message Message text
     * @param level MessageLevel of message
     * @param effectedObject Object message realates to
     */
    public Message(String message, MessageLevel level, String effectedObject) {
        this.message = message;
        this.level = level;
        this.effectedObjects = new ArrayList<>();
        this.effectedObjects.add(effectedObject);
        // Aktuellen StackTrace holen
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        this.originPath = stackTrace[2].getClassName() + "/" + stackTrace[2].getMethodName() + "/" + stackTrace[2].getLineNumber();
        this.dateTime = LocalDateTime.now();
    }

    /**
     * Creates an message not relating to an observedobject
     *
     * @param message
     * @param level
     */
    public Message(String message, MessageLevel level) {
        this.message = message;
        this.level = level;
        this.effectedObjects = new ArrayList<>();
        // Aktuellen StackTrace holen
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        this.originPath = stackTrace[2].getClassName() + "/" + stackTrace[2].getMethodName() + "/" + stackTrace[2].getLineNumber();
        this.dateTime = LocalDateTime.now();
    }

    /**
     * Creates an message not relating to an observedobject
     *
     * @param message
     * @param level
     * @param application
     */
    public Message(String message, MessageLevel level, Application application) {
        this.message = message;
        this.level = level;
        this.effectedObjects = new ArrayList<>();
        this.application = application;
        // Aktuellen StackTrace holen
        StackTraceElement[] stackTrace = Thread.currentThread().getStackTrace();
        this.originPath = stackTrace[2].getClassName() + "/" + stackTrace[2].getMethodName() + "/" + stackTrace[2].getLineNumber();
        this.dateTime = LocalDateTime.now();
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public void setDateTime(LocalDateTime dateTime) {
        this.dateTime = dateTime;
    }
    
    public LocalDateTime getDateTime() {
        return dateTime;
    }

    public MessageLevel getLevel() {
        return level;
    }

    public String getModifier() {
        return modifier;
    }

    public void setModifier(String modifier) {
        this.modifier = modifier;
    }

    public String getMessage() {
        return message;
    }

    public String getOriginPath() {
        return originPath;
    }

    public Process getMessageProcess() {
        return messageProcess;
    }

    public void setMessageProcess(Process process) {
        this.messageProcess = process;
    }

    public Collection<String> getEffectedObjects() {
        return effectedObjects;
    }

    public String getObservedObjectIds() {
        String rt = "";
        int i=0;
        for(String obj : this.effectedObjects) {
            if(i>0) {
                rt = rt + ",";
            }
            rt = rt + obj;
            i++;
        }
        return rt;
    }
    
    public void setEffectedObjects(List<String> effectedObjects) {
        this.effectedObjects = effectedObjects;
    }

    /**
     * Gets the related application.
     *
     * @return Application the message relates
     */
    public Application getApplication() {
        return application;
    }

    /**
     * Sets related application.
     *
     * @param application
     */
    public void setApplication(Application application) {
        this.application = application;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setLevel(MessageLevel level) {
        this.level = level;
    }

    public void setOriginPath(String originPath) {
        this.originPath = originPath;
    }
    
    public void addException(Throwable exception) {
        this.exceptions.add(exception);
    }
    
    public List<Throwable> getExceptions() {
        return this.exceptions;
    }

    /**
     * Checks if the message contains an keyword
     *
     * @param keyword Keyword to search
     * @return true if keyword was found
     */
    public boolean containsKeyword(String keyword) {
        return message.contains(keyword) || originPath.contains(keyword);
    }

    /**
     * Checks if the message contains at least one of the given keywords.
     *
     * @param keywords List of searched keywords
     * @return true if the message contains one of the given keywords
     */
    public boolean containsAtLeastOneKeyword(List<String> keywords) {
        for (String keyword : keywords) {
            if (containsKeyword(keyword)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Checks if the message contains all the given keywords.
     *
     * @param keywords Keywords to search
     * @return true if the message contains all keywords.
     */
    public boolean containsAllKeywords(List<String> keywords) {
        for (String keyword : keywords) {
            if (!containsKeyword(keyword)) {
                return false;
            }
        }

        return true;
    }
}
