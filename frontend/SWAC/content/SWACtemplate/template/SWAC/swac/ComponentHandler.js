/* 
 * Class for handling components
 */

class ComponentHandler {
    constructor() {
        // static attributes
        ComponentHandler.loadingComponents = new Map();
        ComponentHandler.loadedComponents = new Map();
    }

    /**
     * Loads a component
     * 
     * @param {DOMElement} requestor DOM Element requesting a component
     * @returns {Promise} 
     */
    loadComponent(requestor) {
        let thisRef = this;
        return new Promise((resolve, reject) => {
            Msg.createStore(requestor);

            if (!requestor.id) {
                Msg.error('ComponentHandler', 'All requestor DOMElement must have the id attribute.', requestor);
                reject();
            }
            Msg.flow('ComponentHandler', 'Loading component', requestor);

            // Parse the declaration and make attributes on the element out of it
            requestor = this.parseDeclaration(requestor);
            this.loadComponentOptions(requestor).then(function (requestor) {
                thisRef.loadComponentObject(requestor).then(function (requestor) {
                    // Load components language file
                    SWAC_language.loadComponentTranslation(requestor).then(function () {
                        let view = new View(requestor);
                        view.loadTemplate().then(function () {
                            thisRef.loadComponentData(requestor).then(function () {
                                let binding = new Binding(requestor);
                                binding.bind().then(function () {
                                    thisRef.initComponent(requestor).then(function (requestor) {
                                        ComponentHandler.loadedComponents.set(requestor.id, requestor.swac_comp);
                                        let completeEvent = new CustomEvent('swac_' + requestor.id + '_complete', {
                                            detail: {
                                                requestor_id: requestor.id
                                            }
                                        });
                                        document.dispatchEvent(completeEvent);
                                        resolve();
                                    }).catch(function (error) {
                                        if (error)
                                            Msg.error('ComponentHandler', 'Could not init component for >' + requestor.id + '<: ' + error);
                                        view.removeLoadingElem(requestor);
                                        reject();
                                    });
                                }).catch(function (error) {
                                    if (error)
                                        Msg.error('ComponentHandler', 'Could not bind for >' + requestor.id + '<: ' + error);
                                    view.removeLoadingElem(requestor);
                                    reject();
                                });
                            }).catch(function (error) {
                                requestor.swac_comp.createDataLoadErrorMessage(error);
                                if (error)
                                    Msg.error('ComponentHandler', 'Could not load data for >' + requestor.id + '<: ' + error);
                                view.removeLoadingElem(requestor);
                                reject();
                            });
                        }).catch(function (error) {
                            if (error)
                                Msg.error('ComponentHandler', 'Could not load template for >' + requestor.id + '<: ' + error);
                            view.removeLoadingElem(requestor);
                            reject();
                        });
                    }).catch(function (error) {
                        if (error)
                            Msg.error('ComponentHandler', 'Could not load translation for >' + requestor.id + '<: ' + error);
                        reject();
                    });
                }).catch(function (error) {
                    if (error)
                        Msg.error('ComponentHandler', 'Could not load object for >' + requestor.id + '<: ' + error);
                    reject();
                });
            }).catch(function (error) {
                if (error)
                    Msg.error('ComponentHandler', 'Could not load options for >' + requestor.id + '<: ' + error);
                reject();
            });
        });
    }

    /**
     * Parses the swa statement and attatches the statement attributes to the
     * requestor object.
     * 
     * @param {DOMElement} requestor DOM Element requesting a component
     * @returns {DOMEleent} modified requestor element
     */
    parseDeclaration(requestor) {
        // Get swa config tag
        let component_config = requestor.getAttribute("swa");

        // Create loading component
        requestor.swac_comp = {};
        requestor.swac_comp.name = component_config.split(" ")[0];
        requestor.swac_comp.state = 'loading';

        // Positions and options stack
        let clauseMap = new Map();
        // parse request options and set them as attributes to the requestor
        clauseMap.set(component_config.indexOf(" FROM "), 'FROM');
        clauseMap.set(component_config.indexOf(" WHERE "), 'WHERE');
        clauseMap.set(component_config.indexOf(" OPTIONS "), 'OPTIONS');
        clauseMap.set(component_config.indexOf(" TEMPLATE "), 'TEMPLATE');
        // Sort
        clauseMap = new Map([...clauseMap.entries()].sort(function (a, b) {
            return a[0] - b[0];
        }));

        // Declare attributes
        requestor.fromWheres = {};

        //Go trough clauses
        let keys = clauseMap.keys();
        let curEntry = keys.next();
        while (typeof curEntry.value !== 'undefined') {
            let pos = curEntry.value;
            // Load next entry
            curEntry = keys.next();
            if (pos > 0) {
                let clausName = clauseMap.get(pos);
                let clausContStart = pos + clausName.length + 2;
                // Calculate endpos of clause
                let clausContEnd = component_config.length;
                if (typeof curEntry.value !== 'undefined') {
                    clausContEnd = curEntry.value;
                }
                let clausCont = component_config.substring(clausContStart, clausContEnd);
                switch (clausName) {
                    case 'FROM':
                        requestor.fromName = clausCont;
                        // Do not check existence of data here, because it can be loaded
                        // after loading of components code    
                        break;
                    case 'WHERE' :
                        let wheres = clausCont.split(' AND ');
                        // parse each where
                        for (let wherestr of wheres) {
                            let where = wherestr.split('=');
                            let wherekey = where[0];
                            let whereval = where[1];
                            // Check if whereval is a variable
                            let varmatches = whereval.match(/[^{}]+(?=\})/g);
                            if (varmatches !== null && varmatches.length > 0) {
                                for (let i in varmatches) {
                                    let param = SWAC.getParameterFromURL(varmatches[i], window.location);
                                    if (param === null) {
                                        Msg.warn('swac', 'Parameter >'
                                                + varmatches[i] + '< used in WHERE for >'
                                                + requestor.id + '< not found.', requestor);
                                    }
                                    whereval = whereval.replace('{' + varmatches[i] + '}', param);
                                }
                            }
                            if (whereval !== null) {
                                requestor.fromWheres[wherekey] = whereval;
                            } else {
                                Msg.warn('swac', 'Parameter >' + wherekey + '< for >' + requestor.id + '< has null value.', requestor);
                            }
                        }
                        break;
                    case 'OPTIONS':
                        requestor.optionsName = clausCont;
                        break;
                    case 'TEMPLATE':
                        requestor.templateName = clausCont;
                }
            }
        }
        return requestor;
    }

    /**
     * Loads the component options from the variable whose name is given with OPTIONS
     * keyword in swac statement, from global variable [requestor_name]_options or
     * from backend useing the OPTIONS value as source interface.
     * 
     * @param {Requestor} requestor DOM Element requesting the component
     * @returns {Promise}
     */
    loadComponentOptions(requestor) {
        return new Promise((resolve, reject) => {
            // Create options store in loading component
            requestor.swac_comp.options = {};

            if (window[requestor.optionsName]) {
                // Inject options from global variable if exists
                for (let i in window[requestor.optionsName]) {
                    requestor.swac_comp.options[i] =
                            window[requestor.optionsName][i];
                }
                requestor.optionsSource = 'local';
                resolve(requestor);
            } else if (typeof window[requestor.id + '_options'] !== 'undefined') {
                // Inject options from global variable with default name
                for (let i in window[requestor.id + '_options']) {
                    requestor.swac_comp.options[i] =
                            window[requestor.id + '_options'][i];
                }
                requestor.optionsSource = 'standard';
                resolve(requestor);
            } else if (requestor.optionsName) {
                let optionsRequestor = {
                    fromName: requestor.optionsName
                };
                // Get options from datasource
                SWAC_model.load(optionsRequestor).then(function (optionsdata) {
                    requestor.swac_comp.options = optionsdata;
                    Msg.warn('ComponentHandler',
                            requestor.swac_comp.name + ' for ' + requestor.id
                            + ' runs with custom options', requestor);
                    requestor.optionsSource = 'model';
                    resolve(requestor);
                }).catch(function (error) {
                    Msg.error('ComponentHandler',
                            'Could not load options for >' + requestor.id + '<: ' + error, requestor);
                    reject();
                });
            } else {
                // No options to load
                resolve(requestor);
            }
        });
    }

    loadComponentData(requestor) {
        return new Promise((resolve, reject) => {

            // Insert loading data text
            let loadtext = SWAC_language.core.loadingdata.replace(new RegExp('%requestorid%', 'g'), requestor.id);
            requestor.swac_view.changeLoadingText(requestor, loadtext);

            // Resolve if no data is requested
            if (!requestor.fromName) {
                if (requestor.swac_comp.options !== 'undefined'
                        && requestor.swac_comp.options.showWhenNoData === true) {
                    // If set show component even if there is no data
                    Msg.info('ComponentHandler', 'No data requested', requestor);
                } else {
                    // Defaults to hide component if there is no data
                    requestor.classList.add('swac_dontdisplay');
                    // Do not remove node, because component can be reactivated
                    // if there is data a a later time
                    Msg.hint('ComponentHandler', 'There is no data requested so this '
                            + 'component is not shown. If you want this component to '
                            + 'show up on no data add the option showWhenNoData=true '
                            + 'to the global variable >' + requestor.id
                            + '_options<', requestor);
                }

                resolve({});
                return;
            }

            // Load the data
            SWAC_model.load(requestor).then(function (dataCapsle) {
                // Set data to component
                if (dataCapsle.metadata) {
                    requestor.swac_comp.data[dataCapsle.metadata.fromName] = dataCapsle.data;
                    resolve(dataCapsle);
                } else {
                    Msg.error('ComponentHandler', 'Data loading returned without metainformation.', requestor);
                    reject();
                }
                requestor.swac_view.removeLoadingElem(requestor);
            }).catch(function (error) {
                requestor.swac_view.removeLoadingElem(requestor);
                reject(error);
            });
        });
    }

    /**
     * Loads the components object
     * @param {DOMElement} requestor DOM Element requestion the component
     * @returns {Promise}
     */
    loadComponentObject(requestor) {
        return new Promise((resolve, reject) => {
            // Load component script
            let dependencyStack = [];
            dependencyStack.push({path: SWAC_config.swac_root + '/swac/components/'
                        + requestor.swac_comp.name + '/'
                        + requestor.swac_comp.name + '.js'});
            SWAC.loadDependenciesStack(dependencyStack, requestor.swac_comp).then(function () {

                // Check if object is available
                if (typeof window[requestor.swac_comp.name + 'Factory'] !== 'undefined') {
                    // Create component to load dependencies
                    SWAC_language[requestor.swac_comp.name] = {};
                    requestor.swac_comp = window[requestor.swac_comp.name + 'Factory'].create(requestor.swac_comp.options);
                    requestor.swac_comp.requestor = requestor;
                    // Debug function
                    requestor.swac_comp.plugins.unloadPlugins = function () {
                        Msg.error(requestor.swac_comp.name, 'Cant access plugin function >unloadPlugins()< before initialisation has finished.');
                    };

                    // Load dependencies
                    SWAC.loadDependencies(requestor.swac_comp).then(function () {
                        resolve(requestor);
                    }).catch(function () {
                        reject();
                    });
                } else {
                    Msg.error('ComponentHandler',
                            'Factory for >' + requestor.swac_comp.name
                            + '< could not be found.', requestor);
                    reject();
                }

            }).catch(function (error) {
                Msg.error('ComponentHandler',
                        'Could not load script for >' + requestor.swac_comp.name
                        + '<: ' + error, requestor);
                reject();
            });
        });
    }

    /**
     * Calls the init function of the component
     * @param {DOMElement} requestor Requestor whichs component should be initilized
     * @returns {Promise} Promise from the component init function
     */
    initComponent(requestor) {
        return new Promise((resolve, reject) => {
            // Register function for call on complete
            document.addEventListener('swac_' + requestor.id + '_complete', function (event) {
                Msg.flow('ComponentHandler', 'swac_' + requestor.id + '_complete called');
                requestor.swac_view.removeLoadingElem(requestor);
                // Execute reaction on load if registred
                SWAC_reactions.performReactions();
            });

            // Check if init function is available
            if (typeof requestor.swac_comp.init === 'function') {
                requestor.swac_comp.init(requestor).then(function () {
                    try {
                        // Register plugin functions
                        if (requestor.swac_comp.plugins.size > 0
                                || requestor.swac_comp.options.plugins) {
                            let pluginHandler = new ComponentPluginHandler(requestor);
                            requestor.swac_comp.plugins = pluginHandler;
                            // Load applicable plugins
                            pluginHandler.loadPlugins(null).then(function (loadedPlugins) {
                                requestor.swac_comp.afterPluginsLoaded(requestor.swac_comp.plugins.loadedPlugins);
                                resolve();
                            }).catch(function (error) {
                                Msg.error('ComponentHandler',
                                        'Could not load plugins: ' + error, requestor);
                            });
                        }
                    } catch (error) {
                        Msg.error('ComponentHandler', 'Error after init()' + error);
                    }
                    resolve(requestor);
//                }).catch(function (error) {
//                    //DEV-Note: To find the source for the error, comment this catch-block out
//                    Msg.error('ComponentHandler', "Component >" + requestor.swac_comp.name + "< could not be initialized. Error in init(): >" + error + '<', requestor);
//                    this.requestor.swac_view.removeLoadingElem(requestor);
//                    reject();
                });
            } else {
                Msg.warn('ComponentHandler', "Component >" + requestor.swac_comp.name + "< has no initiliser.");
                SWAC_view.removeLoadingElem(requestor);
                resolve(requestor);
            }
        }).catch(function (error) {
            SWAC_view.removeLoadingElem(requestor);
            Msg.error('ComponentHandler',
                    'Could not bind for requestor >' + requestor.id + '<: '
                    + error, requestor);
            reject();
        });
    }
}
