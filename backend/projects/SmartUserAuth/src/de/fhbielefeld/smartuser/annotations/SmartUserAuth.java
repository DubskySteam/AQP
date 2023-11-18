package de.fhbielefeld.smartuser.annotations;

import jakarta.ws.rs.NameBinding;
import static java.lang.annotation.ElementType.METHOD;
import static java.lang.annotation.ElementType.TYPE;
import java.lang.annotation.Retention;
import static java.lang.annotation.RetentionPolicy.RUNTIME;
import java.lang.annotation.Target;

/**
 * This annotation indicates that the annotated method is only accessable when
 * user is identificated and has the proper rights.
 * 
 * @author ffehring
 */
@NameBinding
@Retention(RUNTIME)
@Target({TYPE,METHOD})
public @interface SmartUserAuth {
    
}
