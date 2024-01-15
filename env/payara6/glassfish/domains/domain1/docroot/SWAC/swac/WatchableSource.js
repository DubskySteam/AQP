import Msg from './Msg.js';
import Model from './Model.js';

/* 
 * Makes datasource watchable for changes
 */
export default class WatchableSource {

    constructor(fromName, comp) {
        let msg = 'Create WatchableSource for >' + fromName + '<';
        if (typeof fromName !== 'string') {
            Msg.error('WatchableSource', 'fromName must be a string but is: ' + typeof fromName);
            return;
        }
        this.sets = [];
        this.swac_fromName = fromName;
        this.swac_createTime = Date.now();
        this.swac_updateTime = Date.now();
        this.swac_observers = new Map();
        this.sname = comp.requestor.id + ' WatchableSource';

        if (comp) {
            this.requestor = comp.requestor;
            msg += ' for requestor >' + comp.requestor.id + '<';
        }
        Msg.flow('WatchableSource', msg);
        // Create store Source
        if (!Model.store[fromName]) {
            Model.store[fromName] = {};
            Model.store[fromName] = new WatchableSource(fromName, Model);
        }

        if (comp !== Model) {
            // Set WatchableSource into components data storage
            comp.data[fromName] = this;
            // Watch the Model.store for changes in the Source there (central store)
            Model.store[fromName].addObserver(this);
            // Let the requesting component watch the source to get informed about data changes
            this.addObserver(comp);
        }
    }

    count() {
        return this.sets.length;
    }

    hasSet(id) {
        return typeof this.sets[id] !== 'undefined' && this.sets[id] !== null;
    }

    getSet(id) {
        return this.sets[id];
    }

    getSets() {
        return this.sets;
    }

    addSet(set) {
        Msg.flow('WatchableSource', 'Dataset >' + set.swac_fromName + '[' + set.id + ']< added.', this.requestor);
        this.sets[set.id] = set;
        for (let curObserver of this.swac_observers.keys()) {
            curObserver.notifyAddSet(this, set);
        }
    }

    delSet(set) {
        Msg.flow('WatchableSource', 'Dataset >' + set.swac_fromName + '[' + set.id + ']< deleted.', this.requestor);
        delete this.sets[set.id];
        for (let curObserver of this.swac_observers.keys()) {
            curObserver.notifyDelSet(this, set);
        }
    }

    /**
     * Adds an observer that will be informed on data changes
     * 
     * @param {Object} observer Object that has a notifyData(WatchableSource,set.id,set) function
     * @returns {undefined}
     */
    addObserver(observer) {
        // Prevent use observer more than one time
        if (!this.swac_observers.has(observer)) {
            let req = observer.sname ? observer.sname : observer.requestor.id;
            Msg.flow('WatchableSource', 'Added observer >' + req + '< for source >' + this.swac_fromName + '(' + this.sname + ')<');
            // Check observer
            if (typeof observer.notifyAddSet !== 'function') {
                Msg.error('WatchableSource', 'The object added has no notifyAddSet(WatchableSource,WatchableSet) function.');
                console.log(observer);
                return;
            }
            if (typeof observer.notifyDelSet !== 'function') {
                Msg.error('WatchableSource', 'The object added has no notifyDelSet(WatchableSource,id,set) function.');
                console.log(observer);
                return;
            }
            // Inform of existing sets
            for (let curSet of this.sets) {
                if (curSet)
                    observer.notifyAddSet(this, curSet);
            }
            this.swac_observers.set(observer, 1);
        }
    }

    /**
     * Deletes an observer
     * 
     * @param {Object} observer Object that has a notifyData(WatchableSource,set.id,set) function
     * @returns {undefined}
     */
    delObserver(observer) {
        if (this.swac_observers.has(observer)) {
            this.swac_observers.delete(observer);
            // Also delete from sets
            for (let curSet of this.getSets()) {
                if (!curSet)
                    continue;
                curSet.delObserver(observer);
            }
        }
    }

    /**
     * Recive notify from another WatchableSource
     * 
     * @param {WatchableSource} source Source where set was added
     * @param {WatchableSet} set Set to add 
     */
    notifyAddSet(source, set) {
        Msg.flow('WatchableSource', 'NOTIFY about added set >' + set.swac_fromName + '[' + set.id + ']< in >' + source.swac_fromName + '(' + source.requestor.id + ')< recived for Source >' + this.swac_fromName + '(' + this.requestor.id + ')<', this.requestor);
        // Check if set is accepted by requestor
        if (this.requestor.swac_comp && this.requestor.swac_comp.checkAcceptSet(set)) {
            this.requestor.swac_comp.addSet(set.swac_fromName, set);
        } else if (this.requestor.id === 'Model') {
            this.addSet(set);
        }
    }

    /**
     * Recive notify from another WatchableSource of a deleted set. Delets the set in this WatchableSet if it is there.
     * 
     * @param {WatchableSource} source Source where set was deleted
     * @param {WatchableSet} set Set to delete 
     */
    notifyDelSet(source, set) {
        Msg.flow('WatchableSource', 'NOTIFY about deleted set >' + set.swac_fromName + '[' + set.id + ']< recived for Source >' + this.swac_fromName + '(' + this.requestor.id + ')<', this.requestor);
        if (!this.sets[set.id]) {
            return;
        }
        this.delSet(set);
    }

    toString() {
        return 'WatchableSource(' + this.swac_fromName + ')';
    }
}
