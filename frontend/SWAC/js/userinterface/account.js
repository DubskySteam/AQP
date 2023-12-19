const settings_url = 'http://localhost:8080/SmartSocial/api/profilesettings/getProfileSettingsById/';
const group_url = 'http://localhost:8080/SmartSocial/api/group/getGroupByUser/';
const user_url = 'http://localhost:8080/SmartUser/smartuser/user';
const leaderboard_url = 'http://localhost:8080/SmartSocial/api/leaderboard/getPersonalStats/';
const achievement_url = 'http://localhost:8080/SmartSocial/api/achievements/getByUserId/';
var user_id;

/**
 * First get the user-id and than the data.
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
    document.getElementById('username').innerHTML = data.records[0].username;
    get_user_data(); 
}).catch(error => {
    console.error('FETCH-ERROR-MSG:', error);
})

/**
 * Get the user-data by user-id
 */
function get_user_data() {
    /**
     * Get the driven distance
     */
    fetch(settings_url+user_id, {
        method: 'GET'
    }).then(response => {
        if(!response.ok) {
            throw new Error('RESPONSE-ERROR-MSG: $(response.status)');
        }
        return response.json();
    }).then(data => {
        document.getElementById('profil_img').src = data.picture;
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    })
    
    /**
     * Get the name of the group
     */
    fetch(group_url+user_id, {
        method: 'GET'
    }).then(response => {
        if(!response.ok) {
            throw new Error('RESPONSE-ERROR-MSG: $(response.status)');
        }
        return response.json();
    }).then(data => {
        document.getElementById('group_name').innerHTML = '<a href="./group.html">'+ data.group.name + '</a>';
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    })
    
    fetch(leaderboard_url+user_id, {
        method: 'GET'
    }).then(response => {
        if(!response.ok) {
            throw new Error('RESPONSE-ERROR-MSG: $(response.status)');
        }
        return response.json();
    }).then(data => {
        document.getElementById('distance').innerHTML = data.kilometers;
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    })
    
    /**
     * Get the user achievements 
     */
    fetch(achievement_url+user_id, {
        method: 'GET'
    }).then(response => {
        if(!response.ok) {
            throw new Error('RESPONSE-ERROR-MSG: $(response.status)');
        }
        return response.json();
    }).then(data => {
        let achievement_list = document.getElementById("achievement_list");
        for(const achievement of data) {
            let new_list_element = document.createElement("li"); 
            let new_title = document.createElement("h2");
            new_title.appendChild(document.createTextNode(achievement.achievement.name));
            new_list_element.appendChild(new_title);
            achievement_list.appendChild(new_list_element);
        }
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    })
}