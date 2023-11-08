/* 
 * This is the SmartWebApp entry points. It automatically detects, what 
 * components are used on the page and loads the needed component files.
 */

/**
 * Create an SWAC instance, if page is loaded
 */
var SWAC_config = {};
document.addEventListener("DOMContentLoaded", function () {
    // Locate swac
    let scriptTags = document.getElementsByTagName('script');
    for (let curScript of scriptTags) {
        let swacPos = curScript.src.indexOf('swac/swac.js');
        if (swacPos >= 0) {
            SWAC_config.swac_root = curScript.src.substr(0, swacPos);
            break;
        }
    }

    // Locate app
    let siteFoldPos = window.location.pathname.indexOf("/sites/");
    SWAC_config.app_root = window.location.pathname.substr(0, window.location.pathname.length - 1);
    if (siteFoldPos > 0) {
        SWAC_config.app_root = window.location.pathname.substr(0, siteFoldPos);
    }
    // Load configuration
    var tag = document.createElement("script");
    tag.id = 'config';
    tag.src = SWAC_config.app_root + "/configuration.js";
    document.getElementsByTagName("head")[0].appendChild(tag);
    tag.addEventListener('load', function (evt) {
        if (SWAC_config.debugmode || SWAC.getParameterFromURL('debug', window.location)) {
            SWAC_config.debugmode = true;
            let devhelperRequestor = document.createElement('div');
            devhelperRequestor.id = 'swac_devhelper';
            devhelperRequestor.setAttribute('swa', 'Devhelper');
            document.body.appendChild(devhelperRequestor);
        }
        SWAC.loadGlobalComponents();
    });
});

var SWAC = {};
// List of loading dependencies
SWAC.loadingdependencies = [];
// List of loaded dependencies
SWAC.loadeddependencies = [],
// Version information
        SWAC.version = "13.05.2021";

/**
 * Loads the global components
 * 
 * @returns {undefined}
 */
SWAC.loadGlobalComponents = function () {
    // Load and start serviceworker
    if (SWAC_config.progressive.active && 'serviceWorker' in navigator) {
        // Add "add to homescreen" functionality
        let linkElem = document.createElement('link');
        linkElem.setAttribute('rel', 'manifest');
        linkElem.setAttribute('href', SWAC_config.app_root + '/manifest.json');
        document.head.appendChild(linkElem);
        // Register swac serviceworker
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register(SWAC_config.swac_root + '/serviceworker.js')
                    .then(function (registration) {
                        var serviceWorker;
                        if (registration.installing) {
                            serviceWorker = registration.installing;
                            Msg.flow('ServiceWorker','installing');
                        }
                        if (registration.waiting) {
                            serviceWorker = registration.waiting;
                            Msg.flow('ServiceWorker','waiting');
                        }
                        if (registration.active) {
                            serviceWorker = registration.active;
                            Msg.flow('ServiceWorker','active');
                        }
                        if (serviceWorker) {
                            // logState(serviceWorker.state);
                            serviceWorker.addEventListener('statechange', function (e) {
                                Msg.flow('ServiceWorker','changed state: ' + e.target.state);
                            });
                        }
                    }).catch(function (error) {
                // Something went wrong during registration. The service-worker.js file
                // might be unavailable or contain a syntax error.
            });
            navigator.serviceWorker.addEventListener("message", (evt) => {
                window.alert(`Nachricht vom SW: ${ evt.data }`);
            });
        } else {
            // The current browser doesn't support service workers.
        }
    }

    let corecomp = {};
    corecomp.name = 'SWAC_core';

    let dependencyStack = [];
    for (let i in SWAC_config.coreComponents) {
        dependencyStack.push({path: SWAC_config.coreComponents[i]});
    }

    SWAC.loadDependenciesStack(dependencyStack, corecomp).then(
            function () {
                // Load core language
                SWAC_language.init().then(function () {
                    // Inform about finished loading
                    let completeEvent = new CustomEvent('uiComplete', {});
                    document.dispatchEvent(completeEvent);
                    // Start onlineReactions
                    var SWAC_onlineReactions = new OnlineReactions(SWAC_config);

                    // Check data connection
                    remoteHandler.apiCheckup().then(function (checkupresult) {
                        SWAC.detectRequestors();
                    }).catch(function (error) {
                        Msg.error("swac", "apiCheckup failed with status: " + error);
                    });
                });
            }
    ).catch(function (error) {
        Msg.error('swac', 'Could not load a required file: ' + error);
        UIkit.modal.alert(SWAC_language.core.loaderror).then(function () {
            document.reload();
        });
    });
};

/**
 * Detects requestors and builds up their information and instantiates their
 * component.
 * 
 * @returns {undefined}
 */
SWAC.detectRequestors = function () {
    let requestors = document.querySelectorAll("[swa]");
    // ng
    let componentHandler = new ComponentHandler();
    let compproms = [];
    for (let requestor of requestors) {
        // load component
        compproms.push(componentHandler.loadComponent(requestor));
    }
    Promise.allSettled(compproms).then(function () {
        document.dispatchEvent(new CustomEvent('swac_components_complete'));
    });
};

/**
 * Loads all dependencies for the given compoennt.
 * 
 * @param {SWACComponent} component Component to load dependencies for
 * @returns {Promise} Promise that resolves, when all dependencies are loaded
 */
SWAC.loadDependencies = function (component) {
    return new Promise((resolve, reject) => {
        if (component.requestor) {
            Msg.flow('swac', 'Load dependencies for >'
                    + component.name + '< from requestor >'
                    + component.requestor.id + '<');
        } else {
            Msg.flow('swac', 'Load dependencies for >'
                    + component.name + '< without requestor >');
        }

        // Check if component has dependencies
        if (typeof component.desc === 'undefined'
                || typeof component.desc.depends === 'undefined'
                || component.desc.depends.length <= 0) {
            resolve();
            return;
        }

        // put all dependency on the stack
        let dependencyStack = [];
        for (let depNo in component.desc.depends) {
            dependencyStack.push(component.desc.depends[depNo]);
        }
        SWAC.loadDependenciesStack(dependencyStack, component).then(function () {
            if (SWAC.checkDependenciesLoaded(component)) {
                resolve();
            } else {
                Msg.error('swac',
                        'Could not load all dependencies from >'
                        + component.name + '<', component.requestor);
                reject();
            }
        });
    });
};

/**
 * Loads a dependency from the stack and continues with the next stack element
 * 
 * @param {object[]} dependenciesStack Dependency definitions (debugonly,path,description)
 * @param {SWACcomponent} component Component which needs the dependency
 * @returns {Promise} Promise that resolves if the dependency was loaded
 */
SWAC.loadDependenciesStack = function (dependenciesStack, component) {
    return new Promise((resolve, reject) => {

        // Get first dependency on stack
        let dependency = dependenciesStack.shift();
        // Avoid failing on empty array slots
        if (typeof dependency !== 'undefined') {

            // Skip if debugmode is off and this is a debugonly requirement
            let skipImport = false;
            if (dependency.debugonly && !SWAC_config.debugmode) {
                skipImport = true;
            }

            // Create id for dependency
            let depid = dependency.component ? dependency.component : dependency.path;
            // Skip if file was imported before (globaly check over all loaded components)
            if (SWAC.loadeddependencies.includes(depid)) {
                dependency.loaded = true;
                skipImport = true;
            }

            if (!skipImport) {
                // If dependency is currently loading wait for loading
                if (SWAC.loadingdependencies.includes(depid)) {
                    Msg.flow('SWAC', 'Waiting for loading dependency >' + depid + '<');
                    // Waiting for dependency loaded event
                    document.addEventListener('swac_' + depid + '_dependency_loaded', function () {
                        dependency.loaded = true;
                        if (dependenciesStack.length > 0) {
                            SWAC.loadDependenciesStack(dependenciesStack).then(
                                    function () {
                                        resolve();
                                    }
                            );
                        } else {
                            resolve();
                        }
                    });
                    return;
                } else {
                    SWAC.loadingdependencies.push(depid);
                }

                let addPromResolve = resolve;
                let addPromReject = reject;
                if (dependency.component) {
                    // Load a dependend component
                    let virtualRequestor = document.createElement('div');
                    virtualRequestor.setAttribute('id', 'virtual_' + dependency.component);
                    virtualRequestor.setAttribute('swa', dependency.component);
                    let componentHandler = new ComponentHandler();
                    // load component
                    componentHandler.loadComponent(virtualRequestor);
                    // Register event handler
                    document.addEventListener('swac_' + 'virtual_' + dependency.component + '_complete', function (event) {
                        SWAC.onDependencyLoaded(depid, dependency, dependenciesStack, addPromResolve);
                    });
                } else if (dependency.path.endsWith('.js')) {
                    var scriptElem = document.createElement('script');
                    scriptElem.src = dependency.path; // + '?version=' + SWAC.version;
                    scriptElem.type = "text/javascript";
                    scriptElem.async = false;
                    scriptElem.setAttribute('depid', depid);

                    document.getElementsByTagName('head')[0].appendChild(scriptElem);
                    scriptElem.addEventListener('load', function () {
                        SWAC.onDependencyLoaded(depid, dependency, dependenciesStack, addPromResolve);
                    });
                    scriptElem.addEventListener('error', function () {
                        addPromReject('Could not load >' + scriptElem.src + '<');
                    });
                } else if (dependency.path.endsWith('.css')) {

                    // Load needed style
                    var cssElem = document.createElement('link');
                    cssElem.setAttribute('rel', 'stylesheet');
                    cssElem.setAttribute('type', 'text/css');
                    cssElem.setAttribute('href', dependency.path);

                    document.head.appendChild(cssElem);
                    // Css counts as loaded imideatly after inserting
                    SWAC.onDependencyLoaded(depid, dependency, dependenciesStack, addPromResolve);
                } else {
                    Msg.error('swac.js', 'Dependency >' + dependency.name + '< for >' + component.name + '< has unkown type and cannot be included.');
                    reject('Unknown dependencies');
                }
            } else {
                // If import is skiped continue to import from stack
                if (dependenciesStack.length > 0) {
                    SWAC.loadDependenciesStack(dependenciesStack).then(
                            function () {
                                resolve();
                            }
                    ).catch(function (error) {
                        reject(error);
                    });
                } else {
                    resolve();
                }
            }
        }
    });
};

/**
 * Performs all actions neccessery after a dependency was loaded. Like change
 * load state and dispatch event to notify waiting scripts
 * 
 * @param {String} loadid Id of the load process
 * @param {Object} dependency Dependencies information
 * @returns {undefined}
 */
SWAC.onDependencyLoaded = function (loadid, dependency, dependenciesStack, addPromResolve) {
    dependency.loaded = true;
    delete SWAC.loadingdependencies[loadid];
    SWAC.loadeddependencies.push(loadid);

    let depName = dependency.name;
    if (!depName) {
        depName = dependency.path;
    }
    Msg.flow('swac.js', 'Loaded dependency >' + depName + '<');

    let event = new CustomEvent("swac_" + loadid + "_dependency_loaded");
    document.dispatchEvent(event);

    // Load next dependency or resolve
    if (dependenciesStack.length > 0) {
        SWAC.loadDependenciesStack(dependenciesStack).then(
                function () {
                    addPromResolve();
                }
        );
    } else {
        addPromResolve();
    }
};

/**
 * Checks if all dependencies from the given component are loaded.
 * 
 * @param {SWACComponent} component Component to check
 * @returns {boolean} true if all dependencies are loaded, false otherwise
 */
SWAC.checkDependenciesLoaded = function (component) {
// Check if component has dependencies
    if (typeof component.desc.depends === 'undefined' || component.desc.depends.length <= 0) {
        return;
    }

    // Get components dependencies
    for (let depNo in component.desc.depends) {
        let dependency = component.desc.depends[depNo];
        // Ignore if debugonly and no debugmode
        if (dependency.debugonly && !SWAC_config.debugmode)
            continue;
        if (typeof dependency.loaded === 'undefined' || dependency.loaded === false) {
            return false;
        }
    }
    return true;
};

/**
 * Dynamically add a new datasource url to the list of available data sources
 * 
 * DEV NOTE: Not used at version 16.08.2018 - reserved for later use
 * 
 * @param {type} datasource_url
 * @returns {undefined}
 */
SWAC.addDatasource = function (datasource_url) {
    if (SWAC.isValidURL(datasource_url)) {
        SWAC_config.datasources[SWAC_config.datasources.length] = datasource_url;
    } else {
        Msg.error('swac.js', datasource_url + " is not a valid url");
    }
};

/**
 * Dynamically add an new source for algorithms to the SWAC configuration
 * 
 * DEV NOTE: Not used at version 16.08.2018 - reserved for later use
 * 
 * @param {type} algosource_url
 * @returns {undefined}
 */
SWAC.addAlgosource = function (algosource_url) {
    if (SWAC.isValidURL(algosource_url)) {
        SWAC_config.algosources[SWAC_config.algosources.length] = algosource_url;
    } else {
        Msg.error('swac.js', algosource_url + " is not a valid url");
    }
};



/**
 * Method for checking if an string is an valid url
 * 
 * @param {type} str
 * @returns {Boolean}
 */
SWAC.isValidURL = function (str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name and extension
            '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
            '(\\:\\d+)?' + // port
            '(\\/[-a-z\\d%@_.~+&:]*)*' + // path
            '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' + // query string
            '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return pattern.test(str);
};

/**
 * Gets the value of an parameter from URL
 * 
 * @param {String} param_name Name of the parameter to read value from
 * @param {String} url URL to read parameter from
 * @returns {String} Value of the parameter or undefined if not exists
 */
SWAC.getParameterFromURL = function (param_name, url) {
    if (!url)
        url = location.href;
    param_name = param_name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + param_name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(url);
    return results === null ? null : results[1];
};

/* 
 * Class for registering and handling reactions
 */
class Reactions {
    constructor() {
        this.reactions = [];
    }

    /**
     * Registers a reaction to requestor loads. Those can be bound to more than one 
     * requestor.
     * 
     * @param {Function} reactionfunction Function to execute, when all given requestors are loaded
     * @param {String} requestor_id ID of the requestor(s)
     * @returns {undefined}
     */
    addReaction(reactionfunction, ...requestor_id) {
        let reaction = {};
        reaction.function = reactionfunction;
        reaction.requiredRequestors = [];
        for (let curRequestorId of requestor_id) {
            reaction.requiredRequestors.push(curRequestorId);
        }
        this.reactions.push(reaction);
    }

    /**
     * Performs the registred reactions to requestor loads
     * This calls the registred function, if all required requestors are loaded.
     * The called method becomes a object with references to all required requestors.
     * 
     * @returns {undefined}
     */
    performReactions() {
        let remaining = [];
        for (let i in this.reactions) {
            let curReaction = this.reactions[i];
            // Check if all required requestors are loaded
            let allLoaded = true;
            let requestors = {};
            for (let requiredRequestor of curReaction.requiredRequestors) {
                if (!ComponentHandler.loadedComponents.has(requiredRequestor)) {
                    allLoaded = false;
                    break;
                }
                let requestor = document.getElementById(requiredRequestor);
                if (requestor === null) {
                    Msg.error('swac.js', 'The requestor >' + requiredRequestor
                            + '< was not found in document. These means usually that another script has removed it.'
                            + ' Therefore the reaction to >' + curReaction.requiredRequestors + '< could not be performed.');
                    allLoaded = false;
                    break;
                }
                // Put requstor to requestors array
                requestors[requiredRequestor] = document.getElementById(requiredRequestor);
            }
            // If all loaded execute function
            if (allLoaded) {
                curReaction.function(requestors);
            } else {
                remaining.push(curReaction);
            }
        }

        // Remove reaction to avoid double execution
        this.reactions = remaining;
    }
}

// Activate reaction mechanism
var SWAC_reactions = new Reactions();