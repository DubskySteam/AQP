package de.smartdata.porter.importer.parser.netcdf;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.smartdata.porter.importer.Importer;
import de.smartdata.porter.importer.ImporterException;
import de.smartdata.porter.importer.parser.ParserResult;
import jakarta.json.Json;
import jakarta.json.JsonNumber;
import jakarta.json.JsonObject;
import jakarta.json.JsonObjectBuilder;
import jakarta.json.JsonValue;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import ucar.ma2.Array;
import ucar.ma2.Index;
import ucar.ma2.InvalidRangeException;
import ucar.nc2.Dimension;
import ucar.nc2.NetcdfFile;
import ucar.nc2.Variable;

/**
 * Allows Access to NetCDF file contents.
 *
 * @author ffehring
 */
public class NetCDFFileReader {

    private final HashMap<String, Variable> variables = new HashMap<>();
    private final HashMap<String, List<JsonObject>> values = new HashMap<>();
    private final Importer importer;
    private final ParserResult result;
    private LocalDateTime owtime;

    /**
     * Creates a new NetCDFFileReader with the given NetCDF file
     *
     * @param ncfile previous loaded NetCDF file
     * @param importer Importer calling the FileReader
     * @param result Result to fill with parsing information
     */
    public NetCDFFileReader(NetcdfFile ncfile, Importer importer, ParserResult result) {
        for (Variable variable : ncfile.getVariables()) {
            this.variables.put(variable.getFullName(), variable);
        }
        this.importer = importer;
        this.result = result;
    }

    /**
     * Get all available variable names
     *
     * @return Set of variable names
     */
    public Set<String> getVariableNames() {
        return this.variables.keySet();
    }

    /**
     * Sets the date time that should overwrite datetime from file
     * 
     * @param owtime 
     */
    public void setOwTime(LocalDateTime owtime) {
        this.owtime = owtime;
    }
    
    /**
     * Read data from a variable
     *
     * @param varName Variable name
     * @param ranges Ranges for dimensions
     * @param saveValues true if found values should be saved to database
     * @throws IOException
     * @throws InvalidRangeException
     * @throws de.smartdata.porter.importer.ImporterException
     */
    public void readVariable(String varName, Map<String, DimensionRange> ranges, boolean saveValues) throws IOException, InvalidRangeException, ImporterException {
        Variable variable = this.variables.get(varName);
        if (variable == null) {
            Logger.addMessage(new Message("Variable >" + varName + "< not found.", MessageLevel.ERROR));
            return;
        }

        System.out.println("readVariable(" + varName + ")");

        String spec = "";
        List<Dimension> dims = variable.getDimensions();
        int i = 0;
        for (Dimension curDim : dims) {
            if (curDim.getName().equals(varName)) {
                spec += ":";
                i++;
                continue;
            }
            if (i > 0) {
                spec += ",";
            }
            System.out.println("Dimension: " + curDim.getName() + " with length: " + curDim.getLength());
            if (ranges.containsKey(curDim.getName())) {
                DimensionRange range = ranges.get(curDim.getName());
                // Calculate indizes for min and max values
                if (!range.isIndexCalculated()) {
                    System.out.println("readVariable() " + curDim.getName() + " with saveVals = false");
                    this.readVariable(curDim.getName(), ranges, false);
                    range.setIndexCalculated(true);
                }
                // Order min max
                Integer from = range.getFrom();
                Integer until = range.getUntil();
                if (range.getFrom() > range.getUntil()) {
                    from = range.getUntil();
                    until = range.getFrom();
                }

                System.out.println("Reading data for variable >" + varName + "< from dimension >" + curDim.getName() + "< where index > " + from + " and < " + until);
                if (from != null) {
                    spec += from;
                }
                spec += ":";
                if (until != null) {
                    spec += until;
                }
            } else if(!curDim.getName().equals(varName)) {
                this.readVariable(curDim.getName(), ranges, false);
                spec += ":";
            } else {
                System.out.println("Reading data for variable >" + varName + "< from all values of dimension >" + curDim.getName() + "<");
                this.readVariable(curDim.getName(), ranges, saveValues);
                spec += ":";
            }
            i++;
        }

        System.out.println("spec: " + spec);
        Array data = variable.read(spec);
        System.out.println("Found data for >" + variable.getFullName() + "< with rank: " + data.getRank());
//        String arrayStr = Ncdump.printArray(data, variable.getFullName(), null);
//        System.out.println(arrayStr);

        this.diveRank(data, variable, ranges, -1, new ArrayList<>(), saveValues);
    }

    /**
     * Dive deeper into the data over dimensions.
     *
     * @param data Data to dive in
     * @param variable Target variable
     * @param ranges Ranges to look at
     * @param deepth Actual deepth in dimensions
     * @param indizes Actual position in dimensions as indizes
     * @return
     * @throws ImporterException
     */
    private void diveRank(Array data, Variable variable, Map<String, DimensionRange> ranges, int deepth, List<Integer> indizes, boolean saveValues) throws ImporterException {
        deepth++;
        int[] shape = data.getShape();
//        System.out.println("diveRank() shape size: " + shape.length + " deepth: " + deepth);
        if (deepth < shape.length - 1) {
            for (int i = 0; i < shape[deepth]; i++) {
//                System.out.println("i: " + i + " shape deepth: " + deepth + " length: " + shape[deepth]);
//                System.out.println("Indizes: " + indizes);
                if (indizes.size() <= deepth) {
                    indizes.add(deepth, i);
                } else {
                    indizes.set(deepth, i);
                }
//                System.out.println("dive? Cur level: " + deepth + " max level: " + (shape.length - 1));
//                System.out.println("Go deeper >" + deepth + "< with " + indizes);
                this.diveRank(data, variable, ranges, deepth, indizes, saveValues);
            }
        } else {
            // Last level is data level
            this.readData(data, variable, ranges, deepth, indizes, saveValues);
        }
    }

    /**
     * Read data from data array for variable at position that is indicated by
     * indizes
     *
     * @param data File access array
     * @param variable Variable information
     * @param ranges Ranges definition for wanted data
     * @param deepth Dimension level where readData() is called
     * @param indizes Indizes of dimensions above the data
     * @return List of dataset objects
     */
    private List<JsonObject> readData(Array data, Variable variable, Map<String, DimensionRange> ranges, int deepth, List<Integer> indizes, boolean saveValues) throws ImporterException {
        DimensionRange varRange = ranges.get(variable.getFullName());
//        System.out.println("DataType: " + data.getDataType().name() + " ElementType: " + data.getElementType().getSimpleName() + " length: " + data.getSize());
        List<JsonObject> vals = new ArrayList<>();
        Index index = data.getIndex();
        indizes.add(deepth, 0);
        List<Dimension> dims = variable.getDimensions();
        if (saveValues) {
            this.result.datasetsAvailable += data.getShape()[deepth];
        }

        switch (data.getElementType().getSimpleName()) {
            case "double":
                Double minVal = Double.MIN_VALUE,
                 maxVal = Double.MAX_VALUE;
                if (varRange != null && varRange.getFromValue() != null) {
                    minVal = Double.valueOf(varRange.getFromValue());
                }
                if (varRange != null && varRange.getUntilValue() != null) {
                    maxVal = Double.valueOf(varRange.getUntilValue());
                }
                double lastMin = Double.MAX_VALUE;
                double lastMax = Double.MIN_VALUE;
//                System.out.println("Shape level: " + deepth);
//                System.out.println(data.getShape()[deepth]);
                for (int k = 0; k < data.getShape()[deepth]; k++) {
                    // Merken des Datenpunktes (k) an dem wir uns gerade beim Durchlaufen der Dimensionen (deepth te Dimension) befinden
                    indizes.set(deepth, k);
                    // Dimensions-Datenpunkt Beziehung in Array umwandeln für einfacheren Zugriff
                    int[] indizis = indizes.stream().mapToInt(i -> i).toArray();
                    index.set(indizis);
                    // Wert an diesem Punkt in den Dimensionen holen
                    Double d = data.getDouble(index);
                    // Get threshold indizes
                    if (varRange != null && d > minVal && d < lastMin) {
                        varRange.setFrom(k);
                        lastMin = d;
                    }
                    if (varRange != null && d < maxVal && d > lastMax) {
                        varRange.setUntil(k);
                        lastMax = d;
                    }
                    JsonObject dataset = this.createDataSet(variable, d, indizes, dims, ranges);
                    vals.add(dataset);
                }
                // Exchange from and until if values are ordred DESC
                if(varRange != null && varRange.getFrom() > varRange.getUntil()) {
                    int realFrom = varRange.getUntil();
                    String realFromVal = varRange.getUntilValue();
                    int realUntil = varRange.getFrom();
                    String realUntilVal = varRange.getFromValue();
                    varRange.setFrom(realFrom);
                    varRange.setFromValue(realFromVal);
                    varRange.setUntil(realUntil);
                    varRange.setUntilValue(realUntilVal);
                }
                
                break;
            case "byte":
//                System.out.println("Shape level: " + deepth);
//                System.out.println(data.getShape()[deepth]);

                for (int k = 0; k < data.getShape()[deepth]; k++) {
                    indizes.set(deepth, k);
                    int[] indizis = indizes.stream().mapToInt(i -> i).toArray();
//                    System.out.println("indizis: " + indizes);
//                    System.out.println("byte index rank: " + index.getRank());
                    index.set(indizis);
                    Byte b = data.getByte(index);
//                    System.out.println("Value of " + variable.getFullName() + ": " + b);
                    JsonObject dataset = this.createDataSet(variable, b, indizes, dims, ranges);
                    vals.add(dataset);
                }
                break;
            default:
                Logger.addMessage(new Message("DataType >" + data.getElementType().getSimpleName() + "< is currently not supported.", MessageLevel.INFO));
        }

        if (deepth <= 1) {
            System.out.println("Store data for " + variable.getFullName());
            this.values.put(variable.getFullName(), vals);

            if (varRange != null) {
                if (varRange.getFrom() != null) {
                    System.out.println("Min wanted: " + varRange.getFromValue() + " found at " + varRange.getFrom() + " value on that pos: " + vals.get(varRange.getFrom()));
                } else {
                    System.out.println("Min wantet not found");
                }
                if (varRange.getUntil() != null) {
                    System.out.println("Max wanted: " + varRange.getUntilValue() + " found at " + varRange.getUntil() + " value on that pos: " + vals.get(varRange.getUntil()));
                } else {
                    System.out.println("Max wanted not found.");
                }
            }
        }
        System.out.println(vals.size() + " values readData(): " + vals);
        indizes.remove(deepth);

        if (saveValues) {
            System.out.println("saveValues for " + variable.getFullName());
            this.importer.addDataSets(vals);
            this.result.datasetsParsed += vals.size();
        }
        return vals;
    }

    /**
     * Create a dataset from value for variable. Useing the indizes of the above
     * dimensions to get the values for the other dimensions and put them
     * together into one dataset
     *
     * @param variable Variable to get the dataset for
     * @param varVal Current value
     * @param indizes Indizes of all leading dimensions where the value was
     * found
     * @param dims Dimension informations
     * @param ranges Range informations (for index offset)
     * @return JsonObject with value and values from corosponding dimensions
     */
    public JsonObject createDataSet(Variable variable, Object varVal, List<Integer> indizes, List<Dimension> dims, Map<String, DimensionRange> ranges) {
        // Create record dataset
        JsonObjectBuilder dataSet = Json.createObjectBuilder();
        switch (varVal.getClass().getSimpleName()) {
            case "Double":
                dataSet.add(variable.getFullName().toLowerCase(), (Double) varVal);
                break;
            case "Integer":
                dataSet.add(variable.getFullName().toLowerCase(), (Integer) varVal);
                break;
            case "Byte":
                dataSet.add(variable.getFullName().toLowerCase(), (Byte) varVal);
                break;
            default:
                System.out.println("Type " + varVal.getClass().getSimpleName() + " is currently not supported.");
        }

        if (indizes.size() == 1) {
            return dataSet.build();
        }

        for (int dimi = 0; dimi < indizes.size(); dimi++) {
            int dimid = indizes.get(dimi);
            Dimension dim = dims.get(dimi);
            String dimName = dim.getName();
            // Get offset from range
            DimensionRange range = ranges.get(dimName);
            if (range != null) {
                dimid += range.getFrom();
            }
            // Get list of values preloaded
            List<JsonObject> dimsVals = this.values.get(dimName);
            if (dimsVals == null) {
                System.out.println("There are no values for " + dimName);
            } else {
                JsonObject dimJson = dimsVals.get(dimid);
                JsonValue dimVal = dimJson.get(dimName);
                if (dimName.equals("time") && this.owtime != null) {
                    dataSet.add(dimName.toLowerCase(), owtime.toString());
                } else if (dimName.equals("time")) {
                    // Transforming time data
                    JsonNumber numb = (JsonNumber) dimVal;
                    long numl = (numb.longValue() * 3600); 
                    dataSet.add(dimName.toLowerCase(), numl);
                } else {
                    dataSet.add(dimName.toLowerCase(), dimVal);
                }
            }
        }

        return dataSet.build();
    }
}
