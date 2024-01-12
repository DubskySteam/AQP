package de.fhbielefeld.smartuser.rest.proxies;

import java.io.Serializable;
import jakarta.persistence.Basic;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * Proxy object for grant rights to users
 * 
 * @author Florian Fehring
 */
@XmlRootElement
public class ManageRightInformation implements Serializable {
    private static final long serialVersionUID = 1L;
    
    // Name of the user to grant right for
    @Basic(optional = false)
    private String username;
    
    // Resource to grant right on
    private String resource;
    
    // Action to grant right on
    private String action;
    
    // Authotken of the user granting the right (optional, can also deliverd by cookie)
    private String authtoken;
    
    // Authtoken of the app granting the right (optional)
    private String apptoken;    

    public ManageRightInformation() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getResource() {
        return resource;
    }

    public void setResource(String resource) {
        this.resource = resource;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getAuthtoken() {
        return authtoken;
    }

    public void setAuthtoken(String authtoken) {
        this.authtoken = authtoken;
    }

    public String getApptoken() {
        return apptoken;
    }

    public void setApptoken(String apptoken) {
        this.apptoken = apptoken;
    }
}
