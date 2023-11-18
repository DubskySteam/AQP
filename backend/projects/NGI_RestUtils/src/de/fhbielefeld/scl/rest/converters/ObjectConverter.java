package de.fhbielefeld.scl.rest.converters;

import de.fhbielefeld.scl.logger.Logger;
import de.fhbielefeld.scl.logger.message.Message;
import de.fhbielefeld.scl.logger.message.MessageLevel;
import de.fhbielefeld.scl.reflection.attributes.AttributeReflection;
import de.fhbielefeld.scl.rest.exceptions.ObjectConvertException;
import de.fhbielefeld.scl.rest.util.ResponseObjectBuilder;
import java.lang.reflect.Field;
import java.util.ArrayList;
import java.util.List;

/**
 * Holds helper functions for converting an object to json, or xml
 * representation.
 *
 * @author ffehring
 */
public class ObjectConverter {

    /**
     * Transforms an object into an reference string. Reference contains ref://
     * and the name of the REST api where details can be fetched. If no REST API
     * is found, the name of the objects class is deliverd. If no id is found,
     * null is returned.
     *
     * @param refObject Object to convert to reference
     * @return ref string or null, if refObject has no id
     */
    public static String objectToRefrence(Object refObject) {
        return null;
//        try {
//
//            // Get id from referenced object
//            Long refId = null;
//            Field[] refFields = refObject.getClass().getDeclaredFields();
//            for (int j = 0; j < refFields.length; j++) {
//                Field curRefField = refFields[j];
//                if (curRefField.isAnnotationPresent(Id.class)) {
//                    curRefField.setAccessible(true);
//                    refId = (Long) curRefField.get(refObject);
//                    break;
//                }
//            }
//
//            // Search rest interface for getting referenced data
//            String refPath = InterfaceRegister.getInterfacePath(refObject.getClass(), GET.class, "id", "get");
//            return refPath + "?id=" + refId;
//        } catch (IllegalArgumentException | IllegalAccessException ex) {
//            Message msg = new Message("Could not transform >" + refObject.getClass().getSimpleName() + "< to reference.", MessageLevel.ERROR);
//            Logger.addMessage(msg);
//            return null;
//        }
    }

    /**
     * Converts an object to its json representation.
     *
     * @param obj Object to convert into json
     * @return json representation of the object
     * @throws de.fhbielefeld.scl.rest.exceptions.ObjectConvertException
     */
    public static String objectToJson(Object obj) throws ObjectConvertException {
        // Check if object is allready an json string, if so return without change
        if (obj.getClass().equals(String.class)) {
            String strContent = (String) obj;
            if (strContent.startsWith("{") && strContent.endsWith("}") && !(strContent.startsWith("{\\\""))) {
                return strContent;
            }
        }

        return objectToResponseObjectBuilder(obj).toString();
    }

    /**
     * Converts an object into a ResponseObjectBuilder a json capable of useage
     * as response.
     *
     * @param obj Object to convert
     * @return Object in ResponseObjectBuilder form
     * @throws ObjectConvertException
     */
    public static ResponseObjectBuilder objectToResponseObjectBuilder(Object obj) throws ObjectConvertException {
        ResponseObjectBuilder rob = new ResponseObjectBuilder();
        try {
            for (Field curField : AttributeReflection.getAllFields(obj.getClass())) {
                // Exclude unwanted fields
                switch(curField.getName()) {
                    case "serialVersionUID":
                        break;
                    default:
                        curField.setAccessible(true);
                        // Get object value
                        Object value = curField.get(obj);
                        // Exclude null values and serialUID fields
                        if (value != null) {
                            rob.add(curField.getName(), value);
                        } else if (value == null) {
                            rob.addNullField(obj.getClass().getSimpleName() + ">" + curField.getName());
                        }
                }
            }
        } catch (IllegalArgumentException | IllegalAccessException ex) {
            ObjectConvertException oce = new ObjectConvertException("Could not convert object: " + ex.getLocalizedMessage());
            oce.addSuppressed(ex);
            throw oce;
        }
        return rob;
    }
}
