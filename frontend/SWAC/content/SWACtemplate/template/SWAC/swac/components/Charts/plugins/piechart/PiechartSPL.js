var piechartFactory = {};
piechartFactory.create = function (pluginconfig) {
    return new PiechartSPL(pluginconfig);
};

/**
 * Plugin for representing data in chart with piechart
 */
class PiechartSPL extends ComponentPlugin {

    constructor(pluginconf) {
        super(pluginconf);
        this.name = 'chart/plugins/piechart';
        this.desc.templates[0] = {
            name: 'piechart',
            style: false,
            desc: 'Default template createing a chartjs instance for piechart'
        };
        // Set default options
    }

    init() {
        // Check if content area is available
        if (!this.contElements || this.contElements.length === 0) {
            Msg.error('PiechartSPL', 'This plugin needs a contElement to insert the chart.', this.requestor);
        }
        // Get component where this plugin instance belongs to
        let component = this.requestor.swac_comp;

        // Get draw area
        var ctx = this.contElements[0].querySelector('canvas');

        let chartdata = component.transformDataToChartData();

        let yAxisLabel = chartdata.yAxis1AttrName;
        if (chartdata.yAxis2AttrName) {
            yAxisLabel += " " + chartdata.yAxis2AttrName;
        }

        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                datasets: chartdata.datasets,
                labels: chartdata.labels},
            plugins: [ChartDataLabels],
            options: {
                plugins: {
                    // Change options for ALL labels of THIS CHART
                    datalabels: {
                        color: '#000000',
                        anchor: 'end',
                        align: 'end'
                    }
                }
            }
        });

        return;
    }
}