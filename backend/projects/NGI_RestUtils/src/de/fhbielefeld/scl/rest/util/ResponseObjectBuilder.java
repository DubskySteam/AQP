package de.fhbielefeld.scl.rest.util;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.rest.converters.ObjectConverter;
import de.fhbielefeld.scl.rest.exceptions.ObjectConvertException;
import jakarta.json.JsonObject;
import jakarta.json.JsonString;
import jakarta.json.JsonValue;
import jakarta.json.JsonValue.ValueType;
import java.io.IOException;
import java.io.Writer;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

/**
 * Builds responses for REST API answers
 *
 * @author Jannik Malken, Florian Fehring
 */
public class ResponseObjectBuilder extends ApiResponseBuilder {

    private final Map<String, String> attrs = new HashMap<>(); // Replacement for JsonObjectBuilder (experimental and for subjsons only)

    public ResponseObjectBuilder() {
    }

    /**
     * Adds objects data. Adds objects data directly as key, values. Difference
     * to add(String,Object): Not added as subobject.
     *
     * If obj is an Map, all values will be stored with their keys on root level
     * If obj is an Collection, values will be stored within json-array named
     * "list" If obj is some other algorithm will try to convert it to json
     *
     * @param value Object wich information to add
     * @return This modified ResponseObjectBuilder
     */
    public ResponseObjectBuilder add(Object value) {
        JsonObject jobj;

        if (value == null) {
            Message msg = new Message("null values are not allowed as answer content", MessageLevel.ERROR);
            Logger.addMessage(msg);
        } else if (value instanceof JsonObject) {
            jobj = (JsonObject) value;
            // Add values
            for (Entry<String, JsonValue> curEntry : jobj.entrySet()) {
                this.attrs.put(curEntry.getKey(), curEntry.getValue().toString());
            }
        } else if (value instanceof Map) {
            Map map = (Map) value;
            for (Object curEntryObj : map.entrySet()) {
                Entry curEntry = (Entry) curEntryObj;
                if (curEntry.getKey() == null) {
                    this.add("null", curEntry.getValue());
                } else {
                    this.add(curEntry.getKey().toString(), curEntry.getValue());
                }
            }
        } else if (value instanceof Collection) {
            Collection col = (Collection) value;
            this.add("list", col);
        } else if (value instanceof Boolean
                || value instanceof Byte
                || value instanceof Character
                || value instanceof Number) {
            String msgtxt = "ResponseObjectBuiler: There was a >"
                    + value.getClass().getName() + "< value given to rob.add()."
                    + "The add() interface is intended for use with objects"
                    + " not with single values. You should use add(name,value)"
                    + " instead.";
            Message msg = new Message(msgtxt, MessageLevel.WARNING);
            Logger.addDebugMessage(msg);
            this.addWarningMessage(msgtxt);
        } else {
            // Try convert object to json
            try {
                ResponseObjectBuilder rob = ObjectConverter.objectToResponseObjectBuilder(value);
                this.mergeMessages(rob);
                this.attrs.putAll(rob.attrs);
            } catch (ObjectConvertException ex) {
                this.addErrorMessage(ex.getLocalizedMessage());
                this.addException(ex);
            }
        }
        return this;
    }

    /**
     * Adds an key value pair. With automatic type detection.
     *
     * @param key Key of the entry
     * @param value Entries value, given as java object
     * @return This modified ResponseObjectBuilder
     */
    public ResponseObjectBuilder add(String key, Object value) {
        if (value == null) {
            this.attrs.put(key, "null");
        } else if (value instanceof Number) {
            this.attrs.put(key, value.toString());
        } else if (value instanceof Boolean) {
            this.attrs.put(key, (Boolean) value + "");
        } else if (value instanceof String) {
            String valueStr = (String) value;
            if ((valueStr.startsWith("[") && valueStr.endsWith("]"))
                    || (valueStr.startsWith("{") && valueStr.endsWith("}"))) {
                this.attrs.put(key, valueStr);
            } else {
                valueStr = valueStr.replace("\\", "\\\\");
                this.attrs.put(key, "\"" + valueStr + "\"");
            }
        } else if (value instanceof ResponseObjectBuilder) {
            ResponseObjectBuilder rob = (ResponseObjectBuilder) value;
            this.mergeMessages(rob);
            this.attrs.put(key, rob.toString());
        } else if (value instanceof ResponseListBuilder) {
            ResponseListBuilder rlb = (ResponseListBuilder) value;
            this.mergeMessages(rlb);
            this.attrs.put(key, rlb.toString());
        } else if (value instanceof Map) {
            // Case for map values
            Map<?, ?> map = (Map) value;
            ResponseObjectBuilder subrob = new ResponseObjectBuilder();
            map.entrySet().stream().forEach(
                    e -> {
                        Entry entry = (Entry) e;
                        subrob.add(entry.getKey().toString(), entry.getValue());
                    });
            this.add(key, subrob);
            this.mergeMessages(subrob);
        } else if (value instanceof Collection) {
            // Case for collections (list, etc.)
            Collection<?> col = (Collection) value;
            ResponseListBuilder rlb = new ResponseListBuilder();
            col.stream().forEach(
                    e -> rlb.add(e)
            );
            this.mergeMessages(rlb);
            this.add(key, rlb);
        } else if (value instanceof JsonValue) {
            JsonValue jv = (JsonValue) value;
            if (jv.getValueType() == ValueType.STRING) {
                JsonString jstr = (JsonString) jv;
                this.add(key, jstr.getString());
            } else {
                this.attrs.put(key, jv.toString());
            }
        } else {
            this.addConvertedToString(key, value.getClass());
            this.attrs.put(key, "\"" + value.toString() + "\"");
        }

        return this;
    }

    /**
     * Generates response as json
     *
     * @return Json or JsonP as result.
     */
    @Override
    public String toString() {
        StringBuilder sb = new StringBuilder();
        sb.append("{");

        // Add content
        String json = this.toJson();
        sb.append(json);
        boolean prevCont = !json.isEmpty();

        // Add warnings
        if (!warnings.isEmpty()) {
            if (prevCont) {
                sb.append(",");
            }
            sb.append("\"warnings\": [");
            for (int i = 0; i < warnings.size(); i++) {
                sb.append("\"" + warnings.get(i) + "\"");
                if (i < warnings.size() - 1) {
                    sb.append(",");
                }
                prevCont = true;
            }
            sb.append("]");
        }
        // Add errors
        if (!errors.isEmpty()) {
            if (prevCont) {
                sb.append(",");
            }
            sb.append("\"errors\": [");
            for (int i = 0; i < errors.size(); i++) {
                sb.append("\"" + errors.get(i) + "\"");
                if (i < errors.size() - 1) {
                    sb.append(",");
                }
                prevCont = true;
            }
            sb.append("]");
        }
        // Add exceptions
        if (!exceptions.isEmpty()) {
            if (prevCont) {
                sb.append(",");
            }
            sb.append("\"exceptions\": [");
            for (int i = 0; i < exceptions.size(); i++) {
                String msg = exceptions.get(i).getLocalizedMessage();
                msg = msg.replace("\\", "\\\\");
                msg = msg.replace("\"", "\\\"");
                msg = msg.replace("\b", "\\b");
                msg = msg.replace("\f", "\\f");
                msg = msg.replace("\n", "\\n");
                msg = msg.replace("\r", "\\r");
                msg = msg.replace("\t", "\\t");
                sb.append("\"" + msg + "\"");
                if (i < exceptions.size() - 1) {
                    sb.append(",");
                }
            }
            sb.append("]");
        }

        sb.append("}");
        return sb.toString();
    }

    @Override
    public String toJson() {
        StringBuilder sb = new StringBuilder();
        if (!attrs.isEmpty()) {
            // Adding stored values
            int size = attrs.size();
            int current = 0;
            for (Map.Entry<String, String> curAttr : this.attrs.entrySet()) {
                current++;
                sb.append("\"");
                sb.append(curAttr.getKey());
                sb.append("\": ");
                sb.append(curAttr.getValue());
                if (current < size) {
                    sb.append(",");
                }
            }
        }
        return sb.toString();
    }

    @Override
    public boolean toWriter(Writer writer) throws IOException {
        if (!attrs.isEmpty()) {
            int size = attrs.size();
            int current = 0;
            for (Map.Entry<String, String> curAttr : attrs.entrySet()) {
                current++;
                writer.write("\"" + curAttr.getKey() + "\": ");
                writer.write(curAttr.getValue());
                if (current < size) {
                    writer.write(",");
                }
            }
            return true;
        }
        return false;
    }
}
