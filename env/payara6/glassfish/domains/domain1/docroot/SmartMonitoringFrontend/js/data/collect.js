// Get name of the collection
var matches = /collection=([^&#=]*)/.exec(window.location.search);
var collection = matches[1];

let nShowAttrProject = {};
nShowAttrProject[collection] = ['id', 'name'];

// Configuration for collector
var collector_options = {
    showWhenNoData: true,
    directOpenNew: true,
    fetchDefinitions: true,
    mainSource: collection,
    notShownAttrs: nShowAttrProject,
    saveAlongData: {}
};
// Add customisation options if available
if(typeof custom_collector_options !== 'undefined' && custom_collector_options[collection]) {
    for(let curAttr in custom_collector_options[collection]) {
        collector_options[curAttr] = custom_collector_options[collection][curAttr];
    }
}

// Look screen if manual data capture is disabled for this object
document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(function (requestors) {
        let ooElem = requestors['oo_change'];
        let ooid = parseInt(ooElem.swac_comp.getInputs()[0].value);
        let oo = ooElem.swac_comp.getMainSourceData().getSet(ooid);
        if (!oo.manualcapture) {
            let inputElem = document.querySelector('#collector');
            inputElem.innerHTML = window.swac.lang.dict.app.data_collect_deactivated;
        }
    }, "oo_change");
});