package de.fhbielefeld.smartuser.securitycontext;

import java.security.Principal;
import javax.security.auth.Subject;

/**
 * Principal for SmartUser driven applications.
 * 
 * @author Florian Fehring
 */
public class SmartPrincipal implements Principal {

    private final String name;
    private SmartPrincipalRight contextRight;
    
    public SmartPrincipal(String name) {
        this.name = name;
    }
    
    @Override
    public String getName() {
        return this.name;
    }

    public SmartPrincipalRight getContextRight() {
        return contextRight;
    }

    public void setContextRight(SmartPrincipalRight contextIds) {
        this.contextRight = contextIds;
    }

    @Override
    public boolean implies(Subject subject) {
        return Principal.super.implies(subject); //To change body of generated methods, choose Tools | Templates.
    }
}
