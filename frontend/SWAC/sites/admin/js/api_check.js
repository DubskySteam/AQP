const endpoints = [
    { url: "http://localhost:8080/SmartSocial/api/group/", category: "Group" },
    { url: "http://localhost:8080/SmartSocial/api/leaderboard/", category: "Leaderboard" },
    { url: "http://localhost:8080/SmartSocial/api/profilesettings/", category: "Profile settings" },
    { url: "http://localhost:8080/SmartSocial/api/quest", category: "Quests" },
    { url: "http://localhost:8080/SmartSocial/api/achievements", category: "Achievements" },
    { url: "http://localhost:8080/SmartSocial/api/utility", category: "Utility" },
];

function checkEndpointStatus(endpoint) {
    return fetch(endpoint.url, { method: 'HEAD' })
        .then(response => {
            if (response.ok) {
                return "Online";
            } else {
                return "Offline";
            }
        })
        .catch(() => "Offline");
}

function createEndpointCard(endpoint) {
    const card = document.createElement('div');
    card.classList.add('card');

    const header = document.createElement('div');
    header.classList.add('card-header');
    header.textContent = endpoint.category;

    const body = document.createElement('div');
    body.classList.add('card-body');
    
    checkEndpointStatus(endpoint).then(status => {
        body.textContent = status;
        if (status === "Offline") {
            body.classList.add('offline');
        }
    });

    card.appendChild(header);
    card.appendChild(body);

    return card;
}


function displayEndpointStatuses() {
    const container = document.getElementById('endpoint-status-container');
    container.innerHTML = '';

    endpoints.forEach(endpoint => {
        const card = createEndpointCard(endpoint);
        container.appendChild(card);
    });
}


window.onload = displayEndpointStatuses;
