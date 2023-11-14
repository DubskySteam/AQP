package de.fhbielefeld.smartuser.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.LoggerException;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.smartuser.config.Configuration;
import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import java.util.Timer;
import java.util.logging.Level;
import javax.naming.NamingException;

/**
 * This AppListener reacts whenever the app is deployed or undeployed and makes 
 * necessery forework and afterwork
 * 
 * @author Florian Fehring
 */
@WebListener
public class AppListener implements ServletContextListener {

    private Timer watchtimer;

    @Override
    public void contextInitialized(ServletContextEvent event) {
        String moduleName = null;
        // Init logging
        try {
            moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Configuration conf = new Configuration();
            Logger.getInstance("SmartUser", moduleName);
            Logger.setDebugMode(Boolean.parseBoolean(conf.getProperty("debugmode")));
        } catch (LoggerException | NamingException ex) {
            System.err.println("Error init logger: " + ex.getLocalizedMessage());
        }
        // Create cache watcher
        if (moduleName != null && !moduleName.equals("SmartUser")) {
            CacheWatcher cw = new CacheWatcher(moduleName);
            watchtimer = new Timer();
            watchtimer.scheduleAtFixedRate(cw, 0, 300 * 1000);
        }
    }

    @Override
    public void contextDestroyed(ServletContextEvent event) {
        try {
            // Do your job here during webapp shutdown.
            String moduleName = (String) new javax.naming.InitialContext().lookup("java:module/ModuleName");
            Message msg = new Message("App " + moduleName + " shutdown. Cache listener also shutdown.", MessageLevel.INFO);
            Logger.addDebugMessage(msg);
            if(watchtimer != null)
                watchtimer.cancel();
        } catch (NamingException ex) {
            java.util.logging.Logger.getLogger(AppListener.class.getName()).log(Level.SEVERE, null, ex);
        }
    }

}
