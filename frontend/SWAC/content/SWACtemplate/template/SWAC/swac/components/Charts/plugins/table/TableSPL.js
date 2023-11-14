var tableFactory = {};
tableFactory.create = function (pluginconfig) {
    return new TableSPL(pluginconfig);
};

/**
 * Plugin for representing data in chart with linechart
 */
class TableSPL extends ComponentPlugin {

    constructor(pluginconf) {
        super(pluginconf);
        this.name = 'chart/plugins/table';
        this.desc.templates[0] = {
            name: 'table',
            style: 'table',
            desc: 'Default template creating a simple table of the data'
        };
        // Set default options
        // Exclude attributes from view in table
        if (!this.options.excludedAttrs) {
            this.options.excludedAttrs = ['id'];
        }
    }

    /**
     * Initilises the plugin
     * 
     * @returns {undefined}
     */
    init() {
        // Use data from component
        let data = this.requestor.swac_comp.data;
        
        // Add each table of data (from difference source) seperately
        // If one data from one source could't be added this will not effect
        // the others
        for (let fromName in data) {
            let tableName = "" + fromName;

            if (tableName.includes("//")) {
                let stringArray = tableName.split("//");
                let nextStringArray = stringArray[1].split("/");
                tableName = nextStringArray[0];
                for (let i = 1; i < nextStringArray.length; i++) {
                    tableName += "_" + nextStringArray[i];
                }
            }
            // Get sure there is no second table for the same datasource
            this.removeTable(tableName);
            this.createTable(tableName);
        }
    }

    /**
     * Removes a table from the view.
     * 
     * @param {String} datasourceName Name of the datasource to remove
     * @returns {undefined}
     */
    removeTable(datasourceName) {
        let chartTableId = datasourceName.replace(/\//g, '');
        chartTableId = chartTableId.replace(/\./g, '');
        let chartTableElem = this.requestor.querySelector('#swac_chart_table_' + chartTableId);
        if (chartTableElem !== null) {
            chartTableElem.parentNode.removeChild(chartTableElem);
        }
    }

    /**
     * Executed for each datatable. Returns the sets from the datatable as chartJsSets.
     * 
     * @param {String} datasourceName Name of the datasource where to create a table for
     * @returns {ChartJsDataSet} DataSet in chart.js format (datatable)
     */
    createTable(datasourceName) {
        Msg.warn('TableSPL', 'Creating table for data from >' + datasourceName + '<', this.requestor);

        // Check if content area is available
        if (!this.contElements || this.contElements.length === 0) {
            Msg.error('TableSPL', 'This plugin needs a contElement to insert the chart.', this.requestor);
        }

        // Get element that should be repeated for every datasource
        let datasourceElems = this.contElements[0].querySelectorAll('.swac_chart_table_repeatForDatasource');

        for (let curDatasourceElem of datasourceElems) {
            // Create a copy for the element
            let chartTableAreaElem = curDatasourceElem.cloneNode(true);
            let chartTableId = datasourceName.replace('/', '');
            chartTableId = chartTableId.replace('.', '');

            chartTableAreaElem.setAttribute('id', '#swac_chart_table_' + chartTableId);
            chartTableAreaElem.classList.remove('swac_chart_table_repeatForDatasource');
            chartTableAreaElem.classList.add('swac_chart_table_repeatedForDatasource');

            if (datasourceName.includes("observedobject_get")) {
                let stringArray = datasourceName.split("_");
                datasourceName = "ref://observedobject/get/" + stringArray[stringArray.length - 1]
            }

            // Get elements where to insert the datasourcename
            let datasourceNameElems = chartTableAreaElem.querySelectorAll('.swac_chart_table_datasourceTitle');
            for (let curDatasourceNameElem of datasourceNameElems) {
                curDatasourceNameElem.innerHTML = datasourceName;
            }

            // Get column names
            let columnscount = this.requestor.swac_comp.getAvailableAttributesForDatasource(datasourceName);
            // Create header rows
            let headerRowElems = chartTableAreaElem.querySelectorAll('.swac_chart_table_repeatForAttribute');
            for (let curHeaderRowElem of headerRowElems) {
                for (let [curAttr, curAttrCount] of columnscount) {
                    // Check if attribute should be excluded
                    if (!this.options.excludedAttrs.includes(curAttr)) {
                        let curHeaderElem = curHeaderRowElem.cloneNode(true);
                        curHeaderElem.classList.remove('swac_chart_table_repeatForAttribute');
                        curHeaderElem.classList.add('swac_chart_table_repeatedForAttribute');
                        curHeaderElem.innerHTML = curAttr;
                        curHeaderRowElem.parentNode.appendChild(curHeaderElem);
                    }
                }
            }

            // Go trough sets
            for (let setNo in this.requestor.swac_comp.data[datasourceName]) {
                let set = this.requestor.swac_comp.data[datasourceName][setNo];
                let setElems = chartTableAreaElem.querySelectorAll('.swac_chart_table_repeatForSet');
                for (let curSetElemTemplate of setElems) {
                    let curSetElem = curSetElemTemplate.cloneNode(true);
                    curSetElem.classList.remove('swac_chart_table_repeatForSet');
                    let valueElems = curSetElem.querySelectorAll('.swac_chart_table_repeatForValue');
                    for (let curValueElemTemplate of valueElems) {
                        for (let curAttr of columnscount.keys()) {
                            if (!this.options.excludedAttrs.includes(curAttr)) {
                                let curValue = set[curAttr];
                                let curValueElem = curValueElemTemplate.cloneNode();
                                curValueElem.classList.remove('swac_chart_table_repeatForValue');
                                curValueElem.innerHTML = curValue;
                                curValueElemTemplate.parentNode.appendChild(curValueElem);
                            }
                        }
                    }
                    curSetElemTemplate.parentNode.appendChild(curSetElem);
                }
            }
            this.contElements[0].appendChild(chartTableAreaElem);
        }
    }
}
;