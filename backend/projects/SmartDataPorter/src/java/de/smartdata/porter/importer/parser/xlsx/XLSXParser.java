package de.smartdata.porter.importer.parser.xlsx;

import de.smartdata.porter.importer.ImporterException;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import java.io.InputStream;

import org.apache.poi.openxml4j.opc.OPCPackage;
import org.apache.poi.xssf.eventusermodel.XSSFReader;
import org.apache.poi.xssf.model.SharedStringsTable;
import org.apache.poi.ooxml.util.SAXHelper;
import org.xml.sax.InputSource;

import javax.xml.parsers.ParserConfigurationException;
import org.xml.sax.XMLReader;
import org.xml.sax.SAXException;
import java.io.IOException;
import java.util.Iterator;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.openxml4j.exceptions.OpenXML4JException;

/**
 * The XLSXParser represents a fully functional Class to read Excel sheets in
 * any format. It saves any Entry into the Database
 *
 * @author dstarke <dstarke@fh-bielefeld.de>
 */
public class XLSXParser extends Parser {

    @Override
    public String getDescription() {
        return "Imports data from xlsx files";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        if (mimetype != null && mimetype.equalsIgnoreCase("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")) {
            return true;
        }
        return false;
    }

    @Override
    public void preParse() throws ParserException {
        // Nothing todo here
    }

    /**
     * This Method implements a function to parse an Excel Sheet with all its
     * functions and returns a result of parsed datasets.
     *
     * @param is the InputStream from the Soruce
     * @return ParserResult The Completion of all parsed Objects
     * @throws ParserException
     */
    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        try {
            // Open inputstream as office file
            OPCPackage pkg = OPCPackage.open(is);
            XSSFReader reader = new XSSFReader(pkg);
            SharedStringsTable sst = reader.getSharedStringsTable();
            XMLReader parser = SAXHelper.newXMLReader();
            // Der ExcelSheeHandler übernimmt die eigentlich Arbeit
            XLSXHandler handler = new XLSXHandler(this.importer.getConfig(), sst);
            parser.setContentHandler(handler);

            //Um ueber alle Sheets in Excel zu Iterieren
            Iterator<InputStream> sheets = reader.getSheetsData();
            while (sheets.hasNext()) {
                InputStream sheet = sheets.next();
                InputSource sheetSource = new InputSource(sheet);
                parser.parse(sheetSource);
                sheet.close();
            }
            handler.close();
            try {
                // fuegt Values hinzu
                this.importer.addDataTable(handler.getListDataTable());
            } catch (ImporterException ex) {
                ParserException pe = new ParserException("Could not add values " + ex.getLocalizedMessage());
                pe.addSuppressed(ex);
                throw pe;
            }
            // zeigt die aktuell geparsten datasets an
            handler.close();
            
            return this.result;
        } catch (IOException ioex) {
            throw new ParserException("Error : " + ioex.getLocalizedMessage() + ", name: " + ioex.getClass().getSimpleName());
        } catch (InvalidFormatException ifex) {
            throw new ParserException("Error : " + ifex.getLocalizedMessage());
        } catch (OpenXML4JException | SAXException | ParserConfigurationException ex) {
            throw new ParserException("Error : " + ex.getLocalizedMessage());
        }
    }
}
