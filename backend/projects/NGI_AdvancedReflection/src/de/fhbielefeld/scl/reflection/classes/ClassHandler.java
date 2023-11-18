package de.fhbielefeld.scl.reflection.classes;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URISyntaxException;
import java.net.URL;
import java.net.URLClassLoader;
import java.util.ArrayList;
import java.util.List;

/**
 * Methods for handling multiple classes with reflection
 *
 * @author ffehring
 */
public class ClassHandler {

    /**
     * Loads all available classes from the given directory.
     *
     * @param path System dependend path to directory
     * @return List of found classes
     * @throws ClassHandlerException
     */
    public static List<Class> getAvailableClasses(String path) throws ClassHandlerException {
        return ClassHandler.getAvailableClasses(path, null);
    }

    /**
     * Loads all available classes from the given directory with specified
     * class.
     *
     * @param path System dependend path to directory
     * @param type Class that found classes have to implement
     * @return List of found classes
     * @throws ClassHandlerException
     */
    public static List<Class> getAvailableClasses(String path, Class type) throws ClassHandlerException {
        List<Class> classes = new ArrayList<>();
        try {
            URL resource = java.lang.ClassLoader.getSystemClassLoader().getResource(path);
            File dir = new File(resource.toURI());
            if (dir.isDirectory()) {
                File[] files = dir.listFiles();
                for (File file : files) {
                    // Only include class files
                    if (file.getName().contains(".class")) {
                        Class curClass = Class.forName(file.getName());
                        // Check type of class
                        if (type == null || curClass.isInstance(type)) {
                            curClass.getInterfaces();
                            classes.add(curClass);
                        }
                    }
                }
            }
        } catch (URISyntaxException ex) {
            throw new ClassHandlerException("URI is not valid");
        } catch (ClassNotFoundException ex) {
            throw new ClassHandlerException("Class not found " + ex.getLocalizedMessage());
        }
        return classes;
    }

    /**
     * HotPlugs an class found under path and with packagename.
     *
     * @param sources       Dirs and jars where to search for hot plug classes
     * @param packagename   Name of the package, where the class is located
     * @param type          Type of class to load, if null every
     * @return
     * @throws ClassHandlerException
     */
    public static List<Class> getHotPlugClasses(List<File> sources, String packagename, Class type) throws ClassHandlerException {
        // Create classloader for this plug event
        try {
            URL[] urls = new URL[sources.size()];
            List<File> dirs = new ArrayList<>();
//            List<File> jars = new ArrayList<>();
            for(int i=0; i < sources.size(); i++) {
                urls[i] = sources.get(i).toURI().toURL();
//                if(sources.get(i).isFile()) {
//                    
//                }
                if(sources.get(i).isDirectory()) {
                    dirs.add(sources.get(i));
                }
            }
            // Create classloader
            URLClassLoader cl = new URLClassLoader(urls);
            // TODO possible fix for problem, when useing classloader in jsf application?
            //ClassLoader cl = new URLClassLoader(urls, sources.getClass().getClassLoader());
            
            
            // Load files
//            for(File curJar : jars) {
//                Class cls = cl.loadClass("javax.json.JsonObject");
//            }
            // Load directories
            List<Class> classes = new ArrayList<>();
            for(File curDir : dirs) {
                classes.addAll(getClassesRecursive(cl, curDir, curDir));
            }
            return classes;
        } catch (MalformedURLException ex) {
            throw new ClassHandlerException("URI for classloader is not valid: " + ex.getLocalizedMessage());
        }
    }
    
    public static List<Class> getClassesRecursive(ClassLoader cl, File dir, File startdir) {
        List<Class> classes = new ArrayList<>();
        
            if (dir.isDirectory()) {
                File[] files = dir.listFiles();
                for (File file : files) {
                    // Recursive call
                    if (file.isDirectory()) {
                        classes.addAll(getClassesRecursive(cl,file,startdir));
                    }
                    // Only include class files
                    if (file.getName().contains(".class")) {
                        try {
                            
                            String packagename = dir.getPath().replace(startdir.getPath()+File.separator, "").replace(File.separator, ".");
                            String classname = file.getName().replace(".class", "");
                            
                            Class<?> c = cl.loadClass(packagename + "." + classname);
                            
                            classes.add(c);
                        } catch (ClassNotFoundException ex) {
                            System.out.println("Warning: Class from file " + file.getName() + " could not be created. Is it in the right directory?");
                            //Logger.getLogger(ClassHandler.class.getName()).log(Level.SEVERE, null, ex);
                        }
                    }
                }
            }
        
        return classes;
    }
}
