document.addEventListener('DOMContentLoaded', function() {
    fetch('data/endpoints.json')
        .then(response => response.json())
        .then(data => {
            populateEndpoints(data);
            toggleJsonInput(data);
        })
        .catch(error => console.error('Error loading endpoints:', error));

    const testButton = document.getElementById('test-button');
    testButton.addEventListener('click', testEndpoint);

    const selector = document.getElementById('endpoint-selector');
    selector.addEventListener('change', () => {
        fetch('data/endpoints.json')
            .then(response => response.json())
            .then(data => toggleJsonInput(data));
    });
});

function populateEndpoints(endpoints) {
    const selector = document.getElementById('endpoint-selector');
    endpoints.forEach((endpoint, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = endpoint.name;
        selector.appendChild(option);
    });
}

function toggleJsonInput(endpoints) {
    const selector = document.getElementById('endpoint-selector');
    const selectedEndpoint = endpoints[selector.value];
    document.getElementById('json-input-container').style.display = 
        selectedEndpoint && selectedEndpoint.method === 'POST' ? 'block' : 'none';
}

function testEndpoint() {
    const selector = document.getElementById('endpoint-selector');
    const selectedIndex = selector.value;
    const resultButton = document.getElementById('response-result');
    const jsonInput = document.getElementById('json-input').value;

    fetch('data/endpoints.json')
        .then(response => response.json())
        .then(endpoints => {
            const selectedEndpoint = endpoints[selectedIndex];
            const requestOptions = {
                method: selectedEndpoint.method || 'GET',
                headers: selectedEndpoint.headers
            };

            if (selectedEndpoint.method === 'POST') {
                requestOptions.body = jsonInput;
            }

            return fetch(selectedEndpoint.url, requestOptions);
        })
        .then(response => {
            updateResultButton(response.status, resultButton);
            return response.json();
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
    container.textContent = JSON.stringify(data, null, 2);
}

function updateResultButton(status, button, isError = false) {
    button.textContent = "Response:  " + status;
    if (isError || (status >= 400 && status <= 599)) {
        button.style.backgroundColor = 'red';
    } else {
        button.style.backgroundColor = 'green';
    }
}
