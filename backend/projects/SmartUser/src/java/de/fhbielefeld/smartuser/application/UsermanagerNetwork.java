package de.fhbielefeld.smartuser.application;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.util.WebTargetCreator;
import de.fhbielefeld.smartuser.persistence.jpa.Resource;
import de.fhbielefeld.smartuser.persistence.jpa.User;
import de.fhbielefeld.smartuser.persistence.jpa.UserRight;
import java.io.StringReader;
import java.util.List;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import jakarta.json.stream.JsonParsingException;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.client.WebTarget;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

/**
 * Usermanager for working with userdata managed by another application in
 * network. Uses the REST-Webservices.
 *
 * @author ffehring
 */
public class UsermanagerNetwork extends Usermanager {

    private WebTargetCreator webtargetcreator;
    
    /**
     * Creates an usermanager for checking useraccess over the network,
     * connected to an UsermanagerServer
     *
     * @param umh UsermanagerHandler with needed base information
     * @throws UsermanagerException
     */
    public UsermanagerNetwork(UsermanagerHandler umh) throws UsermanagerException {
        super(umh);
        String networkusermanagerurl = umh.getConf().getProperty("networkusermanager_url");
        if (networkusermanagerurl == null) {
            Message msg = new Message("There is no >networkusermanager_url< specified in usermanager configuration. Can't use UsermanagerNetwork.", MessageLevel.ERROR);
            Logger.addMessage(msg);
        }
        try {
            this.webtargetcreator = new WebTargetCreator(networkusermanagerurl);
        } catch (Exception ex) {
            throw new UsermanagerException("Could not connect to usermanager network. " + ex.getLocalizedMessage());
        }
    }

    @Override
    public User performLogin(String username, String password) throws UsermanagerException {
        // Use webservice to identify user
//        password = MD5.generateMD5Hash(this.config.getEntry("passwordsalt")
//                + password);

        // Build object to send with request
        JsonObjectBuilder builder = Json.createObjectBuilder();
        builder.add("username", username);
        builder.add("password", password);
        JsonObject dataObject = builder.build();
        Entity<String> dataSet = Entity.json(dataObject.toString());
        // Send request
        WebTarget webtarget = webtargetcreator.createWebTarget("user");
        Response response = webtarget.path("performLogin").request(MediaType.APPLICATION_JSON).post(dataSet);
        String responseText = response.readEntity(String.class);
        JsonObject jsonobj = this.convertStringToJsonObject(responseText);

        // If response indicates an error return error
        if (response.getStatus() > 399) {
            throw new UsermanagerException("Could not perform login. REST services answered with status: " + response.getStatus());
        }

        // Convert json to user object
        User user = this.convertJsonToUser(jsonobj);
        user.setPassword(password);
        return user;
    }

    @Override
    public boolean performLogout(String username) throws UsermanagerException {
        // Send request
        WebTarget webtarget = webtargetcreator.createWebTarget("user");
        Response response = webtarget.path("performLogout").request(MediaType.APPLICATION_JSON).get();
//        String responseText = response.readEntity(String.class);
//        JsonObject jsonobj = this.convertStringToJsonObject(responseText);

        if (response.getStatus() > 399) {
            throw new UsermanagerException("Could not perform login. REST services answered with status: " + response.getStatus());
        }

        return true;
    }

    @Override
    public User getUser(String username, User requestor) throws UsermanagerException {
        // Send request
        WebTarget webtarget = webtargetcreator.createWebTarget("user");
        Response response = webtarget.path("performLogout")
                .queryParam("username", username)
                .queryParam("authtoken", requestor.getAuthtoken())
                .request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        JsonObject jsonobj = this.convertStringToJsonObject(responseText);

        if (response.getStatus() > 399) {
            throw new UsermanagerException("Could not perform login. REST services answered with status: " + response.getStatus());
        }

        // Convert json to user object
        User user = this.convertJsonToUser(jsonobj);
        return user;

    }

    @Override
    public User getUser(String authtoken) throws UsermanagerException {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    public List<User> getUserlist(User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException("Not supported yet.");
    }

    @Override
    public User createUser(User user, User creator) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public boolean confirmUser(String confirmToken) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public boolean requestMailLogin(String usermailname) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public User performMailLogin(String onelogintoken) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public User updateUser(User user, User requestor) throws UsermanagerException {
        // Build object to send with request
        JsonObjectBuilder builder = Json.createObjectBuilder();
        builder.add("username", user.getUsername());
        builder.add("password", user.getPassword());
        builder.add("street", user.getStreet());
        builder.add("houseno", user.getHouseno());
        builder.add("zipcode", user.getZipcode());
        builder.add("city", user.getCity());
        builder.add("country", user.getCountry());
        builder.add("email", user.getEmail());
        builder.add("phone", user.getPhone());
        builder.add("firstname", user.getFirstname());
        builder.add("lastname", user.getLastname());
        builder.add("authtoken", requestor.getAuthtoken());
        JsonObject dataObject = builder.build();
        Entity<String> dataSet = Entity.json(dataObject.toString());
        // Send request
        WebTarget webtarget = webtargetcreator.createWebTarget("user");
        Response response = webtarget.path("saveUser").request(MediaType.APPLICATION_JSON).post(dataSet);
        String responseText = response.readEntity(String.class);
        JsonObject jsonobj = this.convertStringToJsonObject(responseText);

        // If response indicates an error return error
        if (response.getStatus() > 399) {
            throw new UsermanagerException("Could not perform login. REST services answered with status: " + response.getStatus());
        }

        // Convert json to user object
        User newuser = this.convertJsonToUser(jsonobj);
        return newuser;
    }
    
    @Override
    public void deleteUser(String username, User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }
    
    @Override
    public Resource createResource(String resource, User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }
    
    @Override
    public List<Resource> userListResources(String username, String resource, String action) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }
    
    @Override
    public void deleteResource(String resource, User requestor) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }

    @Override
    public boolean userHasRight(String username, String resource, String action) throws UsermanagerException {
        WebTarget webtarget = webtargetcreator.createWebTarget("userright");
        Response response = webtarget.path("getHasRight")
                .queryParam("username", username)
                .queryParam("resource", resource)
                .queryParam("action", action)
                .request(MediaType.APPLICATION_JSON).get();
        String responseText = response.readEntity(String.class);
        JsonObject jsonobj = this.convertStringToJsonObject(responseText);

        if (response.getStatus() > 399) {
            throw new UsermanagerException("Could not perform login. REST services answered with status: " + response.getStatus());
        }

        return jsonobj.getBoolean("right");
    }

    @Override
    public List<UserRight> userListRights(String username, String resource, String action) throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet.");
    }
    
    @Override
    public boolean grantRight(String username, String resource, String action, User requestor) throws UsermanagerException {
        // Build object to send with request
        JsonObjectBuilder builder = Json.createObjectBuilder();
        builder.add("username", username);
        builder.add("resource", resource);
        builder.add("action", action);
        builder.add("authtoken", requestor.getAuthtoken());
        JsonObject dataObject = builder.build();
        Entity<String> dataSet = Entity.json(dataObject.toString());
        // Send request
        WebTarget webtarget = webtargetcreator.createWebTarget("userright");
        Response response = webtarget.path("create").request(MediaType.APPLICATION_JSON).post(dataSet);
//        String responseText = response.readEntity(String.class);

        if (response.getStatus() > 399) {
            throw new UsermanagerException("Could not perform login. REST services answered with status: " + response.getStatus());
        }

        return true;
    }

    @Override
    public boolean revokeRight(String username, String resource, String action, User requestor) throws UsermanagerException {
        WebTarget webtarget = webtargetcreator.createWebTarget("userright");
        Response response = webtarget.path("revokeRight")
                .queryParam("username", username)
                .queryParam("resource", resource)
                .queryParam("action", action)
                .queryParam("authtoken", requestor.getAuthtoken())
                .request(MediaType.APPLICATION_JSON).delete();
        String responseText = response.readEntity(String.class);
        JsonObject jsonobj = this.convertStringToJsonObject(responseText);

        if (response.getStatus() > 399) {
            throw new UsermanagerException("Could not perform login. REST services answered with status: " + response.getStatus());
        }

        return true;
    }

    /**
     * Converts a recived responseText into a JsonObject
     *
     * @param responseText Response text recived
     * @return JsonObject created from response
     * @throws UsermanagerException
     */
    private JsonObject convertStringToJsonObject(String responseText) throws UsermanagerException {
        if (responseText == null) {
            // If there is no response from user identification system
            throw new UsermanagerException("Usermanager webservice does not respond.");
        }

        try {
            JsonReader jsonReader = Json.createReader(new StringReader(responseText));
            JsonObject obj = jsonReader.readObject();
            jsonReader.close();
            return obj;
        } catch (JsonParsingException ex) {
            throw new UsermanagerException("Could not understand answer from user webservice.");
        }
    }

    /**
     * Converts an json returned from the user webservice into an User object
     *
     * @param obj JsonObject with json data
     * @return User object
     */
    private User convertJsonToUser(JsonObject obj) {
        User user = new User();
        user.setUsername(obj.getString("username"));
        user.setAuthtoken(obj.getString("authtoken"));
        if (obj.containsKey("firstname")) {
            user.setFirstname(obj.getString("firstname"));
        }
        if (obj.containsKey("lastname")) {
            user.setLastname(obj.getString("lastname"));
        }
        if (obj.containsKey("email")) {
            user.setEmail(obj.getString("email"));
        }
        if (obj.containsKey("phone")) {
            user.setPhone(obj.getString("phone"));
        }

        return user;
    }

    @Override
    public List<User> getParentUsers() throws UsermanagerException {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    @Override
    public long countUsers() throws UsermanagerException {
        throw new UnsupportedOperationException(this.getClass().getSimpleName() + ": Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
}
