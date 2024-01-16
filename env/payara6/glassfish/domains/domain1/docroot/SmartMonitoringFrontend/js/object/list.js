var objectlist_options = {
    showWhenNoData: true,
    attributeRenames: new Map([['parent_id', 'parent']]),
    attributeDefaults: new Map([['manualcapture', 'false']]),
    lazyLoading: 5,
    lazyLoadMode: 'end'
};

const data_visualisation_requestor = {
    fromName: 'tbl_systemconfiguration', // Name of the datatable
    fromWheres: {
        filter: 'ckey,eq,func_datavisualisation&filter=active,eq,true'
    }
};

const datamap_requestor = {
    fromName: 'tbl_systemconfiguration', // Name of the datatable
    fromWheres: {
        filter: 'ckey,eq,func_datamap&filter=active,eq,true'
    }
};

document.addEventListener('swac_ready', function () {
    // check if data visualisation is active
    window.swac.Model.load(data_visualisation_requestor).then(function (res) {
        if (res.length === 0) {
            //Deactivate labeling column
            let labelElems = document.querySelectorAll('.data_visualisation');
            for (let curElem of labelElems) {
                curElem.remove();
            }
        }
    });

    // check if data map is active
    window.swac.Model.load(datamap_requestor).then(function (res) {
        if (res.length === 0) {
            //Deactivate labeling column
            let labelElems = document.querySelectorAll('.datamap');
            for (let curElem of labelElems) {
                curElem.remove();
            }
        }
    });
});