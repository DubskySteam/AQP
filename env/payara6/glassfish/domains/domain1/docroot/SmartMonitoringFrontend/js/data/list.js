window['datalist_options'] = {
    datadescription: '#datamap_datadescription',
    showWhenNoData: true,
    plugins: new Map(),
    lazyLoading: 50,
    lazyLoadMode: 'end'
//  attributeOrder: [
//    "id",
//    "pm25",
//    "pm10",
//    "temperature",
//    "measuredate",
//    "oo_id",
//    "latitude",
//    "longitude",
//    "valid_from",
//    "valid_until"
//  ]
};
window['datalist_options'].plugins.set("TableSort", {
    id: "TableSort",
    active: true
});
window['datalist_options'].plugins.set("TableFilter", {
    id: "TableFilter",
    active: true
});

document.addEventListener('swac_ready', function () {
    // Set collection as sendAlong with new labels
    labels_options.sendAlongData = {collection: window.swac.getParameterFromURL('collection')};
    // Set formating datadescription
    window.swac.reactions.addReaction(function (requestors) {
        requestors['datalist_datadescription'].swac_comp.formatDataElement(requestors['datalist']);
    }, 'datalist', 'datalist_datadescription');
    // Check if labeling is active
    window.swac.Model.load(labels_options.activeOn).then(function (res) {
        if (res.length === 0) {
            //Deactivate labeling column
            let labelElems = document.querySelectorAll('.func_labels');
            for (let curElem of labelElems) {
                curElem.remove();
            }
        }
    });

    // Check if datamap is active
    window.swac.Model.load({
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap&filter=active,eq,true'
        }
    }).then(function (res) {
        if (res.length === 0) {
            //Deactivate labeling column
            let labelElems = document.querySelectorAll('[href^="map.html"]');
            for (let curElem of labelElems) {
                curElem.remove();
            }
        }
    });
});

// Options for labels
var labels_options = {
    showWhenNoData: true,
    labeledidAttr: 'set_id',
    showNoDataInfo: false,
    labelSource: {
        fromName: 'label_labels',
        fromWheres: {
            filter: 'isavailfordatasets,eq,true'
        }
    },
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datatagging&filter=active,eq,true'
        }
    }
};