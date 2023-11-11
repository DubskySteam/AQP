package de.fhbielefeld.scl.rest.util;

import de.fhbielefeld.scl.rest.converters.ObjectConverter;
import de.fhbielefeld.scl.rest.exceptions.ObjectConvertException;
import java.io.IOException;
import java.io.Writer;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Builder for lists of responses.
 *
 * @author jannik, Florian Fehring
 */
public class ResponseListBuilder extends ApiResponseBuilder {

    private final List<String> attrs = new ArrayList<>();

    public ResponseListBuilder() {

    }

    /**
     * Adds an object of object-value to this list.
     *
     * @param value Value to add, is automatically converted
     * @return This modified responselist
     */
    public ResponseListBuilder add(Object value) {
        if (value == null) {
            this.attrs.add("null");
        } else if (value instanceof Number) {
            this.attrs.add(value.toString());
        } else if (value instanceof String) {
            String valueStr = (String) value;
            if ((valueStr.startsWith("{") && valueStr.endsWith("}"))
                    || (valueStr.startsWith("[") && valueStr.endsWith("]"))) {
                this.attrs.add(valueStr);
            } else {
                this.attrs.add("\"" + valueStr + "\"");
            }
        } else if (value instanceof Boolean) {
            this.attrs.add((Boolean) value + "");
        } else if (value instanceof ResponseObjectBuilder) {
            ResponseObjectBuilder rob = (ResponseObjectBuilder) value;
            this.mergeMessages(rob);
            this.attrs.add(rob.toString());
        } else if (value instanceof ResponseListBuilder) {
            ResponseListBuilder rlb = (ResponseListBuilder) value;
            this.attrs.add(rlb.toString());
        } else if (value instanceof Map) {
            // Case for map values
            Map map = (Map) value;
            ResponseObjectBuilder subrob = new ResponseObjectBuilder();
            for (Object curEntryObj : map.entrySet()) {
                Map.Entry curEntry = (Map.Entry) curEntryObj;
                subrob.add(curEntry.getKey().toString(), curEntry.getValue());
            }
            this.mergeMessages(subrob);
            this.add(subrob);
        } else {
            // Try convert object to json
            try {
                ResponseObjectBuilder rob = ObjectConverter.objectToResponseObjectBuilder(value);
                this.mergeMessages(rob);
                this.add(rob);
            } catch (ObjectConvertException ex) {
                this.attrs.add("\"" + value.toString() + "\"");
            }
        }
        return this;
    }

    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();

        // Add content
        String json = this.toJson();
        sb.append(json);
        
        return sb.toString();
    }
    
    @Override
    public String toJson() {
        // Useing fast native implemented toString of list
        return this.attrs.toString();
    }

    @Override
    public boolean toWriter(Writer writer) throws IOException {
        if (!attrs.isEmpty()) {
            int size = attrs.size();
            int current = 0;
            for (String curValue : attrs) {
                current++;
                writer.write(curValue);
                if (current < size) {
                    writer.write(",");
                }
            }
            return true;
        }
        return false;
    }
}
