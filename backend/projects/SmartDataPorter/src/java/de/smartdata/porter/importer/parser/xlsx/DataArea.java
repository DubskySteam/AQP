/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package de.smartdata.porter.importer.parser.xlsx;

/**
 *
 * @author cem
 */
public class DataArea {
    private final String header;
    private final String start;
    private final DataAreaType type;
    
    public DataArea(String header, String start, DataAreaType type){
        this.header = header;
        this.start = start;
        this.type = type;
    }
    
    public String getHeader()
    {
        return header;
    }
    
    public Long getHeaderRow()
    {
        return XLSXHelper.getRow(this.header);
    }
    
    public String getHeaderColumn()
    {
        return XLSXHelper.getColumn(this.header);
    }
    
    public String getStart()
    {
        return start;
    }
    
    public Long getStartRow()
    {
        return XLSXHelper.getRow(this.start);
    }
    
    public String getStartColumn()
    {
        return XLSXHelper.getColumn(this.start);
    }
    
    public DataAreaType getAreaType()
    {
        return type;
    }
    
}