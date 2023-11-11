package de.smartdata.porter.importer.parser.netcdf;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.ImporterException;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import jakarta.json.JsonValue;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.io.StringWriter;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import ucar.ma2.InvalidRangeException;
import ucar.nc2.Dimension;
import ucar.nc2.NetcdfFile;
import ucar.nc2.NetcdfFiles;
import ucar.nc2.Variable;

/**
 * Importer NetCDF files
 *
 * @author bstruzek
 */
public class NetCDFParser extends Parser {

    @Override
    public String getDescription() {
        return "Imports data from open weather map api";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        //TODO check importability
        return true;
    }

    @Override
    public void preParse() throws ParserException {
    }

    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        String filepath = this.importer.getSourceDescriptor().getPath();
        if (filepath == null) {
            filepath = "tempfile.nc";
        }

        try(FileOutputStream outputStream = new FileOutputStream(filepath)) {
            byte[] buffer = new byte[1024];
            int length;

            while ((length = is.read(buffer)) > 0) {
                outputStream.write(buffer, 0, length);
            }
        } catch (IOException ex) {
            Logger.addMessage(new Message(
                    "Could not open temp file: " + ex.getClass() + " : " + ex.getLocalizedMessage(),
                    MessageLevel.ERROR)
            );
        }

        // Check required configuration entries
        String missing = "";
        if (!this.importer.getConfig().containsKey("netcdf.sourceColumns")) {
            missing += ",netcdf.sourceColumns";
        }
        if (!missing.isEmpty()) {
            throw new ParserException("Configuration entries >" + missing + "< are missing. "
                    + "See documentation for further information about the missing configuration entries.");
        }

        try {
            // Get Dimensions that should be imported from configuration
            Map<String, DimensionRange> ranges = new HashMap<>();
            for (Entry<String, JsonValue> curEntry : this.importer.getConfig().entrySet()) {
                // if is a min / max config entry
                if (curEntry.getKey().contains("netcdf.section.") && (curEntry.getKey().contains(".min") || curEntry.getKey().contains(".max"))) {
                    String dimName = curEntry.getKey().replace("netcdf.section.", "").replace(".min", "").replace(".max", "");
                    // Create 
                    if (!ranges.containsKey(dimName)) {
                        ranges.put(dimName, new DimensionRange(dimName));
                    }
                    if (curEntry.getKey().contains(".min")) {
                        ranges.get(dimName).setFromValue(curEntry.getValue().toString());
                    }
                    if (curEntry.getKey().contains(".max")) {
                        ranges.get(dimName).setUntilValue(curEntry.getValue().toString());
                    }
                }
            }

            // Log dimensions to import
            boolean debugmode = false;
            if (this.importer.getConfig().containsKey("debugmode") && this.importer.getConfig().getBoolean("debugmode") == true) {
                debugmode = true;
                String msgt = "";
                for (Entry<String, DimensionRange> range : ranges.entrySet()) {
                    msgt += range.getKey() + ": " + range.getValue().getFromValue() + " until " + range.getValue().getUntilValue() + "\n\r";
                }
                Message msg = new Message(msgt, MessageLevel.INFO);
                Logger.addMessage(msg);
            }

            String sc = this.importer.getConfig().getString("netcdf.sourceColumns");
            String[] sourceColumns = sc.split(",");

            // Get overwrite time if specified
            LocalDateTime owts = null;
            if (this.importer.getConfig().containsKey("netcdf.overwrite.time")) {
                String owtime = this.importer.getConfig().getString("netcdf.overwrite.time");
                owts = LocalDateTime.parse(owtime);
            }

            try (NetcdfFile ncfile = NetcdfFiles.open(filepath)) {
                // Initialize NetCDF Reader, prepearing dimensions
                NetCDFFileReader reader = new NetCDFFileReader(ncfile, this.importer, this.result);
                reader.setOwTime(owts);
                String avinfo = "Available variables and dimensions: \n\r";
                for (Variable curVar : ncfile.getVariables()) {
                    if (!Arrays.stream(sourceColumns).anyMatch(curVar.getFullName()::equals)) {
                        continue;
                    }
                    if (debugmode == true) {
                        avinfo += curVar.getNameAndDimensions();
                        List<Dimension> dims = curVar.getDimensions();
                        for (Dimension curDim : dims) {
                            avinfo += "Dimension: " + curDim.getName() + " with lenght: " + curDim.getLength();
                        }
                    }
                    reader.readVariable(curVar.getFullName(), ranges, true);
                }

                if (debugmode == true) {
                    Logger.addMessage(new Message(avinfo, MessageLevel.INFO));
                }
            } catch (IOException ex) {
                Logger.addMessage(new Message("IOException while reading NetCDF file: " + ex.getLocalizedMessage(), MessageLevel.ERROR));
            } catch (InvalidRangeException ex) {
                Logger.addMessage(new Message("A given range is invalid: " + ex.getLocalizedMessage(), MessageLevel.ERROR));
            } catch (ImporterException ex) {
                ParserException exp = new ParserException("Could not import. Importer for sections reports error: " + ex.getLocalizedMessage());
                exp.addSuppressed(ex);
                throw exp;
            }
            return result;
        } catch (NumberFormatException ex) {
            StringWriter sw = new StringWriter();
            ex.printStackTrace(new PrintWriter(sw));
            Message msg = new Message(
                    "Could not import file. Error in given config file. Not catched error: " + ex.getClass() + " : " + ex.getLocalizedMessage(),
                    MessageLevel.ERROR);
            Logger.addMessage(msg);
            result.addMessage(msg);
        }

        return result;
    }
}
