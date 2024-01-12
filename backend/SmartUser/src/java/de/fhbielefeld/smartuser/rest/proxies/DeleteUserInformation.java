package de.fhbielefeld.smartuser.rest.proxies;

import java.io.Serializable;
import jakarta.persistence.Basic;
import jakarta.xml.bind.annotation.XmlRootElement;

/**
 * Proxy object for information needed to delete a user
 * 
 * @author Florian Fehring
 */
@XmlRootElement
public class DeleteUserInformation implements Serializable {
    private static final long serialVersionUID = 1L;
    
    @Basic(optional = false)
    private String username;
    
    private String requestorpassword;
    
    private String authtoken;

    public DeleteUserInformation() {
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRequestorpassword() {
        return requestorpassword;
    }

    public void setRequestorpassword(String requestorpassword) {
        this.requestorpassword = requestorpassword;
    }

    public String getAuthtoken() {
        return authtoken;
    }

    public void setAuthtoken(String authtoken) {
        this.authtoken = authtoken;
    }
}
