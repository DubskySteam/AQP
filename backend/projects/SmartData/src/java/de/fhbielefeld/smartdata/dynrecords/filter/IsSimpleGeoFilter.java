package de.fhbielefeld.smartdata.dynrecords.filter;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.smartdata.dbo.Attribute;
import de.fhbielefeld.smartdata.exceptions.DynException;
import java.sql.PreparedStatement;
import de.fhbielefeld.smartdata.dyncollection.DynCollection;

/**
 * Filter class for is simple geofilter
 *
 * @author Alexej Rogalski
 */
public class IsSimpleGeoFilter extends Filter {

    public IsSimpleGeoFilter(DynCollection table) {
        super(table);
    }
    
    @Override
    public void parse(String filtercode) throws FilterException {
        this.filtercode = filtercode;
        try {
            String[] parts = filtercode.split(",");
            // First element is the name of the attribute wanted to filter
            this.attribute = parts[0];
            // Check if the collection contains such a attribute
            Attribute col = this.collection.getAttribute(this.attribute);

            if (col == null) {
                throw new FilterException("The Column >" + this.attribute + "< does not exists.");
            }
            if (!col.getType().equals("geometry")) {
                Message msg = new Message(
                    "IsSimpleGeoFilter", MessageLevel.ERROR,
                    "Column type >" + col.getType() + "< is not supported. Please choose a Column with type geometry.");
                Logger.addDebugMessage(msg);
            }

        } catch (DynException ex) {
            FilterException fex = new FilterException("Could not parse IsSimpleGeoFilter: " + ex.getLocalizedMessage());
            fex.addSuppressed(ex);
            throw fex;
        }
    }

    @Override
    public String getPrepareCode() {
        return "ST_IsSimple(" + this.attribute + ")";
    }

    @Override
    public PreparedStatement setFilterValue(PreparedStatement pstmt) throws FilterException {
        return pstmt;            
    }
    
}