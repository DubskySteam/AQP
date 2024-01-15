/**
 * Configurations used for SWAC components used on datavisualisation.html
 */


/**
 * Only for datavisualisation.html needed methods
 */
var datavisualisation = {};

datavisualisation.observedObject_id;
datavisualisation.observedObjectType_id;

var requestlimit = 10000;

// Set options for data selection
var selectobject_options = {};
selectobject_options.onSelect = function (evt) {
    datavisualisation.whenSomeDataSourceSelected(evt);
};
selectobject_options.onUnselect = function (evt) {
    datavisualisation.whenSomeDataSourceUnselected(evt);
};
selectobject_options.subSource = {
    fromName: 'data/getSets',
    fromWheres: {
        ooid: 'swac_setid',
        countOnly: true
    }
};
selectobject_options.expand_function = function (evt) {   
    let input_elem = evt.target;
    if(input_elem.checked === true)
        datavisualisation.whenSomeExpandDataSourceSelected(evt);
    else
        datavisualisation.whenSomeExpandDataSourceUnselected(evt);
};

var loadingbar_options = {};
loadingbar_options.max = 100;


var chart_options = {};
chart_options.showWhenNoData = true;

/**
 * reads the ooid out of the params, to select an object
 */
datavisualisation.readUrlParamSelectObject = function (requestors) {
    var ooid = SWAC.getParameterFromURL("ooid", window.location);
    if (ooid !== null) {
        let selObj = document.getElementById("selectobject");
        selObj.swac_comp.simulateClick("select_" + ooid);
    }
};
SWAC_reactions.addReaction(datavisualisation.readUrlParamSelectObject, "selectobject", "chart");

datavisualisation.bindFilterAndChart = function (requestors) {
   requestors["filterobject"].swac_comp.options.filterablecomp = requestors["chart"];
};
SWAC_reactions.addReaction(datavisualisation.bindFilterAndChart, "filterobject", "chart");

/**
 * Gets the event when an element from the selector is selected and than
 * fetches the data indicated by this element.
 * Cases:
 * - observedobject selected = gets whole data from observedobject (all collums)
 * - TODO: measurement selected = gets the data only from this measurement
 * 
 * in every case:
 * - TODO: uses the input from starttime / endtime
 * 
 * @param {Event} evt Event that triggers the load data
 * @returns {undefined}
 */
datavisualisation.whenSomeDataSourceSelected = function (evt) {  
    // LOADING BAR  
    let loadingbar = document.getElementById("loadingbar");
    
    let filter = document.getElementById("filterobject");
    loadingbar.swac_comp.reset();   
    
    let selected_object = evt.target;
    
    // Get the ObservedObject
    let refToObj = selected_object.value;
    // Get id from observedobject
    let lastSlashPos = refToObj.lastIndexOf("/");
    let observedobject_id = parseInt(refToObj.substring(lastSlashPos + 1));
    this.observedObject_id = observedobject_id;
    
    Promise.all([datavisualisation.getObservedObject(observedobject_id)]).then(values => {
        loadingbar.swac_comp.addValue(20);
        Promise.all([filter.swac_comp.setPossibleValues(observedobject_id,this.observedObjectType_id,null,null)]).then(values => {
            loadingbar.swac_comp.addValue(10);
            let selected_parent = selected_object.parentNode; 
            if (selected_parent.querySelector("a#expand_"+observedobject_id).innerHTML === "-"){
                let childArea = selected_parent.getElementsByClassName("swac_forChilds")[0];
                for (let i = 0; i < childArea.children.length; i++){;
                    let idString = childArea.children[i].getAttribute("swac_id");
                    if (idString.includes("chunk")){
                        childArea.children[i].getElementsByClassName("expand_input")[0].checked = true;
                    }
                }
            }
            // create a requestor for the Data request
            let dataRequest = {};
            dataRequest.id = 'data/getSets?ooid=' + observedobject_id;
            dataRequest.fromName = 'data/getSets';
            dataRequest.fromWheres = {
                ooid: observedobject_id,
                orderby: "ts",
                limit: requestlimit,
                order: "DESC"
            };
            dataRequest.requestChunkSize = requestlimit;        // aus Kommentieren wenn nur eine Bestimmte Anzahl(requestlimit) an Daten geladen werden sollen 


            // Request data
            let dataPromise = SWAC_model.load(dataRequest);

            dataPromise.then(function (response) {
                console.log(response.data);
                // Get requestor element for chart
                loadingbar.swac_comp.addValue(20);
                let chartElem = document.querySelector('#chart');
                if (response.data.length > 0) {
                    // Add datasets to chart
                    for (let dataset of response.data) {
                        chartElem.swac_comp.addSet(refToObj, dataset);
                    }
                }
                let tempJSONArray = {};
                tempJSONArray[refToObj] = response.data;
                if(Object.entries(filter.swac_comp.data).length === 0){
                    filter.swac_comp.data = tempJSONArray;  
                }else{
                    if(filter.swac_comp.data[refToObj] === undefined){
                        filter.swac_comp.data[refToObj] = response.data; 
                    }else{
                        for(let data of response.data){
                            filter.swac_comp.data[refToObj].push(data);
                        }
                    }
                }
                
                filter.swac_comp.initFilterEntries();  
                loadingbar.swac_comp.addValue(20);
                filter.swac_comp.applyCurrentSettings(); 
                loadingbar.swac_comp.addValue(30); 
            }).catch(function (error) {
                console.error('SmartMonitoring (datavisualisation): Daten konnten nicht geladen werden: ' + error);
                UIkit.modal.alert('Die Daten konnten nicht geladen werden.');
            });
        });
    });
};

/**
 * Gets the event when an extended elemetn from the selector is selected and than
 * fetches the data indicated by this element.
 * 
 * @param {Event} evt Event that triggers the load data
 */
datavisualisation.whenSomeExpandDataSourceSelected = function (evt) {       
    // Get the ObservedObject
    let input_elem = evt.target;
    let refToObj = input_elem.value;
    // Get id from observedobject
    let lastSlashPos = refToObj.lastIndexOf("/");
    let observedobject_id = parseInt(refToObj.substring(lastSlashPos + 1));
    this.observedObject_id = observedobject_id;
    
    let parentChildArea = input_elem.parentNode.parentNode;
    let counter = 0;
    let expand_input_list = parentChildArea.querySelectorAll('input[id*="chunk"]');
    for(let i = 0;i < expand_input_list.length; i++){
        if(expand_input_list[i].checked === true){
            counter++;
        }
    }
    if(counter === expand_input_list.length){
        parentChildArea.parentNode.querySelector("#select_"+observedobject_id).checked = true;
    }
        
    // LOADING BAR  
    let loadingbar = document.getElementById("loadingbar");
    loadingbar.swac_comp.reset();
    
    let startset = parseInt(input_elem.getAttribute("startset"));
    let limit = parseInt(input_elem.getAttribute("datasetlength"));
    
    let filter = document.getElementById("filterobject");
    Promise.all([datavisualisation.getObservedObject(observedobject_id)]).then(values => {
        loadingbar.swac_comp.addValue(20);
        Promise.all([filter.swac_comp.setPossibleValues(observedobject_id,this.observedObjectType_id,limit,startset)]).then(values => {           
            loadingbar.swac_comp.addValue(20);
            // create a requestor for the Data request with two extra options startset and limit
            let requestor = {};
            requestor.fromName = 'data/getSets';
            requestor.fromWheres = {
                ooid: observedobject_id,
                orderby: "ts",
                startset: startset,
                limit: limit
            };

            // Request data
            let dataPromise = SWAC_model.load(requestor);
            dataPromise.then(function (response) {
                loadingbar.swac_comp.addValue(20);
                // Get requestor element for chart
                let chartElem = document.querySelector('#chart');
                if (response.data.length > 0) {
                    // Add datasets to chart
                    for (let dataset of response.data) {
                        chartElem.swac_comp.addSet(refToObj, dataset);
                    }
                }      
                let tempJSONArray = {};
                tempJSONArray[refToObj] = response.data;
                if(Object.entries(filter.swac_comp.data).length === 0){
                    filter.swac_comp.data = tempJSONArray;  
                }else{
                    if(filter.swac_comp.data[refToObj] === undefined){
                        filter.swac_comp.data[refToObj] = response.data; 
                    }else{
                        for(let data of response.data){
                            filter.swac_comp.data[refToObj].push(data);
                        }
                    }
                }
                filter.swac_comp.initFilterEntries();  
                loadingbar.swac_comp.addValue(20);
                filter.swac_comp.applyCurrentSettings(); 
                loadingbar.swac_comp.addValue(20);
            }).catch(function (error) {
                console.error('SmartMonitoring (datavisualisation): Daten konnten nicht geladen werden: ' + error);
                UIkit.modal.alert('Die Daten konnten nicht geladen werden.');
            });
            
       });
    });
    
};

/**
 * Executed when an element gets unselected.
 * - Removes the data associated with this element from chart and table
 * - TODO: Stores the data into local storage to get it quiecker next time
 * 
 * @param {type} evt
 */
datavisualisation.whenSomeDataSourceUnselected = function (evt) {
    // Get selected object
    let selected_object = evt.target;
    let refToObj = selected_object.value;
    let lastSlashPos = refToObj.lastIndexOf("/");
    let observedobject_id = parseInt(refToObj.substring(lastSlashPos + 1));
    //TODO performance+ strore removed data in localStorage
    
    let selected_parent = selected_object.parentNode; 
    if (selected_parent.querySelector("a#expand_"+observedobject_id).innerHTML === "-"){
        let childArea = selected_parent.getElementsByClassName("swac_forChilds")[0];
        for (let i = 0; i < childArea.children.length; i++){;
            let idString = childArea.children[i].getAttribute("swac_id");
            if (idString.includes("chunk")){
                childArea.children[i].getElementsByClassName("expand_input")[0].checked = false;
            }
        }
    }
    
    let filter = document.getElementById("filterobject");
    delete filter.swac_comp.data[refToObj];
    SWAC_chart.removeData(refToObj);
    filter.swac_comp.clearFilter();
    if(Object.entries(filter.swac_comp.data).length !== 0){
        filter.swac_comp.applyCurrentSettings();
    }
};

/**
 * Gets the event when an extended elemetn from the selector is selected and than
 * fetches the data indicated by this element.
 * 
 * @param {Event} evt Event that triggers the load data
 */
datavisualisation.whenSomeExpandDataSourceUnselected = function (evt) { 
    let selected_object = evt.target;
    let refToObj = selected_object.value;
    let lastSlashPos = refToObj.lastIndexOf("/");
    let observedobject_id = parseInt(refToObj.substring(lastSlashPos + 1));
     
    let parent_input = selected_object.parentNode.parentNode.parentNode.querySelector("input#select_"+observedobject_id);
    if (parent_input.checked === true){
        parent_input.checked = false;       
    }
    
    let startset = parseInt(selected_object.getAttribute("startset"));
    let datasetlength = parseInt(selected_object.getAttribute("datasetlength")); 
    let removedList = SWAC_chart.removeSet(refToObj, startset+1, datasetlength); 

    let filter = document.getElementById("filterobject");
    filter.swac_comp.data[refToObj].splice(startset,datasetlength);
    if(Object.entries(filter.swac_comp.data).length !== 0){
        filter.swac_comp.applyCurrentSettings();
    }
};

datavisualisation.getObservedObject = function(oo_id) {   
    var filter = document.getElementById("filterobject");
    return new Promise((resolve, reject) => {
        fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'observedobject/get?id=' + oo_id)
            .then((response) => {
                return response.json();
            }).then((observedObject) => {
                let oo_split = observedObject.type.split("/");    
                let typeId = oo_split[oo_split.length -1];
                this.observedObjectType_id = typeId;
                filter.swac_comp.syncObservedObjectSelection(typeId);  
                resolve();
        }).catch((error) => {
            console.log(error);
            reject();
        });
    }); 
};
