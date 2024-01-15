// Confiuration for look screen
var lockscreen_options = {
    timeToLook: 6000000
};

// Configuration for collector
var collector_options = {
    timeToReanswer: 3000,
    defaultSaveData: {}
};
collector_options.dataTarget = 'data/create';


document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(function (requestors) {
        let id = window.swac.getParameterFromURL('id', window.location);
        let collector = requestors['collector'];
        collector.swac_comp.options.dataTarget = 'data_' + id;
        collector.swac_comp.options.defaultSaveData.ooid = id;
    }, "collector");
    
    window.swac.reactions.addReaction(function (requestors) {
        let object = requestors['object'];
        let lockscreen = requestors['lockscreen'];
        // Get manual capture option
        for(let curSource in object.swac_comp.data) {
            let sets = object.swac_comp.data[curSource];
            let set = sets[sets.length - 1];
            // There should be only one object
            if(typeof set.manualcapture !== 'undefined') {
                object.swac_comp.options.unlockable = set.manualcapture;
                if(!object.swac_comp.options.unlockable) {
                    lockscreen.swac_comp.lock("Die Eingabemöglichkeit wurde für dieses Objekt deaktiviert.",false);
                }
                break;
            }
        }
    }, "object", "lockscreen");
});