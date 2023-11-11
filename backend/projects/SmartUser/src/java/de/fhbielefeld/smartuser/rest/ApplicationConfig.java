package de.fhbielefeld.smartuser.rest;

import java.util.Set;
import jakarta.ws.rs.core.Application;

/**
 * Automatisch Erstellte Klasse durch Netbeans, verwaltet REST Klassen
 * @author Nils Leunig, dstarke
 */
@jakarta.ws.rs.ApplicationPath("smartuser")
public class ApplicationConfig extends Application {

    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> resources = new java.util.HashSet<>();
        addRestResourceClasses(resources);
        resources.add(de.fhbielefeld.scl.rest.exceptions.handlers.GeneralExceptionMapper.class);
        return resources;
    }

    /**
     * Do not modify addRestResourceClasses() method.
     * It is automatically populated with
     * all resources defined in the project.
     * If required, comment out calling this method in getClasses().
     */
    private void addRestResourceClasses(Set<Class<?>> resources) {
        resources.add(de.fhbielefeld.scl.rest.exceptions.handlers.GeneralExceptionMapper.class);
        resources.add(de.fhbielefeld.scl.rest.util.CORSFilter.class);
        resources.add(de.fhbielefeld.smartuser.rest.AuthenticationFilter.class);
        resources.add(de.fhbielefeld.smartuser.rest.OwnershipFilter.class);
        resources.add(de.fhbielefeld.smartuser.rest.ResourceResource.class);
        resources.add(de.fhbielefeld.smartuser.rest.SystemResource.class);
        resources.add(de.fhbielefeld.smartuser.rest.UserResource.class);
        resources.add(de.fhbielefeld.smartuser.rest.UserRightsResource.class);
    }
    
}
