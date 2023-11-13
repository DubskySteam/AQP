var quests = [
    {
        id: 1,
        title: 'Stadtradler',
        description: 'Fahre 10km in der Mindener Innenstadt',
        status: 'Aktiv',
        reward: '500 XP'
    },
    {
        id: 2,
        title: 'Wassergeist',
        description: 'Fahre 5km entlang eines Flusses',
        status: 'Aktiv',
        reward: '900 XP'
    },
];

const createQuestElements = () => {
    var questContainer = document.getElementById('quest_container')

    quests.forEach(function(quest) {
        var questDiv = document.createElement('div');
        questDiv.className = 'quest';
        questDiv.innerHTML = `
        <p>${quest.title}</p>
        <div class="questDetails">
            <p>${quest.description}</p>
            <p>Status: ${quest.status}</p>
            <p>Belohnung: ${quest.reward}</p>
        </div>
        `;

        questContainer.appendChild(questDiv);

        questDiv.addEventListener('click', function() {
            toggleDetails(questDiv);
        });
    });
}

const toggleDetails = (questDiv) => {
    var details = questDiv.querySelector('.questDetails');
    details.style.display = (details.style.display === 'none') ? 'block' : 'none';
}

createQuestElements();