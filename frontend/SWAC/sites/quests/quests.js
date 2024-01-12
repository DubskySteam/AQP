data = [];

document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(function (requestors) {
        comp = requestors["present_example6"];
        let datasources = comp.swac_comp.data;
        let mydatasource = datasources['quests_data']
        let json_data = mydatasource.getSets();

        if (Array.isArray(json_data)) {
            json_data.forEach(function (set) {
                let convertedSet = {
                    title: set.title,
                    description: set.description,
                    xpreward: set.xpreward,
                    completed: set.completed
                };
                console.log(convertedSet);
                data.push(convertedSet);
            });
            console.log("data package", data);
            renderData();
        } else {
            console.error("json_data ist kein Array.");
        }
    }, "present_example6");
});

const renderData = () => {
    var questContainer = document.getElementById('present_example6');
    questContainer.innerHTML = "";

    data.forEach(function(quest) {
        var questDiv = document.createElement('div');
        questDiv.className = 'quest ' + quest.completed;
        questDiv.innerHTML = `
            <h3 class="questTitle">${quest.title}</h3>
            <button class="toggleButton">Details</button>
            <div class="questDetails">
                <p>${quest.description}</p>
                <p><strong>Abgeschlossen:</strong> ${quest.completed}</p>
                <p><strong>Belohnung:</strong> ${quest.xpreward}</p>
            </div>
        `;

        questContainer.appendChild(questDiv);

        var toggleButton = questDiv.querySelector('.toggleButton');
        toggleButton.addEventListener('click', function(event) {
            toggleDetails(questDiv);
            event.stopPropagation(); // Verhindere, dass der Klick auf den Button das Quest-Div selbst ausklappt
        });
    });

    questContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('quest')) {
            toggleDetails(event.target);
        }
    });
}

const toggleDetails = (questDiv) => {
    var details = questDiv.querySelector('.questDetails');
    details.style.display = (details.style.display === 'none' || details.style.display === '') ? 'block' : 'none';
}