package de.smartfile.filehandler;

import de.smartfile.filehandler.DirHandlerException;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import java.io.BufferedInputStream;
import java.io.BufferedOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.zip.GZIPInputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * Klasse zum Entpacken komprimierter Dateien
 *
 * @author Lars Niemann
 *
 */
public class Unzipper {

    /**
     * Methode zum Entpacken einer komprimierten Archivs
     *
     * @param source
     * @throws de.smartfile.filehandler.DirHandlerException
     */
    public static Map<Path,Path> gUnzip(String source) throws DirHandlerException {
        Map<Path,Path> unzippedFiles = new HashMap<>();
        
        Path sourceFile = Paths.get(source);
        Path destDir = Paths.get(source).getParent();
        if (source.toLowerCase().endsWith(".gz")) {
            Map<Path,Path> subUnzippedFiles = extractGzipArchive(sourceFile, destDir);
            unzippedFiles.putAll(subUnzippedFiles);
        } else if (source.toLowerCase().endsWith(".zip")) {
            Map<Path,Path> subUnzippedFiles = extractZipArchive(sourceFile, destDir);
            unzippedFiles.putAll(subUnzippedFiles);
        }
        
        return unzippedFiles;
    }

    /**
     * Methode zum Entpacken eines GZipArchives
     *
     * @param archive Pfad zum gezippten Objekt
     * @param destDir Pfad zum zu entpackenden Objekt
     * @return A map of names of unzipped files
     * @deprecated use GzipHandler from FileHandler Project instead
     */
    @Deprecated
    public static Map<Path,Path> extractGzipArchive(Path archive, Path destDir) {
        Map<Path,Path> unzippedFiles = new HashMap<>();
        
        InputStream is = null;
        OutputStream os = null;

        try {
            String sourceFileName = archive.getFileName().toString();
            String destFileName = sourceFileName.substring(0, sourceFileName.length()-3);
            Path targetFile = Paths.get(destDir.toString() + "/" + destFileName);
            is = new GZIPInputStream(new FileInputStream(archive.toFile()));
            os = new FileOutputStream(destDir.toString() + "/" + destFileName);

            byte[] buffer = new byte[8192];

            for (int length; (length = is.read(buffer)) != -1;) {
                os.write(buffer, 0, length);
            }
            unzippedFiles.put(targetFile,archive);
        } catch (IOException e) {
            Logger.addMessage(new Message("Can't unpack " + archive.toString() + ": " + e.getLocalizedMessage(), MessageLevel.WARNING));
        } finally {
            if (os != null) {
                try {
                    os.close();
                } catch (IOException e) {
                }
            }
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                }
            }
        }
        
        return unzippedFiles;
    }

    /**
     * Methode zum Entpacken eines ZipArchives
     *
     * @param archive Pfad zum gezippten Objekt
     * @param destDir Pfad zum zu entpackenden Objekt
     * @return 
     * @throws de.smartfile.filehandler.DirHandlerException
     * @deprecated Use ZipHandler from FileHander Project instead
     */
    @Deprecated
    public static Map<Path,Path> extractZipArchive(Path archive, Path destDir) throws DirHandlerException {
        Map<Path,Path> unzippedFiles = new HashMap<>();
        
        try {
            ZipFile zipFile = new ZipFile(archive.toFile());
            Enumeration entries = zipFile.entries();

            byte[] buffer = new byte[16384];
            int len;
            while (entries.hasMoreElements()) {
                ZipEntry entry = (ZipEntry) entries.nextElement();

                String entryFileName = entry.getName();
                
                Path targetFile = Paths.get(destDir.toString() + "/" + entryFileName);

                File dir = dir = buildDirectoryHierarchyFor(entryFileName, destDir);
                if (!dir.exists()) {
                    dir.mkdirs();
                }

                if (!entry.isDirectory()) {
                    BufferedOutputStream bos = new BufferedOutputStream(
                            new FileOutputStream(new File(destDir.toFile(), entryFileName)));

                    BufferedInputStream bis = new BufferedInputStream(zipFile
                            .getInputStream(entry));

                    while ((len = bis.read(buffer)) > 0) {
                        bos.write(buffer, 0, len);
                    }

                    bos.flush();
                    bos.close();
                    bis.close();
                    unzippedFiles.put(targetFile,archive);
                }
            }
            zipFile.close();
        } catch (IOException ex) {
            throw new DirHandlerException("Error unpacking file: " + archive.toString() + " Error: " + ex.getLocalizedMessage());
        }
        
        return unzippedFiles;
    }

    /**
     * Methode zum Erzeugen eines Pfades
     *
     * @param entryName Pfad zum gezippten Objekt
     * @param destDir Pfad zum zu entpackenden Objekt
     */
    private static File buildDirectoryHierarchyFor(String entryName, Path destDir) {
        int lastIndex = entryName.lastIndexOf('/');
        String entryFileName = entryName.substring(lastIndex + 1);
        String internalPathToEntry = entryName.substring(0, lastIndex + 1);
        return new File(destDir.toFile(), internalPathToEntry);
    }
}
