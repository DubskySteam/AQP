var explaincomponent_options = {
    componentName: 'Charts'
};

// Register example 1 button events
document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function (requestors) {
        let addDatasetButton = document.getElementById('charts_example1_addset');
        addDatasetButton.addEventListener('click', function (evt) {
            let newsetid = 1;
            for(let curSet of requestors['charts_example1'].swac_comp.data['exampledata_list'].getSets()) {
                if(!curSet)
                    continue;
                newsetid = curSet.id;
            }
            newsetid++;

            var min = -5;
            var max = 45;
            var randomDouble = (Math.random() * (max - min)) + min;

            var min = 1000;
            var max = 4000;
            var randomInt = Math.round(Math.random() * (max - min)) + min;

            let newset = {
                id: newsetid,
                name: "Datensatz " + newsetid,
                doubleval: randomDouble,
                intval: randomInt,
                stringval: 'string' + newsetid,
                ts: new Date().toISOString(),
                refval: 'ref://exampledata/' + newsetid,
                swac_fromName: 'exampledata_list'
            };

            requestors['charts_example1'].swac_comp.addSet('exampledata_list', newset);
        });

        let delSourceButton = document.getElementById('charts_example1_clear');
        delSourceButton.addEventListener('click', function (evt) {
            requestors['charts_example1'].swac_comp.removeAllData();
        });

        let clearAddButton = document.getElementById('charts_example1_clearadd');
        clearAddButton.addEventListener('click', function (evt) {
            requestors['charts_example1'].swac_comp.removeAllData();

            let newsetid = 1;
            for(let curSet of requestors['charts_example1'].swac_comp.data['exampledata_list'].getSets()) {
                if(!curSet)
                    continue;
                newsetid = curSet.id;
            }
            newsetid++;

            var min = -5;
            var max = 45;
            var randomDouble = (Math.random() * (max - min)) + min;

            var min = 1000;
            var max = 4000;
            var randomInt = Math.round(Math.random() * (max - min)) + min;

            let newset = {
                id: newsetid,
                name: "Datensatz " + newsetid,
                doubleval: randomDouble,
                intval: randomInt,
                stringval: 'string' + newsetid,
                ts: new Date().toISOString(),
                refval: 'ref://exampledata_list/' + newsetid,
                swac_fromName: 'exampledata_list'
            };

            requestors['charts_example1'].swac_comp.addSet('exampledata_list', newset);
        });

        let addSourceButton = document.getElementById('charts_example1_newsource');
        addSourceButton.addEventListener('click', function (evt) {
            let newsetid = 1;
            for(let curSet of requestors['charts_example1'].swac_comp.data['exampledata_list'].getSets()) {
                if(!curSet)
                    continue;
                newsetid = curSet.id;
            }
            newsetid++;

            var min = -5;
            var max = 45;
            var randomDouble = (Math.random() * (max - min)) + min;

            var min = 1000;
            var max = 4000;
            var randomInt = Math.round(Math.random() * (max - min)) + min;

            let newset = {
//                id: newsetid,
                name: "Datensatz " + newsetid,
                doubleval: randomDouble,
                intval: randomInt,
                stringval: 'string' + newsetid,
                ts: new Date().toISOString(),
                refval: 'ref://exampledata/' + newsetid
            };

            requestors['charts_example1'].swac_comp.addSet('examplenewsource', newset);
        });
    }, "charts_example1");
});

// Example 2
charts_example2_options = {
    showWhenNoData: true,
    xAxisAttrName: 'intval',
    yAxisAttrNames: ['doubleval']
};

// Example 3
charts_example3_options = {
    showWhenNoData: true,
    plugins: new Map()
};
charts_example3_options.plugins.set('Linechart', {
    id: 'Linechart',
    active: true
});

// Example 4
charts_example4_options = {
    viewSetAttributes: 'partyone,partytwo,partythree',
    xAxisAttrName: 'ts',
    yAxisAttrNames: ['intval'],
    datadescription: '#charts_example4_legend'
};
// Options defining WHAT is visualised
charts_example4_legend_options = {
    visuAttribute: 'intval'
};
// Data defining HOW is visualised
charts_example4_legend_data = {
    intval: {
        txt_title: 'Coloring values',
        txt_desc: 'the color depends on the y attributes value',
        txt_uknw: 'Unkown value',
        values: {
            '1234': {
                txt: '1234',
                col: 'red'
            },
            '2345': {
                txt: '2345',
                col: 'green'
            },
            '3456': {
                txt: '3456',
                col: 'blue'
            }
        }
    }
};

// Example 5
charts_example5_options = {
    showWhenNoData: true,
    plugins: new Map(),
    xAxisAttrName: 'doubleval',
    yAxisAttrNames: ['intval']
};
charts_example5_options.plugins.set('Piechart', {
    id: 'Piechart',
    active: true
});

// Example 6
charts_example6_options = {
    showWhenNoData: true,
    xAxisAttrName: 'u',
    yAxisAttrNames: ['i','p'],
    plugins: new Map()
};
charts_example6_options.plugins.set('Linechart', {
    id: 'Linechart',
    active: true
});



// Alternative coloring after the value:
//charts_example6_legend_data.value = {};
//charts_example6_legend_data.value.txt_title = 'Coloring after value';
//charts_example6_legend_data.value.txt_desc = 'The color depends on the value';
//charts_example6_legend_data.value.txt_uknw = 'Unkown value';
//charts_example6_legend_data.value.calcmode = '<';
//charts_example6_legend_data.value.values = {};
//charts_example6_legend_data.value.values['10'] = {};
//charts_example6_legend_data.value.values['10'].txt = 'low value';
//charts_example6_legend_data.value.values['10'].col = 'red';
//charts_example6_legend_data.value.values['20'] = {};
//charts_example6_legend_data.value.values['20'].txt = 'middle value';
//charts_example6_legend_data.value.values['20'].col = 'green';
//charts_example6_legend_data.value.values['30'] = {};
//charts_example6_legend_data.value.values['30'].txt = 'heigh value';
//charts_example6_legend_data.value.values['30'].col = 'blue';
