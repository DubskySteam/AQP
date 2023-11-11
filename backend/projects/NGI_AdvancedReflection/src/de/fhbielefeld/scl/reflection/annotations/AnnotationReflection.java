package de.fhbielefeld.scl.reflection.annotations;

import java.lang.annotation.Annotation;
import java.util.Set;
import org.reflections.Reflections;

/**
 * Methods for working with annotations.
 * 
 * @author ffehring
 */
public class AnnotationReflection {
    /**
     * Returns all classes that have the given annotation and are present in the
     * given package.
     * 
     * @param packageName Name of the package where to search classes
     * @param annotation Annotation to be searched
     * @return 
     */
    public static Set<Class<?>> getClassesWithAnnotation(String packageName, Class<? extends Annotation> annotation) {
        Reflections reflections = new Reflections(packageName);
        return reflections.getTypesAnnotatedWith(annotation);
    }   
}
