document.addEventListener('DOMContentLoaded', function() {
    fetch('http://localhost:8080/SmartSocial/api/openapi.json')
        .then(response => response.json())
        .then(swaggerJson => {
            displayEndpoints(swaggerJson);
        })
        .catch(error => console.error('Error loading Swagger JSON:', error));
});

function displayEndpoints(swaggerJson) {
    const container = document.getElementById('api-endpoints-container');
    container.innerHTML = '';

    for (const path in swaggerJson.paths) {
        for (const method in swaggerJson.paths[path]) {
            const endpoint = swaggerJson.paths[path][method];
            const card = createEndpointCard(path, method, endpoint);
            container.appendChild(card);
        }
    }
}

function createEndpointCard(path, method, endpoint) {
    const card = document.createElement('div');
    card.className = 'api-card';
    card.style.backgroundColor = getBackgroundColorForMethod(method);

    const title = document.createElement('h3');
    title.textContent = `${method.toUpperCase()} ${path}`;

    const description = document.createElement('p');
    const successResponse = endpoint.responses["200"] || {};
    description.textContent = successResponse.description || 'No description available';

    const httpCode = document.createElement('p');
    httpCode.textContent = `HTTP Status Code: 200`;

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(httpCode);

    return card;
}

function getBackgroundColorForMethod(method) {
    switch (method.toLowerCase()) {
        case 'get':
            return 'lightgreen';
        case 'post':
            return '#fcbc26';
        case 'delete':
            return '#fc265f';
        default:
            return 'lightgray';
    }
}

