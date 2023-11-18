package de.smartdata.porter.importer.parser.papendorf;

import de.smartdata.porter.importer.ImporterException;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import de.smartdata.porter.streamconverter.ConvertException;
import de.smartdata.porter.streamconverter.InputStreamConverter;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.HashMap;
import java.util.Map;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.xpath.XPath;
import javax.xml.xpath.XPathConstants;
import javax.xml.xpath.XPathExpression;
import javax.xml.xpath.XPathExpressionException;
import javax.xml.xpath.XPathFactory;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import jakarta.json.JsonObjectBuilder;

/**
 * ParserAnnotation for devices returning pv module data, iset-sensor data and
 * characteristic data in papendorf xml format.
 *
 * @see
 * http://git01-ifm-min.ad.fh-bielefeld.de/Forschung/scl/2015_04_SCL_Importer/wikis/PapendorfPV%20Parser
 * @author ffehring
 */
public class PapendorfPvParser extends Parser {

    @Override
    public String getDescription() {
        return "Imports data from papendorf pv files";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        // Check mimetype
        if (mimetype != null && mimetype.equalsIgnoreCase("application/xml")) {
            // Search content for "<!DOCTYPE sccdata"
            try {
                byte[] contentBytes = InputStreamConverter.toByteArray(is, 1100);
                String firstBytesStr = new String(contentBytes, StandardCharsets.UTF_8);
                if (firstBytesStr.contains("<item key=\"softwaretype\" value=\"psescc_mpp\"/>")) {
                    return true;
                }
            } catch (ConvertException ex) {
                ParserException pex = new ParserException("Could not check acceptance of inputstream. Error: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        } else {
            Message msg = new Message(this.getClass().getSimpleName() + " does not support mimetype >" + mimetype + "<", MessageLevel.ERROR);
            this.result.addMessage(msg);
        }
        return false;
    }

    @Override
    public void preParse() throws ParserException {
        // Nothing todo here
    }

    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        // Check additional requirements to configuration file
        Integer measurementsperminute = this.importer.getConfig().getInt("import.measurementsperminute", 0);

        // Check if each needed data is there
        if (measurementsperminute == 0) {
            measurementsperminute = 6;
        }

        // Get mapping of serials to collections into map
        JsonArray serialmapping = this.importer.getConfig().getJsonArray("papendorfpvparser.serialmapping");
        if (serialmapping == null) {
            throw new ParserException("Configuration entry >papendorfpvparser.serialmapping< is missing.");
        }
        Map<String, String> serialmap = new HashMap<>();
        for (int i = 0; i < serialmapping.size(); i++) {
            JsonObject curMapping = serialmapping.getJsonObject(i);
            serialmap.put(curMapping.getString("serial"), curMapping.getString("collection"));
        }

        Map<String, String> noCollectionMappings = new HashMap<>();

        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            // Open document for xml reading
            Document doc = builder.parse(is);
            // Get root element
            Element root = doc.getDocumentElement();

            // Get row elements (meseaurement block for one device and one minute; contains as many measurementpoints as mesured)
            NodeList rows = root.getElementsByTagName("row");

            // Work on mesurement block
            for (int i = 0; i < rows.getLength(); i++) {
                // Each row contains 6 mesurements
                result.datasetsAvailable += measurementsperminute;
                Element row = (Element) rows.item(i);

                // Block start time
                LocalDateTime blockStartTime;
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                    String subts = this.getKeyValue(row, "timestamp");
                    blockStartTime = LocalDateTime.parse(subts, formatter);
                } catch (DateTimeParseException ex1) {
                    throw new ParserException("Error parsing starttime: " + ex1.getLocalizedMessage());
                }

                // Get collection by serialnumber
                String serial = this.getKeyValue(row, "serialnumber");
                String curCollection = serialmap.get(serial);
                if (curCollection == null) {
                    noCollectionMappings.put(serial, "missing");
                }

                // Get data from all other available items in this block
                NodeList items = row.getElementsByTagName("item");
                // Create datasets
                List<JsonObjectBuilder> iudatasets = new ArrayList<>();
                int secondsPerDataset = 60 / measurementsperminute;
                for (int k = 0; k <= measurementsperminute-1; k++) {
                    JsonObjectBuilder curDataset = Json.createObjectBuilder();
                    // Create timepoint
                    LocalDateTime datasettime = blockStartTime.plusSeconds((k * secondsPerDataset));
                    curDataset.add("ts", datasettime.toString());
                    if (curCollection != null) {
                        curDataset.add("import.collection", curCollection);
                    }
                    iudatasets.add(curDataset);

                    // Log timepoint
                    if (result.datasetFromDate == null || result.datasetFromDate.isAfter(datasettime)) {
                        result.datasetFromDate = datasettime;
                    }
                    if (result.datasetUntilDate == null || result.datasetUntilDate.isBefore(datasettime)) {
                        result.datasetUntilDate = datasettime;
                    }
                }

                // Add data
                for (int k = 0; k < items.getLength(); k++) {
                    Element item = (Element) items.item(k);
                    // Get name and value of the item
                    String item_name = item.getAttribute("key");
                    String item_value = item.getAttribute("value");

                    // Exclude empty values
                    if (item_value.isEmpty() || item_value.isBlank()) {
                        continue;
                    }
                    
                    // Exclude global timestamp
                    if(item_name.equals("timestamp"))
                        continue;

                    // Special handling for charactristic
                    if (item_name.equals("characteristic")) {
                        result.datasetsAvailable++;
                        JsonObjectBuilder characteristicsDataset = this.calculateCharacteristicCurveValues(item_value);
                        characteristicsDataset.add("ts", blockStartTime.toString());
                        if (curCollection != null) {
                            characteristicsDataset.add("import.collection", curCollection + "_characteristics");
                        }
                        result.datasetsParsed++;
                        this.importer.addDataSet(characteristicsDataset.build());
                        continue;
                    }

                    // If name ends with number
                    Pattern p = Pattern.compile("\\d+");
                    Matcher m = p.matcher(item_name);
                    int datasetno = -1;
                    while (m.find()) {
                        datasetno = Integer.parseInt(m.group());
                    }

                    // Special handling for isset datasets
                    if (item_name.startsWith("irradiation_")) {
                        if (!item_value.isEmpty()) {
                            result.datasetsAvailable++;
                            JsonObjectBuilder curDataset = Json.createObjectBuilder();
                            LocalDateTime datasettime = blockStartTime.plusSeconds((datasetno-1) * secondsPerDataset);
                            curDataset.add("ts", datasettime.toString());
                            if (curCollection != null) {
                                curDataset.add("import.collection", curCollection + "_iset");
                            }
                            curDataset.add("irradiation", Double.parseDouble(item_value));
                            this.importer.addDataSet(curDataset.build());
                            result.datasetsParsed++;
                        }
                        continue;
                    }

                    if (datasetno > 0) {
                        String item_name_withoutno = item_name.replace("_" + datasetno, "");
                        try {
                            iudatasets.get((datasetno - 1)).add(item_name_withoutno, Double.parseDouble(item_value));
                        } catch (NumberFormatException ex) {
                            iudatasets.get((datasetno - 1)).add(item_name_withoutno, item_value);
                        }
                    } else {
                        Double item_double_value = null;
                        try {
                            item_double_value = Double.parseDouble(item_value);
                        } catch (NumberFormatException ex) {
                            //Nothing todo here use string
                        }
                        // Else add to every dataset
                        for (JsonObjectBuilder curSet : iudatasets) {
                            if (item_double_value != null) {
                                curSet.add(item_name, item_double_value);
                            } else {
                                curSet.add(item_name, item_value);
                            }
                        }
                    }
                }

                // Give datasets to importer
                for (JsonObjectBuilder curDataset : iudatasets) {
                    JsonObject dataset = curDataset.build();
                    this.importer.addDataSet(dataset);
                    result.datasetsParsed++;
                }
            }
            if (!noCollectionMappings.isEmpty()) {
                // Add message about not found block
                Message msg = new Message("Serials >" + noCollectionMappings.keySet() + "< are not mapped to collections.", MessageLevel.WARNING);
                result.addMessage(msg);
                noCollectionMappings.clear();
            }
        } catch (ParserConfigurationException ex) {
            ParserException ipe = new ParserException("Error in parser configuration: " + ex.getLocalizedMessage());
            ipe.addSuppressed(ex);
            throw ipe;
        } catch (SAXException ex) {
            ParserException ipe = new ParserException("SAXException: " + ex.getLocalizedMessage());
            ipe.addSuppressed(ex);
            throw ipe;
        } catch (IOException ex) {
            ParserException ipe = new ParserException("Error accessing file: " + ex.getLocalizedMessage());
            ipe.addSuppressed(ex);
            throw ipe;
        } catch (ImporterException ex) {
            ParserException pe = new ParserException("Could not add values " + ex.getLocalizedMessage());
            pe.addSuppressed(ex);
            throw pe;
        }
        return result;
    }

    /**
     * Gets the value of an item with the given key, placed under the given row.
     *
     * @param row Row where to search the key item
     * @param key Key of the item to search
     * @return Items value
     * @throws ParserException
     */
    public String getKeyValue(Element row, String key) throws ParserException {
        XPathFactory xPathfactory = XPathFactory.newInstance();
        XPath xpath = xPathfactory.newXPath();
        XPathExpression expr;
        try {
            expr = xpath.compile("item[@key='" + key + "']");
            NodeList nl = (NodeList) expr.evaluate(row, XPathConstants.NODESET);
            if (nl.getLength() < 1) {
                Logger.addMessage(
                        new Message(
                                "Dataset error: Missing " + key,
                                MessageLevel.ERROR)
                );
            } else if (nl.getLength() > 1) {
                Logger.addMessage(
                        new Message(
                                "Dataset error: Too much " + key + "s (" + nl.getLength() + ")",
                                MessageLevel.ERROR)
                );
            } else {
                Element blockKeyElement = (Element) nl.item(0);
                return blockKeyElement.getAttribute("value");
            }
        } catch (XPathExpressionException ex) {
            throw new ParserException("XPath error: " + ex.getLocalizedMessage());
        }
        return null;
    }

    /**
     * Calculates the timepoint of the measurement for values, that are named
     * after number of mesuerments per minute.
     *
     * @param blockStartTime Start time of block
     * @param name Name of the item
     * @return Timepoint referencing data
     */
    public LocalDateTime calculateTimePointFromName(LocalDateTime blockStartTime, String name, Integer measurementsperminute) {
        // Calculate seconds per step
        int secondsPerStep = 60 / measurementsperminute;

        // Get step number
        String[] name_parts = name.split("_");
        String stepNoStr = name_parts[name_parts.length - 1];
        try {
            int stepNo = Integer.parseInt(stepNoStr) - 1;
            LocalDateTime stepTime = blockStartTime.plusSeconds(stepNo * secondsPerStep);
            return stepTime;
        } catch (NumberFormatException ex) {
            return blockStartTime;
        }
    }

    /**
     * Calculate characteristic curves
     *
     * @param characteristic Charachteristic from xml
     * @return Map of voltage and current
     */
    private JsonObjectBuilder calculateCharacteristicCurveValues(String characteristic) {
        JsonObjectBuilder characteristiccurve = Json.createObjectBuilder();
        int counter = 1;
        for (int i = 0; i < characteristic.length(); i += 8) {
            String temp = characteristic.substring(i + 2, i + 2 + 2)
                    + characteristic.substring(i, i + 2);
            double voltage = Long.parseLong(temp, 16) / 100.0;
            temp = characteristic.substring(i + 6, i + 6 + 2)
                    + characteristic.substring(i + 4, i + 4 + 2);
            double current = Long.parseLong(temp, 16) / 1000.0;

            characteristiccurve.add("u" + counter, voltage);
            characteristiccurve.add("i" + counter, current);
            counter++;
        }
        return characteristiccurve;
    }
}
