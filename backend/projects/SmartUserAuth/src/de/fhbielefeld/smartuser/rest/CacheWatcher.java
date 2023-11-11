package de.fhbielefeld.smartuser.rest;

import java.util.TimerTask;

/**
 *
 * @author Florian Fehring
 */
public class CacheWatcher extends TimerTask {

    private String moduleName;
    
    public CacheWatcher(String moduleName) {
        this.moduleName = moduleName;
    }
    
    @Override
    public void run() {
        RightsCache.getInstance().garbaceCollector(this.moduleName);
    }
}
