var user_id = 5;

document.addEventListener('swac_ready', function () {
    let Model = window.swac.Model;
// Request data
    let dataPromise = Model.load({
    fromName: 'getPersonalStats/' + user_id,         // Name of the datatable               
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
            let user = String(curSet);
            document.getElementById('distance').innerHTML = user.split('kilometers = ')[1].split(',')[0];
        }
    }
}).catch(function(err) {
    console.log("ERROR-Message-EventListener-GetUserKilometer: " + err);
    });
});