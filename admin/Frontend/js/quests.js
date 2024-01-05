function loadQuests() {
    fetch('http://localhost:8080/SmartSocial/api/quest/getAll')
        .then(response => response.json())
        .then(data => {
            createQuestTable(data);
        })
        .catch(error => {
            console.error('Error fetching quest data:', error);
        });
}

function createQuestTable(data) {
    const tableContainer = document.getElementById('quests-table');
    let tableHTML = '<table class="responsetable"><thead><tr><th>ID</th><th>Description</th><th>XP Reward</th></tr></thead><tbody>';

    data.forEach(item => {
        tableHTML += `<tr>
                        <td>${item.id}</td>
                        <td>${item.description}</td>
                        <td>${item.xp_reward}</td>
                      </tr>`;
    });

    tableHTML += '</tbody></table>';
    tableContainer.innerHTML = tableHTML;
}


window.onload = loadQuests;