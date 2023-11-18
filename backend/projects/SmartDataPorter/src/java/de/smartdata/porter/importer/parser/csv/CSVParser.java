package de.smartdata.porter.importer.parser.csv;

import org.apache.commons.csv.*;
import java.io.InputStream;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.ImporterException;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonString;
import jakarta.json.JsonValue;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;

/**
 * Parser for csv files from labor hellkennlinien messungen.
 *
 * @author iarent
 */
public class CSVParser extends Parser {

    @Override
    public String getDescription() {
        return "Imports csv files";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        //TODO implement check if parser is applicable
        return true;
    }

    @Override
    public void preParse() throws ParserException {
        // Nothing todo here
    }

    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        // Get format options from configuration
        String format = this.importer.getConfig().getString("csv.format", "DEFAULT");
        String delimiterStr = this.importer.getConfig().getString("csv.delimiter", ";");
        char delimiter = delimiterStr.charAt(0);

        // Build CSV Format options
        CSVFormat csvFormat;
        switch(format) {
            case "EXCEL":
                csvFormat = CSVFormat.EXCEL;
                break;
            default:
                csvFormat = CSVFormat.DEFAULT;
        }
        csvFormat = csvFormat.withDelimiter(delimiter).withTrim();

        // Get header from configuration
        JsonArray jsonHeaders = this.importer.getConfig().getJsonArray("csv.headers");
        List<String> headers = new ArrayList<>();
        if (jsonHeaders != null) {
            for (JsonValue curHeader : jsonHeaders) {
                headers.add(((JsonString) curHeader).getString());
            }
            String[] headersArr = new String[2];
            headersArr = headers.toArray(headersArr);
            
            csvFormat = csvFormat.withHeader(headersArr)
                    .withSkipHeaderRecord(true)
                    .withIgnoreHeaderCase();
        }
        
        // Create type mapping
        JsonArray jsonMapping = this.importer.getConfig().getJsonArray("csv.mapping");
        
        // Create Reader and parser for csv contents
        Reader reader = new InputStreamReader(is);
        org.apache.commons.csv.CSVParser csvParser;
        try {
            csvParser = new org.apache.commons.csv.CSVParser(reader, csvFormat);
        } catch (IOException ex) {
            Message msg = new Message(ex.getClass().getSimpleName() + ": " + ex.getLocalizedMessage(), MessageLevel.ERROR);
            Logger.addMessage(msg);
            this.result.addMessage(msg);
            return this.result;
        }

        // Check if flatten-mode is active
        boolean flatten = this.importer.getConfig().getBoolean("flatten", false);
        JsonObjectBuilder flattedDataSet = Json.createObjectBuilder();
        
        // Get records
        int i=-1;
        for (CSVRecord csvRecord : csvParser) {
            i++;
            if(!flatten)
                this.result.datasetsAvailable++;
            // Create record dataset
            JsonObjectBuilder dataSet = Json.createObjectBuilder();
                
            for(JsonValue curMapping : jsonMapping) {
                JsonObject curMappingObj = curMapping.asJsonObject();
                JsonValue curCSVColumnJson = curMappingObj.get("csv_column");
                if(curCSVColumnJson == null) {
                    Message msg = new Message(">csv_column< must be given in mapping.", MessageLevel.USER_ERROR);
                    Logger.addMessage(msg);
                    this.result.addMessage(msg);
                    continue;
                }
                String curCSVColumn;
                // Get value of colum (csv contains only strings)
                String curValueStr;
                switch (curCSVColumnJson.getValueType()) {
                    case NUMBER:
                        // Get value if column is identified by number
                        curCSVColumn = curMappingObj.getInt("csv_column")+"";
                        curValueStr = csvRecord.get(curMappingObj.getInt("csv_column"));
                        break;
                    case STRING:
                        // Get value if column is identified by header name
                        curCSVColumn = curMappingObj.getString("csv_column");
                        curValueStr = csvRecord.get(curCSVColumn);
                        break;
                    default:
                        Message msg = new Message("A value of type >" + curCSVColumnJson.getValueType() + "< is not expected for csv_column.", MessageLevel.USER_ERROR);
                        Logger.addMessage(msg);
                        this.result.addMessage(msg);
                        continue;
                }
                
                String dbColumnName = curMappingObj.getString("db_column",null);
                if(dbColumnName == null)
                    dbColumnName = curCSVColumn;
                switch(curMappingObj.getString("type")) {
                    case "double":
                        curValueStr = curValueStr.replace(",", ".");
                        double dval = -999.0;
                        try {
                            dval = Double.parseDouble(curValueStr);
                        } catch(NumberFormatException ex) {
                            Message msg = new Message("Value >"+ curValueStr +"< for >" + dbColumnName + "< in row " + i + " of file >" + "< is not a valid double.", MessageLevel.ERROR);
                            Logger.addMessage(msg);
                            this.result.addMessage(msg);
                        }
                        if(!flatten)
                            dataSet.add(dbColumnName, dval);
                        else
                            flattedDataSet.add(dbColumnName + i, dval);
                        break;
                    case "int":
                        int ival = -999;
                        try {
                            ival = Integer.parseInt(curValueStr);
                        } catch(NumberFormatException ex) {
                            Message msg = new Message("Value >"+ curValueStr +"< for >" + dbColumnName + "< in row " + i + " of file >" + "< is not a valid integer.", MessageLevel.ERROR);
                            Logger.addMessage(msg);
                            this.result.addMessage(msg);
                        }
                        if(!flatten)
                            dataSet.add(dbColumnName, ival);
                        else 
                            flattedDataSet.add(dbColumnName + i, ival);
                        break;
                    default:
                        if(!flatten)
                            dataSet.add(dbColumnName, curValueStr);
                        else
                            flattedDataSet.add(dbColumnName + i, curValueStr);
                }
            }
            
            if(!flatten) {
                try {
                    this.importer.addDataSet(dataSet.build());
                    this.result.datasetsParsed++;
                } catch (ImporterException ex) {
                    Message msg = new Message(ex.getClass().getSimpleName() + ": " + ex.getLocalizedMessage(), MessageLevel.ERROR);
                    Logger.addMessage(msg);
                    this.result.addMessage(msg);
                }
            }
        }

        if(flatten) {
            if(i > -1)
                this.result.datasetsAvailable++;
            try {
                JsonObject dataset = flattedDataSet.build();
                this.importer.addDataSet(dataset);
                this.result.datasetsParsed++;
            } catch (ImporterException ex) {
                Message msg = new Message(ex.getClass().getSimpleName() + ": " + ex.getLocalizedMessage(), MessageLevel.ERROR);
                Logger.addMessage(msg);
                this.result.addMessage(msg);
            }
        }
        
        try {
            is.close();
        } catch (IOException ex) {
            Message msg = new Message(ex.getClass().getSimpleName() + ": " + ex.getLocalizedMessage(), MessageLevel.WARNING);
            Logger.addMessage(msg);
            this.result.addMessage(msg);
        }
        
        return result;
    }
}