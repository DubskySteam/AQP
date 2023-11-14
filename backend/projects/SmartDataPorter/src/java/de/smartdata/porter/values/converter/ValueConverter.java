package de.smartdata.porter.values.converter;

import java.text.NumberFormat;
import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.TimeZone;

/**
 *
 * @author ffehring
 */
public class ValueConverter {

    public static Double objectToDouble(Object value) throws ValueConverterException {
        if (value instanceof Double) {
            return (Double) value;
        } else {
            try {
                String stringValue = (String) value;
                if (stringValue.isEmpty() || stringValue.equalsIgnoreCase("NAN")) {
                    throw new ValueConverterException("Error parsing value >" + value + "< to double.");
                } else if (stringValue.contains(",")) {
                    NumberFormat format = NumberFormat.getInstance(Locale.GERMANY);
                    Number number = format.parse(stringValue);
                    return number.doubleValue();
                } else {
                    return Double.parseDouble(stringValue);
                }
            } catch (NumberFormatException | ParseException ex) {
                ValueConverterException pex = new ValueConverterException("Error parsing value >" + value + "<: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        }
    }

    public static Integer objectToInteger(Object value) throws ValueConverterException {
        if (value instanceof Integer) {
            return (Integer) value;
        } else {
            try {
                String stringValue = (String) value;
                if (stringValue.isEmpty() || stringValue.equalsIgnoreCase("NAN")) {
                    throw new ValueConverterException("Error parsing value >" + value + "< to integer.");
                } else {
                    return Integer.parseInt(stringValue);
                }
            } catch (NumberFormatException ex) {
                ValueConverterException pex = new ValueConverterException("Error parsing value >" + value + "<: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        }
    }

    public static Short objectToShort(Object value) throws ValueConverterException {
        if (value instanceof Short) {
            return (Short) value;
        } else if (value instanceof Integer) {
            return ((Integer) value).shortValue();
        } else {
            try {
                String stringValue = (String) value;
                if (stringValue.isEmpty() || stringValue.equalsIgnoreCase("NAN")) {
                    throw new ValueConverterException("Error parsing value >" + value + "< to short.");
                } else {
                    return Short.parseShort(stringValue);
                }
            } catch (NumberFormatException ex) {
                ValueConverterException pex = new ValueConverterException("Error parsing value >" + value + "<: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        }
    }

    public static Long objectToLong(Object value) throws ValueConverterException {
        if (value instanceof Long) {
            return (Long) value;
        } else if (value instanceof Integer) {
            return ((Integer) value).longValue();
        } else {
            try {
                String stringValue = (String) value;
                if (stringValue.isEmpty() || stringValue.equalsIgnoreCase("NAN")) {
                    throw new ValueConverterException("Error parsing value >" + value + "< to short.");
                } else {
                    return Long.parseLong(stringValue);
                }
            } catch (NumberFormatException ex) {
                ValueConverterException pex = new ValueConverterException("Error parsing value >" + value + "<: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        }
    }

    public static Boolean objectToBoolean(Object value) throws ValueConverterException {
        if (value instanceof Boolean) {
            return (Boolean) value;
        } else {
            try {
                return Boolean.parseBoolean((String) value);
            } catch (NumberFormatException ex) {
                ValueConverterException pex = new ValueConverterException("Error parsing value >" + value + "<: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        }
    }

    public static LocalDate objectToLocalDate(Object value) throws ValueConverterException {
        if (value instanceof LocalDate) {
            return (LocalDate) value;
        } else if (value instanceof java.sql.Date) {
            return ((java.sql.Date) value).toLocalDate();
        } else if (value instanceof java.util.Date) {
            return ((java.util.Date) value).toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
        } else {
            // Try parsing as long and interpret as timestamp
            try {
                Long days = Long.parseLong((String) value);
                return LocalDate.of(1899, 12, 30).plusDays(days);
            } catch (NumberFormatException ex) {
                ValueConverterException pex = new ValueConverterException("Error parsing value >" + value + "<: " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                throw pex;
            }
        }
    }

    /**
     * Converts the contents of an object into a local date time if possible.
     * 
     * @param value Object, thats string representation can be converted to a localdetetime
     * @return LocalDateTime interpretation of the content
     * @throws PersistenceException 
     */
    public static LocalDateTime objectToLocalDateTime(Object value) throws ValueConverterException {
        if (value instanceof LocalDateTime) {
            return (LocalDateTime) value;
        } else {
            List<ValueConverterException> exs = new ArrayList<>();
            String datetimestring = (String) value;
            // Try parse string to long
            try {
                Long timestamp = Long.parseLong(datetimestring);
                LocalDateTime datetime = LocalDateTime.ofInstant(Instant.ofEpochSecond(timestamp), TimeZone
                        .getDefault().toZoneId());
                return datetime;
            } catch (NumberFormatException | DateTimeParseException ex) {
                ValueConverterException pex = new ValueConverterException("Could not interpret >"
                        + datetimestring + "< as timestamp. " + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                exs.add(pex);
            }

            // Try parse as iso datetime
            try {
                DateTimeFormatter dtf = DateTimeFormatter.ISO_DATE_TIME;
                LocalDateTime datetime = LocalDateTime.parse(datetimestring, dtf);
                return datetime;
            } catch (DateTimeParseException ex) {
                ValueConverterException pex = new ValueConverterException("Could not parse >"
                        + datetimestring
                        + "< as LocalDateTime after ISO pattern (2011-12-30T10:15:30)"
                        + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                exs.add(pex);
            }

            // Try parse as german datetime
            try {
                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm[:ss][.SSSSSSSSS][.SSSSSSSS][.SSSSSSS][.SSSSSS][.SSSSS][.SSSS][.SSS][.SS][.S]");
                LocalDateTime datetime = LocalDateTime.parse(datetimestring, dtf);
                return datetime;
            } catch (DateTimeParseException ex) {
                ValueConverterException pex = new ValueConverterException(
                        "Could not parse >" + datetimestring
                        + "< as LocalDateTime after ISO-T pattern (2011-12-30 10:15:30.123)"
                        + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                exs.add(pex);
            }            

            // Try parse as german datetime
            try {
                DateTimeFormatter dtf = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm[:ss][.SSSSSSSSS][.SSSSSSSS][.SSSSSSS][.SSSSSS][.SSSSS][.SSSS][.SSS][.SS][.S]");
                LocalDateTime datetime = LocalDateTime.parse(datetimestring, dtf);
                return datetime;
            } catch (DateTimeParseException ex) {
                ValueConverterException pex = new ValueConverterException(
                        "Could not parse >" + datetimestring 
                                + "< as LocalDateTime after DE pattern (30.12.2011 10:15:30)"
                        + ex.getLocalizedMessage());
                pex.addSuppressed(ex);
                exs.add(pex);
            }

            ValueConverterException ex = exs.get(exs.size()-1);
            throw ex;
        }
    }
}
