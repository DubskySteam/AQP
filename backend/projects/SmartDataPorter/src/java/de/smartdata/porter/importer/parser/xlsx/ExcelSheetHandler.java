package de.smartdata.porter.importer.parser.xlsx;

import de.smartdata.porter.importer.Importer;
import de.smartdata.porter.importer.parser.ParserResult;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.apache.poi.xssf.model.SharedStringsTable;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

/**
 * Handler for large Excel sheets with SaxParser (perfomant and for large
 * Excel-Sheets)
 *
 * @author dstarke <dstarke@fh-bielefeld.de>
 */
public class ExcelSheetHandler extends DefaultHandler {

    private SharedStringsTable sst;
    private Importer importer;
    private String lastCellAdress;
    private String lastCellStyle;
    private String lastContents;
    private Long lastSetId;
    private boolean nextIsString;
    private Map<String, String> headerMap = new HashMap<>();
    private List<Map<String, Object>> listDataTable = new ArrayList<>();
    ParserResult result = new ParserResult();
    long starttime;
    long endtime;
    private Map<String, Object> lastDataSet = null;

    LocalDateTime time;

    /**
     * Constructor for the ExcelSheetHandler
     *
     * @param sst the Table of shared Strings
     * @param importer Importer that uses the parser
     */
    public ExcelSheetHandler(SharedStringsTable sst, Importer importer) {
        this.sst = sst;
        this.importer = importer;
        time = LocalDateTime.now();
    }

    /**
     *
     * @param uri
     * @param localName The localName of the Object
     * @param name The Name of the Celltype
     * @param attributes The attributes for the Cell
     * @throws SAXException
     */
    @Override
    public void startElement(String uri, String localName, String name,
            Attributes attributes) throws SAXException {

        // c => cell
        if (name.equals("c")) {
            // Print the cell reference
            lastCellAdress = attributes.getValue("r");
            Long setId = Long.parseLong(lastCellAdress.replaceAll("\\D+", ""));
            if (!setId.equals(lastSetId)) {
                lastSetId = setId;
                result.datasetsAvailable++;

                lastDataSet = new HashMap<>();
                time = time.plusSeconds(1);
                lastDataSet.put("ts", time);

                listDataTable.add(lastDataSet);
            }
            // Figure out if the value is an index in the Shared String Table
            String cellType = attributes.getValue("t");
            lastCellStyle = attributes.getValue("s");
            if (cellType != null && cellType.equals("s")) {
                nextIsString = true;
            } else {
                nextIsString = false;
            }
        }
        // Clear contents cache
        lastContents = "";
    }

    /**
     *
     * @param uri
     * @param localName The LocalName of the Object
     * @param name represents the internal excel sheet format for cells
     * @throws SAXException
     */
    @Override
    public void endElement(String uri, String localName, String name)
            throws SAXException {
        // Process the last contents as required.
        // Do now, as characters() may be called more than once
        if (nextIsString) {
            int idx = Integer.parseInt(lastContents);
            lastContents = sst.getItemAt(idx).getString();
            nextIsString = false;
        }
        // v => contents of a cell
        // Output after we've seen the string contents
        if (name.equals("v")) {
            //Regex match for Headers e.g. *A1-*Z1
            if (lastCellAdress.matches("[a-zA-Z0-9]*[a-zA-Z]1")) {
                //header
                headerMap.put(lastCellAdress, lastContents.toLowerCase());
            } else {
                //replace all numbers to 1
                String headerCellAdress = lastCellAdress.replaceAll("\\d+", "1");
                String headerName = headerMap.get(headerCellAdress);
                if (lastContents != null && lastContents.isEmpty()) {
                    int intLastCellstyle = Integer.MIN_VALUE;
                    try {
                        intLastCellstyle = Integer.parseInt(lastCellStyle);
                        //detection of Reference Fields in Excel
                    } catch (NumberFormatException nfe) {}
                    //content
                    if (intLastCellstyle == CellTypeEnum.DATE) {
                        Long days = Long.parseLong(lastContents);
                        LocalDate date = LocalDate.of(1899, 12, 30).plusDays(days);
                        lastDataSet.put(headerName, date);
                    } else {
                        lastDataSet.put(headerName, lastContents);
                    }
                    // Count parsed datasets
                    this.result.datasetsParsed++;
                } else {
                    // Dataset is ignored
                    this.result.datasetsNotParsed++;
                }
            }
        }
    }

    /**
     *
     * @param ch the char array
     * @param start startpoint of the char array
     * @param length length of the characters
     */
    @Override
    public void characters(char[] ch, int start, int length) {
        lastContents += new String(ch, start, length);
    }

    /**
     * resolves References
     *
     * @return the measurementcounter
     */
    public ParserResult close() {
        return this.result;
    }
    
    /**
     * get the List
     *
     * @return the Datatable as List
     */
    public List<Map<String, Object>> getListDataTable() {
        return listDataTable;
    }

}
