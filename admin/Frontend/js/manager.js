async function checkApplicationStatus(appUrl) {
    try {
        const response = await fetch(appUrl, { method: 'HEAD' });
        return response.ok ? "Online" : "Offline";
    } catch (error) {
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

    checkApplicationStatus(appUrl).then(status => {
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
    disableButton.title = 'Disable Application'; // Hover text
    disableButton.onclick = () => performAction(appName, 'disable');

    const relaunchButton = document.createElement('button');
    relaunchButton.classList.add('relaunch-button');
    relaunchButton.title = 'Relaunch Application'; // Hover text
    relaunchButton.onclick = () => performRelaunch(appName);

    card.appendChild(enableButton);
    card.appendChild(disableButton);
    card.appendChild(relaunchButton);

    return card;
}

function performAction(appName, action) {
    // TODO: Implement action logic
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
