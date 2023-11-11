package de.fhbielefeld.scl.reflection.packages;

import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryIteratorException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

/**
 * Package reflection for reflection methods on packages
 *
 * @author ffehring
 */
public class PackageReflection {

    /**
     * Get all subpackages for given package. (Only for packages outside the
     * jar)
     *
     * @param rootpackage Package to search subs at
     * @param recursive Recursive search?
     * @return List of found packages
     * @throws PackageReflectionException
     */
    public static List<String> getSubPackages(String rootpackage, boolean recursive) throws PackageReflectionException {

        // Build dirname from package name
        String[] packageParts = rootpackage.split("\\.");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < packageParts.length; i++) {
            sb.append(packageParts[i]);
            sb.append(File.separator);
        }
        String rootpackageDirName = sb.toString();
        // Create Path object
        Path parserPath = Paths.get(rootpackageDirName);

        List<String> subpackages = new ArrayList<>();
        // Get subpackages from directory
        try {
            DirectoryStream<Path> stream = Files.newDirectoryStream(parserPath, new DirectoriesFilter());
            for (Path entry : stream) {
                String[] pathParts = entry.toString().split(File.separator);
                StringBuilder sbp = new StringBuilder();
                for (int i = 0; i < pathParts.length; i++) {
                    sb.append(pathParts[i]);
                    sb.append(".");
                }
                String subpackageName = sbp.toString();
                subpackages.add(subpackageName);
                if (recursive == true) {
                    subpackages.addAll(PackageReflection.getSubPackages(subpackageName, recursive));
                }
            }
        } catch (DirectoryIteratorException ex) {
            throw new PackageReflectionException("DirectoryIteratorException. " + ex.getLocalizedMessage());
        } catch (IOException ex) {
            //throw new PackageReflectionException("I/O error encounted during the iteration, the cause is an IOException" + ex.getLocalizedMessage());
        }
        // Get subpackages from classloader (current only)
        subpackages.addAll(findPackageNamesStartingWith(rootpackage));
        
        System.out.println("Subpackages:");
        System.out.println(subpackages);
        return subpackages;
    }

    /**
     * Filter to get only directories from pathstream
     */
    private static class DirectoriesFilter implements DirectoryStream.Filter<Path> {

        @Override
        public boolean accept(Path entry) throws IOException {
            return Files.isDirectory(entry);
        }
    }

    /**
     * Gets a list of all packages available under the given prefix.
     * Important: Returns only at execution time known packages, that may be
     * not all packages of the application.
     * 
     * @param prefix
     * @return List of all packages prefixed with the given prefix
     */
    public static List<String> findPackageNamesStartingWith(String prefix) {
        List<String> packagenames = new ArrayList<>();
        for (Package curPackage : Package.getPackages()) {
            if (curPackage.getName().startsWith(prefix)) {
                packagenames.add(curPackage.getName());
            }
        }
        return packagenames;
    }
}
