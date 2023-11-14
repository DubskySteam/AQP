/**
 * Contains methods for detection of datatypes.
 */
class DatatypeReflection {

    /**
     * Determines the best matching datatype for the given value
     * 
     * @param {type} value
     * @returns {undefined}
     */
    static determineDataType(value) {
        // Check if value is an number
        let numValue = Number(value);
        if (value !== '' && Number.isInteger(numValue)) {
            return 'Long';
        } else if (value !== '' && !Number.isNaN(numValue)) {
            return 'Double';
        }
        // check if value is date
        if (this.isDate(value))
            return 'Date';
        // check if value is datetime
        if (this.isDateTime(value))
            return 'DateTime';
        // check if value is color
        if (this.isColor(value))
            return 'Color';

        if (value.length > 50) {
            return 'textarea';
        }
        //TODO overwork this with use of the algorithm-manager concept
        return 'text';
    }

    /**
     * Checks if the given value is an date
     * @param {type} value
     * @returns {undefined}
     */
    static isDate(value) {
        if (value === null) {
            return false;
        }
        // Try get date format
        let dt = this.getDate(value);
        if (dt && !dt.hour)
            return true;
        return false;
    }

    /**
     * Checks if the given value is an date
     * @param {type} value
     * @returns {undefined}
     */
    static isDateTime(value) {
        if (value === null) {
            return false;
        }
        // Try get date format
        let dt = this.getDate(value);
        if (dt && dt.hour)
            return true;
        return false;
    }

    /**
     * Gets the date if possible
     * 
     * @param {type} value
     * @returns {DateTime}
     */
    static getDate(value) {
        let dt = luxon.DateTime.fromISO(value);
        if (dt.isValid)
            return dt;
        dt = luxon.DateTime.fromRFC2822(value);
        if (dt.isValid)
            return dt;
        dt = luxon.DateTime.fromHTTP(value);
        if (dt.isValid)
            return dt;
        dt = luxon.DateTime.fromSQL(value);
        if (dt.isValid)
            return dt;
        try {
            dt = luxon.DateTime.fromSeconds(value);
            if (dt.isValid)
                return dt;
        } catch (e) {
        }
        try {
            dt = luxon.DateTime.fromMillis(value);
            if (dt.isValid)
                return dt;
        } catch (e) {
        }
        //29.10.2019T7:48:59
        dt = luxon.DateTime.fromFormat(value, "DD.MM.YYYY HH:mm:ss");
        if (dt.isValid)
            return dt;
        return null;
    }

    /**
     * Gets the data format standard
     * 
     * @param {type} value
     * @returns {String|Boolean} Name of the standard or false
     */
    static getDateFormat(value) {
        let dt = luxon.DateTime.fromISO(value);
        if (dt.isValid)
            return 'ISO8601';
        dt = luxon.DateTime.fromRFC2822(value);
        if (dt.isValid)
            return 'RFC2822';
        dt = luxon.DateTime.fromHTTP(value);
        if (dt.isValid)
            return 'HTTP';
        dt = luxon.DateTime.fromSQL(value);
        if (dt.isValid)
            return 'SQL';
        try {
            dt = luxon.DateTime.fromSeconds(value);
            if (dt.isValid)
                return 'UnixSeconds';
        } catch (e) {
        }
        try {
            dt = luxon.DateTime.fromMillis(value);
            if (dt.isValid)
                return 'UnixMillis';
        } catch (e) {
        }
        //29.10.2019T7:48:59
        dt = luxon.DateTime.fromFormat(value, "DD.MM.YYYY HH:mm:ss");
        if (dt.isValid)
            return 'DIN1355-1';
        return false;
    }

    /**
     * Checks if the given value is an color
     * 
     * @param {type} value
     * @returns {boolean} true if value is an color
     */
    static isColor(value) {
        // HEX colors
        if (value.startsWith('#'))
            return true;
        // RGBA colors
        if (value.startsWith('0x')) {
            return true;
        }
    }
}