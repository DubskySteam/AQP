package de.smartdata.porter.importer.parser.gebaeudedpv;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonReader;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

/**
 * ParseImporter for the PV system on the D building of the university
 *
 * @see
 * http://git04-ifm-min.ad.fh-bielefeld.de/forschung/smartecosystem/smartdataporter/-/wikis/anwendung/Parser/GebaeudeDPVParser
 * @author
 */
public class GebaeudeDPVParser extends Parser {

    @Override
    public String getDescription() {
        return "Imports data from the Raspberry PI that captures the data from the sunsnifferpi on the roof";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        //TODO implement check if parser is applicable
        return true;
    }

    @Override
    public void preParse() throws ParserException {
        //Nothing todo here
    }

    @Override
    public ParserResult parse(InputStream is) throws ParserException {

        String filename = this.importer.getSourceDescriptor().getName();
        filename = filename.substring(filename.lastIndexOf("/") + 1);

        // Get date from filename
        String tsName = filename.replace("data_", "").replace(".json", "");
        tsName = tsName.replace("__", ":");
        tsName = tsName.replace("_", " ");
        tsName = tsName.replace("-", ".");
        tsName = tsName.replace("%3A", ":");

        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy MM dd HH mm ss");
            LocalDateTime ldt = LocalDateTime.parse(tsName, formatter);
            result.datasetFromDate = ldt;
            result.datasetUntilDate = ldt;
        } catch (DateTimeParseException ex) {
            Message msg = new Message("Could not parse datetime >" + tsName + "<", MessageLevel.ERROR);
            Logger.addMessage(msg);
        }

        try {
            JsonReader reader = Json.createReader(is);
            JsonObject root = reader.readObject();

            // metadata
//            JsonObject gateway = root.getJsonObject("Gateway");
//            JsonObject inverter = root.getJsonObject("Inverters");
//            JsonObject meters = root.getJsonObject("EnergyMeters");
            // data
            JsonObject strings = root.getJsonObject("Strings");
            JsonObject sensors = root.getJsonObject("EnvironmentSensors");

//            LocalDateTime ldt = LocalDateTime.now();
//            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;          
            if (strings == null || sensors == null) {
                throw new ParserException("Given file is no valid PV data file.");
            }

            // Get mapping of serials to collections into map
            JsonArray serialmapping = this.importer.getConfig().getJsonArray("gebaeudedpvparser.serialmapping");
            if (serialmapping == null) {
                throw new ParserException("Configuration entry >gebaeudedpvparser.serialmapping< is missing.");
            }

            Map<String, String> serialmap = new HashMap<>();
            for (int i = 0; i < serialmapping.size(); i++) {
                JsonObject curMapping = serialmapping.getJsonObject(i);
                serialmap.put(curMapping.getString("serial"), curMapping.getString("collection"));
            }

            JsonArray string_devices = strings.getJsonArray("devices");
            // Collect every string data
            for (int i = 0; i < string_devices.size(); i++) {
                JsonObject pv_string = string_devices.getJsonObject(i);

                double string_voltage = pv_string.getJsonNumber("stringVoltage").doubleValue();
                double string_temperature = pv_string.getJsonNumber("temperature").doubleValue();
                double string_current = pv_string.getJsonNumber("stringCurrent").doubleValue();
                String string_id = String.valueOf(pv_string.getJsonObject("info").getJsonNumber("id").intValue());
//                String string_startTs = String.valueOf(strings.get("startTs"));
//                String string_endTs = String.valueOf(strings.get("endTs"));

                JsonObjectBuilder string_dataset = Json.createObjectBuilder();
//                string_dataset.add("ts", ldt.format(formatter));
                string_dataset.add("ts", tsName);
//                string_dataset.add("start_ts", string_startTs);
//                string_dataset.add("end_ts", string_endTs);
                string_dataset.add("voltage", string_voltage);
                string_dataset.add("current", string_current);
                string_dataset.add("temperature", string_temperature);

                String string_curCollection = serialmap.get(string_id);
                if (string_curCollection != null) {
                    string_dataset.add("import.collection", string_curCollection);
                    JsonObject string_jsonSet = string_dataset.build();
                    this.importer.addDataSet(string_jsonSet);
                } else {
                    Message msg = new Message("Data for string >" + string_id + "< not imported. There is no database mapping.", MessageLevel.WARNING);
                    Logger.addDebugMessage(msg);
                }
                result.datasetsParsed++;

                Map<String, ArrayList<JsonObject>> importedModules = new HashMap<>();
                JsonObject module_att = pv_string.getJsonObject("Modules");
                JsonArray modules = module_att.getJsonArray("devices");
                // Collect every module data
                for (int k = 0; k < modules.size(); k++) {
                    JsonObject module = modules.getJsonObject(k);
                    double voltage = module.getJsonNumber("moduleVoltage").doubleValue();
                    double temperature = module.getJsonNumber("moduleTemperature").doubleValue();
                    String serial = module.getJsonString("moduleSerial").getString();
                    String curCollection = serialmap.get(serial);
//                    String startTs = String.valueOf(module_att.get("startTs"));
//                    String endTs = String.valueOf(module_att.get("endTs"));
                    result.datasetsParsed++;
                    if (curCollection == null || "".equals(curCollection)) {
                        Message msg = new Message("Values for module with serial >" + serial + "< not added. There is no database mapping.", MessageLevel.WARNING);
                        Logger.addDebugMessage(msg);
                        continue;
                    }

//                    if(voltage != 0 && temperature != -273.2){
                    JsonObjectBuilder dataset = Json.createObjectBuilder();
//                        dataset.add("start_ts", startTs);
//                        dataset.add("end_ts", endTs);
                    dataset.add("voltage", voltage);
                    dataset.add("temperature", temperature);
//                        dataset.add("ts", ldt.format(formatter));
                    dataset.add("ts", tsName);
                    dataset.add("current", string_current);
                    dataset.add("import.collection", curCollection);
                    JsonObject jsonSet = dataset.build();

                    // Check for duplicates
                    boolean duplicate = false;
                    if (importedModules.containsKey(serial)) {
                        for (JsonObject curSet : importedModules.get(serial)) {
                            if (curSet.getJsonNumber("voltage").doubleValue() == voltage
                                    && curSet.getJsonNumber("temperature").doubleValue() == temperature
                                    && curSet.getJsonNumber("current").doubleValue() == string_current
                                    && curSet.getJsonString("import.collection").getString().equals(curCollection)) {
                                duplicate = true;
                                break;
                            }
                        }
                    } else {
                        importedModules.put(serial, new ArrayList<>());
                    }
                    if (!duplicate) {
                        importedModules.get(serial).add(jsonSet);
                        this.importer.addDataSet(jsonSet);
                    }
                }
            }

            JsonArray sensor_devices = sensors.getJsonArray("devices");
            // Collect every sensor data
            for (int k = 0; k < sensor_devices.size(); k++) {
                JsonObject sensor = sensor_devices.getJsonObject(k);
                double rawvalue = sensor.getJsonNumber("rawValue").doubleValue();
                double value = sensor.getJsonNumber("value").doubleValue();
//                String startTs = String.valueOf(sensors.get("startTs"));
//                String endTs = String.valueOf(sensors.get("endTs")); 

                JsonObjectBuilder dataset = Json.createObjectBuilder();
                dataset.add("ts", tsName);
//                dataset.add("start_ts", startTs);
//                dataset.add("end_ts", endTs);
                dataset.add("rawvalue", rawvalue);
                dataset.add("value", value);
//                dataset.add("ts", ldt.format(formatter));

                String curCollection = serialmap.get("irradiation_1");
                dataset.add("import.collection", curCollection);
                JsonObject jsonSet = dataset.build();
                this.importer.addDataSet(jsonSet);
                result.datasetsParsed++;
            }
        } catch (Exception ex) {
            ParserException pe = new ParserException("Could not add values. Exception: " + ex.getLocalizedMessage());
            ex.printStackTrace();
            pe.addSuppressed(ex);
            throw pe;
        }
        return result;
    }
}
