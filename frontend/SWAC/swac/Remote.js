import SWAC from './swac.js';
import Msg from './Msg.js';

/*
 * This object contains all neccessery logic for communication between frontend
 * and backend.
 * It is currently implemented to support only json as exchange format.
 */
var remoteHandler = new Object();
remoteHandler.datasourceStates = {};
remoteHandler.datasourceTries = {};
remoteHandler.waitlist = [];
remoteHandler.running = 0;

document.addEventListener('uiComplete', function () {
    // Clear syncstates
    if (window.location.search.indexOf('cleardatasourcestates=true') > 0) {
        localStorage.removeItem('swac_datasourceStates');
        Msg.warn('Remote', 'Cleared datasourceStates');
    }
    // Get synchronisation states
    let datasourcestatesStr = localStorage.getItem('swac_datasourceStates');
    if (datasourcestatesStr !== null) {
        remoteHandler.datasourceStates = JSON.parse(datasourcestatesStr);
    } else {
        remoteHandler.datasourceStates = {};
        localStorage.setItem('swac_datasourceStates', JSON.stringify(remoteHandler.datasourceStates));
    }
});

remoteHandler.clearDatasourceStates = function () {
    remoteHandler.datasourceStates = {};
    localStorage.setItem('swac_datasourceStates', JSON.stringify(remoteHandler.datasourceStates));
};

/**
 * Function for checking reachability of an web ressource
 * 
 * @param {string} fromName url where to fetch
 * @param {Object} fromWheres Object with attributes and values that should be send as query
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves with datacapsle when data was recived
 */
remoteHandler.fetchHead = function (fromName, fromWheres, supressErrorMessage) {
    remoteHandler.datasourceTries = {};
    return remoteHandler.fetch(fromName, fromWheres, 'head', supressErrorMessage);
};

/**
 * Function for getting remote data useing the fetch api
 * This returns an promise that will be fullfilled with the recived data
 * or rejected with the response object
 * 
 * @param {string} fromName url where to fetch
 * @param {Object} fromWheres Object with attributes and values that should be send as query
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves with datacapsle when data was recived
 */
remoteHandler.fetchGet = function (fromName, fromWheres, supressErrorMessage) {
    remoteHandler.datasourceTries = {};
    return remoteHandler.fetch(fromName, fromWheres, 'get', supressErrorMessage);
};

/**
 * Function for getting definitions of a remote resouce
 * 
 * @param {string} fromName url where to fetch
 * @param {Object} fromWheres Object with attributes and values that should be send as query
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves with datacapsle when data was recived
 */
remoteHandler.fetchDefs = function (fromName, fromWheres, supressErrorMessage) {
    remoteHandler.datasourceTries = {};
    return remoteHandler.fetch(fromName, fromWheres, 'defs', supressErrorMessage);
};

/**
 * Function for sending an delte over fecht api
 * This returns an promise that will be fullfilled with the recived json data
 * or rejected with the response object
 * 
 * @param {string} fromName url where to fetch
 * @param {Object} fromWheres Object with attributes and values that should be send as query
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves with datacapsle when data was recived
 */
remoteHandler.fetchDelete = function (fromName, fromWheres, supressErrorMessage) {
    remoteHandler.datasourceTries = {};
    return remoteHandler.fetch(fromName, fromWheres, 'delete', supressErrorMessage);
};

/**
 * Sends an request with data in url (no http body)
 * 
 * @param {string} fromName resource from that fetch or delete data (maybe an url, or an REST resource path)
 * @param {Object} fromWheres Object with attributes and values that should be send as query
 * @param [string} mode string with mode (get, list, defs, create, update, delete)
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @param {object} data object with parameters to send along (only on POST and UPDATE)
 * @returns {Promise} Promise that resolves with datacapsle when data was recived
 */
remoteHandler.fetch = function (fromName, fromWheres, mode, supressErrorMessage, data) {
    // Detect max requests
    if (remoteHandler.running > 50) {
        return this.addToWaitlist(fromName, fromWheres, mode, supressErrorMessage, data);
    } else {
        remoteHandler.running++;
    }

    return new Promise((resolve, reject) => {
        // Determine matching target url
        let sourceRef = remoteHandler.determineMatchingResource(fromName, mode);
        // If got no url but an error object
        if (!sourceRef) {
            reject("No datasource found for >" + fromName + '<');
            return;
        }
        // Add fromWheres to URL
        let url = sourceRef.url;
        for (let curWhereName in fromWheres) {
            if (url.indexOf("?") === -1) {
                url += '?';
            } else {
                url += "&";
            }
            url = url + curWhereName + "=" + fromWheres[curWhereName];
        }

        // Build request configuration
        let fetchConf = {
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *omit
            headers: {
                'user-agent': 'SWAC/1.0 fetch',
                'content-type': 'application/json'
            },
            method: sourceRef.mode, // *GET, DELETE
            mode: 'cors', // no-cors, *same-origin
            redirect: 'follow', // *manual, error
            referrer: 'no-referrer' // *client
        };

        if (typeof data !== 'undefined') {
            try {
                fetchConf.body = JSON.stringify(data); // must match 'Content-Type' header
            } catch (e) {
                Msg.error('Model', 'Could not save data because it was not transformable to JSON: ' + e);
                console.log(data);
                return;
            }
        }
        // Send fetch and handle response here for global error handling
        fetch(url, fetchConf).then(
                function (response) {
                    remoteHandler.running--;
                    remoteHandler.lookAtWaitlist();
                    // Create errormessage if status is not ok
                    if (!response.ok) {
                        if (!supressErrorMessage) {
                            remoteHandler.showFetchError(response);
                        }
                        // Create error event
                        let event = new CustomEvent("swac_fetchfail_" + response.status, {
                            "detail": response
                        });
                        document.dispatchEvent(event);
                        // Note an error to syncstate
                        remoteHandler.datasourceStates[sourceRef.url + '_' + mode] = {
                            status: response.status,
                            date: new Date()
                        };
                        // Note an try in actual request
                        remoteHandler.datasourceTries[sourceRef.url + '_' + mode] = 1;
                        // Save datasourceStates for page reloads
                        localStorage.setItem('swac_datasourceStates', JSON.stringify(remoteHandler.datasourceStates));

                        remoteHandler.fetch(fromName, fromWheres, mode, supressErrorMessage, data).then(
                                function (data) {
                                    // Resolved in child try
                                    resolve(data);
                                }).catch(
                                function (err) {
                                    // Finally nothing found
                                    reject(response);
                                });
                    } else {
                        let ctype = response.headers.get("content-type");
                        if (!ctype)
                            ctype = 'unknown';
                        switch (ctype) {
                            case "application/json":
                                // deliver recived
                                response.json().then(function (data) {
                                    resolve({
                                        data: data,
                                        fromName: fromName,
                                        fromWheres: fromWheres
                                    });
                                }).catch(function (err) {
                                    reject(err);
                                });
                                break;
                            case "application/csv":
                                UIkit.modal.alert("CSV support is not available yet. Sponsor the project to get out of the box CSV support. ;)");
                                break;
                            default:
                                // Try as json
                                response.json().then(function (data) {
                                    resolve({
                                        data: data,
                                        fromName: fromName,
                                        fromWheres: fromWheres
                                    });
                                }).catch(function (err) {
                                    let msg = SWAC.lang.dict.core.contenttype_unsupported.replace('%content-type%', ctype);
                                    UIkit.modal.alert(msg);
                                    reject(err);
                                });
                        }
                    }
                }
        ).catch(function (error) {
            remoteHandler.running--;
            remoteHandler.lookAtWaitlist();
            if (!supressErrorMessage) {
                remoteHandler.showFetchError(error);
            }
            // Note an error to syncstate
            remoteHandler.datasourceStates[sourceRef.url + '_' + mode] = {
                status: 599,
                date: new Date()
            };
            // Save datasourceStates for page reloads
            localStorage.setItem('swac_datasourceStates', JSON.stringify(remoteHandler.datasourceStates));

            reject(error);
        });
    });
};

/**
 * When there are more than 50 requests at one time, the next request goes to waitlist to not overhelm servers
 * 
 * @param {string} fromName resource from that fetch or delete data (maybe an url, or an REST resource path)
 * @param {Object} fromWheres Object with attributes and values that should be send as query
 * @param [string} mode string with mode (get, list, defs, create, update, delete)
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @param {object} data object with parameters to send along (only on POST and UPDATE)
 * @returns {Promise} Promise that resolves with datacapsle when data was send / recived
 */
remoteHandler.addToWaitlist = function (fromName, fromWheres, mode, supressErrorMessage, data) {
    return new Promise((resolve, reject) => {
        let entry = {
            fromName: fromName,
            fromWheres: fromWheres,
            mode: mode,
            supressErrorMessage: supressErrorMessage,
            data: data,
            callbackResolve: function (res) {
                resolve(res);
            },
            callbackReject: function (err) {
                reject(err);
            }
        };
        this.waitlist.push(entry);
    });
};

/**
 * Look if some request is on waitlist and perform if there are slots free
 * 
 * @returns {undefined}
 */
remoteHandler.lookAtWaitlist = function () {
    if (this.waitlist.length < 1)
        return;
    let set;
    for (let i = 0; i < this.waitlist.length; i++) {
        if (this.waitlist[i]) {
            set = this.waitlist.shift();
            break;
        }
    }
    remoteHandler.fetch(set.fromName, set.fromWheres, set.mode, set.supressErrorMessage, set.data).then(function (res) {
        set.callbackResolve(res);
    }).catch(function (err) {
        set.callbackReject(err);
    });
};

/**
 * Function for posting data useing the fetch api
 * This returns an promise that will be fullfilled with the recived json data
 * or rejected with the response object
 * 
 * @param {string} fromName url where to fetch
 * @param {Object} fromWheres Object with attributes and values that should be send as query
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @param {object} data object with parameters to send along
 * @returns {Promise} Promise that resolves when data was recived
 */
remoteHandler.fetchCreate = function (fromName, fromWheres, supressErrorMessage, data) {
    remoteHandler.datasourceTries = {};
    return remoteHandler.fetch(fromName, fromWheres, 'create', supressErrorMessage, data);
};

/**
 * Function for sending an update over fecht api
 * This returns an promise that will be fullfilled with the recived json data
 * or rejected with the response object
 * 
 * @param {string} fromName url where to fetch
 * @param {Object} fromWheres Object with attributes and values that should be send as query
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @param {object} data object with parameters to send along
 * @returns {Promise} Promise that resolves when data was recived
 */
remoteHandler.fetchUpdate = function (fromName, fromWheres, supressErrorMessage, data) {
    remoteHandler.datasourceTries = {};
    return remoteHandler.fetch(fromName, fromWheres, 'update', supressErrorMessage, data);
};

/**
 * Searches an matching ressource for the given url within the configured
 * datasources.
 * 
 * @param {String} fromName Name of the data source table or path
 * @param {String} mode Name of the mode that wants to request (get, list, defs, create, update, delete, head)
 * @returns {mode,url} httpmode and url or null, if no one found
 */
remoteHandler.determineMatchingResource = function (fromName, mode) {
    // Set automatic mode
    let hmode;
    switch (mode) {
        case 'head':
            hmode = 'HEAD';
            break;
        case 'delete':
            hmode = 'DELETE';
            break;
        case 'update':
            hmode = 'PUT';
            break;
        case 'create':
            hmode = 'POST';
            break;
        default:
            hmode = 'GET';
    }

    // If fromName is a concrete url return that url
    let datasources;
    if (fromName.startsWith('http')
            || fromName.startsWith('/')
            || fromName.startsWith("../")) {
        // Do not try other datasources
        datasources = [{
                url: fromName
            }];
    } else {
        datasources = SWAC.config.datasources;
    }

    // Search matching ressource
    for (let i in datasources) {
        let datasource = datasources[i];
        // Check if try is not neccessery
        if (datasource.exclude && datasource.exclude.includes(fromName))
            continue;
        // Create complete url for this datasource
        let sourceRef = {
            url: datasource.url.replace('[fromName]', fromName),
            mode: hmode,
            datasource: i
        };
        // If there is a mode specific interface
        if (datasource.interfaces && datasource.interfaces[mode]) {
            sourceRef.mode = datasource.interfaces[mode][0];
            sourceRef.url = sourceRef.url.replace('[iface]', datasource.interfaces[mode][1]);
        } else {
            sourceRef.url = sourceRef.url.replace('[iface]', '');
            sourceRef.mode = hmode;
        }

        // Check if this url was tried before
        if (typeof remoteHandler.datasourceStates[sourceRef.url + '_' + mode] === 'undefined') {
            // If url was not tried deliver it
            return sourceRef;
        } else if (remoteHandler.datasourceStates[sourceRef.url + '_' + mode].status === 403
                && !remoteHandler.datasourceTries[sourceRef.url + '_' + mode]) {
            return sourceRef;
        } else if (remoteHandler.datasourceStates[sourceRef.url + '_' + mode].status === 403
                && remoteHandler.datasourceTries[sourceRef.url + '_' + mode]) {
            Msg.warn('Remove', 'URL >' + sourceRef.url + '< is known as protected and you dont have access.');
        } else if (remoteHandler.datasourceStates[sourceRef.url + '_' + mode].status >= 400) {
            let link = window.location.href;
            link += link.includes('?') ? '&cleardatasourcestates=true' : '?cleardatasourcestates=true';

            Msg.warn('Remote', 'URL >' + sourceRef.url
                    + '< is known as not applicable for operation >' + mode + '<. Last test on: '
                    + remoteHandler.datasourceStates[sourceRef.url + '_' + mode].date
                    + 'to retry without waiting klick here: ' + link);
        }
    }
    return null;
};

/**
 * Generates and shows an errormessage from response
 * 
 * @param {Response} response
 * @returns {undefined}
 */
remoteHandler.showFetchError = function (response) {
    // Try to get json from error response (will succseed if this is an server catched error)
    try {
        response.json().then(function (jsonresponse) {
            if (typeof jsonresponse.errors !== 'undefined') {
                let errorMessage = jsonresponse.errors[0];

                UIkit.notification({
                    message: errorMessage,
                    status: 'error',
                    timeout: SWAC.config.notifyDuration,
                    pos: 'top-center'
                });
                if (jsonresponse.errors.length > 1) {
                    let moreMsgs = SWAC.lang.dict.core.moreerrors;
                    moreMsgs = SWAC.lang.dict.replacePlaceholders(moreMsgs, 'number', (jsonresponse.errors.length - 1));
                    UIkit.notification({
                        message: moreMsgs,
                        status: 'error',
                        timeout: SWAC.config.notifyDuration,
                        pos: 'top-center'
                    });
                }
            } else {
                // Show http status text if there is no special message
                UIkit.notification({
                    message: response.statusText,
                    status: 'error',
                    timeout: SWAC.config.notifyDuration,
                    pos: 'top-center'
                });
            }
        });
    } catch (e) {
        // Show http status text if there is no special message
        UIkit.notification({
            message: response.statusText,
            status: 'error',
            timeout: SWAC.config.notifyDuration,
            pos: 'top-center'
        });
    }
};
export default remoteHandler;