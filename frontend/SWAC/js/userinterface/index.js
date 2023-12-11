// Get the model


document.addEventListener('swac_ready', function () {
    let Model = window.swac.Model;
// Request data
    let dataPromise = Model.load({
    fromName: 'groups',         // Name of the datatable
    idAttr: 'group',                // Name of sets attribute that contains the id
    attributeDefaults: new Map(),   // Map of attributname / value for default values when the attribute is missing
    attributeRenames: new Map(),    // Map of set attributename / wished attributename for renameing attributes
    reloadInterval: 10000,           // Time in milliseconds after that the data should be refetched from source
});
// Wait for data to be loaded
dataPromise.then(function(data) {
    // Direct access dataset with id 1
    console.log("Data: " + data);
    // Iterate over available datasets
    for(let curSet of data) {
        console.log("curSet: " + curSet);
    }
}).catch(function(err) {
    // Handle load error
});
});