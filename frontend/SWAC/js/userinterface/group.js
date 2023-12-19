const user_url = 'http://localhost:8080/SmartUser/smartuser/user';
const group_url = 'http://localhost:8080/SmartSocial/api/group/getGroupByUser/';
const participant_url = 'http://localhost:8080/SmartSocial/api/group/getMembersByGroup_SV/';
const leaderboard_url = 'http://localhost:8080/SmartSocial/api/leaderboard/getPersonalStats/';

var user_id;
var group_id;
var participant_sum = 0;
var group_distance = 0.0;

/**
 * Get the ID of the user.
 *
 */
fetch(user_url, {
    method: 'GET'
}).then(response => {
    if(!response.ok) {
        throw new Error('RESPONSE-ERROR-MSG: $(response.status)');
    }
    return response.json();
}).then(data => {
    user_id = data.records[0].id;
    get_group_id();
}).catch(error => {
    console.error('FETCH-ERROR-MSG:', error);
})

/**
 * Get the id, image and name of the group
 */
function get_group_id() {
    fetch(group_url+user_id, {
        method: 'GET'
    }).then(response => {
        if(!response.ok) {
            throw new Error('RESPONSE-ERROR-MSG: $(response.status)');
        }
        return response.json();
    }).then(data => {
        document.getElementById('group_image').src = data.group.image;
        document.getElementById('group_name').innerHTML = data.group.name;
        group_id = data.group.id;
        get_participants();
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    })
}


/**
 * Increase the group distance by the participant distance
 * 
 * @param id participant-ID
 */
function getGroupDistance(id) {
    var distance = 0.0;
    fetch(leaderboard_url+id, {
        method: 'GET'
    }).then(response => {
        if(!response.ok) {
            throw new Error('RESPONSE-ERROR-MSG: $(response.status)');
        }
        return response.json();
    }).then(data => {
        group_distance += data.kilometers;
        document.getElementById('group_distance').innerHTML = group_distance.toFixed(2);
        distance = data.kilometers;
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    })
    return distance;
}

/**
 * Get the ID of the user.
 */
function get_participants() {
    fetch(participant_url+group_id, {
        method: 'GET'
    }).then(response => {
        if(!response.ok) {
            throw new Error('RESPONSE-ERROR-MSG: $(response.status)');
        }
        return response.json();
    }).then(data => {
        var participant_table = document.getElementById('all_participants');
        for(const participant of data) {
            let participant_distance = getGroupDistance(participant.id);
            participant_sum += 1;
            let row = participant_table.insertRow();
            let name = row.insertCell(0);
            name.innerHTML = "<h1>" + participant.username + "</h1>";
            let distance = row.insertCell(1);
            distance.innerHTML = "<h1>" + participant_distance + "</h1>";
        };
        document.getElementById('participant_sum').innerHTML = participant_sum;
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    })
}
