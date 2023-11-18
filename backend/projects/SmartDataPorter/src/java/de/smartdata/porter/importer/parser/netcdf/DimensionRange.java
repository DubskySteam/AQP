package de.smartdata.porter.importer.parser.netcdf;

/**
 * Defines a range for a dimension
 * 
 * @author ffehring
 */
public class DimensionRange {
    
    private String dimension;
    private String fromValue = null;
    private String untilValue = null;
    private Integer from = null;
    private Integer until = null;
    private boolean indexCalculated = false;
    
    public DimensionRange(String name) {
        this.dimension = name;
    }

    public String getDimension() {
        return dimension;
    }

    public void setDimension(String dimension) {
        this.dimension = dimension;
    }

    public String getFromValue() {
        return fromValue;
    }

    public void setFromValue(String fromValue) {
        this.fromValue = fromValue;
    }

    public String getUntilValue() {
        return untilValue;
    }

    public void setUntilValue(String untilValue) {
        this.untilValue = untilValue;
    }

    public Integer getFrom() {
        if(from == null)
            return 0;
        return from;
    }

    public void setFrom(Integer from) {
        this.from = from;
    }

    public Integer getUntil() {
        if(until == null)
            return Integer.MAX_VALUE;
        return until;
    }

    public void setUntil(Integer until) {
        this.until = until;
    }

    public boolean isIndexCalculated() {
        return indexCalculated;
    }

    public void setIndexCalculated(boolean indexCalculated) {
        this.indexCalculated = indexCalculated;
    }
}
