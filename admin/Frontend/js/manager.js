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
    enableButton.title = 'Enable Application'; // Hover text
    enableButton.onclick = () => performAction(appName, 'enable');

    const disableButton = document.createElement('button');
    disableButton.classList.add('disable-button');
    disableButton.title = 'Undeploy Application';
    disableButton.onclick = () => performAction(appName, 'undeploy');

    const relaunchButton = document.createElement('button');
    relaunchButton.classList.add('relaunch-button');
    relaunchButton.title = 'Relaunch Application'; // Hover text
    relaunchButton.onclick = () => performRelaunch(appName);

    card.appendChild(enableButton);
    card.appendChild(disableButton);
    card.appendChild(relaunchButton);

    return card;
}

async function performAction(appName, action) {
    const url = `http://localhost:8080/Admin/api/application/${action}/${appName}`;
    const headers = {
        'X-Requested-By': 'GlassFish REST HTML interface'
    };

    try {
        const response = await fetch(url, {
            method: 'POST', // Assuming the action is a POST request
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log(data);
    } catch (error) {
        console.error('Error performing action:', error);
    }
}

function performRelaunch(appName) {
    // TODO: Implement relaunch logic
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
