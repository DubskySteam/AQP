package de.smartdata.porter.importer;

import de.smartdata.porter.importer.parser.ParserResult;
import de.fhbielefeld.scl.logger.message.Message;
import de.smartdata.porter.result.Result;
import java.time.LocalDateTime;

/**
 * Collect results of parser run
 *
 * @author ffehring
 */
public class ImporterResult extends Result {

    // Target storage and collection of import
    public Importer importer;
    public String target;
    public Integer filesAvailable = 0;
    public Integer filesImported = 0;
    public Integer datasetsAvailable = 0;
    public Integer datasetsParsed = 0;
    public Integer datasetsNotParsed = 0;
    public Integer datasetsImported = 0;
    public Integer datasetsUpdated = 0;
    public Integer datasetsIgnored = 0;
    public Integer datasetsNotImported = 0;

    public LocalDateTime datasetFromDate;
    public LocalDateTime datasetUntilDate;
    
    public Integer smartdataErrors = 0;
    
    public Long timeUsed = 0L;

    public Importer getImporter() {
        return importer;
    }

    public void setImporter(Importer importer) {
        this.importer = importer;
    }

    public String getTarget() {
        return target;
    }

    public void setTarget(String target) {
        this.target = target;
    }

    public int getFilesAvailable() {
        return filesAvailable;
    }

    public int getFilesImported() {
        return filesImported;
    }

    public ImporterResult addParserResult(ParserResult pr) {
        // Merge data from ParserResult
        this.datasetsAvailable += pr.datasetsAvailable;
        this.datasetsNotParsed += pr.datasetsNotParsed;
        this.datasetsParsed += pr.datasetsParsed;

        if ((this.datasetFromDate != null && pr.datasetFromDate != null) && this.datasetFromDate.isAfter(pr.datasetFromDate)) {
            this.datasetFromDate = pr.datasetFromDate;
        } else if(this.datasetFromDate == null && pr.datasetFromDate != null) {
            this.datasetFromDate = pr.datasetFromDate;
        }

        if ((this.datasetUntilDate != null && pr.datasetUntilDate != null) && this.datasetUntilDate.isBefore(pr.datasetUntilDate)) {
            this.datasetUntilDate =  pr.datasetUntilDate;
        } else if(this.datasetUntilDate == null && pr.datasetUntilDate != null) {
            this.datasetUntilDate = pr.datasetUntilDate;
        }
        
        // Copy messages
        this.messages.addAll(pr.getMessages());

        // Clear parser result
        pr.clear();
        
        return this;
    }

    /**
     * Merges two results into an summazing result
     *
     * @param ipr Result to merge with current result
     */
    public void merge(ImporterResult ipr) {
        this.datasetsAvailable += ipr.datasetsAvailable;
        this.datasetsParsed += ipr.datasetsParsed;
        this.datasetsNotParsed += ipr.datasetsNotParsed;
        this.datasetsImported += ipr.datasetsImported;
        this.filesAvailable += ipr.filesAvailable;
        this.filesImported += ipr.filesImported;
        this.datasetsIgnored += ipr.datasetsIgnored;
        this.datasetsNotImported += ipr.datasetsNotImported;

        if ((this.datasetFromDate != null && ipr.datasetFromDate != null) && this.datasetFromDate.isAfter(ipr.datasetFromDate)) {
            this.datasetFromDate = ipr.datasetFromDate;
        } else if ((this.datasetFromDate == null && ipr.datasetFromDate != null)) {
            this.datasetFromDate = ipr.datasetFromDate;
        }

        if ((this.datasetUntilDate != null && ipr.datasetUntilDate != null) && this.datasetUntilDate.isBefore(ipr.datasetUntilDate)) {
            this.datasetUntilDate = ipr.datasetUntilDate;
        } else if (this.datasetUntilDate == null && ipr.datasetUntilDate != null) {
            this.datasetUntilDate = ipr.datasetUntilDate;
        }
        
        this.smartdataErrors = this.smartdataErrors + ipr.smartdataErrors;
        
        this.timeUsed = this.timeUsed + ipr.timeUsed;

        // Merge messages
        this.messages.addAll(ipr.messages);
    }

    @Override
    public String toString() {
        String out = "==== ImporterResult for " + this.target + " ("+ this.importer.getClass().getSimpleName() + ") ====" + System.lineSeparator();
        out += "files available      : " + this.filesAvailable + System.lineSeparator();
        out += "files imported       : " + this.filesImported + System.lineSeparator();
        out += "datasets available   : " + this.datasetsAvailable + System.lineSeparator();
        out += "datasets parsed      : " + this.datasetsParsed + System.lineSeparator();
        out += "datasets notparsed   : " + this.datasetsNotParsed + System.lineSeparator();
        out += "datasets imported    : " + this.datasetsImported + System.lineSeparator();
        out += "datasets not imported: " + this.datasetsNotImported +  System.lineSeparator();
        out += "datasets ignored     : " + this.datasetsIgnored + System.lineSeparator();
        out += "datasets updated     : " + this.datasetsUpdated + System.lineSeparator();
        out += "datasetFromDate      : " + this.datasetFromDate + System.lineSeparator();
        out += "datasetUntilDate     : " + this.datasetUntilDate + System.lineSeparator();
        out += "SmartData errors     : " + this.smartdataErrors + System.lineSeparator();
        out += "timeUsed             : " + this.timeUsed + System.lineSeparator();
        out += "messages:";
        for (Message curMessage : this.messages) {
            out += curMessage.getMessage() + System.lineSeparator();
        }
        return out;
    }
}
