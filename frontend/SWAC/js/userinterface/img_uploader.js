const settings_url = 'http://localhost:8080/SmartSocial/api/profilesettings/getProfileSettingsById/';
const user_url = 'http://localhost:8080/SmartUser/smartuser/user';
var user_id;
var img_path;

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
    get_user_data(); 
}).catch(error => {
    console.error('FETCH-ERROR-MSG:', error);
});

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
        document.getElementById('img_input').value = data.picture;
        img_path = data.picture;
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    });
}

function send() {
    var data = {};

    if(!document.getElementById('img_input').value == img_path) {
        data.picture = document.getElementById('img_input').value
    };
    if(Object.keys(data).length !== 0) {
        fetch(settings_url+user_id, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response Data:', data);
            window.location.href = "./../../sites/userinterface/account.html";
        })
        .catch(error => {
            console.error('FETCH-ERROR-MSG:', error);
        });
    } else {
        console.log('No send-data!');
    }
}