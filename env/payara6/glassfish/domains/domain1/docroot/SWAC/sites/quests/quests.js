document.addEventListener('DOMContentLoaded', function() {
    let userAchievements = [];
    fetch('http://localhost:8080/SmartSocial/api/achievement/getByUserId/5')
    .then(response => response.json())
    .then(data => {
        userAchievements = data
            .filter(ach => ach.achievement && ach.achievement.id !== undefined) // Ensure 'achievement' and 'id' exist
            .map(ach => ach.achievement.id);
        return fetch('http://localhost:8080/SmartSocial/api/achievement/getAll/');
    })
        .then(response => response.json())
        .then(allAchievements => {
            createTable(allAchievements, userAchievements);
            addModalListeners();
        })
        .catch(error => console.error('Error:', error));
});

function createTable(achievements, userAchievements) {
    const container = document.getElementById('achievements-table-container');
    const table = document.createElement('table');
    achievements.forEach(achievement => {
        const tr = document.createElement('tr');
        const td = document.createElement('td');
        td.textContent = achievement.name;
        td.dataset.description = achievement.description;
        if (userAchievements.includes(achievement.id)) {
            td.classList.add('highlight');
        }
        tr.appendChild(td);
        table.appendChild(tr);
    });
    container.appendChild(table);
}

function addModalListeners() {
    const modal = document.getElementById('descriptionModal');
    const span = document.getElementsByClassName('close')[0];
    const descriptionText = document.getElementById('descriptionText');
    document.querySelectorAll('#achievements-table-container td').forEach(td => {
        td.onmouseover = function() {
            descriptionText.textContent = this.dataset.description;
            modal.style.display = 'block';
        };
    });
    span.onclick = function() {
        modal.style.display = 'none';
    };
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    };
}