data = [];
const userID = 2;
const url = `http://localhost:8080/SmartSocial/api/quest/getByUserId/${userID}`;

document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(async function (requestors) {
        comp = requestors["present_example6"];
        let datasources = comp.swac_comp.data;
        let mydatasource = datasources['quest/getAll'];
        let json_data = mydatasource.getSets();

        if (Array.isArray(json_data)) {
            try {
                // Erstelle ein Array von Promises für jede fetch-Anfrage
                const fetchPromises = json_data.map(async function (set) {
                    let convertedSet = {
                        questID: set.id,
                        title: set.name,
                        description: set.description,
                        xpReward: set.xpReward,
                        completed: false
                    };

                    // Führe die fetch-Anfrage aus und warte darauf, dass sie abgeschlossen ist
                    try {
                        const isCompletedValue = await isCompleted(url, convertedSet.questID);
                        convertedSet.completed = isCompletedValue;
                    } catch (error) {
                        console.error('Error:', error);
                    }

                    console.log(convertedSet);
                    data.push(convertedSet);
                });

                // Warte darauf, dass alle Promises abgeschlossen sind
                await Promise.all(fetchPromises);

                console.log("data package", data);
                renderData();
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.error("json_data ist kein Array.");
        }
    }, "present_example6");
});

function isCompleted(url, questId) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(dataArray => {
            const questData = dataArray.find(item => item.id.questId === questId);
            return questData ? questData.completionDate !== null : false;
        })
        .catch(error => {
            console.error('Fetch error:', error);
            return false;
        });
}

const renderData = () => {
    var questContainer = document.getElementById('present_example6');
    questContainer.innerHTML = "";

    data.sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? -1 : 1);

    data.forEach(function (quest) {
        var questDiv = document.createElement('div');
        console.log("quest completed?", quest.completed);
        questDiv.className = 'quest ' + quest.completed;
        questDiv.innerHTML = `
            <h3 class="questTitle">${quest.title}</h3>
            <button class="toggleButton">Details</button>
            <div class="questDetails">
                <p>${quest.description}</p>
                <p><strong>Abgeschlossen:</strong> ${quest.completed}</p>
                <p><strong>Belohnung:</strong> ${quest.xpReward}</p>
            </div>
        `;

        questContainer.appendChild(questDiv);

        var toggleButton = questDiv.querySelector('.toggleButton');
        toggleButton.addEventListener('click', function (event) {
            toggleDetails(questDiv);
            event.stopPropagation();
        });
    });

    questContainer.addEventListener('click', function (event) {
        if (event.target.classList.contains('quest')) {
            toggleDetails(event.target);
        }
    });
}

const toggleDetails = (questDiv) => {
    var details = questDiv.querySelector('.questDetails');
    details.style.display = (details.style.display === 'none' || details.style.display === '') ? 'block' : 'none';
}