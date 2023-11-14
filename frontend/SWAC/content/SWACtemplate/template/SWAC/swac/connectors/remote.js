/*
 * This object contains all neccessery logic for communication between frontend
 * and backend.
 * It is currently implemented to support only json as exchange format.
 */
var remoteHandler = new Object();
remoteHandler.responseMetadata = {}; // Storage for response metadatas
remoteHandler.apiCheckupURL = "system/sysinfo";
remoteHandler.apistatus = null;

document.addEventListener('uiComplete', function () {
// Clear syncstates
    if (window.location.search.indexOf('clearsyncstates=true') > 0) {
        localStorage.removeItem('swac_syncstates');
        Msg.warn('remote.js', 'Cleared syncstate chache.');
    }
});

/**
 * Checks an API endpoint on function
 * 
 * @returns {Promise} Promise that resolves with aswer json if checkup was succsessfull
 */
remoteHandler.apiCheckup = function () {
    return new Promise((resolve, reject) => {
        // Use custom api checkup url if given
        if (typeof SWAC_config.apicheckupurl !== 'undefined') {
            remoteHandler.apiCheckupURL = SWAC_config.apicheckupurl;
        } else {
            // Disable api checkup
            resolve();
            return;
        }
        var querydata = {
        };

        remoteHandler.fetchGet(remoteHandler.apiCheckupURL, querydata, true).then(function (json) {
            let succseededEvent = new CustomEvent('swac_apicheckup_succseeded', {
                detail: {
                    url: remoteHandler.apiCheckupURL
                }
            });
            document.dispatchEvent(succseededEvent);
            resolve(json);
        }).catch(function (response) {
            if (response.status === 404) {
                UIkit.modal.dialog(
                        SWAC_language.core.backendnotready,
                        {
                            bgClose: false,
                            escClose: false
                        }
                );
                setTimeout(function () {
                    location.reload();
                }, 5000);
                remoteHandler.apistatus = 404;
                reject(404);
            } else if (response.status === 503 && !window.location.href.includes('/setup.html')) {
                UIkit.modal.dialog(
                        SWAC_language.core.apinotinstalled,
                        {
                            bgClose: false,
                            escClose: false
                        }
                );
                setTimeout(function () {
                    location.reload();
                }, 5000);
                remoteHandler.apistatus = 503;
                reject(503);
            } else if (response.status === 503 && window.location.href.includes('/setup.html')) {
                remoteHandler.apistatus = 503;
                resolve(503);
                let failedEvent = new CustomEvent('swac_apicheckup_failed', {
                detail: {
                    url: remoteHandler.apiCheckupURL
                }
            });
            document.dispatchEvent(failedEvent);
            } else {
                UIkit.modal.dialog(
                        "Other error occured",
                        {
                            bgClose: false,
                            escClose: false
                        }
                );
                remoteHandler.apistatus = 500;
                reject(response);
            }
        });
    });
};

/**
 * Function for checking reachability of an web ressource
 * 
 * @param {string} url url where to fetch
 *  * @param {object} data object with parameters to send along
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves when data was recived
 */
remoteHandler.fetchHead = function (url, data, supressErrorMessage) {
    // Check if query string should be added
    let questIndex = url.indexOf("?");

    // Build query string from data
    let query = "";
    for (let i in data) {
        if (questIndex === -1) {
            url += '?';
            questIndex++;
        } else {
            query += "&";
        }

        query = query + i + "=" + data[i];
    }
    url += query;

    return $.ajax({
        body: data,
        type: "HEAD",
        url: url,
        async: false
    });
};

/**
 * Function for getting remote data useing the fetch api
 * This returns an promise that will be fullfilled with the recived data
 * or rejected with the response object
 * 
 * @param {string} url url where to fetch
 * @param {object} data object with parameters to send along
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves when data was recived
 */
remoteHandler.fetchGet = function (url, data, supressErrorMessage) {
    return remoteHandler.fetchGetDelete(url, data, 'GET', supressErrorMessage);
};

/**
 * Function for sending an delte over fecht api
 * This returns an promise that will be fullfilled with the recived json data
 * or rejected with the response object
 * 
 * @param {string} url url where to fetch
 * @param {object} data object with parameters to send along
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves when data was recived
 */
remoteHandler.fetchDelete = function (url, data, supressErrorMessage) {
    return remoteHandler.fetchGetDelete(url, data, 'DELETE', supressErrorMessage);
};

/**
 * Sends an request with data in url (no http body)
 * 
 * @param {string} resource resource from that fetch or delete data (maybe an url, or an REST resource path)
 * @param {object} data object with parameters to send along
 * @param [string} mode string with mode (GET or DELETE)
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves when data was recived
 */
remoteHandler.fetchGetDelete = function (resource, data, mode, supressErrorMessage) {
    return new Promise((resolve, reject) => {
        // Determine matching target url
        let url = remoteHandler.determineMatchingResource(resource, data, supressErrorMessage, 'get');
        // If got no url but an error object
        if (url instanceof Object) {
            if (supressErrorMessage)
                reject(url);
            return;
        }

        // Check if query string should be added
        let questIndex = url.indexOf("?");

        // Build query string from data
        let query = "";
        for (let i in data) {
            if (questIndex === -1) {
                url += '?';
                questIndex++;
            } else {
                query += "&";
            }

            query = query + i + "=" + data[i];
        }
        url += query;

        // Send fetch and handle response here for global error handling
        fetch(url, {
            // Data in url params not here
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *omit
            headers: {
                'user-agent': 'SWAC/1.0 fetch',
                'content-type': 'application/json'
            },
            method: mode, // *GET, DELETE
            mode: 'cors', // no-cors, *same-origin
            redirect: 'follow', // *manual, error
            referrer: 'no-referrer' // *client
        }).then(
                function (response) {
                    // Save request metadata
                    remoteHandler.responseMetadata[resource] = {};
                    remoteHandler.responseMetadata[resource].url = url;

                    // Create errormessage if status is not ok
                    if (!response.ok) {
                        if (!supressErrorMessage) {
                            remoteHandler.showFetchError(response);
                        }

                        if (url.indexOf(remoteHandler.apiCheckupURL) === -1) {
                            // Note a not found to syncstate
                            // Load syncstates (load required, because another source possible has changed syncstates in betweentime
                            let syncstatesStr = localStorage.getItem('swac_syncstates');
                            if (syncstatesStr === null) {
                                syncstatesStr = "{}";
                            }
                            let syncstates = JSON.parse(syncstatesStr);
                            syncstates[url] = {};
                            syncstates[url].status = 404;
                            syncstates[url].date = new Date();
                            localStorage.setItem('swac_syncstates', JSON.stringify(syncstates));
                        }

                        reject(response);
                    } else {
                        // deliver recived data
                        resolve(response.json());
                    }
                }
        ).catch(function (error) {
            if (!supressErrorMessage) {
                remoteHandler.showFetchError(error);
            }
            if (url.indexOf(remoteHandler.apiCheckupURL) === -1) {
                // Note a not found to syncstate
                // Load syncstates (load required, because another source possible has changed syncstates in betweentime
                let syncstatesStr = localStorage.getItem('swac_syncstates');
                if (syncstatesStr === null) {
                    syncstatesStr = "{}";
                }
                let syncstates = JSON.parse(syncstatesStr);
                syncstates[url] = {};
                syncstates[url].status = 404;
                syncstates[url].date = new Date();
                localStorage.setItem('swac_syncstates', JSON.stringify(syncstates));
            }

            reject(error);
        });
    });
};

/**
 * Function for posting data useing the fetch api
 * This returns an promise that will be fullfilled with the recived json data
 * or rejected with the response object
 * 
 * @param {string} url url where to fetch
 * @param {object} data object with parameters to send along
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves when data was recived
 */
remoteHandler.fetchPost = function (url, data, supressErrorMessage) {
    return remoteHandler.fetchPostUpdate(url, data, 'POST', supressErrorMessage);
};

/**
 * Function for sending an update over fecht api
 * This returns an promise that will be fullfilled with the recived json data
 * or rejected with the response object
 * 
 * @param {string} url url where to fetch
 * @param {object} data object with parameters to send along
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves when data was recived
 */
remoteHandler.fetchUpdate = function (url, data, supressErrorMessage) {
    return remoteHandler.fetchPostUpdate(url, data, 'PUT', supressErrorMessage);
};

/**
 * Sends an request per post or update
 * 
 * @param {string} url url where to fetch
 * @param {object} data object with parameters to send along
 * @param [string} mode string with mode (POST or UPDATE)
 * @param {boolean} supressErrorMessage if true no errormessages will be generated
 * @returns {Promise} Promise that resolves when data was recived
 */
remoteHandler.fetchPostUpdate = function (url, data, mode, supressErrorMessage) {
    return new Promise((resolve, reject) => {
        // Determine matching target url
        url = remoteHandler.determineMatchingResource(url, data, supressErrorMessage, 'get');
        // If got no url but an error object
        if (url instanceof Object) {
            if (supressErrorMessage)
                reject(url);
            return;
        }

        // Send fetch and handle response here for global error handling
        fetch(url, {
            body: JSON.stringify(data), // must match 'Content-Type' header
            cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
            credentials: 'same-origin', // include, *omit
            headers: {
                'user-agent': 'SWAC/1.0 fetch',
                'content-type': 'application/json'
            },
            method: mode, // *GET, PUT, DELETE, etc.
            mode: 'cors', // no-cors, *same-origin
            redirect: 'follow', // *manual, error
            referrer: 'no-referrer' // *client
        }).then(
                function (response) {
                    // Create errormessage if status is not ok
                    if (!response.ok) {
                        if (!supressErrorMessage) {
                            remoteHandler.showFetchError(response);
                        } else {
                            Msg.warn('remote',
                                    'Automatic error message generation is supressed for request to >' + url + '<');
                        }

//                        lastResponse = remoteHandler.fetchHead(url, data, supressErrorMessage);
                        if (url.indexOf(remoteHandler.apiCheckupURL) === -1) {
                            // Note a not found to syncstate
                            // Load syncstates (load required, because another source possible has changed syncstates in betweentime
                            let syncstatesStr = localStorage.getItem('swac_syncstates');
                            if (syncstatesStr === null) {
                                syncstatesStr = "{}";
                            }
                            let syncstates = JSON.parse(syncstatesStr);
                            syncstates[url] = {};
                            syncstates[url].status = 404;
                            syncstates[url].date = new Date();
                            localStorage.setItem('swac_syncstates', JSON.stringify(syncstates));
                        }

                        reject(response);
                    } else {
                        // deliver recived data
                        resolve(response.json());
                    }
                }
        );
    });
};

/**
 * Searches an matching ressource for the given url within the configured
 * datasources.
 * 
 * @param {String} resource URL to data or ressouce path
 * @param {Object} data Data to send with
 * @param {type} supressErrorMessage If true no message will created in case of error
 * @returns url to the concrete ressource or last response, if no url was found
 */
remoteHandler.determineMatchingResource = function (resource, data, supressErrorMessage) {
    if (window.location.search.indexOf('clearsyncstates=true') > 0) {
        localStorage.removeItem('swac_syncstates');
        Msg.warn('remote.js', 'Cleared syncstate chache.');
    }

    let url;
    // Determine matching target url
    if (!resource.startsWith('http')
            && !resource.startsWith('/')
            && !resource.startsWith("../")) {

        // Get synchronisation states
        let syncstatesStr = localStorage.getItem('swac_syncstates');
        let syncstates;
        if (syncstatesStr !== null) {
            syncstates = JSON.parse(syncstatesStr);
        } else {
            syncstates = {};
            localStorage.setItem('swac_syncstates', JSON.stringify(syncstates));
        }

        // Search matching ressource
        for (let datasource of SWAC_config.datasources) {
            // Create complete url for this datasource
            url = datasource.replace('[fromName]', '') + resource;
            // Get saved syncstates
            let syncstatesStr = localStorage.getItem('swac_syncstates');
            let syncstates = JSON.parse(syncstatesStr);
            // Check if this url was tried before
            if (typeof syncstates[url] === 'undefined') {
                // If url was not tried deliver it
                return url;
            } else if (syncstates[url].status === 404) {
                Msg.warn('remote.js', 'URL >' + url
                        + '< is known as not reachable. Last test on: '
                        + syncstates[url].date);
            }
        }
    } else {
        url = resource;
    }
    return url;
};

/**
 * Generates and shows an errormessage from response
 * 
 * @param {type} response
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
                    timeout: SWAC_config.notifyDuration,
                    pos: 'top-center'
                });
                if (jsonresponse.errors.length > 1) {
                    let moreMsgs = SWAC_language.core.moreerrors;
                    moreMsgs = SWAC_language.replacePlaceholders(moreMsgs, 'number', (jsonresponse.errors.length - 1));
                    UIkit.notification({
                        message: moreMsgs,
                        status: 'error',
                        timeout: SWAC_config.notifyDuration,
                        pos: 'top-center'
                    });
                }
            } else {
                // Show http status text if there is no special message
                UIkit.notification({
                    message: response.statusText,
                    status: 'error',
                    timeout: SWAC_config.notifyDuration,
                    pos: 'top-center'
                });
            }
        });
    } catch (e) {
        // Show http status text if there is no special message
        UIkit.notification({
            message: response.statusText,
            status: 'error',
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center'
        });
    }
};