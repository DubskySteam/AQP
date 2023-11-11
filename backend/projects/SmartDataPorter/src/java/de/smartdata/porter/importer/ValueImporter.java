package de.smartdata.porter.importer;

import de.smartdata.porter.importer.descriptors.SourceDescriptor;
import jakarta.json.JsonObject;

/**
 * Importer for values, that are delivered without file, stream, database or so.
 * This can be used as API to insert data into the database.
 * 
 * @author ffehring
 */
public class ValueImporter extends Importer {
    
    public ValueImporter(JsonObject config, SourceDescriptor sd) throws ImporterException {
        super(config);
    }
    
    /**
     * Imports the previous collected data into database.
     * 
     * @return ImporterResult
     * @throws ImporterException 
     */
    public ImporterResult runImport() throws ImporterException {
        return this.saveDatasets();
    }

    @Override
    public void run() {
        throw new UnsupportedOperationException("Not supported yet."); //To change body of generated methods, choose Tools | Templates.
    }
    
    /**
     * Adds an key-value pair under the given timestamp.
     * If there is an open import process, this will import useing that open 
     * process. If there is no open import process, it will create an process 
     * for this one dataset only.
     * 
     * @param ts            Timestamp under wich to safe data
     * @param item_name     Key of the data
     * @param item_value    Datas value
     * @return Returns the Map of ImportResults mapped by configuration
     * 
     * @throws ParserException 
     */
//    public Map<ImportConfiguration, ParserResult> addValue(LocalDateTime ts, String item_name, String item_value) throws ParserException {
//        // Check if an process is opened
//        boolean singleProcess = false;
//        if(this.isInitialized==false) {
//            this.initialise();
//            singleProcess = true;
//        }
//        
//        if(this._importConfList==null) {
//            throw new ParserException("addDataTable called without loaded import configuration.");
//        }
//        
//        // Save data to every defined database
//        for(ImportConfiguration curConf : this._importConfList) {
//            ParseImporter curGrabber = curConf.getValueGrabber();
//            curGrabber.addValue(ts, item_name, item_value);
//        }
//        
//        // Stop import process if it was opend for one set only
//        if(singleProcess==true) {
//            try {
//                Map<ImportConfiguration, ParserResult> results = this.saveDatasets();
//                this.stop();
//                return results;
//            } catch (PersistenceException ex) {
//                ParserException ipe = new ParserException("Could not save data: " + ex.getLocalizedMessage());
//                ipe.addSuppressed(ex);
//                throw ipe;
//            }
//        }
//        return null;
//    }
    
    /**
     * Methode nutzt den ParseImporter um multiple Daten ueber String-Splittung in die Obkejte zu sammeln.
     * @param ts String Timestamp
     * @param item_names String names
     * @param item_values String values
     * @throws ParserException 
     */
//    public Map<ImportConfiguration, ParserResult> addDataTable(LocalDateTime ts, String item_names, String item_values) throws ParserException {
//        // Check if an process is opened
//        boolean singleProcess = false;
//        if(this.isInitialized==false) {
//            this.initialise();
//            singleProcess = true;
//        }
//        
//        // Save data to every defined database
//        String[] tmp_item_names = item_names.split(",");
//        String[] tmp_item_values = item_values.split(",");
//        for(ImportConfiguration curConf : this._importConfList) {
//            ParseImporter curGrabber = curConf.getValueGrabber();
//            curGrabber.addDataTable(ts, tmp_item_names, tmp_item_values);
//        }
//        
//        // Stop import process if it was opend for one set only
//        if(singleProcess==true) {
//            try {
//                Map<ImportConfiguration, ParserResult> results = this.saveDatasets();
//                this.stop();
//                return results;
//            } catch (PersistenceException ex) {
//                ParserException ipe = new ParserException("Could not save data: " + ex.getLocalizedMessage());
//                ipe.addSuppressed(ex);
//                throw ipe;
//            }
//        }
//        return null;
//    }
    
    /**
     * Imports an single dataset.
     * If there is an open import process, this will import useing that open 
     * process. If there is no open import process, it will create an process 
     * for this one dataset only.
     * 
     * @param dataset   Dataset to save
     * @throws ParserException 
     */
//    public Map<ImportConfiguration, ParserResult> addDataSet(DataSet dataset) throws ParserException {
//        // Check if an process is opened
//        boolean singleProcess = false;
//        if(this.isInitialized==false) {
//            this.initialise();
//            singleProcess = true;
//        }
//        
//        for(Entry<String,Object> entry : dataset.getData().entrySet()) {
//            this.addValue(dataset.getTs(), entry.getKey(), entry.getValue().toString());
//        }
//        
//        // Stop import process if it was opend for one set only
//        if(singleProcess==true) {
//            try {
//                Map<ImportConfiguration, ParserResult> results = this.saveDatasets();
//                this.stop();
//                return results;
//            } catch (PersistenceException ex) {
//                ParserException ipe = new ParserException("Could not save data: " + ex.getLocalizedMessage());
//                ipe.addSuppressed(ex);
//                throw ipe;
//            } 
//        }
//        return new HashMap<>();
//    }
    
    /**
     * Imports an list of datasets.
     * If there is an open import process, this will import useing that open 
     * process. If there is no open import process, it will create an process 
     * for all of the given datasets.
     * 
     * @param datasets
     * @throws ParserException 
     */
//    public Map<ImportConfiguration, ParserResult> addDataSets(List<DataSet> datasets) throws ParserException, SQLException {
//        boolean setProcess = false;
//        if(this.isInitialized==false) {
//            this.initialise();
//            setProcess = true;
//        }
//        
//        for(DataSet curSet : datasets) {
//            this.addDataSet(curSet);
//        }
//        
//        if(setProcess==true) {
//            try {
//                Map<ImportConfiguration, ParserResult> results = this.saveDatasets();
//                this.stop();
//                return results;
//            } catch (PersistenceException ex) {
//                ParserException ipe = new ParserException("Could not save data: " + ex.getLocalizedMessage());
//                ipe.addSuppressed(ex);
//                throw ipe;
//            }
//        }
//        return null;
//    }
    
//    public ParserResult importFile(InputStream file) 
//                                                   throws ParserException{
//        ParserResult result = new ParserResult();
//        try{          
//            for(ImportConfiguration curConf : this._importConfList) {
//                ImportParserStream ips =(ImportParserStream)curConf.getParser();
//                if(ips != null){
//                    ips.preParse();
//                    result = result.merge(ips.parseStream(file));
//                    result = result.merge(ips.saveDatasets());
//                }else{
//                    result.setMsg("No Parser Found");
//                    result.setMsgLevel(ParserResult.MsgLevel.Error);
//                }
//            }
//        } catch (PersistenceException ex) {
//            ParserException ipe = new ParserException
//                          ("Could not save data: " + ex.getLocalizedMessage());
//            ipe.addSuppressed(ex);
//            throw ipe;
//        }
//        return result;

//return null;
//    }
    
    /**
     * Saves all added values to the databse.
     * This can be thourght of as "comit"
     * 
     * @return Map with ImportReslts mapped to ImportConfiguration
     */
//    @Override
//    public ImporterResult saveDatasets() throws PersistenceException {
//        // Save values
//        ImporterResult ir = super.saveDatasets();
//        return ir;
//    }
}
