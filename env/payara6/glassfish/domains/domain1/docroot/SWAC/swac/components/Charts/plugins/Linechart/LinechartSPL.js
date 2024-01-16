import SWAC from '../../../../swac.js';
import Msg from '../../../../Msg.js';
import Plugin from '../../../../Plugin.js'

export default class LinechartSPL extends Plugin {

    constructor(options = {}) {
        super(options);
        this.name = 'Charts/plugins/Linechart';
        this.desc.templates[0] = {
            name: 'linechart',
            style: false,
            desc: 'Default template createing a chartjs instance for linechart'
        };
        // Set default options
        this.desc.opts[0] = {
            name: 'showdatalabels',
            desc: 'If true the values of the data points are shown in the diagram'
        };
        this.options.showdatalabels = false;
        this.desc.opts[1] = {
            name: 'scales',
            desc: 'Scales to show at the diagram. Can be configured like documented at chart.js documentation.'
        };
        if (!options.scales)
            this.options.scales = {};
        this.desc.opts[2] = {
            name: 'legend',
            desc: 'Legend configuration as specified in chart.js documentation (https://www.chartjs.org/docs/latest/configuration/legend.html)'
        };
        if (!options.legend)
            this.options.legend = {
                display: true,
                labels: {
                    color: 'rgb(0, 0, 0)'
                }
            };
    }

    init() {
        let thisRef = this;
        return new Promise((resolve, reject) => {
            // Check if content area is available
            if (!thisRef.contElements || thisRef.contElements.length === 0) {
                Msg.error('LinechartSPL', 'This plugin needs a contElement to insert the chart.', this.requestor);
            }
            resolve();
        });
    }

    afterAddSet(set, repeateds) {
        if (!this.chart) {
            this.initChart(set);
            return;
        }

        // Get component where this plugin instance belongs to
        let comp = this.requestor.parent.swac_comp;

        // Check if xAxis attr exists
        if (!set[comp.options.xAxisAttrName]) {
            Msg.error('LinechartSPL', 'The attribute >' + comp.options.xAxisAttrName + '< does not exists in dataset >' + set.swac_fromName + '[' + set.id + ']<. Cannot add set to chart.', comp.requestor);
            return;
        }

        // Add x value
        this.chart.config._config.data.labels.push(set[comp.options.xAxisAttrName]);

        // Calculate color for dataset useing datadescription component
        let col = 'gray';
        if (comp.datadescription)
            col = comp.datadescription.getValueColor(set);

        let rsName = comp.getReadableSourceName(set.swac_fromName);
        let sourceFound = false;
        // Add y values to the datasets
        for (let curSets of this.chart.data.datasets) {
            for (let curYAttr of comp.options.yAxisAttrNames) {
                // Add new dataset to the correct chart datasets
                if (rsName + '_' + curYAttr === curSets.label) {
                    curSets.data.push(set);
                    if (comp.datadescription)
                        curSets.backgroundColor.push(col);
                    sourceFound = true;
                    break;
                }
            }
        }

        // Create new datasource in chart for data from new source
        if (!sourceFound) {
            let odesc = {
                label: rsName,
                data: [set]
            };
            if (comp.datadescription)
                odesc.backgroundColor = [col];

            this.chart.data.datasets.push(odesc);
        }

        this.chart.update();
    }

    /**
     * Initilises the charttype based on the given set
     * 
     * @param {WatchableSet} set Representative dataset for chart data
     */
    initChart(set) {
        // Get component where this plugin instance belongs to
        let comp = this.requestor.parent.swac_comp;
        // Get draw area (only one contElement supported)
        var ctx = this.contElements[0].querySelector('canvas');

        // Auto configure xAxis
        if (!this.options.scales.x) {
            this.options.scales.x = {};
        }
        // Add title for xAxis if not configured
        if (!this.options.scales.x.title) {
            this.options.scales.x.title = {
                display: true,
                align: 'center',
                text: comp.options.xAxisAttrName
            };
        }

        // Check if xAxis attr exists
        if (!set[comp.options.xAxisAttrName]) {
            Msg.error('LinechartSPL', 'The attribute >' + comp.options.xAxisAttrName + '< does not exists in dataset >' + set.swac_fromName + '[' + set.id + ']<. Cannot add set to chart.', comp.requestor);
            return;
        }

        // Set type of xAxis
        if (!this.options.scales.x.type) {
            this.options.scales.x.type = comp.getScaleTypeForAttr(comp.options.xAxisAttrName);
        }

        // Add x value to list of labels
        let label_inst = [set[comp.options.xAxisAttrName]];

        let readableSourceName = comp.getReadableSourceName(set.swac_fromName);

        // Create datasets array
        let datasets_inst = [];

        // Create parsing instruction (e.g. which attr should be shown on which axis?)
        let parsing_inst = {
            xAxisKey: comp.options.xAxisAttrName,
        };

        // Create scales for y axis
        for (let curYAttr of comp.options.yAxisAttrNames) {
            // Auto confgure yAxis1
            if (!this.options.scales['y_' + curYAttr]) {
                this.options.scales['y_' + curYAttr] = {};
            }
            // Add title for yAxis if not configured
            if (!this.options.scales['y_' + curYAttr].title) {
                this.options.scales['y_' + curYAttr].title = {
                    display: 'true',
                    align: 'center',
                    text: curYAttr
                }
            }
            // Set type of yAxis
            if (!this.options.scales['y_' + curYAttr].type) {
                let stype = comp.getScaleTypeForAttr(curYAttr);
                // Category type is only for x axis
                if (stype !== 'category')
                    this.options.scales['y_' + curYAttr].type = stype;
            }
            // Set assignmet of variable to axis
            parsing_inst['y_' + curYAttr] = curYAttr;

            // Create datasets description
            let ddesc = {
                label: readableSourceName + '_' + curYAttr,
                data: [set],
                borderWidth: 1,
                yAxisID: 'y_' + curYAttr,
                parsing: {
                    xAxisKey: comp.options.xAxisAttrName,
                    yAxisKey: curYAttr
                }
            };
            // Calculate color for dataset useing datadescription component
            if (comp.datadescription)
                ddesc.backgroundColor = [comp.datadescription.getValueColor(set)];
            datasets_inst.push(ddesc);
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: label_inst,
                datasets: datasets_inst
            },
            options: {
                parsing: parsing_inst,
                scales: this.options.scales,
                plugins: {
                    zoom: {
                        zoom: {
                            wheel: {
                                enabled: true,
                            },
                            pinch: {
                                enabled: true
                            },
                            mode: 'xy',
                        },
                        pan: {
                            enabled: true
                        }
                    }
                }
            }
        });

        // Add zoom plugin
        var js = document.createElement("script");
        js.type = "text/javascript";
        js.src = '/SWAC/swac/components/Charts/libs/chartjs/chartjs-plugin-zoom.min.js';
        document.body.appendChild(js);
    }

    afterRemoveSet(fromName, id) {
        // Get component where this plugin instance belongs to
        let comp = this.requestor.parent.swac_comp;
        let rsName = comp.getReadableSourceName(fromName);
        // Look at each source (datasets array entry in chart.js)
        for (let curSets of this.chart.data.datasets) {
            for (let curYAttr of comp.options.yAxisAttrNames) {
                if (rsName + '_' + curYAttr === curSets.label) {
                    // Look at each set
                    for (let i in curSets.data) {
                        if (curSets.data[i].id === id) {
                            curSets.data.splice(i, 1);
                            break;
                        }
                    }
                }
            }
        }
        this.chart.update();
    }
}