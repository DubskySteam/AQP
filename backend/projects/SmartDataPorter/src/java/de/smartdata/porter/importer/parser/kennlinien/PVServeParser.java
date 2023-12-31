package de.smartdata.porter.importer.parser.kennlinien;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.ImporterException;
import de.smartdata.porter.importer.parser.Parser;
import de.smartdata.porter.importer.parser.ParserException;
import de.smartdata.porter.importer.parser.ParserResult;
import de.smartdata.porter.streamconverter.ConvertException;
import de.smartdata.porter.streamconverter.InputStreamConverter;
import java.io.InputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.text.NumberFormat;
import java.text.ParseException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Locale;
import de.smartdata.porter.importer.dataset.DataSet;
import java.util.logging.Level;

/**
 * Parser for text files that contains data in the specific format for
 * Dunkelkennlinien, generated by PVServe.
 *
 * @author Marius
 */
public class PVServeParser extends Parser {

    @Override
    public String getDescription() {
        return "Imports data from dunkelkennlinien files";
    }

    @Override
    public boolean isAccepted(InputStream is, String mimetype, String filename) throws ParserException {
        if (mimetype == null) {
            try {
                byte[] contentBytes = InputStreamConverter.toByteArray(is, 70);
                String firstBytesStr = new String(contentBytes, StandardCharsets.UTF_8);
                if (firstBytesStr.contains("USER	U-Limit")) {
                    return true;
                }
            } catch (ConvertException ex) {
                ParserException pex = new ParserException("Could not check acceptance of inputstream. Error: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        }

        Message msg = new Message(this.getClass().getSimpleName() + " does not support mimetype >" + mimetype + "<", MessageLevel.ERROR);
        this.result.addMessage(msg);
        return false;
    }

    private enum State {
        Start,
        DatasetDateFound,
        DatasetNrFound,
        DatasetFFFound,
        DatasetRdsFound,
        DatasetUfFound,
        DatastKindFound,
        DatasetStartUIFound;

        public State next() {
            return values()[ordinal() + 1];
        }
    }

    @Override
    public void preParse() throws ParserException {
        // Nothing todo here
    }

    @Override
    public ParserResult parse(InputStream is) throws ParserException {
        boolean indexUI = this.importer.getConfig().getBoolean("pvserve.indexUI", true);

        // List of datasets
        Collection<DataSet> datasets = new ArrayList<>();
        LocalDateTime mesurementDate = null;
        KennlinienDataSet curDataset = null;
        
        // Set inital state
        State state = State.Start;
        
        try {
            int curCharKeycode = is.read();
            char curChar;
            String curContent = "";
            while (curCharKeycode != -1) {
                curChar = (char) curCharKeycode;
                if (curChar != '\n') {
                    curContent += curChar;
                } else {
                    curContent = curContent.trim();
                    if (curContent.length() > 0) {
                        switch (state) {
                            case Start:
                                if (curContent.matches("[0-9][0-9].[0-9][0-9].[0-9][0-9][0-9][0-9] [0-9][0-9]:[0-9][0-9]:[0-9][0-9]")) {
                                    try {
                                        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm:ss");
                                        mesurementDate = LocalDateTime.parse(curContent, formatter);
                                        state = state.next();
                                    } catch (DateTimeParseException e) {
                                        this.result.addMessage(new Message("The timestamp >" + curContent + "< could not be parsed.", MessageLevel.ERROR));
                                        return result;
                                    }
                                    break;
                                } else {
                                    state = state.next();
                                }
                                // No break here for case 2 (1970 date)
                            case DatasetDateFound:
                                if (curContent.matches("Nr. [0-9]*")) {
                                    // Create new dataset
                                    curDataset = new KennlinienDataSet(indexUI);
                                    curDataset.setTs(mesurementDate);
                                    int datasetNo = Integer.parseInt(curContent.split(" ")[1]);
                                    curDataset.setMesurementno(datasetNo);
                                    state = state.next();
                                    this.result.datasetsAvailable++;
                                    this.result.datasetFromDate = mesurementDate;
                                }
                                break;
                            case DatasetNrFound:
                                if (curContent.matches("FF\t[0-9]*,*[0-9]*")) {
                                    double ff = Double.parseDouble(curContent.split("\t")[1].replace(',', '.'));
                                    curDataset.setFf(ff);
                                    state = state.next();
                                }
                                break;
                            case DatasetFFFound:
                                if (curContent.matches("Rds\t[0-9]*,*[0-9]*")) {
                                    double rds = Double.parseDouble(curContent.split("\t")[1].replace(',', '.'));
                                    curDataset.setRds(rds);
                                    state = state.next();
                                }
                                break;
                            case DatasetRdsFound:
                                if (curContent.matches("Uf\t[0-9]*,*[0-9]*")) {
                                    double uf = Double.parseDouble(curContent.split("\t")[1].replace(',', '.'));
                                    curDataset.setUf(uf);
                                    state = state.next();
                                }
                                break;
                            case DatasetUfFound:
                                if (curContent.matches("bright")) {
                                    curDataset.setKind("bright");
                                    state = state.next();
                                } else if (curContent.matches("dark")) {
                                    curDataset.setKind("dark");
                                    state = state.next();
                                }
                                break;
                            case DatastKindFound:
                                if (curContent.matches("U\tI")) {
                                    state = state.next();
                                }
                                break;
                            case DatasetStartUIFound:
                                if (curContent.matches("-*[0-9]*,*[0-9]*\t-*[0-9]*,*[0-9]*")) {
                                    // Parse u and i from line
                                    String split[] = curContent.split("\t");
                                    NumberFormat format = NumberFormat.getInstance(Locale.GERMANY);
                                    Double u = null;
                                    Double i = null;
                                    try {
                                        u = format.parse(split[0]).doubleValue();
                                        i = format.parse(split[1]).doubleValue();
                                    } catch (ParseException ex) {
                                        Message msg = new Message(ex.getClass().getSimpleName() + ": " + ex.getLocalizedMessage(), MessageLevel.ERROR);
                                        Logger.addMessage(msg);
                                    }
                                    if (u != null && i != null) {
                                        // Add dataset before second measurement gets added
                                        if (curDataset.hasMeasurements() && !indexUI) {
                                            datasets.add(curDataset);
                                            this.result.datasetsParsed++;
                                            // Create new dataset
                                            KennlinienDataSet oldDataset = curDataset;
                                            curDataset = new KennlinienDataSet(indexUI);
                                            curDataset.setTs(oldDataset.getTs()); 
                                            curDataset.setMesurementno(oldDataset.getMeasurementno()); 
                                            curDataset.setFf(oldDataset.getFf());
                                            curDataset.setRds(oldDataset.getRds());
                                            curDataset.setUf(oldDataset.getUf());
                                            curDataset.setKind(oldDataset.getKind());
                                            this.result.datasetsAvailable++;
                                        }

                                        curDataset.addMeasurement(u, i);
                                    }
                                } else if (curContent.matches("Nr. [0-9]*")) {
                                    // Add created dataset to list
                                    datasets.add(curDataset);
                                    this.result.datasetsParsed++;
                                    // Create new dataset
                                    curDataset = new KennlinienDataSet(indexUI);
                                    curDataset.setTs(mesurementDate);
                                    int datasetNo = Integer.parseInt(curContent.split(" ")[1]);
                                    curDataset.setMesurementno(datasetNo);
                                    state = State.DatasetNrFound;
                                    this.result.datasetsAvailable++;
                                }
                                break;
                            default:
                                Logger.addMessage(new Message(
                                        "Not expected State (none)",
                                        MessageLevel.ERROR));
                                break;
                        }
                    }
                    curContent = "";
                }
                curCharKeycode = is.read();
            }
            // Add last dataset
            datasets.add(curDataset);
            this.result.datasetsParsed++;
            this.result.datasetUntilDate = curDataset.getTs();
            
            this.importer.addDataSets(datasets);
        } catch (IOException e) {
            throw new ParserException("IOException parsing Datasets: " + e.getLocalizedMessage());
        } catch (ImporterException ex) {
            throw new ParserException("Could not add datasets: " + ex.getLocalizedMessage());
        }
        
        return result;
    }
}
