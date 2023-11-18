package de.fhbielefeld.scl.logger;

import de.fhbielefeld.scl.logger.application.Application;
import de.fhbielefeld.scl.logger.message.Message;
import java.io.PrintStream;

/**
 * Der Logger loggt alle Fehler- und Infomeldungen und gibt sie an eine Klasse
 * weiter, bis sie am Ende in die Datenbank geschrieben werden.
 *
 * @author Ruben Grest, Ruben Hockemeyer, Florian Fehring
 */
public class Logger {

    private static Logger instance;
    public static String ERROR_TOKEN = "WEBSERVICE_CONNECTION_ERROR";

    private Application application;
    private String processName;
    private int process;

    // Options for debug mode
    private boolean debugMode = false;
    private PrintStream debugOutputStream = System.out;

    /**
     * Make class Singleton
     */
    private Logger() {

    }

    /**
     * Get instance of logger or create new
     *
     * @param applicationName Name of the application to log messages from
     * @param processName Name of the process
     * @param config Configuration object
     * @return Instance of logger
     * @throws SCLLoggerException Thrown if the logger can not be reached
     */
    public static Logger getInstance(String applicationName, String processName) throws LoggerException {
        if (instance == null) {
            instance = new Logger();
            instance.application = new Application(applicationName, "", "");
            instance.processName = processName;

//            if (config.getEntry("debugmode")!=null && config.getEntry("debugmode").equalsIgnoreCase("true")) {
//                instance.debugMode = true;
//            } else {
//                try {
//                    StatusmonitorWebService_Service remote = new StatusmonitorWebService_Service();
//                    instance.service = remote.getStatusmonitorWebServicePort();
//                    String actionmsg = instance.service.openProcess(applicationName, processName);
//                    JSONParser parser = new JSONParser();
//                    JSONObject obj = (JSONObject) parser.parse(actionmsg);
//                    String status = (String) obj.get("status");
//                    if(status.equalsIgnoreCase("ok")) {
//                        String processidStr = (String) obj.get("id");
//                        instance.process = Integer.parseInt(processidStr);
//                        System.out.println("Useing SCL StatusMonitor WebService descripted by WSDL-URL: " + remote.getWSDLDocumentLocation());
//                        System.out.println("For errors and information messages, see there.");
//                    } else {
//                        throw new SCLLoggerException("WebService status: " + status + " message: " + obj.get("message"));
//                    }
//                    
//                } catch (ParseException ex) {
//                    instance.service = null;
//                    throw new SCLLoggerException("Parse Exception: " + ex.getLocalizedMessage());
//                } catch (Exception ex1) {
//                    instance.service = null;
//                    instance.debugMode = true;
//                    Message msg = new Message("LoggerWebService is not available due to: " + ex1.getLocalizedMessage() + " useing local logger with debugmode instead.", MessageLevel.ERROR);
//                    instance.log(msg);
//                }
//            }
        }
        return instance;
    }

    private static Logger getInstance() {
        return instance;
    }

    /**
     * Name of the application under which messages should be logged
     *
     * @return Applications name
     */
    public String getApplicationName() {
        return this.application.getName();
    }

    /**
     * If debug mode is acitvated messages will not be send to the webservice
     *
     * @return true if debugmode is activated
     */
    public boolean isDebugMode() {
        return debugMode;
    }

    public static void setDebugMode(boolean debugMode) {
        instance.debugMode = debugMode;
    }

    /**
     * Schickt das Message-Objekt zum Webservice, der diese in die Datenbank
     * loggt (und je nach Konfiguration E-Mail-Benachrichtigungen verschickt).
     * Treten keine Fehler auf, so wird null zurückgegeben. Tritt ein Fehler im
     * Webservice auf, so wird die Exception-Nachricht zurückgegeben. Sollte ein
     * Fehler beim Verbinden mit dem Webservice auftreten, liefert diese Methode
     * SCLLogger.ERROR_TOKEN zurück.
     *
     * @param message Message to send to log
     * @return Response from webservice
     */
    private String logMessage(Message message) {
        String result = ERROR_TOKEN;

        // Set application if not given
        if (message.getApplication() == null) {
            message.setApplication(this.application);
        }

        // build up message
        String msg = "====";
        if (message.getModifier() != null) {
            msg += message.getModifier() + " ";
        }
        msg += message.getLevel() + "===="
                + System.lineSeparator()
                + message.getDateTime().toString()
                + System.lineSeparator()
                + message.getMessage()
                + System.lineSeparator()
                + message.getOriginPath()
                + System.lineSeparator()
                + "process:           " + this.process + ""
                + System.lineSeparator()
                + "affected entities: " + message.getObservedObjectIds()
                + System.lineSeparator()
                + "app:               " + message.getApplication().getName() + "/" + this.processName;

        if (this.debugMode == false) {
            // TODO recive message objects, do not explode it
            System.out.println(msg);
        } else {
            // Write into debug output stream
            this.debugOutputStream.println(msg);
        }
        return result;
    }

    /**
     * Log a message to the previous configured logger.
     *
     * @param message Message to log
     */
    public static void addMessage(Message message) {
        Logger logger = Logger.getInstance();
        if (logger == null) {
            System.err.println("Logger is not configured. Can not log message: " + message.getMessage());
        } else {
            logger.logMessage(message);
        }
    }

    /**
     * Log a debug message to the previous configured logger service. Those
     * messages only apear on console or in database, if debug mode is on
     *
     * @param message
     */
    public static void addDebugMessage(Message message) {
        Logger.getInstance().logDebugMessage(message);
    }

    /**
     * Logs the debug message
     *
     * @param message
     */
    private void logDebugMessage(Message message) {
        if (this.debugMode) {
            message.setModifier("DEBUG");
            this.logMessage(message);
        }
    }
}
