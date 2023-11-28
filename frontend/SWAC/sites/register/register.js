/*
var create_user_options = {
    showWhenNoData: true,
    allowAdd: true,
    directOpenNew: true,
    mainSource: 'http://localhost:8080/SmartUser/smartuser/user',
    afterSave: function(fromName, set) {
        UIkit.modal.alert(window.swac.lang.dict.RoNeKo.savedredirect);
        window.location = 'regconfirm.html';
    }
}; 
*/

const fluppy = () => {
    const url = 'http://localhost:8080/SmartUser/smartuser/user';

    let username = document.getElementById('username').value;
    let password = document.getElementById('password').value;
    let privacy_accepted = document.getElementById('privacy_accepted').checked;
    let terms_accepted = document.getElementById('terms_accepted').checked;

    const data = {
    username: username,
    password: password,
    privacy_accepted: privacy_accepted,
    terms_accepted: terms_accepted
    };


    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

