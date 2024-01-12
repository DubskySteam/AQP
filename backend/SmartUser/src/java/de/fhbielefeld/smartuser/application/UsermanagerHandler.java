package de.fhbielefeld.smartuser.application;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.smartuser.config.Configuration;
import java.util.ArrayList;
import java.util.List;
import jakarta.annotation.Resource;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.UserTransaction;

/**
 * Handles the active usermanagers
 *
 * @author ffehring
 */
public class UsermanagerHandler {

    @PersistenceContext(unitName = "SmartUserPU")
    private EntityManager em;
    @Resource
    private UserTransaction utx;

    private Configuration conf;
    // List of all defined usermanagers in configured order
    private static List<Usermanager> usermanagers = new ArrayList<>();
    private int activeUsermanager = 0;

    public UsermanagerHandler(EntityManager em, UserTransaction utx, Configuration conf) {
        this.em = em;
        this.utx = utx;
        this.conf = conf;
    }
    
    /**
     * Gets the configured main usermanager
     *
     * @return
     * @throws de.fhbielefeld.smartuser.application.UsermanagerException
     */
    public Usermanager getUsermanager() throws UsermanagerException {
        Usermanager um;
        if (this.usermanagers.isEmpty()) {
            Message dmsg = new Message("Load usermanagers from configuration", MessageLevel.INFO);
            Logger.addDebugMessage(dmsg);
            this.usermanagers = UsermanagerBuilder.build(this);
            this.activeUsermanager = 0;
            um = this.usermanagers.get(this.activeUsermanager);
        } else {
            um = this.usermanagers.get(this.activeUsermanager);
        }
        Message imsg = new Message("Get usermanager >" + this.activeUsermanager + "< >" + um.getClass().getSimpleName() + "<", MessageLevel.INFO);
        Logger.addDebugMessage(imsg);
        return um;
    }

    /**
     * Activates the next usermanager
     *
     * @return true if there is an next usermanager, false otherwise
     */
    public boolean setNextUsermanagerActive() {
        if (this.usermanagers.size() > this.activeUsermanager + 1) {
            this.activeUsermanager++;
                try {
                    Message msg = new Message("Setting now " + this.getUsermanager().getClass().getSimpleName() + " active", MessageLevel.INFO);
                    Logger.addDebugMessage(msg);
                } catch (UsermanagerException ex) {
                    Message errmsg = new Message("Could not load usermanager >" + this.activeUsermanager + "<", MessageLevel.ERROR);
                    Logger.addDebugMessage(errmsg);
                }
            return true;
        }
        return false;
    }

    /**
     * Resets the active usermanager to the default
     */
    public void resetActiveUsermanager() {
        this.activeUsermanager = 0;
    }

    /**
     * Gets if the Usermanager is ready
     *
     * @return
     */
    public boolean isReady() {
        if (this.usermanagers.isEmpty()) {
            return false;
        }
        return true;
    }

    /**
     * Returns the status of the usermanager as text.
     *
     * @return
     */
    public String getStatusMessage() {
        if (this.usermanagers.isEmpty()) {
            return "There is no active usermanager";
        }
        return "ready";
    }

    /**
     * Returns the EntityManager
     *
     * @return EntityManager
     */
    public EntityManager getEntityManager() {
        return this.em;
    }

    public UserTransaction getUserTransaction() {
        return this.utx;
    }

    public Configuration getConf() {
        return conf;
    }
}
