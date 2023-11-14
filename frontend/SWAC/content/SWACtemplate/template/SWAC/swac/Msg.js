var SWAC_msgs = new Map();
SWAC_msgs.set(undefined, {
    errors: [],
    warnings: [],
    infos: [],
    flows: [],
    hints: []
});
class Msg {

    /**
     * Create a message storage for a requestor
     * 
     * @param {SWAC requestor} requestor Requestor to create storage for
     * @returns {undefined}
     */
    static createStore(requestor) {
        SWAC_msgs.set(requestor, {
            errors: [],
            warnings: [],
            infos: [],
            flows: [],
            hints: []
        });
    }

    /**
     * Adds a message to the message store
     * @param {type} component Component which reports
     * @param {type} message Message reported
     * @param {type} element Element the message belongs to (usualy a SWAC requestor)
     * @param {type} level Messages level (error, debug, hint)
     * @returns {undefined}
     */
    static message(component, message, element, level) {
        SWAC_msgs.get(element)[level + 's'].push({
            component: component,
            message: message
        });
        let msg = 'SWAC(' + component + '): ' + message;
        if (element) {
            msg = msg + ' for requestor: >' + element.id + '<';
        }
        switch (level) {
            case 'error':
                console.error(msg);
                break;
            case 'warning':
                console.warn(msg);
                break;
            default:
                console.info(msg);
        }
    }

    /**
     * Adds an error message to console and to the effected element if given.
     * 
     * @param {String} component Name of the component where to log from 
     * @param {String} message Message to display
     * @param {DOMElement} element Element the error is realated to
     * @returns {undefined}
     */
    static error(component, message, element) {
        Msg.message(component, message, element, 'error');
    }

    /**
     * Adds an debug message to console and to the effected element if given.
     * 
     * @param {String} component Name of the component where to log from 
     * @param {String} message Message to display
     * @param {DOMElement} element Element the error is realated to
     * @returns {undefined}
     */
    static warn(component, message, element) {
        if (SWAC_config.debugmode)
            Msg.message(component, message, element, 'warning');
    }
    /**
     * Adds an message with general information
     * 
     * @param {String} component Name of the component where to log from 
     * @param {String} message Message to display
     * @param {DOMElement} element Element the error is realated to
     * @returns {undefined}
     */
    static info(component, message, element) {
        if (SWAC_config.debugmode)
            Msg.message(component, message, element, 'info');
    }
    /**
     * Adds an message describing a point in processing
     * 
     * @param {String} component Name of the component where to log from 
     * @param {String} message Message to display
     * @param {DOMElement} element Element the error is realated to
     * @returns {undefined}
     */
    static flow(component, message, element) {
        if (SWAC_config.debugmode) {
            Msg.message(component, message, element, 'flow');
            performance.mark(message);
        }
    }
    /**
     * Adds an hint message to console and to the effected element if given.
     * 
     * @param {String} component Name of the component where to log from 
     * @param {String} message Message to display
     * @param {DOMElement} element Element the error is realated to
     * @returns {undefined}
     */
    static hint(component, message, element) {
        if (SWAC_config.debugmode)
            Msg.message(component, message, element, 'hint');
    }
}