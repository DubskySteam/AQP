package de.fhbielefeld.scl.reflection.classes;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.HashSet;
import java.util.Set;
import org.reflections.Reflections;

/**
 *
 * @author ffehring
 */
public class ClassReflection {
    
    /**
     * Gets all classes from a package, that extends the given class.
     * 
     * @param packageName Name of the package, where to search
     * @param extendedClass Class wich should be extended
     * @return List of classes extending the given class
     */
    public static <T extends Object> Set<Class<? extends T>> getClassesThatExtends(String packageName, Class<T> extendedClass) {
        Reflections reflections = new Reflections(packageName);
        return reflections.getSubTypesOf(extendedClass);
    }
    
    /**
     * Get all classes from a list of methods, that are annotated with the given annotation
     * 
     * @param methods   Set of methods to search in
     * @param annotation Annotation to search
     * @return List of Classes that have the annotation
     */
    public static Set<Class> getClassesWithAnnotation(Set<Method> methods, Class<? extends Annotation> annotation) {
        Set<Class> result = new HashSet<>();
        for(Method curMethod : methods) {
            if(curMethod.getDeclaringClass().isAnnotationPresent(annotation)) {
                result.add(curMethod.getDeclaringClass());
            }
        }
        return result;
    }
}
