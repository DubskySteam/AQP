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
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
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
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;

/**
 * ParserAnnotation for devices returning pv module data, iset-sensor data and
 * characteristic data in papendorf xml format.
 *
 * @see
 * http://git01-ifm-min.ad.fh-bielefeld.de/Forschung/scl/2015_04_SCL_Importer/wikis/PapendorfPyr%20Plugin
 * @author ffehring
 */
public class PapendorfPyrParser extends Parser {

    @Override
    public String getDescription() {
        return "Imports data from papendorf pyranometer files";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        if (mimetype != null && mimetype.equalsIgnoreCase("application/xml")) {
            try {
                byte[] contentBytes = InputStreamConverter.toByteArray(is, 1500);
                String firstBytesStr = new String(contentBytes, StandardCharsets.UTF_8);
                System.out.println(firstBytesStr);
                if (firstBytesStr.contains("<item key=\"softwaretype\" value=\"psescc_wxt520\"/>")
                        && firstBytesStr.contains("<item key=\"class\" value=\"Multiscan\"/>")) {
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
        Integer measurementsperminute = this.importer.getConfig().getInt("import.measurementsperminute",6);

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
            LocalDateTime blockStartTime = null;
            for (int j = 0; j < rows.getLength(); j++) {
                Element row = (Element) rows.item(j);

                // Block start time
                try {
                    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
                    blockStartTime = LocalDateTime.parse(this.getKeyValue(row, "timestamp"), formatter);
                } catch (DateTimeParseException ex1) {
                    throw new ParserException("Error parsing starttime: " + ex1.getLocalizedMessage());
                }

                // Get data from all other available items in this block
                NodeList items = row.getElementsByTagName("item");
                // Look at mesurement item
                for (int k = 0; k < items.getLength(); k++) {
                    Element item = (Element) items.item(k);
                    // Get name of the item
                    String item_name = item.getAttribute("key");
                    String item_value = item.getAttribute("value");
                    
                    if(item_value.isBlank() || item_value.isEmpty())
                        continue;

                    if (item_name.contains("_irradiance")) {
                        result.datasetsAvailable++;
                        // Get timepoint from name
                        LocalDateTime timepoint = this.calculateTimePointFromName(blockStartTime, item_name, measurementsperminute);
                        // Log timepoint
                        if (result.datasetFromDate == null || result.datasetFromDate.isAfter(timepoint)) {
                            result.datasetFromDate = timepoint;
                        }
                        if (result.datasetUntilDate == null || result.datasetUntilDate.isBefore(timepoint)) {
                            result.datasetUntilDate = timepoint;
                        }

                        JsonObjectBuilder dataset = Json.createObjectBuilder();
                        dataset.add("ts", timepoint.toString());
                        dataset.add("irradiance", Double.parseDouble(item_value));

                        JsonObject datasetobj = dataset.build();
                        this.importer.addDataSet(datasetobj);
                        result.datasetsParsed++;
                    }
                }
            }
        } catch (ParserConfigurationException ex) {
            throw new ParserException("Error in parser configuration: " + ex.getLocalizedMessage());
        } catch (SAXException ex) {
            throw new ParserException("SAXException: " + ex.getLocalizedMessage());
        } catch (IOException ex) {
            throw new ParserException("Error accessing file: " + ex.getLocalizedMessage());
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
        String stepNoStr = name_parts[0].replace("ms01", "");
        try {
            int stepNo = Integer.parseInt(stepNoStr) - 1;
            LocalDateTime stepTime = blockStartTime.plusSeconds(stepNo * secondsPerStep);
            return stepTime;
        } catch (NumberFormatException ex) {
            return blockStartTime;
        }
    }
}
