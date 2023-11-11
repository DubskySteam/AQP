package de.smartdata.porter.importer;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.descriptors.SourceDescriptor;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonValue;
import jakarta.json.JsonValue.ValueType;
import jakarta.json.stream.JsonParser;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;

/**
 * Handles the import based on the given configuration
 * 
 * @author Florian Fehring
 */
public class ImportControler {
    
    private List<JsonObject> importTasks = new ArrayList<>();
    
    public ImportControler(String configuration) {
    
        JsonParser parser = Json.createParser(new StringReader(configuration));
        parser.next();
        
        // Get import
        JsonValue confdata = parser.getValue();
        if(null == confdata.getValueType()) {
            // Content will be ignored
        } else switch (confdata.getValueType()) {
            case OBJECT:
                this.importTasks.add(confdata.asJsonObject());
                break;
            case ARRAY:
                // If there is more than one import specified
                for(JsonValue curValue : confdata.asJsonArray()) {
                    if(curValue.getValueType() == ValueType.OBJECT) {
                        this.importTasks.add(curValue.asJsonObject());
                    } else {
                        // Content will be ignored
                    }
                }   break;
            default:
                break;
        }
    }
    
    /**
     * Runs the import
     * 
     * @return Imports result
     * @throws de.smartdata.porter.importer.ImportControlerException
     */
    public ImporterResult run() throws ImportControlerException {
        ImporterResult ir = new ImporterResult();
        for(JsonObject curConf : this.importTasks) {
            try {
                // Check if there is a importer configured
                if(!curConf.containsKey("importer")) {
                    Message msg = new Message("There is no importer defined in import configuration.",
                                    MessageLevel.USER_ERROR);
                    Logger.addMessage(msg);
                    ir.addMessage(msg);
                    continue;
                }
                
                // Get importer
                String importer = curConf.getString("importer");
                SourceDescriptor sd = new SourceDescriptor();
                Importer imp = null;
                switch(importer) {
                    case "FTPImporter":
                        sd.setName("FTPImporter");
                        imp = new FTPImporter(curConf, sd);
                        break;
                    case "HTTPImporter":
                        sd.setName("HTTPImporter");
                        imp = new HTTPImporter(curConf, sd);
                        break;
                    case "FilesImporter":
                        sd.setName("FilesImporter");
                        imp = new FilesImporter(curConf, sd);
                        break;
                    case "ValueImporter":
                        sd.setName("ValueImporter");
                        imp = new ValueImporter(curConf, sd);
                        break;
                    case "RequestImporter":
                        sd.setName("RequestImporter");
                        imp = new RequestImporter(curConf, sd);
                        break;
//                case "NetCDFImporter":
//                    SourceDescriptor sd = new SourceDescriptor();
//                    sd.setName("NetCDFImporter");
//                    NetCDFImporter imp = new NetCDFImporter(curImportConfig, sd);
//                    return imp.importFile();
                }
                
                if(imp == null) {
                    Message msg = new Message("Importer >" + importer + "< does not exists.",
                                    MessageLevel.USER_ERROR);
                    Logger.addMessage(msg);
                    ir.addMessage(msg);
                    continue;
                }
                
                // Use multithreading if activated
                if(curConf.getBoolean("usethreading", false)) {
                    Thread importthread = new Thread(imp);
                    importthread.start();
                    //TODO get import result after import
                } else {
                    imp.run();
                    System.out.println(imp.getResult());
                    ir.merge(imp.getResult());
                }
            } catch (ImporterException ex) {
                throw new ImportControlerException("Import could not be startet: " + ex.getLocalizedMessage());
            }
        }
        return ir;
    }
}
