import SWAC from '../../../../swac.js';
import Msg from '../../../../Msg.js';
import Plugin from '../../../../Plugin.js'

export default class BarchartSPL extends Plugin {

    constructor(options = {}) {
        super(options);
        this.name = 'Charts/plugins/Barchart';
        this.desc.templates[0] = {
            name: 'barchart',
            style: false,
            desc: 'Default template createing a chartjs instance for barchart'
        };
        // Set default options
        this.desc.opts[0] = {
            name: 'showdatalabels',
            desc: 'If true the values of the data points are shown in the diagram'
        };
        if (typeof options.showdatalabels === 'undefined')
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

        // internal attributes
        this.chart = null;
    }

    init() {
        return new Promise((resolve, reject) => {
            // Check if content area is available
            if (!this.contElements || this.contElements.length === 0) {
                Msg.error('BarchartSPL', 'This plugin needs a contElement to insert the chart.', this.requestor);
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

        // Calculate color for dataset useing datadescription component
        let col = 'gray';
        if (comp.datadescription)
            col = comp.datadescription.getValueColor(set);

        let rsName = comp.getReadableSourceName(set.swac_fromName);
        let sourceFound = false;
        for (let curSets of this.chart.data.datasets) {
            // Add new dataset to the correct chart datasets
            if (rsName === curSets.label) {
                curSets.data.push(set);
                if (comp.datadescription)
                    curSets.backgroundColor.push(col);
                sourceFound = true;
                break;
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
        // Set type of xAxis
        if (!this.options.scales.x.type) {
            this.options.scales.x.type = comp.getScaleTypeForAttr(comp.options.xAxisAttrName);
        }

        // Auto confgure yAxis1
        if (!this.options.scales.y) {
            this.options.scales.y = {};
        }
        // Add title for yAxis if not configured
        if (!this.options.scales.y.title) {
            this.options.scales.y.title = {
                display: 'true',
                align: 'center',
                text: comp.options.yAxis1AttrName
            }
        }
        // Set type of yAxis
        if (!this.options.scales.y.type) {
            let stype = comp.getScaleTypeForAttr(comp.options.yAxis1AttrName);
            // Category type is only for x axis
            if (stype !== 'category')
                this.options.scales.y.type = stype;
        }

        //TODO reimplement yAxis2 support
        // Auto confgure yAxis2
//        if (comp.options.yAxis2AttrName && this.options.scales.yAxis2) {
//            // Add title for yAxis if not configured
//            if (!this.options.scales.yAxis2.title) {
//                this.options.scales.yAxis2.title = {
//                    display: 'true',
//                    align: 'center',
//                    text: comp.options.yAxis2AttrName
//                }
//            }
//            // Set type of xAxis
//            if (!this.options.scales.yAxis2.type) {
//                this.options.scales.yAxis2.type = comp.getScaleTypeForAttr(comp.options.yAxis2AttrName);
//            }
//            this.options.scales.yAxis2.grid = {
//                drawOnChartArea: false, // only want the grid lines for one axis to show up
//            }
//        } else if (!comp.options.yAxis2AttrName) {
//            delete this.options.scales.yAxis2;
//        }

        let readableSourceName = comp.getReadableSourceName(set.swac_fromName);

        let ddesc = {
            label: readableSourceName,
            data: [set],
            borderWidth: 1
        };
        // Calculate color for dataset useing datadescription component
        if (comp.datadescription)
            ddesc.backgroundColor = [comp.datadescription.getValueColor(set)];

        this.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                datasets: [ddesc]
            },
            options: {
                parsing: {
                    xAxisKey: comp.options.xAxisAttrName,
                    yAxisKey: comp.options.yAxis1AttrName
                },
                scales: this.options.scales
            }
        });
    }

    afterRemoveSet(fromName, id) {
        // Look at each source (datasets array entry in chart.js)
        for (let curSets of this.chart.data.datasets) {
            if (curSets.label === fromName) {
                // Look at each set
                for (let i in curSets.data) {
                    if (curSets.data[i].id === id) {
                        curSets.data.splice(i, 1);
                        break;
                    }
                }
            }
        }
        this.chart.update();
    }
}