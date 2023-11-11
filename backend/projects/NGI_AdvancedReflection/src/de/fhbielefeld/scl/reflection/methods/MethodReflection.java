package de.fhbielefeld.scl.reflection.methods;

import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;
import org.reflections.Reflections;
import org.reflections.scanners.MethodAnnotationsScanner;
import org.reflections.util.ClasspathHelper;
import org.reflections.util.ConfigurationBuilder;

/**
 *
 * @author ffehring
 */
public class MethodReflection {
    
    /**
     * Gets all methods with the given annotation
     * 
     * @param packageName   Name of the package where to search
     * @param annotation    Annotation to search
     * @return List of all methods that are annotated with the annotation given
     */
    public static Set<Method> getMethodsWithAnnotation(String packageName, Class<? extends Annotation> annotation) {
        Reflections reflections = new Reflections(new ConfigurationBuilder()
                                    .setUrls(ClasspathHelper.forPackage("de.fhbielefeld.scl.database.rest"))
                                    .setScanners(new MethodAnnotationsScanner()));
        Set<Method> methods = reflections.getMethodsAnnotatedWith(annotation);
        if (methods == null) {
            // Set empty hashset (HashSet<Method> instead of HashSet for type safeity)
            methods = new HashSet<Method>();
        }
        return methods;
    }
    
    /**
     * Gets all methods from a given package that have a annotation and at least one param of the given class.
     * 
     * @param packageName   Package to search in
     * @param annotation    Annotation expected on the method
     * @param paramClass         Class of the param expected
     * @return List of methods with annotation and parameter
     */
    public static Set<Method> getMethodsWithAnnotationAndParam(String packageName, Class<? extends Annotation> annotation, Class paramClass) {
        Set<Method> methods = getMethodsWithAnnotation(packageName,annotation);
        return MethodReflection.filterForParentClass(methods, paramClass);
    }
    
    public static Set<Method> filterForParentClass(Set<Method> methods, Class paramClass) {
        Set<Method> result = new HashSet<>();
        for(Method curMethod : methods) {
            if(Arrays.asList(curMethod.getParameterTypes()).contains(paramClass)) {
                result.add(curMethod);
            }
        }
        return result;
    }
}
