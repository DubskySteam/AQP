package de.smartdata.porter.importer.parser.sui;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.ImporterException;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import de.smartdata.porter.streamconverter.InputStreamConverter;
import de.smartdata.porter.streamconverter.ConvertException;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.*;
import jakarta.json.Json;
import jakarta.json.JsonObjectBuilder;

/**
 * Parser for sui files from labor hellkennlinien messungen.
 *
 * @author jrathert
 */
public class SUIFormatParser extends Parser {

    // Groesse der Bytes in SUI-Dateien, die fuer Floats verwendet werden (siehe
    // IEEE 754 und Delphi-Datentyp "Single")
    private static final int FLOAT_BYTE_SIZE = 4;
    // Groesse der Bytes in SUI-Dateien, die fuer groessere Ganzzahlen verwendet
    // werden (siehe Delphi-Datentyp "Word")
    private static final int WORD_BYTE_SIZE = 2;
    // Groesse der Bytes von int-Werten in Java, wird verwendet zum Umwandeln von
    // 2-Byte-Words zu 4-Byte-Ints
    private static final int INT_BYTE_SIZE = 4;

    @Override
    public String getDescription() {
        return "Imports sui files";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        return filename.toLowerCase().endsWith(".sui");
        //TODO add check if file is valid
    }

    @Override
    public void preParse() throws ParserException {
        // Nothing todo here
    }

    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        byte[] bytes;
        try {
            bytes = InputStreamConverter.toByteArray(is, 1024 * 1024); // arbitrary limit, but I've never personally seen a .SUI-File above 1MB 
        } catch (ConvertException ex) {
            Message msg = new Message(ex.getClass().getSimpleName() + ": " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(msg);
            this.result.addMessage(msg);
            ParserException e = new ParserException("Failed to read input stream");
            e.addSuppressed(ex);
            throw e;
        }
        
        var numOfValues = readNumOfValues(bytes);
        var currentValues = readFloatValues(bytes, numOfValues, SUIFilePosition.CURRENT);
        var voltageValues = readFloatValues(bytes, numOfValues, SUIFilePosition.VOLTAGE);

        var ivPairs = buildIVPairs(currentValues, voltageValues);

        try {
            for (var pair : ivPairs) {
                JsonObjectBuilder db_row = Json.createObjectBuilder();
                db_row.add("current", (float) pair.get("current"));
                db_row.add("voltage", (float) pair.get("voltage"));
                this.importer.addDataSet(db_row.build());
                this.result.datasetsParsed++;
            }
        } catch (ImporterException ex) {
            Message msg = new Message(ex.getClass().getSimpleName() + ": " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(msg);
            this.result.addMessage(msg);
            ParserException e = new ParserException("Failed to add dataset");
            e.addSuppressed(ex);
            throw e;
        }

        return this.result;
    }

    private int readNumOfValues(byte[] allBytes) {
        var relevantBytes = new byte[INT_BYTE_SIZE];
        System.arraycopy(allBytes, SUIFilePosition.NUM_OF_MEASURED_VALUES.getPosition(), relevantBytes, 0,
                WORD_BYTE_SIZE);

        // Messwerte in SUI-Dateien haben immer einen Wert mehr, als in
        // NUM_OF_MEASURED_VALUES im File gespeichert ist
        return parseBytesToInt(relevantBytes) + 1;
    }

    private ArrayList<Float> readFloatValues(byte[] allBytes, int numOfValues, SUIFilePosition position) {
        var numRelevantBytes = FLOAT_BYTE_SIZE * numOfValues;

        var relevantBytes = new byte[numRelevantBytes];
        System.arraycopy(allBytes, position.getPosition(), relevantBytes, 0, numRelevantBytes);

        var parsedValues = new ArrayList<Float>();
        for (var i = 0; i < numRelevantBytes; i += FLOAT_BYTE_SIZE) {
            var floatBytes = new byte[FLOAT_BYTE_SIZE];
            System.arraycopy(relevantBytes, i, floatBytes, 0, FLOAT_BYTE_SIZE);

            var floatValue = parseBytesToFloat(floatBytes);
            parsedValues.add(floatValue);
        }

        return parsedValues;
    }

    private float parseBytesToFloat(byte[] bytes) {
        if (bytes.length != FLOAT_BYTE_SIZE) {
            throw new IllegalArgumentException(
                    "bytes is " + bytes.length + " instead of exactly " + FLOAT_BYTE_SIZE + " bytes long");
        }

        return ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).getFloat();
    }

    private int parseBytesToInt(byte[] bytes) {
        if (bytes.length != INT_BYTE_SIZE) {
            throw new IllegalArgumentException(
                    "bytes is " + bytes.length + " instead of exactly " + INT_BYTE_SIZE + " bytes long");
        }

        return ByteBuffer.wrap(bytes).order(ByteOrder.LITTLE_ENDIAN).getInt();
    }

    private Collection<HashMap<String, Object>> buildIVPairs(List<Float> currentValues, List<Float> voltageValues) {
        var pairs = new ArrayList<HashMap<String, Object>>();

        for (var i = 0; i < currentValues.size(); i++) {
            var pair = new HashMap<String, Object>();
            pair.put("current", currentValues.get(i));
            pair.put("voltage", voltageValues.get(i));

            pairs.add(pair);
        }

        return pairs;
    }

    /**
     * Enum f�r die byte-wise-Positionen innerhalb einer SUI-Datei. Code
     * �bernommen von Felix Meyer.
     */
    private enum SUIFilePosition {
        CURRENT(467), VOLTAGE(1467), NUM_OF_MEASURED_VALUES(2475);

        private final int position;

        SUIFilePosition(int position) {
            this.position = position;
        }

        public int getPosition() {
            return position;
        }
    }
}
