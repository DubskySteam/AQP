package de.smartfile.filehandler;

import java.io.File;
import java.io.IOException;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * DirHandler provides methods for operations with directories
 *
 * @author ffehring
 */
public class DirHandler {

    /**
     * Cleans an directory recursive
     *
     * @param path Path of the directory
     * @param minold Time in seconds the files should be minimum old to be moved
     * @throws DirHandlerException
     */
    public static void clean(Path path, long minold) throws DirHandlerException {
        if (path == null) {
            throw new DirHandlerException("No path given");
        }
        if (Files.notExists(path)) {
            throw new DirHandlerException("Path >" + path.toAbsolutePath().toString() + "< does not exists.");
        }

        if (Files.isDirectory(path)) {
            try (DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
                for (Path sourcefile : stream) {
                    if (!Files.isDirectory(sourcefile)) {
                        File file = new File(sourcefile.toAbsolutePath().toUri());
                        // Ignore file when its to young
                        long diff = Instant.now().getEpochSecond() - (file.lastModified() / 1000);
                        if (diff < minold) {
                            continue;
                        }
                        Files.delete(sourcefile);
                    }
                }
            } catch (IOException ex) {
                throw new DirHandlerException("Error cleaning " + path.toString() + " cause: " + ex.getLocalizedMessage());
            }
        } else {
            throw new DirHandlerException("Path for cleaning is no directory " + path.toString());
        }
    }

    /**
     * Copy contents of an dir to another location.
     *
     * @param source Source directory
     * @param destination Destination directory (created if not existend)
     * @param supportedFileEndings
     * @param minold Copy only files that are minimum old
     * @return List of exceptions occured on files not affecting the whole
     * directory
     * @throws DirHandlerException
     */
    public static List<String> copy(Path source, Path destination, String[] supportedFileEndings, long minold) throws DirHandlerException {
        List<String> fileExceptions = new ArrayList<>();

        if (Files.notExists(source)) {
            throw new DirHandlerException("Source directory >" + source.toAbsolutePath() + "< does not exists");
        }
        if (!Files.isDirectory(source)) {
            throw new DirHandlerException("Source path is no directory");
        }
        if (Files.notExists(destination)) {
            try {
                Files.createDirectory(destination);
            } catch (IOException ex) {
                throw new DirHandlerException("Could not create destination directory " + ex.getLocalizedMessage());
            }
        }
        if (!Files.isDirectory(destination)) {
            throw new DirHandlerException("Destination path is no directory");
        }

        // Copy contents
        try(DirectoryStream<Path> sourcestream = Files.newDirectoryStream(source)) {
            for (Path sourcefile : sourcestream) {
                Path destfile = Paths.get(destination.toString() + "/" + sourcefile.getFileName());
                try {
                    if (supportedFileEndings != null) {
                        for (String supportedFileEnding : supportedFileEndings) {
                            if (sourcefile.getFileName().toString().endsWith(supportedFileEnding)) {
                                Files.copy(sourcefile, destfile);
                                //copiedfiles++;
                                break;
                            }
                        }
                    } else if (!Files.isDirectory(sourcefile)) {
                        File file = new File(sourcefile.toAbsolutePath().toUri());
                        // Ignore file when its to young
                        long diff = Instant.now().getEpochSecond() - (file.lastModified() / 1000);
                        if (diff < minold) {
                            continue;
                        }

                        Files.copy(sourcefile, destfile);
                        //copiedfiles++;
                    }
                } catch (IOException ex) {
                    fileExceptions.add("Could not copy " + sourcefile.toAbsolutePath() + " to " + destfile.toAbsolutePath() + " cause: " + ex.getMessage());
                }
            }
        } catch (IOException ex) {
            throw new DirHandlerException("Could not access source dir for copy " + source.toAbsolutePath());
        }

        return fileExceptions;
    }

    /**
     * Copies all files from source to destination directory
     *
     * @param source Source directory
     * @param destination Destination directory (created if not existend)
     * @param minold Time in seconds that should the file be old to be copied
     * @return List of exceptions occured on files not effecting the whole
     * directory
     * @throws DirHandlerException
     */
    public static List<String> copy(Path source, Path destination, long minold) throws DirHandlerException {
        return DirHandler.copy(source, destination, null, minold);
    }

    /**
     * Moves all contents from one path to another
     *
     * @param source Path of the source directory
     * @param destination Path of the destination directory (created if not
     * existend)
     * @param minold Time in seconds the files should be minimum old to be moved
     * @throws DirHandlerException
     */
    public static void move(String source, String destination, long minold) throws DirHandlerException {
        Path sourcepath = Paths.get(source);
        Path destpath = Paths.get(destination);
        DirHandler.move(sourcepath, destpath, minold);
    }

    /**
     * Moves all contents from one path to another
     *
     * @param source Source path
     * @param destination Destination path (created if not existend)
     * @param minold Time in seconds the files should be minimum old to be moved
     * @throws DirHandlerException
     */
    public static void move(Path source, Path destination, long minold) throws DirHandlerException {
        DirHandler.copy(source, destination, minold);
        DirHandler.clean(source, minold);
    }

//    /**
//     * Unzips all files from the source directory to the destination directory
//     * and returns an orderd map of all files sorted and ordered by time.
//     *
//     * @param source
//     * @param destination
//     * @param supportedFileEndings
//     * @return
//     */
//    public Map<LocalDateTime, List<Path>> unzipTo(Path source, Path destination, String[] supportedFileEndings) throws DirHandlerException {
//        List<String> fileExceptions = new ArrayList<>();
//
//        if (Files.notExists(source)) {
//            throw new DirHandlerException("Source directory does not exists");
//        }
//        if (!Files.isDirectory(source)) {
//            throw new DirHandlerException("Source path is no directory");
//        }
//        if (Files.notExists(destination)) {
//            try {
//                Files.createDirectory(destination);
//            } catch (IOException ex) {
//                throw new DirHandlerException("Could not create destination directory " + ex.getLocalizedMessage());
//            }
//        }
//        if (!Files.isDirectory(destination)) {
//            throw new DirHandlerException("Destination path is no directory");
//        }
//
//        // Copy contents
//        DirectoryStream<Path> sourcestream;
//        try {
////            int copiedfiles = 0;
//            sourcestream = Files.newDirectoryStream(source);
//            for (Path sourcefile : sourcestream) {
//                Path destfile = Paths.get(destination.toString() + "/" + sourcefile.getFileName());
//                try {
//                    if (supportedFileEndings != null) {
//                        for (String supportedFileEnding : supportedFileEndings) {
//                            if (sourcefile.getFileName().toString().endsWith(supportedFileEnding)) {
//                                Files.copy(sourcefile, destfile);
//                                if (destfile.toString().endsWith(".zip") || destfile.toString().endsWith(".gz")) {
//                                    Unzipper.gUnzip(destfile.toString());
//                                }
//                                break;
//                            }
//                        }
//                    } else if (!Files.isDirectory(sourcefile)) {
//                        Files.copy(sourcefile, destfile);
//                        if (destfile.toString().endsWith(".zip") || destfile.toString().endsWith(".gz")) {
//                            Unzipper.gUnzip(destfile.toString());
//                        }
//                    }
//                } catch (IOException ex) {
//                    fileExceptions.add("Could not copy " + sourcefile.toAbsolutePath() + " to " + destfile.toAbsolutePath() + " cause: " + ex.getMessage());
//                }
//            }
//            sourcestream.close();
//        } catch (IOException ex) {
//            throw new DirHandlerException("Could not access source dir for copy " + source.toAbsolutePath());
//        }
//
//        return fileExceptions;
//    }
    /**
     * Unzips all files in the given path.
     *
     * @param path Path to directory
     * @return Map with all unzipped files and the outzipped files
     * @throws DirHandlerException
     */
    public static Map<Path, Path> unzipFiles(Path path) throws DirHandlerException {
        Map<Path, Path> unzippedMap = new HashMap<>();
        if (Files.notExists(path)) {
            throw new DirHandlerException("Path >" + path.toString() + "< does not exists.");
        }
        if (!Files.isDirectory(path)) {
            throw new DirHandlerException("Source path is no directory");
        }
        
        try(DirectoryStream<Path> stream = Files.newDirectoryStream(path)) {
            for (Path file : stream) {
                if (Files.isDirectory(file)) {
                    unzippedMap.putAll(DirHandler.unzipFiles(file));
                } else if (file.toString().endsWith(".zip") || file.toString().endsWith(".gz")) {
                    unzippedMap.putAll(Unzipper.gUnzip(file.toString()));
                    Files.delete(file);
                }
            }
        } catch (IOException ex) {
            throw new DirHandlerException("Error accessing directory " + ex.getLocalizedMessage());
        }
        return unzippedMap;
    }
}
