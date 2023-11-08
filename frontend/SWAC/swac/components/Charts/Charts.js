import SWAC from '../../swac.js';
import View from '../../View.js';
import Msg from '../../Msg.js';

export default class Charts extends View {

    constructor(options = {}) {
        super(options);
        this.name = 'Charts';
        this.desc.text = "Show bar- line or pie-chart and datatable for every data.";
        this.desc.developers = 'Florian Fehring (FH Bielefeld)';
        this.desc.license = 'GNU Lesser General Public License';

        this.desc.depends[0] = {
            name: 'Chartjs Class',
            path: SWAC.config.swac_root + 'components/Charts/libs/chartjs/Chart.min.js',
            desc: 'Class containing the ChartJs functions.'
        };
        this.desc.depends[1] = {
            name: 'DatatypeReflection',
            algorithm: 'DatatypeReflection',
            desc: 'Algorithm with methods to determine date and time values'
        };
        this.desc.depends[2] = {
            name: 'Chartjs datetime adapter',
            path: SWAC.config.swac_root + 'components/Charts/libs/chartjs/chartjs-adapter-date-fns.bundle.min.js',
            desc: 'Class with adapter for datetime conversion.'
        };
        this.desc.depends[3] = {
            name: 'HammerJS for zoom plugin',
            path: SWAC.config.swac_root + 'components/Charts/libs/chartjs/hammerjs.js',
            desc: 'Needed for zoom plugin.'
        };
        
        
//        this.desc.depends[3] = {
//            name: 'Chartjs datalables Plugin',
//            path: SWAC.config.swac_root + 'components/Charts/libs/chartjs/chartjs-plugin-datalabels.min.js',
//            desc: 'Extension for chartjs to display datalables.'
//        };

        this.desc.templates[0] = {
            name: 'chart',
            style: false,
            desc: 'Template with area for plugins and pluginnavigation'
        };
        this.desc.reqPerTpl[0] = {
            selc: '.swac_chart_nav',
            desc: 'Element where the chart navigation is placed'
        };
        this.desc.reqPerTpl[1] = {
            selc: '.swac_chart_tabs',
            desc: 'Element where the chart plugins create tabs'
        };
        this.desc.reqPerTpl[2] = {
            selc: '.swac_repeatForPluginNav',
            desc: 'A area element thats content is repeated for every plugin that delivers a navigation'
        };
        this.desc.reqPerTpl[3] = {
            selc: '.swac_repeatForPluginCont',
            desc: 'A area element thats content is repeated for every plugin (here the plugin stores its main content = chart output)'
        };
        this.desc.optPerTpl[0] = {
            selc: '.swac_chart_msgs',
            desc: 'A area where error messages could be placed'
        };
        this.desc.reqPerSet[0] = {
            name: 'id',
            desc: 'Dataset id used for indexing, sorting and performance optimization. (unique per datasource)'
        };
        this.desc.reqPerSet[1] = {
            name: '*',
            desc: 'at least one value as an attribute (named whatever you want)'
        };
        this.desc.optPerSet[0] = {
            name: '*',
            desc: 'n values as attributes (named whatever you want). The first attribute is placed on x-axis per default, the second one is placed on y-axis. All other are not displayed until selected (selection not implemented yet)'
        };
        if (!options.showWhenNoData)
            this.options.showWhenNoData = true;
        this.desc.opts[0] = {
            name: 'xAxisAttrName',
            desc: 'Name of the attribut to show on xAxis. If not set the fist attribute with timestamp data will be used. If there is no timestampdata the first other attribute will be used.'
        };
        if (!options.xAxisAttrName)
            this.options.xAxisAttrName = null;
        this.desc.opts[1] = {
            name: 'yAxis1AttrName',
            desc: 'Name of the attribute to show on yAxis 1. Uses the first attribute of datasets that is not id or placed on xAxis.'
        };
        if (!options.yAxis1AttrName)
            this.options.yAxis1AttrName = null;
        this.desc.opts[2] = {
            name: 'yAxis2AttrName',
            desc: 'Name of the attribute to show on yAxis 2. If not set there will be no yAxis 2'
        };
        if (!options.yAxis2AttrName)
            this.options.yAxis2AttrName = null;
        this.desc.opts[2] = {
            name: 'yAxis2AttrName',
            desc: 'Name of the attribute to show on yAxis 2. If not set there will be no yAxis 2'
        };
        if (!options.yAxis2AttrName)
            this.options.yAxis2AttrName = null;
        
        this.desc.opts[3] = {
            name: 'sortXAxisValues',
            desc: 'If true the values on the x-axis are sorted'
        };
        if (!options.sortXAxisValues)
            this.options.sortXAxisValues = true;
        this.desc.opts[4] = {
            name: 'viewSetAttributes',
            desc: 'A commata separated list of attribute names that should be shown. Only usefull useing one single dataset.'
        };
        if (!options.viewSetAttributes)
            this.options.viewSetAttributes = false;
        this.desc.opts[5] = {
            name: 'datadescription',
            desc: 'Selector of the datadescription component that should be used.'
        };
        if (!options.datadescription)
            this.options.datadescription = null;
        if (!options.plugins) {
            this.options.plugins = new Map();
            // Plugin for barcharts
            this.options.plugins.set('Barchart', {
                id: 'Barchart',
                active: true
            });
            // Plugin for linecharts
            this.options.plugins.set('Linechart', {
                id: 'Linechart',
                active: true
            });
            //Plugin for piecharts
            this.options.plugins.set('Piechart', {
                id: 'Piechart',
                active: true
            });
        }

        this.desc.funcs[0] = {
            name: 'redrawCharts',
            desc: 'Redraws the charts useing the available and activated plugins. If charts are allready drawn redraws the charts completely new.'
        };

        // internal avalues
        this.attributes = new Map();

        // old ones
        this.chartjsdata = null; // Stores data in chartjs compatible form (DEPRECATED)
        this.chartdata = null; // Stores data in chartjs compatible form (new implementation)
        this.datadescription = null; // Stores the reference to the datadescription component
    }

    init() {
        return new Promise((resolve, reject) => {
            if (this.options.plugins.size === 0)
                Msg.warn('Chart', 'No plugin active, there will be nothing to see', this.requestor);

            if (this.options.datadescription) {
                let dd = document.querySelector(this.options.datadescription);
                if (dd)
                    this.datadescription = dd.swac_comp;
                else
                    Msg.error('Charts', 'Datadescription component >' + this.options.datadescription + '< not found.', this.requestor);
            }
            resolve();
        });
    }

    afterAddSet(set, repeateds) {
        this.analyseSet(set);
        super.afterAddSet(set, repeateds);
    }

    afterRemoveSet(fromName, id) {
        super.afterRemoveSet(fromName,id);
    }

    // public function
    redrawCharts() {
        return new Promise((resolve, reject) => {
            // Clear chart areas
            this.unloadPlugins();
            // Redraw chart areas
            this.loadPlugins();
        });
    }

// ***************************
// Set analysis
// ***************************
    analyseSet(set) {
        let dtr = SWAC.loadedAlgorithms['DatatypeReflection'];
        let firstAttr;
        
        for (let curAttr in set) {
            if (curAttr.startsWith('swac_'))
                continue;
            if (!this.attributes.has(curAttr)) {
                // Get datatype if unknown attr
                let dtype = dtr.determineDataType(set[curAttr]);
                this.attributes.set(curAttr, {
                    type: dtype,
                    min: set[curAttr],
                    max: set[curAttr]
                });
                // Autoconfigure xAxis to a timestamp if no option given
                if(!this.options.xAxisAttrName && (dtype === 'date' || dtype === 'timestamp')) {
                    this.options.xAxisAttrName = curAttr;
                    Msg.info('Charts','Automatic detected to use >' + curAttr + '< on xAxis',this.requestor);
                } else if(curAttr !== 'id' && !this.options.yAxis1AttrName && dtype !== 'varchar' && dtype !== 'bool') {
                    this.options.yAxis1AttrName = curAttr;
                    Msg.info('Charts','Automatic detected to use >' + curAttr + '< on yAxis',this.requestor);
                } else if(!firstAttr && curAttr !== 'id') {
                    
                    firstAttr = curAttr;
                }
            } else {
                let cur = this.attributes.get(curAttr);
                // Update min value
                if(cur.min > set[curAttr])
                    cur.min = set[curAttr];
                // Update max value
                if(cur.max < set[curAttr])
                    cur.max = set[curAttr];
            }
        }
        // Set xAxis to first attribute if no time information present
        if(!this.options.xAxisAttrName) {
            this.options.xAxisAttrName = firstAttr;
        }
        // Set visualised attribute for datadescription
        if(this.datadescription && !this.datadescription.options.visuAttribute) {
            Msg.info('Charts','Automatic setting descriped attribute to >' + this.options.yAxis1AttrName + '< to datadescription.');
            this.datadescription.options.visuAttribute = this.options.yAxis1AttrName;
        }
    }

// ***************************
// Data transformations
// ***************************

    /**
     * Transfers requestors data from the "one object per dataset" format to the "one array per
     * all values" format. Transfers only those data that is identified by the axis 
     * names.
     * If no axis names are given automatically calculates the matching axis attributes.
     * 
     * @returns {this.transformDataToChartData.chartdata}
     */
    async transformDataToChartData() {
        // Avoid reclaculating chartjs dataform
        if (this.chartjsdata === null) {
            // Sort if sort is acive
            let data = this.data;
            if (this.options.sortXAxisValues) {
                data = this.getDataSorted(this.options.xAxisAttrName);
            }

            if (this.options.viewSetAttributes) {
                let viewAttrs = this.options.viewSetAttributes.split(',');
                // Transform dataobject to dataset
                let objsets = [];
                let i = 0;
                for (let datasource in data) {
                    for (let setNr in data[datasource]) {
                        let set = data[datasource][setNr];
                        for (let attr in set) {
                            // Check if attribute should be shown
                            if (viewAttrs.includes(attr)) {
                                i++;
                                let obj = {
                                    id: i,
                                    name: attr,
                                    value: set[attr]
                                }
                                objsets[i] = obj;
                            }
                        }
                    }
                }

                data = {};
                data["transformed"] = objsets;
            } else {
                // If no xAxisAttrName is given automatic detect
                if (!this.options.xAxisAttrName) {
                    this.options.xAxisAttrName = await this.detectAllOverAvailableAttr(['id'], ['timestamp', 'date', 'time', 'varchar']);
                }
                if (!this.options.yAxis1AttrName) {
                    let ignore = ['id', this.options.xAxisAttrName];
                    this.options.yAxis1AttrName = await this.detectAllOverAvailableAttr(ignore, ['int8', 'int4', 'float8', 'float4']);
                }
            }

            this.chartjsdata = {};
            this.chartjsdata.xAxisAttrName = this.options.xAxisAttrName;
            this.chartjsdata.yAxis1AttrName = this.options.yAxis1AttrName;
            this.chartjsdata.yAxis2AttrName = this.options.yAxis2AttrName;
            this.chartjsdata.datasets = [];
            this.chartjsdata.labels = [];
            // Look at each datasource
            for (let datasource in data) {
                let iddata = [];
                let xaxisdata = [];
                let yaxis1data = [];
                let yaxis2data = [];
                let colors = [];

                let missingValues = new Map();
                missingValues.set(this.options.xAxisAttrName, 0);
                missingValues.set(this.options.yAxis1AttrName, 0);
                if (this.options.yAxis2AttrName) {
                    missingValues.set(this.options.yAxis2AttrName, 0);
                }
                let availableSets = 0;
                for (let setNr in data[datasource]) {
                    availableSets++;
                    let set = data[datasource][setNr];
                    iddata.push(set.id);
                    // Check if x value isnt there
                    if (!set[this.options.xAxisAttrName]) {
                        missingValues.set(this.options.xAxisAttrName, missingValues.get(this.options.xAxisAttrName) + 1);
                    }
                    xaxisdata.push(set[this.options.xAxisAttrName]);
                    // Check if y1 value isnt there
                    if (!set[this.options.yAxis1AttrName]) {
                        missingValues.set(this.options.yAxis1AttrName, missingValues.get(this.options.yAxis1AttrName) + 1);
                    }
                    yaxis1data.push(set[this.options.yAxis1AttrName]);
                    // Check if y2 value isnt there
                    if (this.options.yAxis2AttrName) {
                        if (!set[this.options.yAxis2AttrName]) {
                            missingValues.set(this.options.yAxis2AttrName, missingValues.get(this.options.yAxis2AttrName) + 1);
                        }
                        yaxis2data.push(set[this.options.yAxis2AttrName]);
                    }
                    // Calculate colors
                    if (this.datadescription) {
                        let col = this.datadescription.getValueColor(set);
                        colors.push(col);
                    }
                }

                // Check if a whole attribute is missing in all datasets
                if (missingValues.get(this.options.xAxisAttrName) === availableSets) {
                    let errMsg = 'The choosen attribute >' + this.options.xAxisAttrName + '< for x-axis does not exists in datasource >' + datasource + '<.';
                    this.showErrorMessage(errMsg);
                }
                if (missingValues.get(this.options.yAxis1AttrName) === availableSets) {
                    let errMsg = 'The choosen attribute >' + this.options.yAxis1AttrName + '< for y-axis-1 does not exists in datasource >' + datasource + '<.';
                    this.showErrorMessage(errMsg);
                }
                if (this.options.yAxis2AttrName) {
                    if (missingValues.get(this.options.yAxis2AttrName) === availableSets) {
                        let errMsg = 'The choosen attribute >' + this.options.yAxis2AttrName + '< for y-axis-2 does not exists in datasource >' + datasource + '<.';
                        this.showErrorMessage(errMsg);
                    }
                }

                let datasourceData = {};
                datasourceData.datasets = [];
                datasourceData.labels = xaxisdata;

                datasourceData.datasets.push({
                    label: this.options.yAxis1AttrName,
                    backgroundColor: colors,
                    data: yaxis1data,
                    yAxisID: 'y-axis-1'
                });
                if (this.options.yAxis2AttrName) {
                    datasourceData.datasets.push({
                        label: this.options.yAxis2AttrName,
                        data: yaxis2data,
                        yAxisID: 'y-axis-2'
                    });
                }
                // Merge data from datasource to global data
                let tmplables = this.chartjsdata.labels.concat(datasourceData.labels);
                this.chartjsdata.labels = [...new Set(tmplables)];
                this.chartjsdata.datasets = this.chartjsdata.datasets.concat(datasourceData.datasets);
            }
        }
        return this.chartjsdata;
    }

    async transformDataToChartData2() {
        // Avoid reclaculating chartjs dataform
        if (this.chartdata === null) {
            // Sort if sort is acive
            let data = this.data;
            if (this.options.sortXAxisValues) {
                data = this.getDataSorted(this.options.xAxisAttrName);
            }
            if (this.options.viewSetAttributes) {
                let viewAttrs = this.options.viewSetAttributes.split(',');
                // Transform dataobject to dataset
                let objsets = [];
                let i = 0;
                for (let datasource in data) {
                    for (let setNr in data[datasource]) {
                        let set = data[datasource][setNr];
                        for (let attr in set) {
                            // Check if attribute should be shown
                            if (viewAttrs.includes(attr)) {
                                i++;
                                let obj = {
                                    id: i,
                                    name: attr,
                                    value: set[attr]
                                }
                                objsets[i] = obj;
                            }
                        }
                    }
                }

                data = {};
                data["transformed"] = objsets;
            } else {
                // If no xAxisAttrName is given automatic detect
                if (!this.options.xAxisAttrName) {
                    this.options.xAxisAttrName = await this.detectAllOverAvailableAttr(['id'], ['timestamp', 'date', 'time', 'varchar']);
                }
                if (!this.options.yAxis1AttrName) {
                    let ignore = ['id', this.options.xAxisAttrName];
                    this.options.yAxis1AttrName = await this.detectAllOverAvailableAttr(ignore, ['int8', 'int4', 'float8', 'float4']);
                }
            }

            this.chartdata = {
                datasets: [],
                metadata: []
            };
            // Look at each datasource
            for (let curSource in data) {
                let iddata = [];
                let sets = [];
                let colors = [];
                let yAxis2color = [];
                let metadata = {
                    xAxisTypes: [],
                    xAxisScaleType: 'category',
                    yAxis1Types: [],
                    yAxis1ScaleType: 'category',
                    yAxis2Types: [],
                    yAxis2ScaleType: 'category'
                };

                let missingValues = new Map();
                missingValues.set(this.options.xAxisAttrName, 0);
                missingValues.set(this.options.yAxis1AttrName, 0);
                if (this.options.yAxis2AttrName) {
                    missingValues.set(this.options.yAxis2AttrName, 0);
                }
                let availableSets = 0;
                for (let curSet of data[curSource]) {
                    if (!curSet)
                        continue;
                    availableSets++;
                    iddata.push(curSet.id);
                    // Check if x value isnt there
                    if (!curSet[this.options.xAxisAttrName]) {
                        missingValues.set(this.options.xAxisAttrName, missingValues.get(this.options.xAxisAttrName) + 1);
                    } else if (!metadata.xAxisTypes.includes(typeof curSet[this.options.xAxisAttrName])) {
                        metadata.xAxisTypes.push(typeof curSet[this.options.xAxisAttrName]);
                    }
                    // Check if y1 value isnt there
                    if (!curSet[this.options.yAxis1AttrName]) {
                        missingValues.set(this.options.yAxis1AttrName, missingValues.get(this.options.yAxis1AttrName) + 1);
                    } else if (!metadata.yAxis1Types.includes(typeof curSet[this.options.yAxis1AttrName])) {
                        metadata.yAxis1Types.push(typeof curSet[this.options.yAxis1AttrName]);
                    }
                    sets.push(curSet);
                    // Check if y2 value isnt there
                    if (this.options.yAxis2AttrName) {
                        if (!curSet[this.options.yAxis2AttrName]) {
                            missingValues.set(this.options.yAxis2AttrName, missingValues.get(this.options.yAxis2AttrName) + 1);
                        } else if (!metadata.yAxis2Types.includes(typeof curSet[this.options.yAxis2AttrName])) {
                            metadata.yAxis2Types.push(typeof curSet[this.options.yAxis2AttrName]);
                        }
                    }
                    // Calculate colors
                    if (this.datadescription) {
                        let col = this.datadescription.getValueColor(curSet);
                        colors.push(col);
                    }
                }

                // Check if a whole attribute is missing in all datasets
                if (missingValues.get(this.options.xAxisAttrName) === availableSets) {
                    let errMsg = 'The choosen attribute >' + this.options.xAxisAttrName + '< for x-axis does not exists in datasource >' + curSource + '<.';
                    this.showErrorMessage(errMsg);
                }
                if (missingValues.get(this.options.yAxis1AttrName) === availableSets) {
                    let errMsg = 'The choosen attribute >' + this.options.yAxis1AttrName + '< for y-axis-1 does not exists in datasource >' + curSource + '<.';
                    this.showErrorMessage(errMsg);
                }
                if (this.options.yAxis2AttrName) {
                    if (missingValues.get(this.options.yAxis2AttrName) === availableSets) {
                        let errMsg = 'The choosen attribute >' + this.options.yAxis2AttrName + '< for y-axis-2 does not exists in datasource >' + curSource + '<.';
                        this.showErrorMessage(errMsg);
                    }
                }

                // Add chartjs dataset definitions
                this.chartdata.datasets.push({
                    label: this.options.yAxis1AttrName,
                    backgroundColor: colors,
                    data: sets,
                    parsing: {
                        xAxisKey: this.options.xAxisAttrName,
                        yAxisKey: this.options.yAxis1AttrName
                    }
                });
                if (this.options.yAxis2AttrName) {
                    this.chartdata.datasets.push({
                        fromName: curSource,
                        label: this.options.yAxis2AttrName,
                        backgroundColor: yAxis2color,
                        data: sets,
                        parsing: {
                            xAxisKey: this.options.xAxisAttrName,
                            yAxisKey: this.options.yAxis2AttrName
                        }
                    });
                }
                // Determine scaleTypes from metadata
                if (metadata.xAxisTypes.length !== 1) {
                    metadata.xAxisScaleType = 'category';
                } else {
                    switch (metadata.xAxisTypes[0]) {
                        case 'number':
                            metadata.xAxisScaleType = 'linear';
                            break;
                        default:
                            metadata.xAxisScaleType = 'category';
                    }
                }
                if (metadata.yAxis1Types.length !== 1) {
                    metadata.yAxis1ScaleType = 'category';
                } else {
                    switch (metadata.yAxis1Types[0]) {
                        case 'number':
                            metadata.yAxis1ScaleType = 'linear';
                            break;
                        default:
                            metadata.yAxis1ScaleType = 'category';
                    }
                }
                if (this.options.yAxis2AttrName) {
                    if (metadata.yAxis2Types.length !== 1) {
                        metadata.yAxis2ScaleType = 'category';
                    } else {
                        switch (metadata.yAxis2Types[0]) {
                            case 'number':
                                metadata.yAxis2ScaleType = 'linear';
                                break;
                            default:
                                metadata.yAxis2ScaleType = 'category';
                        }
                    }
                }
                // Add metadata
                this.chartdata.metadata.push(metadata);
            }
        }
        return this.chartdata;
    }

    /**
     * Detects the attribute from data, that is best suited to be used for x-axis (labels)
     * 
     * @param {Object[]} data Object with datasources[datasets[dataobjects{}]]
     * @param {Type} preferType Name of the datatype prefered for useage
     * @param {String[]} ignore List of attribute names that should be ignored
     * @returns {String} Name of the attribute to use for x-axis
     */
    detectAllOverAvailableAttr(ignore = ['id'], typeOrder = ['timestamp', 'date', 'time', 'int8', 'int4', 'float8', 'float4']) {
        let thisRef = this;
        return new Promise((resolve, reject) => {
            thisRef.getAttributeUseage().then(function (candidates) {
                let allDatasetsCount = thisRef.countSets();
                let candSorted = new Map();

                // Sort after type
                for (let curCandidate of candidates.values()) {
                    if (!candSorted.has(curCandidate.type))
                        candSorted.set(curCandidate.type, []);
                    candSorted.get(curCandidate.type).push(curCandidate);
                }
                // Use first matching type
                let firstMatch = null;
                for (let curType of typeOrder) {
                    let curCandidates = candSorted.get(curType);
                    if (!curCandidates)
                        continue;
                    for (let curCand of curCandidates) {
                        if (!ignore.includes(curCand.name) && curCand.count === allDatasetsCount) {
                            firstMatch = curCand.name;
                            break;
                        }
                    }
                    if (firstMatch)
                        break;
                }
                resolve(firstMatch);
            });
        });
    }

    /**
     * Select the first chart tab
     */
    selectFirstChartTab() {
        let chartNav = this.requestor.querySelector(".swac_chart_nav");
        UIkit.tab(chartNav).show(1);
    }

    /**
     * Hides the tabs and shows the first tab content
     */
    hideChartTab() {
        let chartNav = this.requestor.querySelector(".swac_chart_nav");
        chartNav.style.visibility = "hidden";
        let chartTabs = this.requestor.querySelector(".swac_chart_tabs");
        chartTabs.querySelector('.swac_repeatedForPluginCont').setAttribute('style', 'display: block');
    }

    /**
     * Shows a errormessage to the user. Does nothing if there is no element with
     * class swac_chart_msgs
     * 
     * @param {String} message Message to show
     * @returns {undefined}
     */
    showErrorMessage(message) {
        // Get error message place
        let errAreas = this.requestor.querySelectorAll('.swac_chart_msgs');
        for (let errArea of errAreas) {
            let errMsgElem = document.createElement('div');
            errMsgElem.innerHTML = message;
            errArea.appendChild(errMsgElem);
        }
    }

    /**
     * Removes the tab navigation if there is only one plugin active and opens the
     * first tab.
     * 
     * @param {String[]} loadedPlugins
     * @returns {undefined}
     */
    afterPluginsLoaded(loadedPlugins) {
        if (loadedPlugins.length < 2)
            this.hideChartTab();
        else
            this.selectFirstChartTab();
    }
    
    /**
     * Gets a human readable name from a source name
     * 
     * @param {String} fromName Full qualified fromName
     * @returns {String} Short readable name
     */
    getReadableSourceName(fromName) {
        let rsName = fromName;
        let lastPos = rsName.lastIndexOf('/');
        if(lastPos > 0) {
            rsName = rsName.substring(lastPos,rsName.length);
        }
        return rsName;
    }
    
    /**
     * Get the chart.js scale type for an attribute
     * 
     * @param {String} Attribut name
     * @return {String} Matching scale type
     */
    getScaleTypeForAttr(attr) {
        if(!this.attributes.get(attr)) {
            Msg.error('Charts','There is no attributes def for ' + attr,this.requestor);
            return 'category';
        }
        switch(this.attributes.get(attr).type) {
            case 'timestamp': return 'time';
            default: return 'category'
        }
    }
}