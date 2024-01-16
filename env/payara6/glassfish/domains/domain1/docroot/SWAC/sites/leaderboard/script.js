document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('apiButton1').addEventListener('click', function() {
        fetchDataAndRenderTable('http://localhost:8080/SmartSocial/api/leaderboard/getList/10');
    });

    document.getElementById('apiButton2').addEventListener('click', function() {
        fetchDataAndRenderTable('http://localhost:8080/SmartSocial/api/leaderboard/getListByQuests/10');
    });

    fetchDataAndRenderTable('http://localhost:8080/SmartSocial/api/leaderboard/getList/10');
});

function fetchDataAndRenderTable(apiUrl) {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            createTable(data);
        })
        .catch(error => {
            console.error('Error fetching data: ', error);
        });
}

function createTable(data) {
    var container = document.getElementById('api-data-container');
    container.innerHTML = '';
    var table = document.createElement('table');

    var container = document.getElementById('api-data-container');
    var table = document.createElement('table');
    table.style.width = '100%';
    table.setAttribute('border', '1');
    table.setAttribute('cellspacing', '0');
    table.setAttribute('cellpadding', '5');

    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    ['Username', 'Kilometers', 'Finished Quests'].forEach(text => {
        var th = document.createElement('th');
        th.appendChild(document.createTextNode(text));
        tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);

    var tbody = document.createElement('tbody');
    data.forEach(item => {
        var tr = document.createElement('tr');
        
        // Username
        var tdUsername = document.createElement('td');
        var username = item.users && item.users.username ? item.users.username : 'N/A';
        tdUsername.appendChild(document.createTextNode(username));
        tr.appendChild(tdUsername);

        // Kilometers
        var tdKilometers = document.createElement('td');
        tdKilometers.appendChild(document.createTextNode(item.kilometers !== undefined ? item.kilometers : 'N/A'));
        tr.appendChild(tdKilometers);

        // Finished Quests
        var tdFinishedQuests = document.createElement('td');
        tdFinishedQuests.appendChild(document.createTextNode(item.finishedQuests !== undefined ? item.finishedQuests : 'N/A'));
        tr.appendChild(tdFinishedQuests);

        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    container.appendChild(table);
}