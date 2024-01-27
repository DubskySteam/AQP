package de.hsbi.smartsocial.Logging;

import java.util.logging.Level;
import java.util.logging.Logger;

/**
 * Author: Clemens Maas
 * Date: 2024/01/06
 * <p>
 * This class is used to log messages to the server console.
 */
public class CLogger {

    private static CLogger instance;
    private final Logger logger;

    private CLogger() {
        this.logger = Logger.getLogger("CustomLogger");
    }

    public static synchronized CLogger getInstance() {
        if (instance == null) {
            instance = new CLogger();
        }
        return instance;
    }

    public void log(Level level, String apiPath, String message) {
        logger.log(level, "[SmartSocial | " + apiPath + "] " + message);
    }

}