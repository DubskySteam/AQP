let currentEndpoints = [];

document.addEventListener('DOMContentLoaded', function () {
    const categorySelector = document.getElementById('category-selector');
    const endpointSelector = document.getElementById('endpoint-selector');
    const testButton = document.getElementById('test-button');

    //populateCategorySelector();

    categorySelector.addEventListener('change', () => {
        fetchCategoryEndpoints(categorySelector.value);
    });
    testButton.addEventListener('click', testEndpoint);

    endpointSelector.addEventListener('change', () => {
        const selectedEndpoint = currentEndpoints[endpointSelector.value];
        toggleJsonInput(selectedEndpoint);
    });

    fetchCategoryEndpoints(categorySelector.value);
});

function populateCategorySelector() {
    const categorySelector = document.getElementById('category-selector');
    const categories = {
        "Group": "group.json",
        "Leaderboard": "leaderboard.json",
        "Achievements": "achievements.json",
        "Quests": "quests.json",
        "Profile Settings": "profilesettings.json",
        "Utility": "utility.json"
    };

    for (let categoryName in categories) {
        let option = document.createElement('option');
        option.value = categories[categoryName];
        option.textContent = categoryName;
        categorySelector.appendChild(option);
    }

    if (Object.keys(categories).length > 0) {
        fetchCategoryEndpoints(categories[Object.keys(categories)[0]]);
    }
}

function fetchCategoryEndpoints(categoryFile) {
    fetch('data/' + categoryFile)
        .then(response => response.json())
        .then(data => {
            currentEndpoints = data;
            populateEndpoints(data);
            toggleJsonInput(data);
        })
        .catch(error => console.error('Error loading endpoints:', error));
}

function populateEndpoints(endpoints) {
    const endpointSelector = document.getElementById('endpoint-selector');
    endpointSelector.innerHTML = '';
    endpoints.forEach((endpoint, index) => {
        let option = document.createElement('option');
        option.value = index;
        option.textContent = endpoint.name;
        endpointSelector.appendChild(option);
    });
}

function toggleJsonInput(selectedEndpoint) {
    document.getElementById('json-input-container').style.display =
        selectedEndpoint && selectedEndpoint.method === 'POST' ? 'block' : 'none';
}

function testEndpoint() {
    const selectedEndpoint = currentEndpoints[document.getElementById('endpoint-selector').value];
    const resultButton = document.getElementById('response-result');
    const jsonInput = document.getElementById('json-input').value;

    const requestOptions = {
        method: selectedEndpoint.method || 'GET',
        headers: selectedEndpoint.headers
    };

    if (selectedEndpoint.method === 'POST' || selectedEndpoint.method === 'PUT' || selectedEndpoint.method === 'DELETE') {
        requestOptions.body = jsonInput;
    }

    fetch(selectedEndpoint.url, requestOptions)
        .then(response => {
            updateResultButton(response.status, resultButton);
            if (response.headers.get("content-type").includes("application/json")) {
                return response.json();
            } else {
                return response.text();
            }
        })
        .then(data => {
            displayResponse(data);
        })
        .catch(error => {
            displayResponse({ error: error.message });
            updateResultButton('Error', resultButton, true);
        });
}

function displayResponse(data) {
    const container = document.getElementById('response-container');
    if (typeof data === 'object') {
        container.textContent = JSON.stringify(data, null, 2);
    } else {
        container.textContent = data;
    }
}

function updateResultButton(status, button, isError = false) {
    button.textContent = "HTTP Code: " + status;
    button.style.backgroundColor = isError || (status >= 400 && status <= 599) ? 'red' : 'lightgreen';
}
