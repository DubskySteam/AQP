/**
 * General class for components
 */
class Component {

    /*
     * Constructs a new component object and transfers the config to the
     * object
     */
    constructor(options) {
        // Component description
        this.name;
        this.desc = {};
        this.desc.text = 'Component';
        this.desc.depends = [];
        this.desc.templates = [];
        this.desc.reqPerTpl = [];
        this.desc.optPerTpl = [];
        this.desc.optPerPage = [];
        this.desc.reqPerSet = [];
        this.desc.optPerSet = [];
        this.desc.opts = [];
        this.options = {};
        this.desc.opts[1000] = {
            name: "showWhenNoData",
            desc: "Show mediaeditor even if there is not picture loaded from start."
        };
        this.options.showWhenNoData = false;
        this.desc.opts[1001] = {
            name: "attributeOrder",
            desc: "Establish the order of the attributes from datasets. Attributes that are not in dataset will be not added."
        };
        this.options.attributeOrder = ["id", "title", "name"];
        this.desc.opts[1002] = {
            name: "attributeDefaults",
            desc: "Default data values for attributes in datasts, when they are not existing."
        };
        this.options.attributeDefaults = new Map();
        this.desc.opts[1003] = {
            name: "attributeRenames",
            desc: "Renameing of attributes. Define incoming attribute name as key and target name as value"
        };
        this.options.attributeRenames = new Map();
        this.desc.opts[1004] = {
            name: "reloadinterval",
            desc: "Interval in which the component automaticaly reloads its data (-1 to deactivate)"
        };
        this.options.reloadinterval = -1;
        this.desc.funcs = [];
        this.desc.funcs[1000] = {
            name: 'addData',
            desc: 'Adds an array with datasets (dataobjects) to the given resource. If the resource does not exists, if will be created',
            params: [
                {
                    name: 'fromName',
                    desc: 'Name of the datasource'
                },
                {
                    name: 'data',
                    desc: 'Data to add. In form of standard SWAC datalyout (array[{attr1:val1,attr2:val2},{attr1:val1,attr2:val2}])'
                }
            ]
        };
        this.desc.funcs[1001] = {
            name: 'addDataFromReference',
            desc: 'Adds the data that could be recived from a reference link.',
            params: [
                {
                    name: 'reference',
                    desc: 'Reference link of a object where to recive data from. (form: ref://)'
                }
            ]
        };
        this.desc.funcs[1002] = {
            name: 'getDataSorted',
            desc: 'Gets a copy of the data sorted after the given attribute.',
            params: [
                {
                    name: 'sortAfter',
                    desc: 'Name of the attribute to sort after'
                }
            ]
        };
        this.desc.funcs[1003] = {
            name: 'removeData',
            desc: 'Removes the data with the given source (fromName)',
            params: [
                {
                    name: 'fromName',
                    desc: 'Name of the datasource'
                }
            ]
        };
        this.desc.funcs[1004] = {
            name: 'removeAllData',
            desc: 'Removes all data from component'
        };
        this.desc.funcs[1005] = {
            name: 'addSet',
            desc: 'Adds an single dataset to the chart. If dataset with id allready exists, it will be updated.',
            params: [
                {
                    name: 'fromName',
                    desc: 'Name of the datasource'
                },
                {
                    name: 'set',
                    desc: 'Set with information (can be every kind of object with any number of attributes) \n\
DEFINTION of SET:\n\
- required: set.id = id of the dataset (unique across the given fromname)\n\
- required: at least one value as an attribute (named whatever you want)\n\
- optional: n values as attributes (named whatever you want)\n\
- optional: functions are ignored\n\
- optional: objects in attributes are ignored\n\
- optional: arrays in attributes are ignored'
                }
            ]
        };
        this.desc.funcs[1006] = {
            name: 'updateSet',
            desc: 'Updates a dataset. If youre unsure you can simply use addSet.',
            params: [
                {
                    name: 'fromName',
                    desc: 'Name of the datasource'
                },
                {
                    name: 'set',
                    desc: 'Set with information (can be every kind of object with any number of attributes) \n\
DEFINTION of SET:\n\
- required: set.id = id of the dataset (unique across the given fromname)\n\
- required: at least one value as an attribute (named whatever you want)\n\
- optional: n values as attributes (named whatever you want)\n\
- optional: functions are ignored\n\
- optional: objects in attributes are ignored\n\
- optional: arrays in attributes are ignored'
                }
            ]
        };
        this.desc.funcs[1007] = {
            name: 'removeSets',
            desc: 'Removes data from the chart',
            params: [
                {
                    name: 'fromname',
                    desc: 'Name of the datasource'
                },
                {
                    name: 'startSetId',
                    desc: 'Id of the set where to start remove, if undefined, all data from datasource will be removed'
                },
                {
                    name: 'removeCount',
                    desc: 'Number of sets that should be removed, if undefined only one will be removed'
                }
            ]
        };
        this.desc.funcs[1008] = {
            name: 'removeNullDatasets',
            desc: 'Removes all datasets from all datasources that contain null values'
        };
        this.desc.funcs[1009] = {
            name: 'reload',
            desc: 'Reloads the data from the datasource and updates the component.'
        };
        this.desc.funcs[1010] = {
            name: 'update',
            desc: 'Updates the component with the data currently in data storage.'
        };
        this.desc.funcs[1011] = {
            name: 'exportJson',
            desc: 'Exports the current state of components data to a json file.',
            params: [
                {
                    name: 'fromname',
                    desc: 'Name of the datasource. If not given uses all data.'
                },
                {
                    name: 'indent',
                    desc: 'Number of space chars used for auto indent formating.'
                }
            ]
        };
        this.desc.funcs[1012] = {
            name: 'getJson',
            desc: 'Get the current state of components data into json string.',
            params: [
                {
                    name: 'fromname',
                    desc: 'Name of the datasource. If not given uses all data.'
                },
                {
                    name: 'indent',
                    desc: 'Number of space chars used for auto indent formating.'
                }
            ]
        };
        this.desc.funcs[1013] = {
            name: 'saveData',
            desc: 'Saves the datasets state to their datasources.'
        };
        this.desc.styles = [];

        // Plugins for this component
        this.plugins = new Map();

        // Conditions are functions for attributes that you can use to filter
        // datasets that are fetched over the SWAC_model
        this.conditions = [];

        // Requestor owning this component instance
        this.requestor = null;

        // Component data
        // key = fromName = Sooure of the data
        // value = array of objects (sets) with attributes
        this.data = {};

        // Overwrite default options with given options
        for (let attrname in options) {
            this.options[attrname] = options[attrname];
        }
        // Init automatic reload
        if (this.options.reloadinterval > 0) {
            setInterval(this.reload.bind(this), this.options.reloadinterval * 1000);
    }
    }

    /**
     * Initializes the component
     * 
     * @param {SWACRequestor} componentRequestor
     * @returns {undefined}
     */
    init(componentRequestor) {
        throw('The concrete implementation has to implement the init() method.')
    }

    //public function
    addData(fromName, data) {
        // Add fromName
        this.requestor.fromName = fromName;
        for (let curSet of data) {
            if (curSet !== undefined)
                this.addSet(fromName, curSet);
        }
    }

    // public function
    addDataFromReference(reference, idAttr, attributeDefaults, attributeRenames) {
        let thisRef = this;
        SWAC_model.getFromReference(reference, idAttr, attributeDefaults, attributeRenames).then(function (dataCapsle) {
            thisRef.addData(dataCapsle.metadata.fromName, dataCapsle.data);
            });
    }

    // public function
    getDataSorted(sortAfter) {
        let sortoptions = {
            sortAfter: sortAfter
        };
        let sorteddata = {};
        // Sort at each datasource
        for (let datasource in this.data) {
            // Create a map of position and value to sort
            let mapped = this.data[datasource].map(function (set, position) {
                return {
                    index: position,
                    value: set[this.sortAfter]
                };
            }, sortoptions);

            // Sort after value
            mapped.sort(function (a, b) {
                if (a.value < b.value) {
                    return -1;
                }
                if (a.value > b.value) {
                    return 1;
                }
                return 0;
            });

            // Now get for each sorted object the set from the sort position
            sorteddata[datasource] = mapped.map(function (el) {
                return this.data[datasource][el.index];
            }, this);
        }
        return sorteddata;
    }

    // public function - created by the opendata group
    getDataSortedReversed(sortAfter) {
        let sortoptions = {
            sortAfter: sortAfter
        };
        let sorteddata = {};
        // Sort at each datasource
        for (let datasource in this.data) {
            // Create a map of position and value to sort
            let mapped = this.data[datasource].map(function (set, position) {
                return {
                    index: position,
                    value: set[this.sortAfter]
                };
            }, sortoptions);

            // Sort after value
            mapped.sort(function (a, b) {
                if (a.value < b.value) {
                    return 1;
                }
                if (a.value > b.value) {
                    return -1;
                }
                return 0;
            });

            // Now get for each sorted object the set from the sort position
            sorteddata[datasource] = mapped.map(function (el) {
                return this.data[datasource][el.index];
            }, this);
        }
        return sorteddata;
    }

    //public function
    removeData(fromName) {
        delete this.data[fromName];
        Msg.flow('component', 'Removed all data from datasource >' + fromName + '<', this.requestor);
        // Get and remove all repeated elements
        let repeateds = this.requestor.querySelectorAll('[swac_setname="' + fromName + '"]');
        for (let curRepeated of repeateds) {
            curRepeated.parentElement.removeChild(curRepeated);
        }
    }

    //public function
    removeAllData() {
        for (let curFromName in this.data) {
            this.removeData(curFromName);
        }
    }

    /**
     * Method that should be executed before a dataset is added.
     * This can be overwritten in components to check or modify recived
     * datasets.
     * The default implementation does nothing other than returning the set
     * 
     * @param {String} fromName Name of the resource, where the set comes from
     * @param {Object} set Object with attributes to add
     * @returns {Object} (modified) set
     */
    beforeAddSet(fromName, set) {
        return set;
    }

    //public function
    addSet(fromName, set) {
        if (typeof this.requestor === 'undefined') {
            throw 'SWAC ERROR (component): addSet() called on component class instead on component instance';
        }
        if (!fromName) {
            fromName = Object.keys(this.data)[0];
            if (!fromName)
                throw 'SWAC ERROR (component): No fromName given.';
        }
        if (!set) {
            throw 'SWAC ERROR (component): Given undefined as set.';
        }
        set.swac_fromName = fromName;
        // Remove no data info text from loaded informations
        this.requestor.swac_view.removeNoDataInformation(this.requestor);

        // Check if storage for resouce exists
        if (!this.data[fromName]) {
            this.data[fromName] = [];
        }

        // Add automatic set.id if there is no one
        if (typeof set.id === 'undefined') {            
            set.id = this.data[fromName].length;
            set.isnew = true;
        }
        // Check if set is allready contained
        if (typeof this.data[fromName][set.id] !== 'undefined') {
            this.updateSet(fromName, set);
            //Msg.warn('chart', 'Set >' + fromName + '< id >' + set.id + '< updated.', this.requestor);
        } else {
            if (this.beforeAddSet)
                set = this.beforeAddSet(fromName, set);
            if (set) {
                // Check if binding is initilised
                if (!this.requestor.swac_binding) {
                    new Binding(this.requestor);
                }
                // Create binding and with that the view for set
                set = this.requestor.swac_binding.bindSet(set);
                this.data[fromName][set.id] = set;
                if (this.afterAddSet)
                    this.afterAddSet(fromName, set);
            } else {
                Msg.warn('Component', 'Dataset was not added because beforeAddDataset returned with null.');
            }
            //Msg.warn('chart', 'Set >' + fromName + '< id >' + set.id + '< added.', this.requestor)
        }
        // Reorder parent child elements
        this.requestor.swac_view.orderChildElements();
    }

    /**
     * Method that should be executed after a dataset is added.
     * This can be overwritten in component.
     * The default implementation does nothing
     * 
     * @param {String} fromName Name of the resource, where the set comes from
     * @param {Object} set Object with attributes to add
     * @returns {undefined}
     */
    afterAddSet(fromName, set) {
        return;
    }

    //public function
    updateSet(fromName, set) {
        if (typeof this.requestor === 'undefined')
            throw('SWAC ERROR (component): updateSet() called on component class instead on component instance');
        if (typeof set === 'undefined')
            throw('SWAC ERROR (component): updateSet(): Given undefined as set.');
        if (!this.data[fromName])
            throw('SWAC ERROR (component): updateSet(): Source >' + fromName + '< is unkown.');

        let watchableSet = this.data[fromName][set.id];
        if (watchableSet.notify) {
            // Update attributes each for notification
            for (let curAttr in set) {
                watchableSet[curAttr] = set[curAttr];
            }
        } else {
            Msg.warn('Component', 'Stored set >' + fromName
                    + '[' + set.id + ']< is no WatchableSet.');
            this.data[fromName][set.id] = set;
        }
    }

    //public function
    removeSets(fromName, startSetId = null, removeCount = 1) {
        let removedSets = [];
        if (typeof this.data[fromName] !== 'undefined') {
            if (startSetId === null) {
                removedSets = this.data[fromName];
                this.removeData(fromName);
            } else {
                // Find dataset with id
                let startSetNo = -1;
                for (let i in this.data[fromName]) {
                    let curSet = this.data[fromName][i];
                    if (curSet.id === startSetId) {
                        startSetNo = i;
                        break;
                    }
                }
                if (startSetNo === -1) {
                    Msg.warn('component', 'startSetId >' + startSetId + '< was not found for remove.', this.requestor);
                    return;
                }

                removedSets = this.data[fromName].splice(startSetNo, removeCount);
                // Remove repeatedForSets
                for (let j = startSetId; j < startSetId + removeCount; j++) {
                    let repeatedForSets = this.requestor.querySelectorAll('.swac_repeatedForSet[swac_setId="' + j + '"]');
                    for (let curRepeated of repeatedForSets) {
                        curRepeated.parentNode.removeChild(curRepeated);
                    }
                }
                Msg.warn('component', 'Removed >' + removedSets.length + '< datasets from >' + fromName + '<', this.requestor);
            }
        } else {
            Msg.warn('component', 'There is no datasource with name >' + fromName + '< so there is nothing to remove', this.requestor);
        }
        this.afterRemoveSets(fromName, removedSets);
        return removedSets;
    }

    /**
     * Method executed after sets were removed
     * 
     * @param {String} fromName Name of the datasource where the set was removed
     * @param {Object[]} sets Array of sets that where removed
     * @returns {undefined}
     */
    afterRemoveSets(fromName, sets) {
        return;
    }

    //public function
    removeNullDatasets() {
        for (let curSourceName in this.data) {
            let sets = this.data[curSourceName];
            // Check each set
            for (let i = 0; i < sets.length; i++) {
                let isNull = false;
                // Check each set on null
                for (let value in sets[i])
                    if (sets[i][value] === null) {
                        isNull = true;
                    }
                if (isNull) {
                    delete sets[i];
                }
            }
            sets.length = Object.keys(sets).length;
        }
    }

    /**
     * Gets all occuring attributes and their number of occurence over all loaded
     * datasources.
     * 
     * @returns {this.getAvailableAttributes.columnsmap|Map}
     */
    getAvailableAttributes() {
        let columnsmap = new Map();

        // Look at each datasource
        for (let datasource in this.data) {
            let columnoccurences = this.getAvailableAttributesForDatasource(datasource);
            columnsmap.set(datasource, columnoccurences);
        }

        return columnsmap;
    }

    /**
     * Gets all occuring attributes and their number of occurence for a specific
     * datasources.
     * 
     * @param {String} datasource Name of the datasource where to get the attributes
     * @returns {this.getAvailableAttributesForDatasource.columnoccurences|Map}
     */
    getAvailableAttributesForDatasource(datasource) {
        let columnoccurences = new Map();

        // Look at each set
        for (let set in this.data[datasource]) {
            // Look at each attribute
            for (let attr in this.data[datasource][set]) {
                if (columnoccurences.has(attr)) {
                    columnoccurences.set(attr, columnoccurences.get(attr) + 1);
                } else {
                    columnoccurences.set(attr, 1);
                }
            }
        }
        return columnoccurences;
    }

    /**
     * Creates definitions based on the available data
     * 
     * @returns {undefined}
     */
    getDataDefinitions() {
        let deflistmap = new Map();

        // Look at each datasource
        for (let datasource in this.data) {
            let sourcedeflist = this.getDataDefinitionsForDatasource(datasource);
            deflistmap.set(datasource, sourcedeflist);
        }

        return deflistmap;
    }

    getDataDefinitionsForDatasource(datasource) {
        let defmap = new Map();

        // Look at each set
        for (let set in this.data[datasource]) {
            // Look at each attribute
            for (let attr in this.data[datasource][set]) {
                let value = this.data[datasource][set][attr];
                if (defmap.has(attr)) {
                    let def = defmap.get(attr);
                    let newtype = DatatypeReflection.determineDataType(value);
                    if (newtype !== def.type) {
                        def.type = 'String';
                    }
                    defmap.set(attr, def);
                } else {
                    // Create definition
                    let def = {};
                    def.name = attr;
                    def.source = datasource;
                    def.type = DatatypeReflection.determineDataType(value);
                    defmap.set(attr, def);
                }
            }
        }
        return Array.from(defmap.values());
    }

    // public function
    reload() {
        // Get used sources
        let oldSources = [];
        let oldSetCount = 0;
        for (let curSource in this.data) {
            oldSources.push(curSource);
            oldSetCount += this.data[curSource].length;
    }
        let thisRef = this;
        // If there where no sources try again with source from requestor element
        if (oldSources.length < 1) {
            oldSources.push(this.requestor.fromName);
        }
        // Fix components size while reloading
        let boundingBox = this.requestor.getBoundingClientRect();
        this.requestor.style.height = boundingBox.height + 'px';
        this.requestor.style.widht = boundingBox.width + 'px';
        // Remove old data
        this.removeAllData();
        // Get new data
        let newSetCount = 0;
        for (let curSource of oldSources) {
            SWAC_model.getFromReference('ref://' + curSource).then(function (dataCapsle) {
                thisRef.removeDataLoadErrorMessage();
                thisRef.addData(dataCapsle.metadata.fromName, dataCapsle.data);
                newSetCount += dataCapsle.data.length;

                // Recalculte components size if neccessery
                if (newSetCount !== oldSetCount) {
                    this.requestor.style.height = null;
                    this.requestor.style.widht = null;
                }
            }).catch(function (error) {
                thisRef.createDataLoadErrorMessage(error);
            });
        }
    }

    // public function
    update() {

        
        
        
        Msg.warn('Component', 'update() function not implemented yet.', this.requestor);
    }

    /**
     * Create an error message from a response from data loading
     * 
     * @param {Response} errorresponse Response object from model
     * @returns {undefined}
     */
    createDataLoadErrorMessage(errorresponse) {
        let errDiv = this.requestor.querySelector('.swac_dataerrormsg');
        if (!errDiv) {
            let errDiv = document.createElement('div');
            errDiv.classList.add('swac_dataerrormsg');
            let errImg = document.createElement('img');
            errImg.height = '100';
            errImg.width = '100';
            let errMsg = '';
            // Insert information about missing login
            if (errorresponse.status === 401) {
                errImg.setAttribute('src', SWAC_config.swac_root + 'swac/components/Icon/imgs/person_fail.svg');
                errMsg = SWAC_language.core.loadFailLogin;
            } else if (errorresponse.status === 403) {
                // Insert information about missing right
                errImg.setAttribute('src', SWAC_config.swac_root + 'swac/components/Icon/imgs/person_locked.svg');
                errMsg = SWAC_language.core.loadFailRight;
            } else {
                errImg.setAttribute('src', SWAC_config.swac_root + 'swac/components/Icon/imgs/database_fail.svg');
                errMsg = SWAC_language.core.loadFailErr;
            }
            errDiv.appendChild(errImg);
            errDiv.appendChild(document.createTextNode(errMsg));
            this.requestor.appendChild(errDiv);
        }
    }

    /**
     * Removes error messages from data loading
     * @returns {undefined}
     */
    removeDataLoadErrorMessage() {
        let errDiv = this.requestor.querySelector('.swac_dataerrormsg');
        if (errDiv)
            errDiv.parentElement.removeChild(errDiv);
        this.requestor.classList.remove('swac_errormsg');
    }

    // public function
    exportJson(fromName, indent) {
        let data = this.getJson(fromName, indent);
        let dataURL = 'data:application/json,' + data;
        var link = document.createElement('a');
        link.download = 'calculation_result.json';
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // public function
    getJson(fromName, indent) {
        let data = this.data;
        if(fromName)
            data = this.data[fromName];
        let json = JSON.stringify(data, (key, value) => {
            if (typeof value !== 'undefined' && value !== null && !key.startsWith('swac_'))
                return value;
        }, indent);
        json = json.replaceAll('null,\n','');
        return json;
    }

    // public function
    saveData() {
        for (let curFromName in this.data) {
            // Build datacapsle
            let dataCapsle = {
                data: this.data[curFromName],
                metadata: {
                    fromSource: curFromName
                }
            };

            // Save data
            SWAC_model.save(dataCapsle).then(function (response) {

            }).catch(function (error) {
                UIkit.modal.alert(SWAC_language.core.model_saveerror);
            });
        }
    }

    /**
     * Method to be executed after plugins where be loaded.
     * Default implementation does nothing.
     * 
     * @returns {undefined}
     */
    afterPluginsLoaded() {
        return;
    }
}