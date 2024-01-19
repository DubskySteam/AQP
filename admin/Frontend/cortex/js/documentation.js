/**
 * Author: Clemens Maas
 */

let apiData = [];

document.addEventListener('DOMContentLoaded', function() {
    loadApiData();
});

function loadApiData() {
    fetch('http://localhost:8080/SmartSocial/api/openapi.json')
        .then(response => response.json())
        .then(data => {
            apiData = Object.entries(data.paths);
            renderCards(apiData);
        });
}

function renderCards(data) {
    const container = document.getElementById('api-cards');
    container.innerHTML = '';
    data.forEach(([path, details]) => {
        Object.keys(details).forEach(method => {
            const card = document.createElement('div');
            card.className = 'api-card ' + `${method}-method`;

            const responses = details[method].responses;
            const firstResponseKey = Object.keys(responses)[0];
            const firstResponse = responses[firstResponseKey];
            const description = firstResponse.description || 'No description available';

            const trimmedPath = path.replace('api/', '');

            card.innerHTML = `
                <h4>${trimmedPath}</h4>
                <p>${description}</p>
            `;
            container.appendChild(card);
        });
    });
}

function truncateString(str, num) {
    if (str.length <= num) {
        return str;
    }
    return str.slice(0, num) + '...';
}

function sortCards(category) {
    const sortedData = apiData.filter(([path, details]) => path.includes(category));
    renderCards(sortedData);
}

function searchCards() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.api-card');
    cards.forEach(card => {
        if (card.innerText.toLowerCase().includes(searchInput)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    });
}
