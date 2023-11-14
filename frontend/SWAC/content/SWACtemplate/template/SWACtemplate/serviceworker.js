let serviceworker_version = 'a1';
// Import configuration
self.importScripts('configuration.js');
//import localforage lib, this libs provides an api for easy key-value indexedDB access
self.importScripts(SWAC_config.swac_root + '/swac/libs/localforage/localforage.min.js');

/**
 * event listener for the install event 
 */
self.addEventListener('install', function (evt) {
    console.log('SWAC serviceworker is installing...');
    // Add swac.js (not in core components because it woul load itself)
    SWAC_config.coreComponents.push(SWAC_config.swac_root + "/swac/swac.js");
    // Add localforage script used by serviceworker
    SWAC_config.coreComponents.push(SWAC_config.swac_root + '/swac/libs/localforage/localforage.min.js');
    // Add default pages
    SWAC_config.coreComponents.push(SWAC_config.app_root + "/js/offline.js");
    SWAC_config.coreComponents.push(SWAC_config.app_root + "/sites/offline.html");
    SWAC_config.coreComponents.push(SWAC_config.app_root + "/data/offline.json");

    // Install used components
    self.importScripts(SWAC_config.swac_root + "/swac/Component.js");
    for (let i in SWAC_config.progressive.components) {
        precacheComponent(SWAC_config.progressive.components[i]);
    }

    evt.waitUntil(precache(SWAC_config.coreComponents));
    // waitUntil does not means that this code is only reached after execution
});

/*
 * Caches the files given.
 * 
 * @param {String[]} files contains the paths to the files
 * @param {boolean} if set to true
 */
function precache(files) {
    return new Promise((resolve, reject) => {
        //Open cache to put files into
        caches.open('swac_sw_cache_' + serviceworker_version).then(function (cache) {
            let cacheProms = [];
            for (let curFile of files) {
                // Jump over undefined (maybe deactivated) file entries
                if (!curFile)
                    continue;
                if (SWAC_config.debugmode)
                    console.log('SWAC ServiceWorker: Precacheing file: >' + curFile + '<');
                let request = new Request(curFile);

                let storedate = new Date().getTime();
                //safe url of request with timestamp of current date in indexedDB
                localforage.setItem(request.url.toString(), storedate);

                let fileCacheProm = cache.add(curFile);
                cacheProms.push(fileCacheProm);
                fileCacheProm.catch(function (error) {
                    console.error('SWAC ServiceWorker: Could not load file >' + curFile + '<: ' + error);
                });
            }
            Promise.all(cacheProms).then(function () {
                resolve();
            }).catch(function (error) {
                console.error('SWAC ServiceWorker: Error while cacheing: ' + error);
                reject();
            });
        }).catch(function (error) {
            console.error('SWAC serviceworker: Error while cacheing: ' + error);
        });
    });
}

/**
 * Precaches a complete SWAC component for offline use
 * 
 * @param {String} componentName Components name
 * @returns {undefined}
 */
function precacheComponent(componentName) {
    let component_root = SWAC_config.swac_root + '/swac/components/'
            + componentName + '/';
    let component_url = component_root + componentName + '.js';
    // Include main script
    self.importScripts(component_url);

    let factory = eval(componentName + 'Factory');
    if (factory) {
        let explObj = factory.create();
        let precacheFiles = [];
        precacheFiles.push(component_url);
        // Add language file
        let activeLang = navigator.language || navigator.userLanguage;
        let bindStrPos = activeLang.indexOf('-');
        if (bindStrPos > 0) {
            activeLang = activeLang.substring(0, bindStrPos);
        }
        precacheFiles.push(component_root + 'langs/' + activeLang + '.js');
        for (let curDepends of explObj.desc.depends) {
            precacheFiles.push(curDepends.path);
        }
        for (let curTemplate of explObj.desc.templates) {
            precacheFiles.push(component_root + curTemplate.name + '.html');
            if (curTemplate.style)
                precacheFiles.push(component_root + curTemplate.style + '.css');
        }
        precache(precacheFiles, true);
    } else {
        console.error('SWAC ServiceWorker: Failed to precache component >' + componentName + '<: Factory not found.');
    }
}

/**
 * event listener for the activate event, in this event the cache is cleand from 
 * files older then DELETIONTIME
 */
self.addEventListener('activate', function (evt) {
    if (SWAC_config.debugmode)
        console.log('SWAC ServiceWorker: The service worker is activateing...');

    //precache in activation-event to keep precache-sites up to to date,
    //also important to update timestamp, otherwise it might get thrown out 
    //by the cleanup-procedure
    evt.waitUntil(precache(SWAC_config.progressive.precache));

    // Create timeout date
    let timeoutTime = new Date().getTime() - (SWAC_config.progressive.cachetimeout * 24 * 60 * 60 * 1000);

    //iterate through list of urls in indexedDB
    localforage.iterate(function (value, key, iterationNumber) {
        //get date object from value in indexedDB
        let cachedate = new Date(value);
        // if cacheing is longer ago as the configured timeout
        if (cachedate.getTime() < timeoutTime) {
            if (SWAC_config.debugmode)
                console.log('SWAC ServiceWorker: Deleteing >' + key + '< from cache, because its to old.');
            var request = new Request(key);

            //remove file from cache
            caches.open('swac_sw_cache_' + serviceworker_version).then(function (cache) {
                cache.delete(request);
            });

            //remove entry from indexedDB
            localforage.removeItem(key).then(function () {
                // Run this code once the key has been removed.
                //console.log('Key is cleared!');
            }).catch(function (error) {
                console.error('SWAC ServiceWorker: Could not remove cache key >' + key + '<: ' + error);
            });
        }
    });
});



/**
 * EventListener for the fetch event, provides a response to the request either 
 * from network of cache, then updates the cache and then safes the cache date
 */
self.addEventListener('fetch', function (evt) {
    if (SWAC_config.debugmode)
        console.log('SWAC ServiceWorker: fetching >' + evt.request.url + '<');

    // Do not cache POST requests
    if (evt.request.method === 'POST') {
        if (SWAC_config.debugmode)
            console.log('SWAC ServiceWorker: ignored - is POST request');
        return;
    }

    // Check if request is datarequest
    let isDataRequest = false;
    for (let curSource of SWAC_config.datasources) {
        let curSourceMain = curSource.replace('[fromName]', '');
        if (evt.request.url.includes(curSourceMain)) {
            isDataRequest = true;
        }
    }
    // If data is requested than always try to get fresh data
    if (isDataRequest) {
        evt.respondWith(firstFromNetworkThenCache(evt.request));
    } else {
        evt.respondWith(firstFromCacheThenNetwork(evt.request));
    }
});

/**
 * Tries to get the request from cache first, if this fails tries to geht the 
 * request from networt if this fails too a fallback will be delivered.
 * 
 * @param {HTTPRequest} request
 * @returns {unresolved}
 */
function firstFromCacheThenNetwork(request) {
    if (SWAC_config.debugmode)
        console.log('SWAC ServiceWorker: try to get >' + request.url + '< from cache first.');
    return caches.open('swac_sw_cache_' + serviceworker_version).then(function (cache) {
        return cache.match(request).then(function (matching) {
            if (matching) {
                if (SWAC_config.debugmode)
                    console.log('SWAC ServiceWorker: got >' + request.url + '< from cache.');
                return matching;
            } else {
                if (SWAC_config.debugmode)
                    console.log('SWAC ServiceWorker: >' + request.url + '< not found in cache.');
                return fetch(request.clone()).then(
                        function (fetched) {
                            if (SWAC_config.debugmode)
                                console.log('SWAC ServiceWorker: >' + request.url + '< was fresh fetched.');
                            // Save to cache
                            fetchToCache(request.clone());
                            return fetched;
                        }
                ).catch(
                        function (error) {
                            console.error('SWAC ServiceWorker: Could not get >' + request.url + '< from cache or network: ' + error);
                            return useFallback(request);
                        });
            }
        });
    }).catch(function (error) {
        //in case of no possible fetch an no match in cache, use fallback site
        console.error('SWAC ServiceWorker: Error getting >' + request.url + '< from cache: ' + error);
        return useFallback(request);
    });
}

/**
 * Tries to get the request from network if this fails tries to get the request
 * from cache, if this fails too a fallback will be delivered
 * 
 * @param {HTTPRequest} request
 * @returns {unresolved}
 */
function firstFromNetworkThenCache(request) {
    if (SWAC_config.debugmode)
        console.log('SWAC ServiceWorker: try to get >' + request.url + '< from network first.');

    return fetch(request.clone()).then(
            function (fetched) {
                if (SWAC_config.debugmode)
                    console.log('SWAC ServiceWorker: got >' + request.url + '< fresh from network.');
                // Put to cache
                fetchToCache(request.clone());
                return fetched;
            }
    ).catch(
            function (error) {
                if (SWAC_config.debug)
                    console.log('SWAC ServiceWorker: coult not get >' + request.url + '< from network try from cache.');
                return caches.open('swac_sw_cache_' + serviceworker_version).then(function (cache) {
                    return cache.match(request).then(
                            function (matching) {
                                if (SWAC_config.debugmode)
                                    console.log('SWAC ServiceWorker: got >' + request.url + '< from cache instead of network.');
                                return matching;
                            }
                    ).catch(
                            function (error) {
                                console.error('SWAC ServiceWorker: Could not get >' + request.url + '< from network or cache: ' + error);
                                return useFallback(request);
                            }
                    );
                }).catch(function (error) {
                    //in case of no possible fetch an no match in cache, use fallback site
                    console.error('SWAC ServiceWorker: Could not get >' + request.url + '< from network or cache: ' + error);
                    return useFallback(request);
                });
            }
    );
}

/**
 * safes the request in the service worker cache
 * 
 * @param {Request} request
 * @returns {Promise}  Promise that resolves with void
 */
function fetchToCache(request) {
    return caches.open('swac_sw_cache_' + serviceworker_version).then(function (cache) {
        return fetch(request).then(function (response) {
            //get current date
            var d1 = new Date();
            //safe url of request with timestamp of current date
            localforage.setItem(request.url.toString(), d1.getTime());
            return cache.put(request, response);
        });
    });
}

/**
 * provides a fallback html site from the service worker cache
 * 
 * @param {HTTPRequest} request Request that can't be fullfilled
 * @returns {Promise} Promise that resolves to the first Response that 
 *  matches the request or to undefined if no match is found
 */
function useFallback(request) {
    let plainURL;
    let paramStartPos = request.url.indexOf('?');
    if (paramStartPos > 0) {
        plainURL = request.url.substring(0, paramStartPos);
    } else {
        plainURL = request.url;
    }

    // Determine which fallback should be used
    let fallbackURL;
    if (plainURL.endsWith('.html')) {
        fallbackURL = SWAC_config.app_root + '/sites/offline.html';
        sendMessageToPages('test offline html!');
    } else if (plainURL.endsWith('.js')) {
        fallbackURL = SWAC_config.app_root + "/js/offline.js";
    } else if (plainURL.endsWith('.json')) {
        fallbackURL = SWAC_config.app_root + "/data/offline.json";
    } else {
        // Other data resources
        for (let curSource of SWAC_config.datasources) {
            let curSourceMain = curSource.replace('[fromName]', '');
            if (request.url.includes(curSourceMain)) {
                fallbackURL = SWAC_config.app_root + "/data/offline.json";
                break;
            }
        }
    }
    var fallbackRequest = new Request(fallbackURL);

    return caches.open('swac_sw_cache_' + serviceworker_version).then(function (cache) {
        return cache.match(fallbackRequest).then(function (matching) {
            console.log('delivering fallback: ' + fallbackURL);
            return matching;
        });
    });
}

function sendMessageToPages(message) {
    console.log('ServiceWorker self:');
    console.log(self);
//    const clients = self.clients.matchAll();
//    for (const client of clients) {
//        client.postMessage('Message: ' + message);
//    }
}


// Below for future use
self.addEventListener('push', function (evt) {
    console.log('Serviceworker push event!');
});

self.addEventListener('notificationclick', function (evt) {
    console.log('Serviceworker notificationclick event!');
});

self.addEventListener('notificationclose', function (evt) {
    console.log('Serviceworker notificationclose event!');
});

self.addEventListener('sync', function (evt) {
    console.log('Serviceworker sync event!');
});

self.addEventListener('canmakepayment', function (evt) {
    console.log('Serviceworker canmakepayment event!');
});

self.addEventListener('paymentrequest', function (evt) {
    console.log('Serviceworker paymentrequest event!');
});

self.addEventListener('message', function (evt) {
    console.log('Serviceworker message event!');
});

self.addEventListener('messageerror', function (evt) {
    console.log('Serviceworker messageerror event!');
});