async function checkApplicationStatus(appName) {
    try {
        const url = `http://localhost:8080/Admin/api/application/getStatus/${appName}`;
        const response = await fetch(url);
        const data = await response.json(); // Parse the JSON response
        return data.status === "enabled" ? "Online" : "Offline";
    } catch (error) {
        console.error('Error checking application status:', error);
        return "Offline";
    }
}

function createApplicationCard(appName, appUrl) {
    const card = document.createElement('div');
    card.classList.add('card');

    const header = document.createElement('div');
    header.classList.add('card-header');
    header.textContent = appName;

    const body = document.createElement('div');
    body.classList.add('card-body');

    checkApplicationStatus(appName).then(status => {
        body.textContent = status;
        body.classList.add(status === "Offline" ? 'offline' : 'online');
    });

    card.appendChild(header);
    card.appendChild(body);

    const enableButton = document.createElement('button');
    enableButton.classList.add('enable-button');
    enableButton.title = 'Enable Application';
    enableButton.onclick = () => performAction(appName, 'enable');

    const disableButton = document.createElement('button');
    disableButton.classList.add('disable-button');
    disableButton.title = 'Disable Application';
    disableButton.onclick = () => performAction(appName, 'disable');

    const relaunchButton = document.createElement('button');
    relaunchButton.classList.add('relaunch-button');
    relaunchButton.title = 'Relaunch Application';
    relaunchButton.onclick = () => performRelaunch(appName);

    card.appendChild(enableButton);
    card.appendChild(disableButton);
    card.appendChild(relaunchButton);

    return card;
}

async function performAction(appName, action) {
    /*
    * This function is still bugged, because the server returns a 500 error even though the action is performed correctly.
    * This is because of an API bug, which will be fixed in the next version.
    */
    const url = `http://localhost:8080/Admin/api/application/toggle/${appName}/${action}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data.message);
    } catch (error) {
        console.error('Error toggling application:', error);
        //alert(`Error toggling application: ${error.message}`);
    }
}

function performRelaunch(appName) {
    alert(`Relaunching is not yet implemented for ${appName}`);
}

async function displayApplicationStatuses() {
    const container = document.getElementById('application-container');
    container.innerHTML = '';

    const response = await fetch('http://localhost:8080/Admin/api/application/getApplications');
    const applications = await response.json();

    Object.keys(applications).forEach(appName => {
        const appUrl = applications[appName];
        const card = createApplicationCard(appName, appUrl);
        container.appendChild(card);
    });
}

window.onload = displayApplicationStatuses;
