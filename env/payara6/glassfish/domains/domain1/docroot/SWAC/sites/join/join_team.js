const userID = 2;
const urlJoin = `http://localhost:8080/SmartSocial/api/group/join/${userID}`;

function saveTeamName() {
    var teamCode = document.getElementById('team-name').value;
    console.log('Team Code:', teamCode);

    const outputMessageDiv = document.getElementById('outputMessage');
    
    const data = {
        code: teamCode,
    };
    
    const options = {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json', 
        },
    };
    
    const url = `${urlJoin}/${teamCode}`;
    fetch(url, options)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Erfolgreich gepostet:', data);
            outputMessageDiv.innerHTML = `
            <p class="output_txt">User <strong style="color: #4CAF50;">${data.adminUser.username}</strong> successfully joined team <strong style="color: #4CAF50;">${data.name}</strong> !</p>
            `
        })
        .catch(error => {
            console.error('Fehler beim Posten:', error);
        });
}