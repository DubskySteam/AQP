package de.fhbielefeld.smartuser.rest;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.smartuser.securitycontext.SmartPrincipalRight;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.stream.JsonParser;
import java.io.StringReader;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

/**
 * Builds a cache for known rights, so not every request must validated against
 * the database.
 * 
 * @author Florian Fehring
 */
public class RightsCache {

    private static RightsCache instance = null;
    private Map<String, SmartPrincipalRight> rightCache = new HashMap<>();

    private RightsCache() {

    }

    public static RightsCache getInstance() {
        if (instance == null) {
            instance = new RightsCache();
        }
        return instance;
    }

    public SmartPrincipalRight addRight(String username, String authtoken, String resource, String action) {
        SmartPrincipalRight right = new SmartPrincipalRight();
        right.setUsername(username);
        right.setEndTime(LocalDateTime.now().plusSeconds(300)); // Cache 5 minutes
        Set newsets = new HashSet<>();
        newsets.add(Long.MAX_VALUE);
        right.setIds(newsets);
        String cacheId = authtoken + "/" + resource + "/" + action;
        right.setCacheId(cacheId);
        rightCache.put(cacheId, right);
        return right;
    }

    public SmartPrincipalRight addRights(String username, String authtoken, String rightsJson) {
        JsonParser rightsParser = Json.createParser(new StringReader(rightsJson));
        rightsParser.next();
        JsonObject rightsJsonObj = rightsParser.getObject();
        JsonArray rightsList = rightsJsonObj.getJsonArray("list");
        SmartPrincipalRight right = null;
        // Check if there are rights delivered
        if (rightsList != null && !rightsList.isEmpty()) {
            for (int i = 0; i < rightsList.size(); i++) {
                JsonObject curRight = rightsList.getJsonObject(i);
                String curRightId = authtoken + "/";
                String[] pathParts = curRight.getString("path").split("\\.");
                String lastPart = pathParts[pathParts.length - 1];
                Long setvalue;
                if (lastPart.matches("-?\\d+(\\.\\d+)?")) {
                    curRightId += curRight.getString("path").replace(pathParts[pathParts.length - 1], "") + "/";
                    curRightId += curRight.getString("action");
                    setvalue = Long.parseLong(pathParts[pathParts.length - 1]);
                } else {
                    curRightId += curRight.getString("path") + "/";
                    curRightId += curRight.getString("action");
                    setvalue = Long.MAX_VALUE;
                }

                // Create cache entry if not exists
                if (!rightCache.containsKey(curRightId)) {
                    right = new SmartPrincipalRight();
                    right.setUsername(username);
                    right.setEndTime(LocalDateTime.now().plusSeconds(300)); // Cache 5 minutes
                    rightCache.put(curRightId, right);
                } else {
                    right = rightCache.get(curRightId);
                }
                // Do not add if sets contain MAX_VALUE (*-Right)
                if (!right.getIds().contains(Long.MAX_VALUE)) {
                    if (setvalue != Long.MAX_VALUE) {
                        right.getIds().add(setvalue);
                    } else {
                        Set newsets = new HashSet<>();
                        newsets.add(setvalue);
                        right.setIds(newsets);
                    }
                }
            }
            return right;
        } else if (rightsList != null && rightsList.isEmpty()) {
            System.out.println("## TEST addRights 2");
            right = new SmartPrincipalRight();
            right.setUsername(username);
            right.setEndTime(LocalDateTime.now().plusSeconds(300)); // Cache 5 minutes
            return right;
        } else {
            return null;
        }
    }

    public SmartPrincipalRight get(String rightId) {
        SmartPrincipalRight right = rightCache.get(rightId);
        // Check timeout
        if (right != null && right.getEndTime().isBefore(LocalDateTime.now())) {
            rightCache.remove(rightId);
            return null;
        }
        return right;
    }

    public void garbaceCollector(String moduleName) {
        Map<String, SmartPrincipalRight> newMap = new HashMap<>();
        for (Entry<String, SmartPrincipalRight> curEntry : rightCache.entrySet()) {
            if (curEntry.getValue().getEndTime().isAfter(LocalDateTime.now())) {
                newMap.put(curEntry.getKey(), curEntry.getValue());
            }
        }
        int removed = rightCache.size() - newMap.size();
        Message msg = new Message("Removed " + removed + " / " + rightCache.size() + " outdated rights from rights cache for application >" + moduleName + "<.", MessageLevel.INFO);
        Logger.addDebugMessage(msg);
        rightCache = newMap;
    }
}
