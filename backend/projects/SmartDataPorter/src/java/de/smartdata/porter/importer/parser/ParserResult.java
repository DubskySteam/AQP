package de.smartdata.porter.importer.parser;

import de.fhbielefeld.scl.logger.message.Message;
import de.smartdata.porter.result.Result;
import jakarta.xml.bind.annotation.XmlRootElement;
import java.time.LocalDateTime;

/**
 * Collect results of parser run
 *
 * @author ffehring
 */
@XmlRootElement
public class ParserResult extends Result {

    public Integer datasetsAvailable = 0;
    public Integer datasetsParsed = 0;
    public Integer datasetsNotParsed = 0;
    public LocalDateTime datasetFromDate;
    public LocalDateTime datasetUntilDate;

    /**
     * Merges two results into an summazing result
     *
     * @param ipr Result to merge with current result
     */
    public void merge(ParserResult ipr) {
        this.datasetsAvailable += ipr.datasetsAvailable;
        this.datasetsParsed += ipr.datasetsParsed;
        this.datasetsNotParsed += ipr.datasetsNotParsed;
        this.messages.addAll(ipr.messages);

        if ((this.datasetFromDate != null && ipr.datasetFromDate != null) && this.datasetFromDate.isAfter(ipr.datasetFromDate)) {
            this.datasetFromDate = ipr.datasetFromDate;
        } else if ((this.datasetFromDate == null && ipr.datasetFromDate != null)) {
            this.datasetUntilDate = ipr.datasetFromDate;
        }

        if ((this.datasetUntilDate != null && ipr.datasetUntilDate != null) && this.datasetUntilDate.isBefore(ipr.datasetUntilDate)) {
            this.datasetUntilDate = ipr.datasetUntilDate;
        } else if (this.datasetUntilDate == null && ipr.datasetUntilDate != null) {
            this.datasetUntilDate = ipr.datasetUntilDate;
        }
    }
    
    public void clear() {
        this.datasetsAvailable = 0;
        this.datasetsParsed = 0;
        this.datasetsNotParsed = 0;
        this.datasetFromDate = null;
        this.datasetUntilDate = null;
    }

    @Override
    public String toString() {
        String out = "==== ParserResult ====" + System.lineSeparator();
        out += "datasets available: " + this.datasetsAvailable + System.lineSeparator();
        out += "datasets parsed   : " + this.datasetsParsed + System.lineSeparator();
        out += "datasets notparsed: " + this.datasetsNotParsed + System.lineSeparator();
        out += "datasetFromDate   : " + this.datasetFromDate + System.lineSeparator();
        out += "datasetUntilDate  : " + this.datasetUntilDate + System.lineSeparator();
        out += "messages:";
        for (Message curMessage : this.messages) {
            out += curMessage.getMessage() + System.lineSeparator();
        }
        return out;
    }
}
