var number_of_groups = 0;
var number_of_participants = 0;
var sum_of_all_kilometer = 0.0;

document.addEventListener('swac_ready', function () {
    let Model = window.swac.Model;
// Request data
    let dataPromise = Model.load({
    fromName: 'getAllGroups',         // Name of the datatable               
    attributeDefaults: new Map(),   // Map of attributname / value for default values when the attribute is missing
    attributeRenames: new Map(),    // Map of set attributename / wished attributename for renameing attributes
    reloadInterval: 10000,           // Time in milliseconds after that the data should be refetched from source
});
// Wait for data to be loaded
dataPromise.then(function(data) {
    // Direct access dataset with id 1
    // Iterate over available datasets
    for(let curSet of data) {
        if(curSet != undefined) {
            number_of_groups++;
            document.getElementById('number_of_groups').innerHTML = "Aktive Gruppen:           " + number_of_groups;
        }
    }
}).catch(function(err) {
    console.log("ERROR-Message-EventListener-GetAllGroups: " + err);
    });
});

document.addEventListener('swac_ready', function () {
    let Model = window.swac.Model;
// Request data
    let dataPromise = Model.load({
    fromName: 'getList/1000000',         // Name of the datatable               
    attributeDefaults: new Map(),   // Map of attributname / value for default values when the attribute is missing
    attributeRenames: new Map(),    // Map of set attributename / wished attributename for renameing attributes
    reloadInterval: 10000,           // Time in milliseconds after that the data should be refetched from source
});
// Wait for data to be loaded
dataPromise.then(function(data) {
    // Direct access dataset with id 1
    // Iterate over available datasets
    for(let curSet of data) {
        if(curSet != undefined) {
            number_of_participants++;
            let participant = String(curSet);
            let kilometer = parseFloat(participant.split('kilometers = ')[1].split(','));
            sum_of_all_kilometer += kilometer;
            document.getElementById('sum_of_all_kilometer').innerHTML = "Gemessene Kilometer:      " + sum_of_all_kilometer;
            document.getElementById('number_of_participants').innerHTML = "Aktive Teilnehmer:        " + number_of_participants;
        }
    }
}).catch(function(err) {
    console.log("ERROR-Message-EventListener-Leaderboard: " + err);
    });
});