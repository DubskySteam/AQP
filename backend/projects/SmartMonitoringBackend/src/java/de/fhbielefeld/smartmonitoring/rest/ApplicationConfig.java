package de.fhbielefeld.smartmonitoring.rest;

import java.util.Set;
import jakarta.ws.rs.core.Application;
import org.glassfish.jersey.media.multipart.MultiPartFeature;

/**
 * Automatisch Erstellte Klasse durch Netbeans, verwaltet REST Klassen
 * @author Nils Leunig, dstarke
 */
@jakarta.ws.rs.ApplicationPath("smartmonitoring")
public class ApplicationConfig extends Application {

    @Override
    public Set<Class<?>> getClasses() {
        Set<Class<?>> resources = new java.util.HashSet<>();
        addRestResourceClasses(resources);
        resources.add(MultiPartFeature.class);
        resources.add(de.fhbielefeld.scl.rest.exceptions.handlers.GeneralExceptionMapper.class);
//        resources.add(de.fhbielefeld.scl.rest.proxy.RESTProxyFeature.class);
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
        resources.add(de.fhbielefeld.smartmonitoring.rest.LocationJoinOoResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.LocationResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.MeasurementTypeResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.ObservedObjectMetadataResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.ObservedObjectMetadataTypeResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.ObservedObjectResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.ObservedObjectTypeJoinMeasurementTypeResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.ObservedObjectTypeJoinMetadataTypeResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.ObservedObjectTypeResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.SystemResource.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.ZSystemService.class);
        resources.add(de.fhbielefeld.smartmonitoring.rest.ZSystemTest.class);
    }
}
