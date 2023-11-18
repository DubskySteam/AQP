package de.smartdata.porter.importer;

import de.smartfile.filehandler.DirHandler;
import de.smartfile.filehandler.DirHandlerException;

import de.smartdata.porter.importer.descriptors.SourceDescriptor;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.values.converter.ValueConverter;
import de.smartdata.porter.values.converter.ValueConverterException;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.nio.file.DirectoryStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;
import java.nio.file.attribute.FileAttribute;
import java.nio.file.attribute.PosixFilePermission;
import java.nio.file.attribute.PosixFilePermissions;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.TreeMap;
import jakarta.json.JsonObject;

/**
 * Importer for importing data from files.
 *
 * @author ffehring
 */
public class FilesImporter extends StreamImporter {

    protected String source_dir;
    protected String working_dir;
    protected String archiv_dir;
    protected String inspection_dir;

    public FilesImporter(JsonObject config, SourceDescriptor sd) throws ImporterException {
        super(config, sd);
        // Get data from configuration
        source_dir = this.config.getString("sourcedir", null);
        working_dir = this.config.getString("workingdir", null);
        archiv_dir = this.config.getString("archivedir", null);
        inspection_dir = this.config.getString("inspectiondir", null);

        if (source_dir == null) {
            source_dir = "source";
            Message msg = new Message("sourcedir is missing in the configuration, useing >source<", MessageLevel.INFO);
            this.result.addMessage(msg);
        }
        if (working_dir == null) {
            working_dir = "working";
            Message msg = new Message("workingdir is missing in the configuration, useing >working<", MessageLevel.INFO);
            this.result.addMessage(msg);
        }
        if (archiv_dir == null) {
            archiv_dir = "archive";
            Message msg = new Message("archivedir is missing in the configuration, useing >archive<", MessageLevel.INFO);
            this.result.addMessage(msg);
        }
        if (inspection_dir == null) {
            inspection_dir = "inspection";
            Message msg = new Message("inspectiondir is missing in the configuration, useing >inspection<", MessageLevel.INFO);
            this.result.addMessage(msg);
        }
    }

    @Override
    public void run() {

        Path source_path = Paths.get(source_dir);
        Path working_path = Paths.get(working_dir);
        Path archiv_path = Paths.get(archiv_dir);
        Path inspection_path = Paths.get(inspection_dir);

        try {
            // Clean working directory
            DirHandler.clean(working_path, 0);
            // Move source files to working directory
            DirHandler.move(source_path, working_path, 5);

            // Unzip files in working directory
            Map<Path, Path> zipFilesMap = DirHandler.unzipFiles(working_path);

            // Loop trough files to get them sorted by date
            Map<LocalDateTime, List<Path>> filemap = new TreeMap<>();
            try ( DirectoryStream<Path> stream = Files.newDirectoryStream(working_path)) {
                for (Path p : stream) {
                    // Get files time from filename
                    LocalDateTime filestime = this.parseFilenameAsDate(p);
                    if (filestime == null) {
                        // Get filestime from last modified
                        filestime = LocalDateTime.ofInstant(Files.getLastModifiedTime(p).toInstant(), ZoneId.systemDefault());
                    }
                    if (!filemap.containsKey(filestime)) {
                        filemap.put(filestime, new ArrayList<>());
                    }
                    filemap.get(filestime).add(p);
                }
            }

            if (filemap.isEmpty()) {
                Message msg = new Message("There are no files to import in >" + source_path.toAbsolutePath() + "<", MessageLevel.WARNING);
                Logger.addDebugMessage(msg);
                this.result.addMessage(msg);
            }

            // List only files in simulation 2
            if (this.config.getBoolean("simulation", false)) {
                String filelist = "Found files: \r\n";
                int filesc = 0;
                for (List<Path> fileli : filemap.values()) {
                    for (Path file : fileli) {
                        filelist += file.getFileName() + " source: " + zipFilesMap.get(file.getFileName().toString()) + "\r\n";
                        filesc++;
                    }
                }
                filelist += "Sum: " + filesc + " files. \n\r";
                Logger.addMessage(new Message(filelist, MessageLevel.INFO));
                return;
            }

            int lastparsed = 0;
            int lastimported = 0;
            int lastignored = 0;
            int lastupdated = 0;
            int lastnotimported = 0;

            int filesmovedForInspection = 0;
            // Import each file
            for (List<Path> fileli : filemap.values()) {
                for (Path file : fileli) {
                    String fileerror = "";
                    this.result.filesAvailable++;
                    String filename = file.getFileName().toString();
                    this.sourceDescriptor = new SourceDescriptor();
                    this.sourceDescriptor.setName(filename);

                    Logger.addDebugMessage(new Message("Import file >" + filename + "<", MessageLevel.INFO));
                    try ( InputStream is = new FileInputStream(file.toFile())) {
                        //TODO for each file make a rule checkup (see Importcontroler/importStream)
                        ImporterResult streamImporterResult = this.importStream(is);
                        streamImporterResult.filesImported++;
                        is.close();
                        // Data is saved by streamImporter so do not call save here again

                        int sumParsed = streamImporterResult.datasetsParsed - lastparsed;
                        int sumSavehandled = (streamImporterResult.datasetsImported - lastimported 
                                + streamImporterResult.datasetsIgnored - lastignored
                                + streamImporterResult.datasetsUpdated - lastupdated);

                        if (sumParsed > sumSavehandled) {
                            fileerror = "Error importing >" + filename + "<: Only " 
                                    + (streamImporterResult.datasetsImported - lastimported) 
                                    + " datasets from " + sumParsed + " where imported." + System.lineSeparator()
                                    + " Parsed               : " + sumParsed + System.lineSeparator()
                                    + " Ignored  (by Parser) : " + (streamImporterResult.datasetsIgnored - lastignored) + System.lineSeparator()
                                    + " Imported             : " + (streamImporterResult.datasetsImported - lastimported) + System.lineSeparator()
                                    + " Not imported         : " + (streamImporterResult.datasetsNotImported - lastnotimported) + System.lineSeparator()
                                    + " updated: " + (streamImporterResult.datasetsUpdated - lastupdated) + System.lineSeparator()
                                    + " ------------------------------" + System.lineSeparator()
                                    + " sumSavehandled: " + sumSavehandled + System.lineSeparator() + System.lineSeparator()
                                    + " Messages: ";
                            for (Message curMsg : streamImporterResult.getMessages()) {
                                fileerror += System.lineSeparator() + curMsg.getMessage();
                            }
                            streamImporterResult.setMessages(new ArrayList<>());
                        } else if (streamImporterResult.smartdataErrors > 0) {
                            fileerror = "Error importing >" + filename + "<: SmartData reported errors: " + System.lineSeparator()
                                    + " Parsed: " + (streamImporterResult.datasetsParsed - lastparsed) + System.lineSeparator()
                                    + " Ignored  (by Parser) : " + (streamImporterResult.datasetsIgnored - lastignored) + System.lineSeparator()
                                    + " Imported: " + (streamImporterResult.datasetsImported - lastimported) + System.lineSeparator()
                                    + " Not imported         : " + (streamImporterResult.datasetsNotImported - lastnotimported) + System.lineSeparator()
                                    + " updated: " + (streamImporterResult.datasetsUpdated - lastupdated) + System.lineSeparator()
                                    + " ------------------------------" + System.lineSeparator()
                                    + " sumSavehandled: " + sumSavehandled + System.lineSeparator() + System.lineSeparator()
                                    + " Got errors from SmartData: ";
                            for (Message curMsg : streamImporterResult.getMessages()) {
                                fileerror += System.lineSeparator() + curMsg.getMessage();
                            }
                            streamImporterResult.setMessages(new ArrayList<>());
                        }
                        lastparsed = streamImporterResult.datasetsParsed;
                        lastimported = streamImporterResult.datasetsImported;
                        lastnotimported = streamImporterResult.datasetsNotImported;
                        lastignored = streamImporterResult.datasetsIgnored;
                        lastupdated = streamImporterResult.datasetsUpdated;
                    } catch (ImporterException ex) {
//                        this.result.addMessage(new Message(
//                                "Could not import file " + filename + ". FilesImporter: " + ex.getLocalizedMessage(),
//                                MessageLevel.ERROR)
//                        );
                        fileerror = "Error importing >" + filename + "<: FilesImporter reported ImporterException: " + ex.getLocalizedMessage();
                    } catch (Exception ex) {
                        StringWriter sw = new StringWriter();
                        ex.printStackTrace(new PrintWriter(sw));
//                        this.result.addMessage(new Message(
//                                "Could not import file " + filename + ". Not catched error: " + ex.getClass() + " : " + ex.getLocalizedMessage(),
//                                MessageLevel.ERROR)
//                        );
                        fileerror = "Error importing >" + filename + "< FilesImporter reported unhandled " + ex.getClass().getSimpleName() + ": " + ex.getLocalizedMessage() + " " + sw.toString();
                    } finally {
                        // Check if error occured
                        if (!fileerror.isEmpty()) {
                            // Move file to inspection dir
                            Path inspectionFilePath = inspection_path.resolve(file.getFileName());
                            try {
                                if (Files.notExists(inspection_path)) {
                                    if (System.getProperty("os.name").contains("Windows")) {
                                        Files.createDirectory(inspection_path);
                                    } else {
                                        Set<PosixFilePermission> perms
                                                = PosixFilePermissions.fromString("rwxrwx---");
                                        FileAttribute<Set<PosixFilePermission>> attr
                                                = PosixFilePermissions.asFileAttribute(perms);
                                        Files.createDirectory(inspection_path, attr);
                                    }
                                }
                                Files.move(file, inspectionFilePath, REPLACE_EXISTING);

                                filesmovedForInspection++;

                                String logfilename = file.getFileName().toString();
                                if(fileerror.contains("existiert bereits")) {
                                    logfilename += "_allreadyexists";
                                }
                                logfilename += "_error.log";
                                
                                //Create logfile for error
                                Path inspectionLogFilePath = inspection_path.resolve(logfilename);
                                Files.write(inspectionLogFilePath, fileerror.getBytes());
                            } catch (IOException ioex) {
                                this.result.addMessage(new Message(
                                        "Failed to move " + filename + " to inspection dir." + ioex.getMessage(),
                                        MessageLevel.ERROR)
                                );
                            }
                        } else {
                            // Move file to archive
                            try {
                                Path archiveFilePath = archiv_path.resolve(file.getFileName());
                                Files.createDirectories(archiveFilePath.getParent());
                                Files.move(file, archiveFilePath, REPLACE_EXISTING);
                            } catch (IOException ex) {
                                this.result.addMessage(new Message(
                                        "Can't move file >" + file + "< to archive cause: " + ex.getLocalizedMessage(),
                                        MessageLevel.ERROR)
                                );
                            }
                        }
                    }
                }
            }

            if (filesmovedForInspection > 0) {
                this.result.addMessage(
                    new Message(
                        "There where " + filesmovedForInspection + " files moved for inspection to >" + inspection_path.toAbsolutePath() + "<",
                         MessageLevel.ERROR)
                );
            }

        } catch (IOException ex) {
            Message msg = new Message(
                    "Could not import. Error access working dir >" + ex.getLocalizedMessage() + "<",
                    MessageLevel.ERROR);
            this.result.addMessage(msg);
            Logger.addMessage(msg);
        } catch (DirHandlerException ex) {
            Message msg = new Message("Could not import. " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            this.result.addMessage(msg);
            Logger.addMessage(msg);
        }
    }

    /**
     * Parses the filename as an localdatetime for sorting. If not possible,
     * returns null.
     *
     * @param file Name of the file
     * @return LocalDateTime of file or null if not available
     */
    public LocalDateTime parseFilenameAsDate(Path file) {
        String filename = file.getFileName().toString();

        List<String> failedPatterns = new ArrayList<>();

        // Try automatically parse filename into localdatetime
        try {
            return ValueConverter.objectToLocalDateTime(filename);
        } catch (ValueConverterException ex) {
            failedPatterns.add("DefaultPatterns");
        }
        int firstdotindex = filename.indexOf(".");
        int firstunderlineindex = filename.indexOf("_");

        if (firstdotindex < filename.length() - 4 && firstunderlineindex > firstdotindex) {
            try {
                // Working with files named like: TotSMS1.12_03_2014-15-00.xml
                String datestring = filename.substring(firstdotindex + 1, filename.length() - 4);
                int year = Integer.parseInt(datestring.substring(6, 10));
                int month = Integer.parseInt(datestring.substring(0, 2));
                int day = Integer.parseInt(datestring.substring(3, 5));
                int hour = Integer.parseInt(datestring.substring(11, 13));
                int minute = Integer.parseInt(datestring.substring(14, 16));
                return LocalDateTime.of(year, month, day, hour, minute);
            } catch (Exception ex) {
                failedPatterns.add("timestamp of pattern TotSMS1.12_03_2014-15-00.xml");
            }
        }
        if (firstdotindex < filename.length() - 4 && firstunderlineindex == -1) {
            try {
                // Working with files named like: TotSMS1.2016-01-13-09-00-01.xml
                String datestring = filename.substring(firstdotindex + 1, filename.length() - 4);
                int year = Integer.parseInt(datestring.substring(0, 4));
                int month = Integer.parseInt(datestring.substring(5, 7));
                int day = Integer.parseInt(datestring.substring(8, 10));
                int hour = Integer.parseInt(datestring.substring(11, 13));
                int minute = Integer.parseInt(datestring.substring(14, 16));
                int second = Integer.parseInt(datestring.substring(17, 19));

                return LocalDateTime.of(year, month, day, hour, minute, second);
            } catch (Exception ex) {
                failedPatterns.add("timestamp of pattern TotSMS1.2016-01-13-09-00-01.xml");
            }
        }

        try {
            int year = Integer.parseInt(filename.substring(0, 4));
            int month = Integer.parseInt(filename.substring(4, 6));
            int day = Integer.parseInt(filename.substring(6, 8));
            int hour = Integer.parseInt(filename.substring(8, 10));
            int minute = Integer.parseInt(filename.substring(10, 12));
            int second = Integer.parseInt(filename.substring(12, 14));

            return LocalDateTime.of(year, month, day, hour, minute, second);
        } catch (Exception ex) {
            failedPatterns.add("timestamp of pattern 20120619030535.xml");
        }
        Message msg = new Message("Could not parse filename >"
                + filename + "< with patterns.",
                MessageLevel.INFO);
        Logger.addDebugMessage(msg);
        return null;
    }
}
