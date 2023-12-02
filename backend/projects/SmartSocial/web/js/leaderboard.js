function loadLeaderboard() {
    fetch('http://localhost:8080/SmartSocial/api/leaderboard/getList/10')
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
    let tableHTML = '<table border="1"><tr><th>Rank</th><th>Name</th><th>Score</th></tr>';

    data.forEach((item, index) => {
        tableHTML += `<tr>
                        <td>${index + 1}</td>
                        <td>${item.kilometers}</td>
                        <td>${item.quests}</td>
                      </tr>`;
    });

    tableHTML += '</table>';
    tableContainer.innerHTML = tableHTML;
}

window.onload = loadLeaderboard;
