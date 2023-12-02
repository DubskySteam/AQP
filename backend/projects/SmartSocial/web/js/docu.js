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

    const title = document.createElement('h3');
    title.textContent = `${method.toUpperCase()} ${path}`;

    const description = document.createElement('p');
    description.textContent = endpoint.summary || 'No description';

    card.appendChild(title);
    card.appendChild(description);

    return card;
}
