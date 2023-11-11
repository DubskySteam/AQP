package de.fhbielefeld.smartuser.securitycontext;

import jakarta.ws.rs.container.ContainerRequestContext;
import jakarta.ws.rs.core.SecurityContext;


/**
 * Security Context implementation for SmartUser
 * 
 * @author Florian Fehring
 */
public class SmartSecurityContext implements SecurityContext {

    private final ContainerRequestContext context;
    private final SmartPrincipal principal;
    
    public SmartSecurityContext(ContainerRequestContext context, SmartPrincipal principal) {
        this.context = context;
        this.principal = principal;
    }
    
    @Override
    public SmartPrincipal getUserPrincipal() {
        return this.principal;
    }

    @Override
    public boolean isUserInRole(String arg0) {
        //TODO use listParents REST-Interface to determine role useage
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }

    @Override
    public boolean isSecure() {
        return this.context.getUriInfo().getAbsolutePath().toString().startsWith("https");
    }

    @Override
    public String getAuthenticationScheme() {
        return "Token-Based-Authentification";
    }
}
