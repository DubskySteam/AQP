package de.smartdata.porter.importer.parser.xlsx;

import de.smartdata.porter.importer.parser.ParserResult;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import jakarta.json.JsonObject;
import org.apache.poi.xssf.model.SharedStringsTable;
import org.xml.sax.Attributes;
import org.xml.sax.SAXException;
import org.xml.sax.helpers.DefaultHandler;

/**
 * Reads content from a given excel sheet
 *
 * @author cem
 */
public class XLSXHandler extends DefaultHandler {

    private final SharedStringsTable sst;

    private final ParserResult result;
    private final List<Map<String, Object>> dataset;
    private Map<String, String> headers;

    private final List<DataArea> areas;
    private final boolean dataset_flatten;
    private final String importDateKey;

    private Map<String, Object> vertical_values;

    private long currentRow;
    private CellInformation currentCell;
    private Map<String, Object> currentDataset;

    /**
     * Initializes the handler
     *
     * @param conf Contains informations for further processing of the
     * content
     * @param sst the shared strings table is requird to read the actual content
     */
    public XLSXHandler(JsonObject conf, SharedStringsTable sst) {
        this.sst = sst;
        this.currentCell = null;

        dataset = new ArrayList<>();
        headers = new HashMap<>();
        result = new ParserResult();
        areas = new ArrayList<>();

        String tmp = conf.getString("import.dataset_flatten");
        //Read configuration of the parser
        dataset_flatten = tmp != null && tmp.equalsIgnoreCase("true");
        importDateKey = conf.getString("import.dataset_importdate");

        String dataset_vertical_header = conf.getString("import.dataset_vertical_header");
        String dataset_vertical_start = conf.getString("import.dataset_vertical_start");
        String dataset_horizontal_header = conf.getString("import.dataset_horizontal_header");
        String dataset_horizontal_start = conf.getString("import.dataset_horizontal_start");

        if (dataset_vertical_header != null && !dataset_vertical_header.isEmpty()
                && dataset_vertical_start != null && !dataset_vertical_start.isEmpty()) {
            areas.add(new DataArea(dataset_vertical_header, dataset_vertical_start, DataAreaType.VERTICAL));
        }

        if (dataset_horizontal_header != null && !dataset_horizontal_header.isEmpty()
                && dataset_horizontal_start != null && !dataset_horizontal_start.isEmpty()) {
            areas.add(new DataArea(dataset_horizontal_header, dataset_horizontal_start, DataAreaType.HORIZONTAL));
        }

        if (areas.isEmpty()) {
            areas.add(new DataArea("A1", "A2", DataAreaType.HORIZONTAL));
        }

        Collections.sort(areas, (t, t1) -> {
            return (int) (t.getHeaderRow() - t1.getHeaderRow());
        });
    }

    @Override
    public void startElement(String uri, String localName, String name, Attributes attrs) throws SAXException {
        DataArea currentArea = areas.get(0);
        DataAreaType currentAreaType = currentArea.getAreaType();

        DataArea nextArea = areas.size() > 1 ? areas.get(1) : null;

        if (name.equals("row")) {
            currentRow = Long.parseLong(attrs.getValue("r"));
            if (currentRow < currentArea.getHeaderRow()) {
                return;
            }

            if (nextArea != null && currentRow >= nextArea.getHeaderRow()) {
                if (currentDataset != null) {
                    if (currentAreaType == DataAreaType.VERTICAL) {
                        vertical_values = currentDataset;
                        currentDataset = null;
                    }
                }

                areas.remove(currentArea);
            }

            if (currentAreaType == DataAreaType.HORIZONTAL && !dataset_flatten) {
                appendCurrentDataset();
            }

            if (currentDataset == null) {
                currentDataset = new HashMap<>();
            }
        } else if (name.equals("c")) {
            if (currentDataset == null) {
                return;
            }

            currentCell = new CellInformation(attrs);
        } else if (name.equals("v")) {
            if (currentCell == null) {
                return;
            }

            currentCell.isValue = true;
        }
    }

    @Override
    public void characters(char[] chars, int start, int length) throws SAXException {
        if (this.currentCell == null) {
            return;
        }

        this.currentCell.appendContent(new String(chars, start, length));
    }

    @Override
    public void endElement(String uri, String localName, String name) throws SAXException {

        if (name.equals("c")) {
            //Add Column    
            if (currentCell == null) {
                return;
            }

            DataArea currentArea = areas.get(0);
            DataAreaType currentAreaType = currentArea.getAreaType();

            String col = currentCell.getColumn();
            String row = Long.toString(currentRow);

            if (currentAreaType == DataAreaType.VERTICAL) {
                if (col.equalsIgnoreCase(currentArea.getHeaderColumn())) {
                    headers.put(row, currentCell.getString());
                } else if (col.equalsIgnoreCase(currentArea.getStartColumn())) {
                    if (headers.containsKey(row)) {
                        currentDataset.put(headers.get(row), currentCell.getContent());
                    }
                }
            } else {
                if (currentRow == currentArea.getHeaderRow()) {
                    headers.put(col, currentCell.getString());
                } else {
                    if (headers.containsKey(col)) {
                        String header = headers.get(col);
                        if (dataset_flatten) {
                            Long tmp = (currentRow - currentArea.getStartRow()) + 1;
                            header += tmp;
                        }

                        currentDataset.put(header, currentCell.getContent());
                    }
                }
            }

            currentCell = null;
        }
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
     * currentDataset get the List
     *
     * @return the Datatable as List
     */
    public List<Map<String, Object>> getListDataTable() {
        appendCurrentDataset();

        if (vertical_values != null) {
            for (Map<String, Object> set : dataset) {
                for (String key : vertical_values.keySet()) {
                    set.put(key, vertical_values.get(key));
                }
            }
        }

        return dataset;
    }

    private void appendCurrentDataset() {
        if (currentDataset == null || currentDataset.size() == 0) {
            return;
        }

        if (currentDataset.containsKey(importDateKey)) {
            Object tmp = currentDataset.remove(importDateKey);
        }

        dataset.add(currentDataset);

        currentDataset = null;
    }

    private class CellInformation {

        private String id;
        private String style;
        private String type;

        public boolean isValue;

        public String content;

        public CellInformation(Attributes attrs) {
            this.id = attrs.getValue("r");
            this.style = attrs.getValue("s");
            this.type = attrs.getValue("t");

            this.isValue = false;

            this.content = "";
        }

        public void appendContent(String content) {
            if (!isValue) {
                return;
            }

            this.content += content;
        }

        public String getId() {
            return id;
        }

        public String getStyleRaw() {
            return style;
        }

        public int getStyle() {
            String s = getStyleRaw();
            int style = Integer.MIN_VALUE;

            try {
                style = Integer.parseInt(s);
            } catch (Exception e) {
            }

            return style;
        }

        public boolean isString() {
            String tmp = type;
            if (tmp == null) {
                return false;
            }

            return tmp.equalsIgnoreCase("s");
        }

        public boolean isDate() {
            int s = getStyle();
            if (s == Integer.MIN_VALUE) {
                return false;
            }

            return s == CellTypeEnum.DATE;
        }

        public String getColumn() {
            return XLSXHelper.getColumn(getId());
        }

        public Long getRow() {
            return XLSXHelper.getRow(getId());
        }

        public String getString() {
            if (!isString()) {
                return content;
            }

            int idx = Integer.parseInt(content);
            return sst.getItemAt(idx).getString();
        }

        public Object getContent() {
            String c = getString();

            if (!isDate()) {
                return c;
            }

            Long days = Long.parseLong(c);
            return LocalDate.of(1899, 12, 30).plusDays(days);
        }
    }

}
