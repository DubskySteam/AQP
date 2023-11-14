var ChartsFactory = {};
ChartsFactory.create = function (config) {
    return new Charts(config);
};

/**
 * Component for presenting data in charts
 */
class Charts extends Component {

    constructor(options = {}) {
        super(options);
        this.name = 'Charts';
        this.desc.text = "Show bar- line or pie-chart and datatable for every data.";
        this.desc.depends[0] = {
            name: 'DatatypeReflection Class',
            path: SWAC_config.swac_root + '/swac/algorithms/DatatypeReflection.js',
            desc: 'Class containing methods for detecting datatypes.'
        };
        this.desc.depends[1] = {
            name: 'Chartjs Class',
            path: SWAC_config.swac_root + '/swac/components/Charts/libs/chartjs/Chart.min.js',
            desc: 'Class containing the ChartJs functions.'
        };
        this.desc.depends[2] = {
            name: 'Chartjs datalables Plugin',
            path: SWAC_config.swac_root + '/swac/components/Charts/libs/chartjs/chartjs-plugin-datalabels.min.js',
            desc: 'Extension for chartjs to display datalables.'
        };
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
        this.desc.opts[3] = {
            name: 'sortXAxisValues',
            desc: 'If true the values on the x-axis are sorted'
        };
        if (!options.sortXAxisValues)
            this.options.sortXAxisValues = true;

        if (!options.plugins) {
            let chart_options = {
                //TODO change this use Datadescription component for coloring
//                lineconfigs: [
//                    {
//                        fill: false,
//                        borderColor: '#6495ED',
//                        backgroundColor: '#6495ED',
//                        lineTension: 0
//                    },
//                    {
//                        fill: false,
//                        borderColor: '#9F9F9F',
//                        backgroundColor: '#9F9F9F',
//                        lineTension: 0
//                    }
//                ]
            };

            // Plugin for barcharts
            this.plugins.set('barchart', {
                active: true,
                options: chart_options
            });
            // Plugin for linecharts
            this.plugins.set('linechart', {
                active: true,
                options: chart_options
            });
            //Plugin for piecharts
            this.plugins.set('piechart', {
                active: true,
                options: chart_options
            });
            // Plugin for table view
            this.plugins.set('table', {
                active: true,
                options: chart_options
            });
        }

        this.desc.funcs[0] = {
            name: 'drawCharts',
            desc: 'Draws the charts useing the available and activated plugins. If charts are allready drawn redraws the charts completely new.'
        };

        // internal avalues
        this.chartjsdata = null; // Strores data in chartjs compatible form
    }

    init() {
        return new Promise((resolve, reject) => {
            if (!this.data) {
                Msg.warn('Chart', 'There is no data for chart.', this.requestor);
                resolve();
            } else {
                resolve();
            }
        });
    }

    /**
     * Executed after ading a set. Resets the chartjs data
     * 
     * @param {type} fromName
     * @param {type} set
     * @returns {undefined}
     */
    afterAddSet(fromName, set) {
        // Data in chartjs form must be recalculated
        //TODO update chartjsdata instead recalculating it if possible
        this.chartjsdata = null;
    }

    afterRemoveSets(fromName, sets) {
        // Data in chartjs form must be recalculated
        //TODO update chartjsdata instead recalculating it if possible
        this.chartjsdata = null;
    }

    drawCharts(chart_arr) {
        return new Promise((resolve, reject) => {
//            // Clear chart area
//            this.plugins.unloadPlugins();
//            this.chartjsdata = null;

        });
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
    transformDataToChartData() {
        // Avoid reclaculating chartjs dataform
        if (this.chartjsdata === null) {
            // If no xAxisAttrName is given automatic detect
            if (!this.options.xAxisAttrName) {
                this.options.xAxisAttrName = this.detectAllOverAvailableAttr(this.data, true);
            }
            if (!this.options.yAxis1AttrName) {
                let ignore = ['id', this.options.xAxisAttrName];
                this.options.yAxis1AttrName = this.detectAllOverAvailableAttr(this.data, false, ignore);
            }

            // Sort if sort is acive
            let data = this.data;
            if (this.options.sortXAxisValues) {
                data = this.getDataSorted(this.options.xAxisAttrName);
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
                    // Check if value isnt there
                    if (!set[this.options.xAxisAttrName]) {
                        missingValues.set(this.options.xAxisAttrName, missingValues.get(this.options.xAxisAttrName) + 1);
                    }
                    xaxisdata.push(set[this.options.xAxisAttrName]);
                    if (!set[this.options.yAxis1AttrName]) {
                        missingValues.set(this.options.yAxis1AttrName, missingValues.get(this.options.yAxis1AttrName) + 1);
                    }
                    yaxis1data.push(set[this.options.yAxis1AttrName]);
                    if (this.options.yAxis2AttrName) {
                        if (!set[this.options.yAxis2AttrName]) {
                            missingValues.set(this.options.yAxis2AttrName, missingValues.get(this.options.yAxis2AttrName) + 1);
                        }
                        yaxis2data.push(set[this.options.yAxis2AttrName]);
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
                datasourceData.labels = [...new Set(xaxisdata)];
                datasourceData.datasets.push({
                    label: this.options.yAxis1AttrName,
                    backgroundColor: this.color,
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

    /**
     * Detects the attribute from data, that is best suited to be used for x-axis (labels)
     * 
     * @param {Object[]} data Object with datasources[datasets[dataobjects{}]]
     * @param {boolean} preferTs if true columns with timestemps will be prefered
     * @param {String[]} ignore List of attribute names that should be ignored
     * @returns {String} Name of the attribute to use for x-axis
     */
    detectAllOverAvailableAttr(data, preferTs = false, ignore = ['id']) {
        let allCandidates = new Map();
        let allTsCandidates = [];
        let allDatasetsCount = 0;

        for (let datasource in data) {
            // Create a map of all attributes and their occurences
            let candidates = new Map();
            let tscandidates = [];
            let datasetsCount = 0;

            for (let setNo in data[datasource]) {
                datasetsCount++;
                for (let attribute in data[datasource][setNo]) {
                    // Exclude attributes on ignore list
                    if (!ignore.includes(attribute)) {
                        // If the data is of type date use this for x axis
                        if (DatatypeReflection.isDate(data[datasource][setNo][attribute])) {
                            tscandidates.push(attribute);
                        }
                        // Note as candidate and count canditates occurences
                        if (!candidates.has(attribute)) {
                            candidates.set(attribute, 1);
                        } else {
                            candidates.set(attribute, candidates.get(attribute) + 1);
                        }
                    }
                }
            }
            allDatasetsCount += datasetsCount;
            // Add tsCandidates
            allTsCandidates = allTsCandidates.concat(tscandidates);
            // Add candidats to the allCandidates list that where present at every dataset
            for (let [curAttribute, curAttributeCount] of candidates) {
                if (curAttributeCount === allDatasetsCount) {
                    if (!allCandidates.has(curAttribute)) {
                        allCandidates.set(curAttribute, curAttributeCount);
                    } else {
                        allCandidates.set(curAttribute, allCandidates.get(curAttribute) + curAttributeCount);
                    }
                }
            }
        }
        // Use tsCandidate if there and available in all datasets
        if (preferTs) {
            for (let curTsCandidate of allTsCandidates) {
                if (allCandidates.has(curTsCandidate) && allCandidates.get(curTsCandidate) === allDatasetsCount) {
                    return curTsCandidate;
                }
            }
        }
        // Use first candidate that is available on all datasets
        for (let [curAttribute, curAttributeCount] of allCandidates) {
            if (curAttributeCount === allDatasetsCount) {
                return curAttribute;
            }
        }

        return null;
    }

    /**
     * Select the first chart tab
     */
    selectFirstChartTab() {
        let chartNav = this.requestor.querySelector(".swac_chart_nav");
        if (chartNav.children.length > 1) {
            chartNav.children[1].children[0].click();
        }
    }
    hideChartTab() {
        let chartNav = this.requestor.querySelector(".swac_chart_nav");
        chartNav.style.visibility = "hidden";
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
        if (loadedPlugins.length < 2) {
            this.hideChartTab();
        }
        this.selectFirstChartTab();
    }
}