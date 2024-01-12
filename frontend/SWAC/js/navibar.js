function change_link() {
    fetch('http://localhost:8080/SmartUser/smartuser/user', {
        method: 'GET'
    }).then(response => {
        // Is the response not ok is the user not logged in
        if(!response.ok) {
            console.log("not logged in!");
            document.getElementById('account_login_link').href = '/SWAC/sites/userinterface/login.html';
            
        } else {
            console.log("logged in!");
            document.getElementById('account_login_link').href = '/SWAC/sites/userinterface/account.html';
        }
    }).catch(error => {
        console.error('FETCH-ERROR-MSG:', error);
    })
}

window.onload = change_link();