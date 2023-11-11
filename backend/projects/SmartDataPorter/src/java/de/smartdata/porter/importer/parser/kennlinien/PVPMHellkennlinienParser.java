package de.smartdata.porter.importer.parser.kennlinien;

import java.io.InputStream;
import java.util.Iterator;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.Row;
import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.util.ArrayList;

/**
 * Parser for xls files containing Hellkennlinien from PVServe devices
 * 
 * !NOTE: This parser is NOT checked for useage in SmartDataPorter yet!
 * 
 * @author Marius
 */
public class PVPMHellkennlinienParser extends Parser {

//    private DataSet dataset;
//    private LocalDateTime ts;
//    private ArrayList<Pair<Double, Double>> measurementList;
    int measurementCounter;
    boolean alods;

    @Override
    public String getDescription() {
        return "Imports data from hellkennlinien files";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        if(mimetype != null && mimetype.equalsIgnoreCase("application/vdn.ms-")
                && filename.toUpperCase().endsWith("HKL_PVPM.XLS")) {
            return true;
        }
        System.out.println(this.getClass().getSimpleName() + " does not support mimetype >" + mimetype + "<");
        return false;
    }

    private enum State {
        Head1("Speicherort not found"),
        Head2("Timestamp not found"),
        Head3("PVPM Nr./No. not found"),
        Head4("Irr.-Sensor Nr./No. not found"),
        Head5("T sens not found"),
        Head6("T mod  not found"),
        Head7("E eff not found"),
        Head8("Isc not found2"),
        Head9("Uoc not found"),
        Head10("Ipmax not found"),
        Head11("Upmax not found"),
        Head12("Isc 0  not found"),
        Head13("Uoc 0  not found"),
        Head14("Ipmax 0 not found"),
        Head15("Upmax 0 not found"),
        Head16("Ppk  not found"),
        EndOfHead("Measurement Headline not found"),
        Measurement("No Measurement found");

        private final String message;

        private State(String message) {
            this.message = message;
        }

        public State next() {
            return values()[ordinal() + 1];
        }

        public String getMessage() {
            return this.message;
        }
    }

    @Override
    public void preParse() throws ParserException {
        // Nothing todo here
    }

    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        if (is != null) {
//            this.dataset = new DataSet();
//            this.measurementList = new ArrayList<>();
            this.measurementCounter = 0;
            this.alods = false;
            State state = State.Head1;
            try {
                HSSFRow row = null;
                HSSFWorkbook workbook = new HSSFWorkbook(is);
                HSSFSheet spreadsheet = workbook.getSheetAt(0);
                Iterator<Row> rowIterator = spreadsheet.iterator();
                Iterator<Cell> cellIterator = null;
                Cell cell = null;
                while (rowIterator.hasNext()) {
                    row = (HSSFRow) rowIterator.next();
                    cellIterator = row.cellIterator();
                    ArrayList<Object> rowData = new ArrayList<>();
                    while (cellIterator.hasNext()) {
                        cell = cellIterator.next();
                        if (cell.getCellType().name().equals("STRING")) {
                            rowData.add(cell.getStringCellValue());
                        } else if (cell.getCellType().name().equals("NUMERIC")) {
                            rowData.add((Double) cell.getNumericCellValue());
                        }
                    }
                    if (rowData.size() > 1) {
                        switch (state) {
                            case Head1:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof String) {
                                    if (((String) rowData.get(0)).contains("Datei")) {
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head2:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof String) {
                                    if (((String) rowData.get(0)).contains("Datum der Messung")) {
//                                        if (this.dataset != null) {
//                                            saveMeasurement();
//                                        }
//                                        try {
//                                            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
//                                            this.ts = LocalDateTime.parse((String) rowData.get(1), formatter);
//                                            this.result._datasetFromDate = this.ts;
//                                            this.dataset.addData("ts", this.ts);
//                                            state = state.next();
//                                        } catch (DateTimeParseException e) {
//                                            Logger.addMessage(new Message(
//                                                    "Invalid timestamp.",
//                                                    MessageLevel.INFO));
//                                            return result;
//                                        }
                                    }
                                }
                                break;
                            case Head3:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof String) {
                                    if (((String) rowData.get(0)).contains("PVPM Nr.")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head4:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof String) {
                                    if (((String) rowData.get(0)).contains("Irr.-Sensor Nr.")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head5:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("T sens:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head6:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("T mod:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head7:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("E eff:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head8:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("Isc:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head9:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("Uoc:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head10:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("Ipmax:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head11:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("Upmax:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head12:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("Isc 0:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head13:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("Uoc 0:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head14:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("Ipmax0:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head15:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("Upmax0:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case Head16:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof Double) {
                                    if (((String) rowData.get(0)).contains("Ppk:")) {
                                        addHead(rowData.get(0), rowData.get(1));
                                        state = state.next();
                                    }
                                }
                                break;
                            case EndOfHead:
                                if (rowData.get(0) instanceof String && rowData.get(1) instanceof String) {
                                    if (((String) rowData.get(0)).contains("U in V") && ((String) rowData.get(1)).contains("I in A")) {
                                        state = state.next();
                                    }
                                }
                                break;
                            case Measurement:
                                if (rowData.get(0) instanceof Double && rowData.get(1) instanceof Double) {
                                    addMeasurement((Double) rowData.get(0), (Double) rowData.get(1));
                                    this.alods = true;
                                } else if (rowData.get(0) instanceof String && rowData.get(1) instanceof String) {
                                    if (((String) rowData.get(0)).contains("Datei")) {
                                        state = State.Head2;
                                    }
                                }
                                break;
                            default:
                                Logger.addMessage(new Message(
                                        "Error.",
                                        MessageLevel.ERROR));
                                break;
                        }
                    }
                }
                workbook.close();
                is.close();
                if (this.alods) {
//                    saveMeasurement();
//                    this.result._datasetUntilDate = this.ts;
                } else {
                    Message msg = new Message(
                    state.getMessage(),
                    MessageLevel.WARNING);
                    
                    this.result.addMessage(msg);
                    Logger.addMessage(msg);
                }
            } catch (FileNotFoundException e) {
                Logger.addMessage(new Message(
                        e.getLocalizedMessage(),
                        MessageLevel.CRITICAL_ERROR));
                throw new ParserException("Error : " + e.getLocalizedMessage());
            } catch (IOException e) {
                Logger.addMessage(new Message(
                        e.getLocalizedMessage(),
                        MessageLevel.CRITICAL_ERROR));
                throw new ParserException("Error : " + e.getLocalizedMessage());
            } catch (RuntimeException ex) {
                if(ex.getLocalizedMessage().contains("Found EOFRecord before WindowTwoRecord was encountered")) {
                    throw new ParserException("The file containts a error. This can often be solved by opening and resaveing the file.");
                } else {
                    throw new ParserException(ex.getLocalizedMessage());
                }
            }
        } else {
            Logger.addMessage(new Message(
                    "Nothing to import.",
                    MessageLevel.WARNING));
        }
        return result;
    }

    private void addHead(Object name, Object content) {
        if (name instanceof String && content instanceof String) {
            name = ((String) name).toLowerCase();
        }
        if (name != null && content != null) {
            if (name instanceof String && content instanceof String) {
                String newName = (String) name;
                newName = newName.replace(":", "");
//                this.dataset.addData(newName, (String) content);
            } else if (name instanceof String && content instanceof Double) {
                String newName = (String) name;
                newName = newName.replace(":", "");
//                this.dataset.addData(newName, "" + content);
            }
        }
    }

    private void addMeasurement(Double u, Double i) {
        if (u != null && i != null) {
//            this.measurementList.add(new Pair<>(u, i));
        }
    }

//    private void saveMeasurement() throws ParserException {
//        if (this.alods) {
//            this.result._datasetsAvailable += 1;
//            if (this.measurementList != null && !this.measurementList.isEmpty()) {
//                Collections.sort(this.measurementList);
//                for (Pair<Double, Double> p : this.measurementList) {
//                    //TODO this is a local used variable, do not make a attribute from it
//                    this.measurementCounter++;
//                    String name1 = "u" + measurementCounter;
//                    Double value1 = p.getValue0();
//                    this.dataset.addData(name1, value1);
//                    String name2 = "i" + measurementCounter;
//                    Double value2 = p.getValue1();
//                    this.dataset.addData(name2, value2);
//                }
//            }
//            if (this.measurementCounter > 0 && this.ts != null && this.dataset != null) {
//                try {
//                    this._importer.addDataSet(dataset);
//                    this.result._datasetsParsed += 1;
//                    this.measurementList.clear();
//                    this.dataset = new DataSet();
//                    this.measurementCounter = 0;
//                    Logger.addMessage(new Message(
//                            "Dataset addded.",
//                            MessageLevel.INFO));
//                } catch (ImporterException ex) {
//                    ParserException pe = new ParserException("Could not add values " + ex.getLocalizedMessage());
//                    pe.addSuppressed(ex);
//                    throw pe;
//                }
//            } else {
//                Logger.addMessage(new Message(
//                        "Dataset ignored.",
//                        MessageLevel.WARNING));
//                this.result._datasetsNotParsed += 1;
//            }
//        }
//    }
}
