var user_id = 1;
var group_id = 1;
var participant_sum = 0;
var group_distance;

document.addEventListener('swac_ready', function () {
    let Model = window.swac.Model;
    let memeber_path ='getMembersByGroup_SV/' + group_id;
// Request data
    let dataPromise = Model.load({
    fromName: memeber_path,         // Name of the datatable               
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
            participant_sum++;
            let participant = String(curSet);
            let participant_id = participant.split('id = ')[1].split(',')[0]; 
            getParticipantKilometer(parseInt(participant_id));
            document.getElementById('group_distance').innerHTML = group_distance;
            document.getElementById('participant_sum').innerHTML = participant_sum;
        }
    }
}).catch(function(err) {
    console.log("ERROR-Message-EventListener-ParticipantSum: " + err);
    });
});

function getParticipantKilometer(member_id) {
    let Model2 = window.swac.Model;
    let dataPromise = Model2.load({
        fromName: 'getPersonalStats/' + member_id,         // Name of the datatable               
        attributeDefaults: new Map(),   // Map of attributname / value for default values when the attribute is missing
        attributeRenames: new Map(),    // Map of set attributename / wished attributename for renameing attributes
        reloadInterval: 10000,           // Time in milliseconds after that the data should be refetched from source
    });
    dataPromise.then(function(data) {
        for(let curSet of data) {
            if(curSet != undefined) {
                let participant = String(curSet);
                group_distance += parseFloat(participant.split('kilometers = ')[1].split(',')[0]);
        }
    }});
}