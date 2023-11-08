/**
 * Handler for component plugins. This is automatically instantiated and added
 * to requestors, where the attribute "plugins" is available.
 * 
 * The plugins attribut should have the following form:
 * 
 * plugins = new Map();
 * plugins.set('pluginname', {
 *      active: true,
 *      template: 'Name of the template file. Defaults to the plugins name'
 * });
 * 
 * @type type
 */
class ComponentPluginHandler {

    constructor(requestor) {
        // static attribute
        ComponentPluginHandler.loadingPlugins = new Map();
        this.loadedPlugins = [];

        this.requestor = requestor;
        // Use configuration for plugins from options if given
        if (requestor.swac_comp.options.plugins) {
            this.plugins = requestor.swac_comp.options.plugins;
        } else if (requestor.swac_comp.plugins.size > 0) {
            this.plugins = requestor.swac_comp.plugins;
        } else {
            Msg.warn('ComponentPluginHandler', 'There are no plugins configured.', requestor);
            // There are no plugins defined
            return;
        }
    }

    /**
     * Gets a map of all available plugins. With their name as key and their definition as value.
     * 
     * @returns {Map[String,Object{}]}
     */
    getAvailablePlugins() {
        return this.plugins;
    }

    /**
     * Gets a map of all loaded plugins with pluginname as key and plugindefinition as value.
     * 
     * @returns {Array|ComponentPluginHandler.getLoadedPlugins.loadedPlugins|Map}
     */
    getLoadedPlugins() {
        let loadedPlugins = new Map();
        for (let curLoadedPluginName of this.loadedPlugins) {
            loadedPlugins.set(curLoadedPluginName, this.getPlugin(curLoadedPluginName));
        }
        return loadedPlugins;
    }

    /**
     * 
     * @param {String} pluginname Plugins name
     * @returns {unresolved}
     */
    getPlugin(pluginname) {
        let plugin = this.plugins.get(pluginname);
        if (!plugin) {
            let errMsg = 'Plugin >' + pluginname
                    + '< cannot be loaded because there is no plugin with that name'
            Msg.error('ComponentPluginHandler', errMsg, this.requestor);
            throw(errMsg);
        }
        return plugin;
    }

    /**
     * Deactivates a plugin. Also unloads the plugin if its currently loaded.
     * Deactivated plugins are ignored, if loadPlugins() or loadPlugin() is called.
     * 
     * @param {String} pluginname Name of the plugin to deactivate
     * @returns {undefined}
     */
    deactivatePlugin(pluginname) {
        let plugin = this.plugins.get(pluginname);
        if (!plugin) {
            Msg.error('ComponentPluginHandler', 'Plugin >'
                    + pluginname + '< cannot be deactivated because there is no plugin with that name', this.requestor);
        }
        // Unload plugin if it is loaded
        if (this.loadedPlugins.includes(pluginname)) {
            this.unloadPlugin(pluginname);
        }
        plugin.active = false;
    }

    /**
     * Activates the plugin. Also loads the plugin.
     * Activated plugins are loaded when loadPlugins() or loadPlugin is called.
     * 
     * @param {String} pluginname Name of the plugin to activate
     * @returns {undefined}
     */
    activatePlugin(pluginname) {
        let plugin = this.plugins.get(pluginname);
        if (!plugin) {
            Msg.error('ComponentPluginHandler', 'Plugin >'
                    + pluginname + '< cannot be activated because there is no plugin with that name', this.requestor);
        }
        plugin.active = true;
        this.loadPlugin(pluginname);
    }

    /**
     * Loads all plugins that are activated and applicable
     * 
     * @param {String} startAfterPlugin Name of the plugin from the map to start loading 
     * @returns {Promise} Promise that resolves when the plugins are loaded
     */
    loadPlugins(startAfterPlugin) {
        return new Promise((resolve, reject) => {
            let pluginnames = Array.from(this.plugins.keys());
            let startindex = pluginnames.indexOf(startAfterPlugin) + 1;
            let pluginname = pluginnames[startindex];
            let loadedPlugins = [];

            // Stop if there is no plugin left
            if (pluginname) {
                let thisComponentPluginHandler = this;
                this.loadPlugin(pluginname).then(function (loadResult) {
                    loadedPlugins.push(pluginname);
                    thisComponentPluginHandler.loadPlugins(pluginname).then(function (loadedSubPlugins) {
                        loadedPlugins = loadedPlugins.concat(loadedSubPlugins);
                        let requestor = thisComponentPluginHandler.requestor;
                        Msg.warn(requestor.swac_comp.name, 'Plugins loading done', requestor);
                        // Create the event
                        var event = new CustomEvent("swac_" + requestor.id + "_plugins_loaded");
                        document.dispatchEvent(event);
                        // If plugins useing switcher open first tab
                        let repeatForPluginCont = requestor.querySelector('.swac_repeatForPluginCont');
                        let pluginswitcher = repeatForPluginCont;
                        while (pluginswitcher) {
                            if (pluginswitcher.classList.contains('uk-switcher')) {
                                break;
                            } else {
                                pluginswitcher = pluginswitcher.parentNode;
                            }
                        }
                        if (pluginswitcher) {
                            setTimeout(function () {
                                UIkit.switcher(pluginswitcher).show(1);
                            }, 200);
                        }

                        resolve(loadedPlugins);
                    }).catch(function (error) {
                        reject(error);
                    });
                }).catch(function (error) {
                    Msg.error('ComponentPluginHandler', 'Could not load plugin >' + pluginname + '>: ' + error);
                    reject();
                });
            } else {
                resolve(loadedPlugins);
            }
        });
    }

    /**
     * Loads an plugin with its script and html part file. Also calls the init() 
     * function of the plugin.
     * 
     * @param {String} pluginname     Definition of the plugin to load
     * @returns {Promise}       Promise resolved if the plugin is loaded completely,
     *                          or if the plugin was ignored because it's deactivated.
     *                          Also waits for fullfilled init() function, even if
     *                          it returns an promise.
     */
    loadPlugin(pluginname) {
        return new Promise((resolve, reject) => {
            // Check if plugin is allready loaded
            if (this.loadedPlugins.includes(pluginname)) {
                resolve();
                return;
            }

            // Get plugin
            let pluginconfig = this.getPlugin(pluginname);
            if (!pluginconfig.active) {
                Msg.warn('ComponentPluginHandler', 'Plugin >'
                        + pluginname + '< is not active.', this.requestor);
                resolve();
                return;
            }

            // Check if applicable (either there is no check or the check validates to true
            if (pluginconfig.isApplicableFor) {
                // Check if there is data on the component
                if (this.requestor.swac_comp.data) {
                    if (!pluginconfig.isApplicableFor(this.requestor.swac_comp.data)) {
                        let errMsg = 'Plugin >' + pluginname + '< is not applicable to the current data.';
                        Msg.error(
                                'ComponentPluginHandler',
                                errMsg,
                                this.requestor);
                        reject(errMsg);
                        return;
                    }
                } else {
                    let errMsg = 'There is a isApplicableFor() fnction on plugin >'
                            + pluginname + '< but there is no data.';
                    Msg.error('ComponentPluginHandler',
                            errMsg, this.requestor);
                    reject(errMsg);
                    return;
                }
            }

            let compShortName = this.requestor.swac_comp.name.replace('SWAC_', '');
            // Reference to requestor
            pluginconfig.requestor = this.requestor;
            // Build up plugins root dir
            pluginconfig.pluginRootDir = SWAC_config.swac_root + '/swac/components/' + compShortName + '/plugins/' + pluginname;

            let thisComponentPluginHandler = this;

            let pluginrequestor = {};
            pluginrequestor.swac_comp = {};
            pluginrequestor.swac_comp.name = compShortName + '/plugins/' + pluginname;

            // Load plugin language file
            SWAC_language.loadComponentTranslation(pluginrequestor).then(function () {
                // Get name from language file
                if (SWAC_language[compShortName]
                        && SWAC_language[compShortName][pluginname]
                        && SWAC_language[compShortName][pluginname].name) {
                    pluginconfig.displayName = SWAC_language[compShortName][pluginname].name;
                } else {
                    pluginconfig.displayName = pluginname;
                }

                // Load template
                thisComponentPluginHandler.loadPluginObject(pluginname).then(function (loadPluginObjectResult) {
                    thisComponentPluginHandler.loadPluginTemplate(pluginname).then(function (loadTemplateResult) {
                        thisComponentPluginHandler.initPluginObject(pluginname).then(function (initObjectResult) {
                            thisComponentPluginHandler.loadedPlugins.push(pluginname);
                            resolve();
                        }).catch(function (error) {
                            let errMsg = 'Error init plugin >' + pluginname + '<: ' + error;
                            Msg.error('ComponentPluginHandler', errMsg, thisComponentPluginHandler.requestor);
                            reject(errMsg);
                        });
                    }).catch(function (error) {
                        let errMsg = 'Error loading template for plugin >' + pluginname + '<: ' + error;
                        Msg.error('ComponentPluginHandler', errMsg, thisComponentPluginHandler.requestor);
                        reject(errMsg);
                    });
                }).catch(function (error) {
                    let errMsg = 'Error loading script for plugin >' + pluginname + '<: ' + error;
                    Msg.error('ComponentPluginHandler', errMsg, thisComponentPluginHandler.requestor);
                    reject(errMsg);
                });
            }).catch(function (error) {
                Msg.error('ComponentPluginHandler', 'Could not load language for plugin: ' + error);
            });
        });
    }

    /**
     * Loads the template code for that plugin
     * 
     * @param {String} pluginname Name of the plugin where to load template for
     * @returns {Promise} Promise that resolves when template code was loaded and
     * inserted to pluginarea. Returns with a list of all inserted dom nodes.
     */
    loadPluginTemplate(pluginname) {
        return new Promise((resolve, reject) => {
            // Get plugin
            let plugin = this.getPlugin(pluginname);

            // Find area template where to store plugin navigation
            let plugNavTempls = this.requestor.querySelectorAll('.swac_repeatForPluginNav');
            if (plugNavTempls === null) {
                Msg.warn('ComponentPluginHandler', 'There was no navigation area '
                        + 'template found for plugin >' + pluginname + '< Add an html element '
                        + 'with class="swac_repeatForPluginNav" to your template', this.requestor);
                plugin.navElement = null;
            } else {
                let i = 0;
                for (let plugNavTempl of plugNavTempls) {
                    let pluginnavElem = plugNavTempl.cloneNode(true);
                    pluginnavElem.classList.remove('swac_repeatForPluginNav');
                    pluginnavElem.classList.add('swac_repeatedForPluginNav');
                    pluginnavElem.id = this.requestor.id + '_' + pluginname + '_nav_' + i;
                    // Workaround for dynamically adding tabs
                    if (pluginnavElem.classList.contains('uk-active')) {
                        pluginnavElem.classList.remove('uk-active');
                        pluginnavElem.removeAttribute('aria-expanded');
                    }
                    let pluginnavAElem = pluginnavElem.querySelector('a');
                    if (!pluginnavAElem) {
                        Msg.error('ComponentPluginHandler', 'The components template must contain a a-element within the swac_repeatedForPluginNav.', this.requestor);
                        return;
                    }
                    let plugNameNode = document.createTextNode(plugin.displayName);
                    pluginnavAElem.appendChild(plugNameNode);
                    //pluginnavElem.innerHTML = pluginnavElem.innerHTML.replace('#pluginname#', curPlugin.name);
                    plugNavTempl.parentNode.appendChild(pluginnavElem);
                    plugin.navElement = pluginnavElem;
                    i++;
                }
            }

            // Find area template where to store plugin content
            plugin.contElements = [];
            let plugContAreas = this.requestor.querySelectorAll('.swac_repeatForPluginCont');
            if (plugContAreas === null) {
                Msg.warn('ComponentPluginHandler', 'There was no area template '
                        + 'found for plugin >' + pluginname + '<. Add an html element '
                        + 'with class="swac_repeatForPluginCont" to your template.', this.requestor);
                // Resolve with no template (templateless plugin)
                resolve(null);
                return;
            }

            // Get requested template name
            let templateName = plugin.requestor.templateName;
            // Check if plugin contains such a template
            let template = plugin.desc.templates[0];
            for (let curTemplate of plugin.desc.templates) {
                if (curTemplate.name === templateName) {
                    template = curTemplate;
                }
            }

            // Load css
            if (template && template.style) {
                Msg.flow('view', 'Load CSS >' + template.style + '< for plugin >' + plugin.name + '<');
                let cssLinkElem = document.createElement("link");
                cssLinkElem.setAttribute("href", plugin.pluginRootDir + '/' + template.style + ".css");
                cssLinkElem.setAttribute("type", "text/css");
                cssLinkElem.setAttribute("rel", "stylesheet");
                document.head.appendChild(cssLinkElem);
            }

            let thisComponentPluginHandler = this;
            // Load html
            fetch(plugin.pluginRootDir + '/' + template.name + ".html")
                    .then(function (response) {
                        response.text().then(function (content) {
                            let i = 0;
                            for (let plugContArea of plugContAreas) {
                                // Clone contentarea for plugin
                                let pluginarea = plugContArea.cloneNode(true);
                                pluginarea.id = thisComponentPluginHandler.requestor.id + '_' + pluginname + '_cont_' + i;
                                pluginarea.classList.remove('swac_repeatForPluginCont');
                                pluginarea.classList.add('swac_repeatedForPluginCont');
                                // Workaround for dynamically adding tabs
                                if (pluginarea.classList.contains('uk-active')) {
                                    pluginarea.classList.remove('uk-active');
                                }
                                // Find insertion point for pluginname
                                let pluginNameElem = pluginarea.querySelector('.swac_plugin_name');
                                if (pluginNameElem)
                                    pluginNameElem.innerHTML = plugin.displayName;
                                // Find point for insertion of plugincontent
                                let pluginContElem = pluginarea.querySelector('.swac_plugin_content');
                                if (pluginContElem === null) {
                                    pluginContElem = pluginarea;
                                }
                                pluginarea.swac_comp = plugin;
                                pluginarea.templateName = template.name;
                                // Translate template code
                                let plugView = new View(pluginarea);
                                plugView.templatecode = content;
                                content = plugView.translateTemplate();
                                pluginContElem.innerHTML = content;
                                plugContArea.parentNode.appendChild(pluginarea);
                                plugin.contElements.push(pluginarea);
                                i++;
                            }
                            resolve(plugin.contElements);
                        });
                    }).catch(function (error) {
                let errMsg = 'Could not load html template for plugin >' + pluginname + '<: ' + error;
                Msg.error('ComponentPluginHandler', errMsg, thisComponentPluginHandler.requestor);
                reject(errMsg);
            });
        });
    }

    /** 
     * Loads the plugin script files and creates a new plugin object
     * 
     * @param {String} pluginname Name of the plugin where to load script for
     * @returns {undefined}
     */
    loadPluginObject(pluginname) {
        return new Promise((resolve, reject) => {
            let pluginconfig = this.getPlugin(pluginname);
            let fistcharuppercase = pluginname[0].toUpperCase();
            pluginconfig.classname = fistcharuppercase + pluginname.substring(1, pluginname.length) + 'SPL';

            let thisComponentPluginHandler = this;
            // Check if there is another thread loading the plugins code
            let loadingPromise = ComponentPluginHandler.loadingPlugins.get(pluginname);
            if (!loadingPromise) {
                loadingPromise = new Promise((resolve, reject) => {
                    // Build plugincomponent
                    let plugincomp = {
                        name: pluginconfig.classname
                    };

                    // Load plugin script
                    let dependencyStack = [];
                    dependencyStack.push({path: pluginconfig.pluginRootDir + '/' + pluginconfig.classname + '.js'});
                    SWAC.loadDependenciesStack(dependencyStack, plugincomp).then(function () {
                        // Check if object is available
                        if (typeof window[pluginname + 'Factory'] !== 'undefined') {
                            // Create new plugin instance only to get dependencies
                            let plugin = window[pluginname + 'Factory'].create({});
                            // Load dependencies
                            SWAC.loadDependencies(plugin).then(function () {
//                                thisComponentPluginHandler.plugins.set(pluginname, plugin);
                                resolve();
                            }).catch(function (error) {
                                let errMsg = 'Dependencies for plugin >' + pluginname + '< could not be loaded: ' + error;
                                Msg.error('ComponentPluginHandler', errMsg, thisComponentPluginHandler.requestor);
                                reject(errMsg);
                            });
                        } else {
                            Msg.error('ComponentPluginHandler',
                                    'Script for plugin >' + pluginname
                                    + '< was loaded. But there is no >'
                                    + pluginname + 'Factory< in it.',
                                    thisComponentPluginHandler.requestor);
                            reject(errMsg);
                        }
                    }).catch(function (error) {
                        let errMsg = 'Could not load script for plugin >' + pluginname + '<: ' + error;
                        Msg.error('ComponentPluginHandler', errMsg, thisComponentPluginHandler.requestor);
                        reject(errMsg);
                    });
                });
                ComponentPluginHandler.loadingPlugins.set(pluginname, loadingPromise);
            }

            // Wait for code loaded
            loadingPromise.then(function () {
                let plugin = window[pluginname + 'Factory'].create(pluginconfig);
                thisComponentPluginHandler.plugins.set(pluginname, plugin);
                resolve(plugin);
            }).catch(function (error) {
                reject(error);
            });
        });
    }

    /**
     * Initilizes the plugin if it has an init function.
     * 
     * @param {String} pluginname name of the plugin to init. Plugin script must 
     * be loaded first by calling loadPluginObject()
     * @returns {Promise}
     */
    initPluginObject(pluginname) {
        return new Promise((resolve, reject) => {
            let plugin = this.getPlugin(pluginname);

            // Check if pluginconfig has a init function
            if (typeof plugin.init === 'undefined') {
                Msg.warn('ComponentPluginHandler', 'Plugin >' + pluginname + '< has no init() function.', this.requestor);
                resolve(plugin);
                return;
            }
            let initRes = plugin.init();

            // Check if init returns a promise if then wait for resolve
            if (typeof initRes !== 'undefined' && typeof initRes.then !== 'undefined') {
                initRes.then(function (initResult) {
                    resolve(initResult);
                });
            } else {
                // Direct resolve if there is no promise used
                resolve();
            }
        });
    }

    /**
     * Unloads all plugins and removes their contents from the requestor
     * NOTE: This will not unload the loaded script files
     * 
     * @returns {undefined}
     */
    unloadPlugins() {
        for (let pluginname of this.loadedPlugins) {
            this.unloadPlugin(pluginname);
        }
    }

    /**
     * Unloads a single plugin.
     * 
     * @param {String} pluginname name of the plugin to unload
     * @returns {undefined}
     */
    unloadPlugin(pluginname) {
        let pluginElemIdPrefix = this.requestor.id + '_' + pluginname;
        // Remove page contents
        let navareas = this.requestor.querySelectorAll('#' + pluginElemIdPrefix + '_nav');
        for (let navarea of navareas) {
            navarea.parentNode.removeChild(navarea);
        }
        let contareas = this.requestor.querySelectorAll('#' + pluginElemIdPrefix + '_cont');
        for (let contarea of contareas) {
            contarea.parentNode.removeChild(contarea);
        }
        // Remove plugin from loaded list
        let loadedIndex = this.loadedPlugins.indexOf(pluginname);
        if (loadedIndex >= 0) {
            this.loadedPlugins.splice(loadedIndex, 1);
        }
    }
}


