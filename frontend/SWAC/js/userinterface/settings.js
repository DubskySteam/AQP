const user_url = 'http://localhost:8080/SmartUser/smartuser/user';
const settings_url = 'http://localhost:8080/SmartSocial/api/profilesettings/getProfileSettingsById/';
var username = "";
var firstname = "";
var lastname = "";
var email = "";


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
    username = data.records[0].username;
    firstname = data.records[0].firstname;
    lastname = data.records[0].lastname;
    email = data.records[0].email;
    load_data(); 
}).catch(error => {
    console.error('FETCH-ERROR-MSG:', error);
})

function load_data() {
    document.getElementById('firstname').placeholder = firstname;
    document.getElementById('lastname').placeholder = lastname;
    document.getElementById('email').placeholder = email;
}

function send() {
    var data = {};

    if(!document.getElementById('firstname').value == "") {
        data.firstname = document.getElementById('firstname').value
    };
    if(!document.getElementById('lastname').value == "") {
        data.lastname = document.getElementById('lastname').value
    };
    if(!document.getElementById('email').value == "") {
        data.email = document.getElementById('email').value
    };
    if(!document.getElementById('password').value == "") {
        data.password = document.getElementById('password').value
    };
    if(Object.keys(data).length !== 0) {
        data.username = username;
        fetch(user_url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Response Data:', data);
        })
        .catch(error => {
            console.error('FETCH-ERROR-MSG:', error);
        });
    } else {
        console.log('No send-data!');
    }
}

function delete_img() {
    var data = {};
    data.picture = "";
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
    })
    .catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    });
}
