function loadLeaderboard() {
    fetch('http://localhost:8080/SmartSocial/api/leaderboard/getList/30')
        .then(response => response.json())
        .then(data => {
            createLeaderboardTable(data);
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error);
        });
}

function createLeaderboardTable(data) {
    const tableContainer = document.getElementById('leaderboard-table');
    let tableHTML = '<table class="leaderboard"><thead><tr><th>ID</th><th>Username</th><th>Finished Quests</th><th>Kilometers</th></tr></thead><tbody>';

    data.forEach(item => {
        tableHTML += `<tr>
                        <td>${item.id}</td>
                        <td>${item.users.username}</td>
                        <td>${item.finishedQuests}</td>
                        <td>${item.kilometers}</td>
                      </tr>`;
    });

    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}


window.onload = loadLeaderboard;