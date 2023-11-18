package de.fhbielefeld.smartuser.db;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.smartuser.config.Configuration;
import java.sql.*;

/**
 * Database access for rights check and update
 *
 * @author Florian Fehring
 */
public class DatabaseAccess {

    private String db_uri;
    private String db_user;
    private String db_pwd;

    public DatabaseAccess(Configuration conf) {
        db_uri = conf.getProperty("smartuser.db_uri");
        db_user = conf.getProperty("smartuser.db_user");
        db_pwd = conf.getProperty("smartuser.db_pwd");
    }

    public String getUsername(String authtoken) {
        String username = null;
        try ( Connection conn = DriverManager.getConnection(this.db_uri, this.db_user, this.db_pwd);  Statement stmt = conn.createStatement();  ResultSet rs = stmt.executeQuery("SELECT username FROM smartuser.users WHERE authtoken = '" + authtoken + "'");) {
            // Extract data from result set

            if (rs.next()) {
                username = rs.getString("username");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return username;
    }

    public Long getUserid(String authtoken) {
        Long userid = null;
        try ( Connection conn = DriverManager.getConnection(this.db_uri, this.db_user, this.db_pwd);  Statement stmt = conn.createStatement();  ResultSet rs = stmt.executeQuery("SELECT id FROM smartuser.users WHERE authtoken = '" + authtoken + "'");) {
            // Extract data from result set

            if (rs.next()) {
                userid = rs.getLong("id");
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }

        return userid;
    }

    public boolean hasRight(String authtoken, String resource, String action) {
        Long userid = this.getUserid(authtoken);
        if(userid == null) {
            Message msg = new Message("Could not find user for authtoken >" + authtoken + "<", MessageLevel.INFO);
            Logger.addDebugMessage(msg);
            return false;
        }
        // Get resourceid
        Long resoureid = null;
        try ( Connection conn = DriverManager.getConnection(this.db_uri, this.db_user, this.db_pwd);  Statement stmt = conn.createStatement();  ResultSet rs = stmt.executeQuery("SELECT id FROM smartuser.resources WHERE path = '" + resource + "'");) {
            if (rs.next()) {
                resoureid = rs.getLong("id");
            } else {
                Message msg = new Message("Could not find resource >" + resource + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }

        // Get right
        try ( Connection conn = DriverManager.getConnection(this.db_uri, this.db_user, this.db_pwd);  Statement stmt = conn.createStatement();  ResultSet rs = stmt.executeQuery("SELECT id FROM smartuser.userrights WHERE resource_id = " + resoureid + " AND user_id = " + userid + " AND action = '" + action + "'");) {
            if (rs.next()) {
                rs.getLong("id");
                return true;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }

        // Get general right for user
        try ( Connection conn = DriverManager.getConnection(this.db_uri, this.db_user, this.db_pwd);  Statement stmt = conn.createStatement();  ResultSet rs = stmt.executeQuery("SELECT id FROM smartuser.userrights WHERE resource_id = " + resoureid + " AND user_id = " + userid + " AND action = '*'");) {
            if (rs.next()) {
                rs.getLong("id");
                return true;
            } else {
                Message msg = new Message("Could not find right for resource >" + resource + "< for user >" + userid + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
        
        // Get general right for all users
        try ( Connection conn = DriverManager.getConnection(this.db_uri, this.db_user, this.db_pwd);  Statement stmt = conn.createStatement();  ResultSet rs = stmt.executeQuery("SELECT id FROM smartuser.userrights WHERE resource_id = " + resoureid + " AND user_id = 1 AND action = '" + action + "'");) {
            if (rs.next()) {
                rs.getLong("id");
                return true;
            } else {
                Message msg = new Message("Could not find right for resource >" + resource + "< for all users", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                return false;
            }
        } catch (SQLException e) {
            e.printStackTrace();
            return false;
        }
    }
    
    public String listRights(String authtoken, String resource, String action) {
        Long userid = this.getUserid(authtoken);
        if(userid == null) {
            Message msg = new Message("Could not find user for authtoken >" + authtoken + "<", MessageLevel.INFO);
            Logger.addDebugMessage(msg);
            return null;
        }
        
        String sql = "SELECT resource_id, action FROM smartuser.userrights WHERE user_id = " + userid;
        if(action != null)
            sql += " AND (action = '"+action+"' OR action = '*')";
        try ( Connection conn = DriverManager.getConnection(this.db_uri, this.db_user, this.db_pwd);  Statement stmt = conn.createStatement();  ResultSet rs = stmt.executeQuery(sql);) {
            String json = "";
            int i=0;
            String respath = "unknown";
            while(rs.next()) {
                Long resource_id = rs.getLong("resource_id");
                String act = rs.getString("action");
                // Request resource info
                Statement stmt1 = conn.createStatement();
                ResultSet rs1 = stmt1.executeQuery("SELECT path FROM smartuser.resources WHERE id = " + resource_id);
                if(rs1.next()) {
                    respath = rs1.getString("path");
                    if(resource != null && !respath.contains(resource))
                        continue;
                    if(i>0)
                        json += ",";
                    json = json + "{\"path\":\""+respath+"\", \"action\": \""+act+"\"}";
                    i++;
                } else {
                    Message msg1 = new Message("Could not find resource >" + resource_id + "<", MessageLevel.WARNING);
                    Logger.addDebugMessage(msg1);
                }
            }
            if(json.isEmpty()) {
                Message msg = new Message("Could not find any right for resource >" + resource + "< ("+respath+") for user >" + userid + "<", MessageLevel.INFO);
                Logger.addDebugMessage(msg);
                json = "{ \"list\": []}";
                return json;
            } else {
                json = "{ \"list\": [" + json + "]}";
                return json;
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }
}
