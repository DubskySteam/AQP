/* 
 * Makes data watchable for changes
 */
class WatchableSet {

    constructor(set) {
        this.swac_observers = new Map();
        let proxy = new Proxy(this, {
            get(target, name, receiver) {
                return Reflect.get(target, name, receiver);
            },
            set(target, name, value, receiver) {
                // Check if value has changed
                if (Reflect.get(target, name, receiver) !== value) {
                    // Inform observers
                    if (target.swac_observers.has(name)) {
                        for (let curObserver of target.swac_observers.get(name)) {
                            curObserver.notify(name, value);
                        }
                    }
                }
                return Reflect.set(target, name, value, receiver);
            }
        });
        // Setting attribute values
        for (let curAttr in set) {
            proxy[curAttr] = set[curAttr];
        }

        return proxy;
    }

    /**
     * Adds an observer that will be informed on data changes
     * 
     * @param {Object} observer Object that has a notify(attrName,value) function
     * @param {String} attrName Name of the attribute the observer wants to observe
     * @returns {undefined}
     */
    addObserver(observer, attrName) {
        if (typeof observer.notify !== 'function') {
            Msg.error('BindPoint', 'The object added has no notify function.');
            return;
        }
        // Create observers array for attr when needed
        if (!this.swac_observers.has(attrName)) {
            this.swac_observers.set(attrName, []);
        }
        // Prevent use observer more than one time
        if (!this.swac_observers.get(attrName).includes(observer)) {
            this.swac_observers.get(attrName).push(observer);
        }
    }
    /**
     * Recives a notification about a change of data in a object that
     * uses the data
     * 
     * @param {String} attrName Name of the attribut that changes
     * @param {Object} value New value
     * @returns {undefined}
     */
    notify(attrName, value) {
        // Update data
        if (this[attrName] !== value) {
            this[attrName] = value;
        }
    }
}
