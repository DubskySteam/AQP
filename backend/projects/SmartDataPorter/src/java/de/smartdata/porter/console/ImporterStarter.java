package de.smartdata.porter.console;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.ImportControler;
import de.smartdata.porter.importer.ImportControlerException;
import de.smartdata.porter.importer.ImporterResult;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import org.apache.commons.cli.CommandLine;
import org.apache.commons.cli.CommandLineParser;
import org.apache.commons.cli.HelpFormatter;
import org.apache.commons.cli.Options;
import org.apache.commons.cli.ParseException;
import org.apache.commons.cli.PosixParser;

/**
 * Überarbeitete Version des Startens des Imports
 *
 * @author ffehring
 */
public class ImporterStarter {

    // Available commandline options
    private static final Options OPTIONS;

    static {
        OPTIONS = new Options()
                .addOption("h", "help", false, "Show this help.")
                .addOption("config", true, "Specifies the location of config file.");
    }

    public static void main(String[] args) {

        String configfilepath = null;
        try {
            // Get commandline options
            CommandLineParser cmdParser = new PosixParser();
            CommandLine cmd = cmdParser.parse(OPTIONS, args);

            // Print help and exit
            if (cmd.hasOption("h")) {
                ImporterStarter.printHelpAndExit();
            }

            if (cmd.hasOption("config")) {
                configfilepath = cmd.getOptionValue("config");
                // Read configuration
                File file = new File(configfilepath);
                try ( FileInputStream fis = new FileInputStream(file)) {
                    byte[] data = new byte[(int) file.length()];
                    fis.read(data);
                    String configuration = new String(data, "UTF-8");
                    // Build ImportControler
                    ImportControler ih = new ImportControler(configuration);
                    // Run import
                    ImporterResult ir = ih.run();
                    Message msg = new Message(ir.toString(), MessageLevel.INFO);
                    Logger.addMessage(msg);
                }
            } else {
                ImporterStarter.printHelpAndExit();
            }
        } catch (ParseException ex) {
            System.err.println("Could not parse console parameter: " + ex.getLocalizedMessage());
            System.exit(1);
        } catch (ImportControlerException ex) {
            System.err.println("Could not run import: " + ex.getLocalizedMessage());
            System.exit(1);
        } catch (IOException ex) {
            System.err.println("Could not read configuration file >" + configfilepath + "<: " + ex.getLocalizedMessage());
        }
    }

    /**
     * Print help instructions to the standard output and exit the program
     */
    public static void printHelpAndExit() {
        StringBuilder strBuilder = new StringBuilder();
        // Headline
        strBuilder.append("SmartDataPorter V. 4.0 - Help");
        // Print help instructions
        new HelpFormatter().printHelp("java -jar <programm name> -config <config-file> [-debug]", OPTIONS);
        System.exit(0);
    }
}
