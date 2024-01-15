var explaincomponent_options = {
    componentName: 'Datadescription'
};

document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function (requestors) {
        requestors['datadescription_example1'].swac_comp.formatDataElement(requestors['datadescription_example2']);

    }, 'datadescription_example1', 'datadescription_example2');

    window.swac.reactions.addReaction(function (requestors) {
        requestors['datadescription_example3'].swac_comp.formatDataElement(requestors['datadescription_example3_present']);

    }, 'datadescription_example3', 'datadescription_example3_present');
    
    window.swac.reactions.addReaction(function (requestors) {
        requestors['datadescription_example6'].swac_comp.formatDataElement(requestors['datadescription_example6_present']);

    }, 'datadescription_example6', 'datadescription_example6_present');
});

// In external file: var datadescription_data3;

var datadescription_data6 = {
    doubleval: {
        txt_title: 'DoubleWert',
        txt_desc: 'Ein Wert mit double Genauigkeit',
        txt_uknw: 'Es wurde kein Wert angegeben',
        col: 'blue',
        calcmode: 'gradient',
        values: {
            '10': {
                txt: 'ein niedriger Wert',
                col: '#008000'
            },
            '100': {
                txt: 'ein mittelniedriger Wert',
                col: '#0000FF'
            },
            '1000': {
                txt: 'ein mittelhoher Wert',
                col: '#FFFF00'
            },
            '10000': {
                txt: 'ein hoher Wert',
                col: '#FF0000'
            }
        }
    }
};