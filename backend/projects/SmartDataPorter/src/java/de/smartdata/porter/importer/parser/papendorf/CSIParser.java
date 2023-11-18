package de.smartdata.porter.importer.parser.papendorf;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.ImporterException;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import de.smartdata.porter.streamconverter.ConvertException;
import de.smartdata.porter.streamconverter.InputStreamConverter;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.NamedNodeMap;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;
import org.xml.sax.InputSource;

/**
 * ParserAnnotation for devices returning pv module data, iset-sensor data and
 * characteristic data in papendorf xml format.
 *
 * @see
 * http://git01-ifm-min.ad.fh-bielefeld.de/Forschung/scl/2015_04_SCL_Importer/wikis/CR1000%20Plugin
 * @author ffehring
 */
public class CSIParser extends Parser {

    @Override
    public String getDescription() {
        return "Imports data from CSI xml files";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        if (mimetype != null && mimetype.equalsIgnoreCase("application/xml")) {
            try {
                byte[] contentBytes = InputStreamConverter.toByteArray(is, 70);
                String firstBytesStr = new String(contentBytes, StandardCharsets.UTF_8);
                if (firstBytesStr.contains("<csixml version=\"1.0\">")) {
                    return true;
                }
            } catch (ConvertException ex) {
                ParserException pex = new ParserException("Could not check acceptance of inputstream. Error: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        } else {
            Message msg = new Message(this.getClass().getSimpleName() + " does not support mimetype >" + mimetype + "<", MessageLevel.WARNING);
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
        try {
            DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
            DocumentBuilder builder = factory.newDocumentBuilder();
            // Open document for xml reading
            InputSource inputs = new InputSource(is);
            inputs.setEncoding("ISO-8859-1");
            Document doc = builder.parse(inputs);
            // Get root element
            Element docroot = doc.getDocumentElement();

            // Get mesurement names
            Map<String, String> measurementsMap = new HashMap<>();
            NodeList fields = docroot.getElementsByTagName("field");
            for (int i = 1; i <= fields.getLength(); i++) {
                Node curNode = fields.item(i - 1);
                NamedNodeMap curAttributes = curNode.getAttributes();
                String curMeasurement = curAttributes.getNamedItem("name").getNodeValue();
//                String curMeasurementType = null;
//                Node unitsnode = curAttributes.getNamedItem("units");
//                if (unitsnode != null) {
//                    curMeasurementType = unitsnode.getNodeValue();
//                }

                //Add data
                measurementsMap.put("v" + i, curMeasurement);
            }
            Message msg = new Message("Found fields: " + measurementsMap + " in file >" + this.importer.getSourceDescriptor().getName() + "<", MessageLevel.INFO);
            Logger.addDebugMessage(msg);

            if (measurementsMap.isEmpty()) {
                return result;
            }
            // Get row elements (meseaurement block for one minute)
            NodeList records = docroot.getElementsByTagName("r");

            for (int j = 0; j < records.getLength(); j++) {
                Node record = records.item(j);
                String timestring = record.getAttributes().getNamedItem("time").getNodeValue();
                // Convert given UTC time to local time
                LocalDateTime ts = LocalDateTime.parse(timestring);
                ZonedDateTime zts = ts.atZone(ZoneId.of("UTC"));
                ZonedDateTime ztslocal = zts.withZoneSameInstant(ZoneId.of("Europe/Berlin"));
                ts = ztslocal.toLocalDateTime();

                // Data for statistics
                result.datasetsAvailable++;
                if (result.datasetFromDate == null || ts.isBefore(result.datasetFromDate)) {
                    result.datasetFromDate = ts;
                }
                if (result.datasetUntilDate == null || ts.isAfter(result.datasetUntilDate)) {
                    result.datasetUntilDate = ts;
                }

                NodeList values = record.getChildNodes();
                JsonObjectBuilder dataset = Json.createObjectBuilder();
                int foundValues = 0;
                for (int i = 0; i < values.getLength(); i++) {
                    Node curNode = values.item(i);
                    if (measurementsMap.containsKey(curNode.getNodeName())) {
                        String curValue = curNode.getTextContent();
                        try {
                            dataset.add(measurementsMap.get(curNode.getNodeName()), Double.parseDouble(curValue));
                        } catch (NumberFormatException ex) {
                            dataset.add(measurementsMap.get(curNode.getNodeName()), curValue);
                        }

                        foundValues++;
                    }
                }
                if (foundValues == 0) {
                    result.datasetsNotParsed++;
                } else {
                    dataset.add("ts", ts.toString());
                    this.importer.addDataSet(dataset.build());
                    result.datasetsParsed++;
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
}
