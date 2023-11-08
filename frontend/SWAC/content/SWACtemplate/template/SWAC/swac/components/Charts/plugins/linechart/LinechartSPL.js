var linechartFactory = {};
linechartFactory.create = function (pluginconfig) {
    return new LinechartSPL(pluginconfig);
};
/**
 * Plugin for representing data in chart with linechart
 */
class LinechartSPL extends ComponentPlugin {

    constructor(pluginconf) {
        super(pluginconf);
        this.name = 'chart/plugins/linechart';
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
    }

    init() {
        // Check if content area is available
        if (!this.contElements || this.contElements.length === 0) {
            Msg.error('LinechartSPL', 'This plugin needs a contElement to insert the chart.', this.requestor);
        }
        // Get component where this plugin instance belongs to
        let component = this.requestor.swac_comp;
        // Get draw area
        var ctx = this.contElements[0].querySelector('canvas');
        let chartdata = component.transformDataToChartData();

        let yAxisScales = [];
        yAxisScales.push({
            display: true,
            position: 'left',
            id: 'y-axis-1',
            scaleLabel: {
                display: true,
                labelString: chartdata.yAxis1AttrName
            }
        });
        if (chartdata.yAxis2AttrName) {
            yAxisScales.push({
                display: true,
                position: 'right',
                id: 'y-axis-2',
                scaleLabel: {
                    display: true,
                    labelString: chartdata.yAxis2AttrName
                },
                // grid line settings
                gridLines: {
                    drawOnChartArea: false // only want the grid lines for one axis to show up
                }
            });
        }

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                datasets: chartdata.datasets,
                labels: chartdata.labels},
            plugins: [ChartDataLabels],
            options: {
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        fill: false,
                        color: '#ffffff',
                        anchor: 'end',
                        align: 'end',
                        display: this.options.showdatalabels
                    }
                },
                scales: {
                    xAxes: [{
                            display: true,
                            scaleLabel: {
                                display: true,
                                labelString: chartdata.xAxisAttrName
                            }
                        }],
                    yAxes: yAxisScales
                }
            }
        });
        return;
    }
}