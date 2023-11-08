import SWAC from './swac.js';
import Msg from './Msg.js';
import Remote from './Remote.js';
import WatchableSet from './WatchableSet.js';
import WatchableSource from './WatchableSource.js';

export default class Model {

    static requestor = {id: 'Model'};
    static requests = new Map();
    static store = new Map();

    /**
     * Loads data (single or multiple) from the resource.
     * 
     * @param {DataRequest} dataRequest Object containing the request data
     * @param {SWACComponent} comp Component requesting data
     * @returns {Promise}
     */
    static load(dataRequest, comp) {
        let thisRef = this;
        return new Promise((resolve, reject) => {
            if (!dataRequest.fromName) {
                reject('DataRequest is invalid. Attribute >fromName< is missing.');
                return;
            }

            // Calculate fromWheres for lazy loading
            if (comp?.options?.lazyLoading > 0) {
                dataRequest.lazyLoadSets = comp.options.lazyLoading;
                dataRequest.fromWheres['size'] = comp.options.lazyLoading;
                let lazyAttr = comp.options.lazyOrder.split(',')[0];
                let lazyOrder = comp.options.lazyOrder.split(',')[1] === 'DESC' ? 'gt' : 'lt';
                let lastLazy = lazyAttr + ',' + lazyOrder + ',' + (comp.lastloaded - comp.options.lazyLoading)
                if (dataRequest.fromWheres['filter'] && dataRequest.fromWheres['filter'].includes(lastLazy)) {
                    // Update existing lazy loading filter
                    dataRequest.fromWheres['filter'] = dataRequest.fromWheres['filter'].replace(lastLazy, lazyAttr + ',' + lazyOrder + ',' + comp.lastloaded);
                } else if (dataRequest.fromWheres['filter']) {
                    // Append lazy loading filter after other filters
                    dataRequest.fromWheres['filter'] += '&' + lazyAttr + ',' + lazyOrder + ',' + comp.lastloaded;
                } else {
                    // Set lazy loading filter without existence of other filters
                    dataRequest.fromWheres['filter'] = lazyAttr + ',' + lazyOrder + ',' + comp.lastloaded;
                }
                comp.lastrequest = dataRequest;
            }
            // Calculate fromWheres for ecoMode
            if (comp?.options?.ecoMode?.ecoColumn) {
                let col = comp.options.ecoMode.ecoColumn;
                let ecoFilter = '';
                if (comp.ecoMode.active)
                    ecoFilter = col + ',eq,true';
                else
                    ecoFilter = col + ',eq,false';
                
                if (dataRequest.fromWheres['filter']) {
                    dataRequest.fromWheres['filter'] += '&' + ecoFilter;
                } else
                    dataRequest.fromWheres['filter'] = ecoFilter;
            }

            // Support filter from URL
            let urlFilter = SWAC.getParameterFromURL('filter');
            if (urlFilter) {
                // Check if filter is applicable for component
                let parts = urlFilter.split(',');
                if (parts.length < 4 || parts[3] === comp.requestor.id) {
                    if (dataRequest.fromWheres['filter']) {
                        dataRequest.fromWheres['filter'] += '&' + urlFilter;
                    } else {
                        dataRequest.fromWheres['filter'] = urlFilter;
                    }
                }
            }

            // Calculate request id
            let requestId = dataRequest.fromName;
            if (dataRequest.fromWheres) {
                for (let curWhere in dataRequest.fromWheres) {
                    requestId += curWhere + '=' + dataRequest.fromWheres[curWhere];
                }
            }
            
            // Create datasource if not exists
            if (comp && !comp.data[dataRequest.fromName]) {
                // Create WS for component and (inside WatchableSource) if needed for Model.store
                new WatchableSource(dataRequest.fromName, comp);
            } else if(!comp) {
                // Create WS if data is requested without component
                new WatchableSource(dataRequest.fromName, Model);
            }
            
            // Check if data is allready loading
            let loadProm = thisRef.requests.get(requestId);
            let timeout = dataRequest.reloadInterval ? dataRequest.reloadInterval : 10000;
            if (!loadProm || loadProm.fromDate < Date.now() - timeout) {
                loadProm = thisRef.getData(dataRequest, comp);
                thisRef.requests.set(requestId, loadProm);
            }
            loadProm.then(function (data) {
//                if (comp)
//                    comp.addData(dataRequest.fromName, data);
                resolve(data);
            }).catch(function (err) {
                if (typeof err !== 'object')
                    Msg.error('model', err, comp);
                reject(err);
            });

        });
    }

    /**
     * Loads the data from best applicable storage.
     * This maybe a local variable, a file or a interface on a url
     * 
     * @param {DataRequest} dataRequest
     * @returns Promise<WatchableSet[]>
     */
    static getData(dataRequest, comp) {
        let thisRef = this;
        // Return promise for loading and initialising the view
        let prom = new Promise((resolve, reject) => {
            
            let dataCapsule;
            // Check if data is locally available
            if (typeof window[dataRequest.fromName] === 'object' && !window[dataRequest.fromName].nodeName) {
                Msg.info('model', 'Useing data from global variable for >' + dataRequest.fromName + '<', comp);
                dataCapsule = thisRef.convertData(window[dataRequest.fromName], dataRequest, comp);
                comp.lastloaded = dataCapsule.length - 1;
                resolve(dataCapsule);
            } else {
                // Get data from remote (fetchGet uses data from first datasource that delivers data)
                Remote.fetchGet(dataRequest.fromName, dataRequest.fromWheres, true).then(
                        function (dataCapsule) {
                            Msg.info('model', 'Useing data from >' + dataCapsule.fromName + '< for >' + dataRequest.fromName + '<', comp);
                            dataCapsule = thisRef.convertData(dataCapsule, dataRequest, comp);
                            if (comp)
                                comp.lastloaded = dataCapsule.length - 1;
                            resolve(dataCapsule);
                        }
                ).catch(function (e) {
                    if (typeof e.status !== 'undefined') {
                        if (dataRequest.reportErrors !== false) {
                            let errmsg = "Could not get data for >" + dataRequest.fromName + "<  Statuscode: " + e.status;
                            Msg.error('model', errmsg, comp);
                        }
                        reject(e);
                    } else if (e.toString().indexOf('NetworkError') > 0) {
                        // Try download file
                        if (SWAC.config.corsavoidurl) {
                            let corsurl = SWAC.config.corsavoidurl.replace('%url%', dataRequest.fromName);
                            // Check if file is ziped and activate unzip
                            if (dataRequest.fromName.endsWith('.zip') || dataRequest.fromName.endsWith('.gz')) {
                                corsurl += '&unzip=true';
                            }
                            fetch(corsurl, {method: "post",
                                headers: {
                                    'Accept': 'application/json'
                                }
                            }).then(function (res) {
                                // Get path to new file from answer (even if file was not stored in filespace db file is downloaded)
                                res.json().then(function (data) {
                                    if (data.errors[0].startsWith('Error downloading file')) {
                                        reject(e);
                                    }
                                    dataRequest.fromName = '/' + data.path;
                                    thisRef.getData(dataRequest, comp).then(function (dataCapsule) {
                                        resolve(dataCapsule);
                                    }).catch(function (e) {
                                        reject(e);
                                    });
                                });
                            }).catch(function (e) {
                                Msg.error('Model', 'Could not use file download to avoid cors: ' + e, requestor);
                                reject(e);
                            });
                        } else {
                            reject(e);
                        }
                    } else {
                        let errmsg = "Could not get data for >" + dataRequest.fromName + "<  Error: " + e;
                        Msg.error('model', errmsg, comp);
                        reject(e);
                    }
                });
            }
        });
        prom.fromDate = new Date();
        return prom;
    }

    /**
     * Converts the recived data into an array of WatchableSets
     * 
     * @param {Object[]} data recived data
     * @param {DataRequest} dataRequest Object with requestdata for the object
     * @param {SWACComponent} comp Component to load data for
     * @returns {WatchableSet[]} Array of WatchableSets
     */
    static convertData(data, dataRequest, comp) {
        // Get attribute that contains the id
        let idAttr = dataRequest.idAttr ? dataRequest.idAttr : 'id';

        let newdata;
        if (data?.data?.list) {
            // Metadata support format
            newdata = data.data.list;
            newdata.metadata = {};
            // Move other recived values to metadata
            for (let i in data.data) {
                if (i !== 'list') {
                    newdata.metadata[i] = data.data[i];
                }
            }
        } else if (data?.data?.records) {
            // TreeQL format support
            newdata = data.data.records;
        } else if (data.data && Array.isArray(data.data)) {
            // Raw data formats
            newdata = data.data;
        } else if (data.data) {
            newdata = [data.data];
        } else if (Array.isArray(data)) {
            newdata = data;
        } else {
            newdata = [];
            newdata[0] = data;
        }

        // Get default values
        if (!dataRequest.attributeDefaults) {
            if (comp && comp.options.attributeDefaults) {
                dataRequest.attributeDefaults = comp.options.attributeDefaults;
            } else {
                dataRequest.attributeDefaults = new Map();
            }
        }
        if (!dataRequest.attributeRenames) {
            if (comp && comp.options.attributeRenames) {
                dataRequest.attributeRenames = comp.options.attributeRenames;
            } else {
                dataRequest.attributeRenames = new Map();
            }
        }
        // Transform objectsets to WatchableSets and filter by date
        let genid = 0;
        let transdata = [];
        let newLoaded = 0;
        for (let i = 0; i < newdata.length; i++) {
            let curSet = newdata[i];
            if (!curSet)
                continue;

            // Break for lazy loading on sources, that does not support lazy requesting
            if (comp?.options?.lazyLoading > 0 && curSet[idAttr] > comp.lastloaded) {
                if (newLoaded >= comp.options.lazyLoading) {
                    break;
                }
                newLoaded++;
            }
            // If set is included in store, use old set instead, so that obserers remain on the set
            if (this.store[dataRequest.fromName]?.hasSet(curSet[idAttr])) {
                curSet = this.store[dataRequest.fromName].getSet(curSet[idAttr]);
            }

            // Filter data that should not be shown by time
            if (curSet['swac_from']) {
                let fromDate = new Date(curSet['swac_from']);
                if ((new Date().getTime() - fromDate.getTime()) < 0) {
                    continue;
                }
            }

            if (curSet['swac_until']) {
                let untilDate = new Date(curSet['swac_until']);
                if ((new Date().getTime() - untilDate.getTime()) > 0) {
                    continue;
                }
            }

            // Filter for fromWheres (no effect on data from sources that support filtering allready)
            if (!this.matchFilter(curSet, dataRequest.fromWheres)) {
                continue;
            }
            // Set default values
            let defaults = dataRequest.attributeDefaults.get(dataRequest.fromName);
            let gdefaults = dataRequest.attributeDefaults.get('*');
            if (defaults && gdefaults)
                defaults = Object.assign(defaults, gdefaults);
            else if (gdefaults)
                defaults = gdefaults;
            if (defaults) {
                for (let curAttr in defaults) {
                    if (typeof curSet[curAttr] === 'undefined') {
                        let curVal = defaults[curAttr];
                        // Calculate default value
                        let placeholders = curVal.match(/%\w+%/g);
                        if (placeholders && placeholders.length > 0) {
                            let eq = curVal;
                            let repall = true;
                            for (let curPlaceh of placeholders) {
                                let curName = curPlaceh.split('%').join('');
                                if (typeof curSet[curName] !== 'undefined')
                                    eq = eq.replace(curPlaceh, curSet[curName]);
                                else {
                                    Msg.error('Model', 'Variable >' + curName + '< for calculation >' + eq + '< not found in set >' + dataRequest.fromName + '[' + curSet.id + ']<');
                                    repall = false;
                                    break;
                                }
                            }
                            if (repall) {
                                curSet[curAttr] = eval(eq);
                            }
                        } else
                            curSet[curAttr] = curVal;
                    }
                }
            }

            // Set attribute renameing
            for (let [curAttr, curRename] of dataRequest.attributeRenames) {
                if (typeof curSet[curAttr] !== 'undefined') {
                    curSet[curRename] = curSet[curAttr];
                    delete curSet[curAttr];
                }
            }

            let wset;
            if (curSet.constructor.name !== 'WatchableSet') {
                // Auto generate id
                if (isNaN(curSet[idAttr])) {
                    curSet[idAttr] = ++genid;
                }
                curSet.swac_fromName = dataRequest.fromName;
                // Transform set
                wset= new WatchableSet(curSet);
            } else {
                wset = curSet;
            }
            transdata[curSet[idAttr]] = wset;
            
            // Add Data to source
            Model.store[curSet.swac_fromName].addSet(wset);
        }
        return transdata;
    }

    /**
     * Gets the value definitions of the values that each dataset in the
     * datasource of this requestor can carry.
     * 
     * @param {DOMElement} defRequest Element requesting data
     * @returns {Promise<DataCapsule>} Promise that resolves to an data object with definition
     * information.
     */
    static getValueDefinitions(defRequest) {
        return new Promise((resolve, reject) => {
            if (defRequest.fromName.endsWith('.json')) {
                let lastSlashPos = defRequest.fromName.lastIndexOf('/');
                let filename = defRequest.fromName.substring(lastSlashPos + 1, defRequest.fromName.length);
                defRequest.fromName = defRequest.fromName.replace(filename, 'definition.json');
            }
            Remote.fetchDefs(defRequest.fromName, defRequest.fromWheres, true).then(function (rawCapsule) {
                resolve(rawCapsule.data.attributes);
            }).catch(function (err) {
                reject(err);
            });
        });
    }

    /**
     * Method for saveing data
     * 
     * @param {Object} dataCapsle Casple with data
     * 
     * An data capsle is an object of form;
     * {
     *   data: [
     *      {name:value},
     *      {name:value},
     *      ...
     *   ],
     *   fromName: 'path where the data was recived from'
     * }
     * @param {boolean} supressMessages Supress errormessages generated by the model
     * 
     * @returns {Promise} Returns an promise that resolves with the information
     * deliverd by the save or update REST-interface
     */
    static save(dataCapsle, supressMessages = false) {
// Return promise for loading and initialising the view
        return new Promise((resolve, reject) => {
            // Build "create" interface resource url
            if (typeof dataCapsle.fromName === 'undefined') {
                Msg.error('model', 'fromName in datacapsle is missing. Check your dataCapsle metadata.');
            }
            Remote.clearDatasourceStates();
            let saveProms = [];
            // Save every dataset
            for (let j in dataCapsle.data) {
                // Exclude non data attributes
                if (j === 'map' || j.startsWith('swac_'))
                    continue;
                if (dataCapsle.data[j].swac_isnew) {
                    delete dataCapsle.data[j].id;
                }
                let saveObj = {};
                // Check data if it can be converted to number or booelan
                for (let attr in dataCapsle.data[j]) {
                    let curValue = dataCapsle.data[j][attr];
                    // TODO Send null values? Remove null check in component.js and edit.js
                    if (curValue === null || attr.startsWith('swac_'))
                        continue;
                    if (typeof curValue === 'string' && curValue !== '') {
                        let num = new Number(curValue);
                        if (!isNaN(num)) {
                            saveObj[attr] = num;
                            continue;
                        }
                    }
                    if (curValue === 'false') {
                        saveObj[attr] = false;
                    } else if (curValue === 'true') {
                        saveObj[attr] = true;
                    } else {
                        saveObj[attr] = curValue;
                    }
                }

                let remoteFunc;
                let remoteSuccMsg;
                let remoteFailMsg;
                // Check if create or update should be used
                if (typeof saveObj.id === 'undefined' || saveObj.id === '') {
                    // Create
                    remoteFunc = Remote.fetchCreate;
                    remoteSuccMsg = SWAC.lang.dict.core.savesuccsess;
                    remoteFailMsg = SWAC.lang.dict.core.saveerror;
                } else {
                    // Update
                    remoteFunc = Remote.fetchUpdate;
                    remoteSuccMsg = SWAC.lang.dict.core.updatesuccsess;
                    remoteFailMsg = SWAC.lang.dict.core.updateerror;
                }
                // Send request
                let curSaveProm = remoteFunc(dataCapsle.fromName, dataCapsle.fromWheres, supressMessages, saveObj).then(
                        function (dataCap) {
                            if (!supressMessages) {
                                UIkit.notification({
                                    message: remoteSuccMsg,
                                    status: 'info',
                                    timeout: SWAC.config.notifyDuration,
                                    pos: 'top-center'
                                });
                            }
                            if (dataCap?.data?.records) {
                                // Deliver records as plain array
                                dataCap.data = dataCap.data.records;
                            } else if (dataCap.data && typeof dataCap.data === 'number') {
                                // Deliver id as set
                                dataCap.data = [{id: dataCap.data}];
                            }

                            // Give the response dataCapsle to Promise.all()
                            return dataCap;
                        }
                ).catch(function (err) {
                    if (!supressMessages) {
                        UIkit.notification({
                            message: remoteFailMsg,
                            status: 'info',
                            timeout: SWAC.config.notifyDuration,
                            pos: 'top-center'
                        });
                    }
                    // Show http error response
                    if (err.statusText) {
                        Msg.error('Model', 'Error in save / update request: Status: ' + err.status + ': ' + err.statusText);
                    } else {
                        Msg.error('Model', 'Error while processing save / update request: ' + err);
                    }
                    // Give err to Promise.all()
                    reject(err);
                }
                );
                saveProms.push(curSaveProm);
            }

            // Wait for all datasets to be saved
            Promise.all(saveProms).then(function (dataCaps) {
                // Return all response dataCapsle
                resolve(dataCaps);
            });
        });
    }

    /**
     * Method for deleteing data
     * 
     * @param {Object} dataCapsle Casple with data
     * @param {boolean} supressErrorMessages If true automatic generated error messages are supressed.
     * 
     * An data capsle is an object of form;
     * {
     *   data: [
     *      {id:value},
     *      {id:value},
     *      ...
     *   ],
     *   fromName: 'path where the data was recived from'
     * }
     * 
     * @returns {Promise} Returns an promise that resolves with the information
     * deliverd by the delete REST-interface
     */
    static delete(dataCapsle, supressErrorMessages = false) {
// Return promise for loading and initialising the view
        return new Promise((resolve, reject) => {
            if (!dataCapsle.fromName) {
                Msg.error('model', 'fromName in datacapsle is missing. Check your dataCapsle metadata.');
            }
            // Delete every dataset
            for (let j in dataCapsle.data) {
                if (dataCapsle.data[j].id) {
                    // Send request
                    Remote.fetchDelete(dataCapsle.fromName + "/" + dataCapsle.data[j].id, dataCapsle.data[j], supressErrorMessages).then(
                            function (response) {
                                UIkit.notification({
                                    message: SWAC.lang.dict.core.deletesuccsess,
                                    status: 'info',
                                    timeout: SWAC.config.notifyDuration,
                                    pos: 'top-center'
                                });
                                resolve(response);
                            }
                    ).catch(
                            function (errors) {
                                UIkit.notification({
                                    message: SWAC.lang.dict.core.deleteerror,
                                    status: 'info',
                                    timeout: SWAC.config.notifyDuration,
                                    pos: 'top-center'
                                });
                                reject(errors);
                            }
                    );

                } else {
                    Msg.error('model', 'Dataset given to delete has no id.');
                }
            }
        });
    }

    /**
     * Resolves an reference to the single element and returns that.
     * 
     * @param {String} reference Reference url (starting with ref://)
     * @param {String} idAttr Name of the attribute used as id
     * @param {Map} attributeDefaults Default values for attributes Map<Sourcename,Object<Attribute,Value>>
     * @param {Map} attributeRenames Renameings for attributes
     * @param {int} reloadInterval Time in milliseconds after which data should no loger be used from local
     * @param {DataObserver[]} observers Objects that implement the DataObserver
     * @return {Promise<DataCapsule>} Promise that resolves to the data if succsessfull
     */
    static getFromReference(reference, idAttr, attributeDefaults, attributeRenames, reloadInterval, observers, comp) {
        let thisRef = this;
        return new Promise((resolve, reject) => {
            if (!reference) {
                Msg.error('Model', 'No reference given to get data from.');
                reject('No reference given to get data from.');
                return;
            }
            if (reference.indexOf('ref://') !== 0) {
                Msg.error('model', 'Given string >' + reference + '< is not a valid refernece.');
                reject('Given string >' + reference + '< is not a valid refernece.');
                return;
            }
            let dataRequest = {
                fromName: thisRef.getSetnameFromReference(reference),
                fromWheres: {},
                idAttr: idAttr,
                attributeDefaults: attributeDefaults,
                attributeRenames: attributeRenames,
                reloadInterval: reloadInterval,
                observers: observers
            };
            let setid = thisRef.getIdFromReference(reference);
            if (setid) {
                dataRequest.fromWheres['id'] = setid;
            }
            let params = thisRef.getParametersFromReference(reference);
            if (params) {
                for (let curParam of params) {
                    if (dataRequest.fromWheres[curParam.key])
                        dataRequest.fromWheres[curParam.key] = dataRequest.fromWheres[curParam.key] + '&' + curParam.key + '=' + curParam.value;
                    else
                        dataRequest.fromWheres[curParam.key] = curParam.value;
                }
            }

            thisRef.load(dataRequest, comp).then(function (data) {
                let dataCapsule = {
                    fromName: dataRequest.fromName,
                    data: data
                };
                resolve(dataCapsule);
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    /**
     * Gets the id from the reference string
     * 
     * @param {String} reference Reference string
     * @returns {Long} Number of the referenced object
     */
    static getIdFromReference(reference) {
        let lastSlashPos = reference.lastIndexOf('/');
        let idrefpart = reference.substring(lastSlashPos);
        let matches = idrefpart.match(/\d+/);
        if (!matches) {
            Msg.warn("model", "Reference contains no number.");
            return null;
        }
        let numbers = matches.map(Number);
        return numbers[0];
    }

    /**
     * Gets the setname form the reference string
     * 
     * @param {String} reference Refernece string (ref://)
     * @returns {String} Name of the set the reference points to
     */
    static getSetnameFromReference(reference) {
        let setname = reference.replace('ref://', '');
        if (setname.includes('?') && !setname.includes('?storage')) {
            let lastaskpos = setname.lastIndexOf('?');
            setname = setname.substring(0, lastaskpos);
        } else if (setname.endsWith('.json')) {
            // Return filename
        } else if (setname.includes('.')) {
            // Leaf file as it is
            let lastSlashPos = setname.lastIndexOf('/');
            let idrefpart = reference.substring(lastSlashPos);
            let matches = idrefpart.match(/\d+/);
            if (matches)
                setname = setname.substring(0, lastSlashPos);
        } else if (setname.includes('/') && !setname.includes('?storage')) {
            let lastSlashPos = setname.lastIndexOf('/');
            let idrefpart = reference.substring(lastSlashPos);
            let matches = idrefpart.match(/\d+/);
            if (matches)
                setname = setname.substring(0, lastSlashPos);
        }
        return setname;
    }

    /**
     * Gets the params that are stored in the reference.
     * 
     * @param {String} reference String begining with ref://
     * @returns {Object[]} Objects with key and value attribute for each param
     */
    static getParametersFromReference(reference) {
        if (reference.includes('?')) {
            let firstaskpos = reference.indexOf('?');
            let paramsstr = reference.substring(firstaskpos + 1, reference.length);
            let paramsarr = paramsstr.split('&');
            let params = [];
            for (let curParam of paramsarr) {
                let param = curParam.split('=');
                params.push({
                    key: param[0],
                    value: param[1]
                });
            }
            return params;
        }
        return null;
    }

    /**
     * Copys a requestor. If given attributes from the second parameter are 
     * inserted into placeholders whithin the requestors fromWhere clauses.
     * 
     * @param {DataRequestor} dataRequestor DataRequestor source object
     * @param {DOMElement} attrElem DOM Element containing attributes that should be placed in the requestors where clauses
     * @returns {DataRequestor}
     */
    static copyDataRequestor(dataRequestor, attrElem) {
        // Copy requestor
        let newRequestor = {};
        newRequestor.fromName = dataRequestor.fromName;
        newRequestor.fromWheres = {};
        for (let attr in dataRequestor.fromWheres) {
            newRequestor.fromWheres[attr] = dataRequestor.fromWheres[attr];
        }

        // Replace palceholders in wheres
        for (let curWhereName in newRequestor.fromWheres) {
            let curWhereValue = newRequestor.fromWheres[curWhereName];
            // If its a placeholder
            if (curWhereValue.indexOf('{') === 0) {
                let attrName = curWhereValue.replace('{', '').replace('}', '');
                // Get attr value from element
                let attrValue = attrElem.getAttribute(attrName);
                // Replace placeholder
                newRequestor.fromWheres[curWhereName] = attrValue;
            }
        }

        return newRequestor;
    }

    /**
     * Check if the given set matches the fromWheres.
     * Note: Currently only supports eq-filter
     * 
     * @param {WatchableSet} set    Dataset
     * @param {Object} fromWheres   Object with fromWheres as attributes
     * @returns {Boolean}   True if the set matches the fromWheres
     */
    static matchFilter(set, fromWheres) {
        if (!set)
            return false;
        if (!fromWheres || set.id === 0 || Object.keys(fromWheres).length === 0)
            return true;
        for (let curWhere in fromWheres) {
            // Only need todo filter if filter is string
            if (!fromWheres[curWhere].split)
                continue;
            for (let curPart of fromWheres[curWhere].split('&')) {
                curPart = curPart.replace(curWhere + '=', '');
                if (curWhere.startsWith('filter')) {
                    let parts = curPart.split(',');
                    // eq-filter
                    if (curPart.includes(',eq,')) {
                        // Saw equal needed here because numbers are strings in fromWheres
                        if (set[parts[0]] != parts[2] && set[parts[0]] + '' != parts[2] + '') {
                            return false;
                        }
                    } else if (curPart.includes(',gt,')) {
                        // gt-filter
                        let setdate = new Date(set[parts[0]]);
                        // Date compare
                        if (!isNaN(setdate.valueOf())) {
                            let compDate = new Date(parts[2]);
                            if (setdate <= compDate)
                                return false;
                            continue;
                        }

                        // Number compare
                        let setnum = new Number(set[parts[0]]);
                        if (!isNaN(setnum)) {
                            let compNum = new Number(parts[2]);
                            if (setnum <= compNum)
                                return false;
                            continue;
                        }
                    } else if (curPart.includes(',lt,')) {
                        // lt-filter
                        let setdate = new Date(set[parts[0]]);
                        // Date compare
                        if (!isNaN(setdate.valueOf())) {
                            let compDate = new Date(parts[2]);
                            if (setdate >= compDate)
                                return false;
                            continue;
                        }

                        // Number compare
                        let setnum = new Number(set[parts[0]]);
                        if (!isNaN(setnum)) {
                            let compNum = new Number(parts[2]);
                            if (setnum >= compNum)
                                return false;
                            continue;
                        }
                    }
                }
            }
        }
        return true;
    }

    /**
     * Add set to store bucket, when some observed WatchableSet informs about an added set
     * 
     * @param {WatchableSource} source Source where the set was added
     * @param {WatchableSet} set Added set
     */
    static notifyAddSet(source, set) {
        if (!this.store[set.swac_fromName].hasSet(set.id))
            this.store[set.swac_fromName].addSet(set);
    }

    /**
     * Delete set from store bucket when some observed WatcableSet informs about an deleted set
     * 
     * @param {WatchableSource} source Source where the set was added
     * @param {WatchableSet} set Added set
     */
    static notifyDelSet(source, set) {
        if (this.store[set.swac_fromName].hasSet(set.id))
            this.store[set.swac_fromName].delSet(set);
    }

    static createWatchableSource(fromName, comp) {
        return new WatchableSource(fromName, comp);
    }

    static createWatchableSet(set) {
        return new WatchableSet(set);
    }
}


