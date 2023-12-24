data = [];

document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(function (requestors) {
        comp = requestors["present_example6"];
        let datasources = comp.swac_comp.data;
        let mydatasource = datasources['join_data'];
        let json_data = mydatasource.getSets();
        console.log("JSON-Data: ", json_data);

        if (Array.isArray(json_data)) {
            json_data.forEach(function (set) {
                let convertedSet = {
                    teamname: set.teamname,
                };
                data.push(convertedSet);
            });
            renderData();
        } else {
            console.error("json_data ist kein Array.");
        }
    }, "present_example6");
});

function renderData() {
    const teamNameInput = document.getElementById("team-name");
    const teamSelectionPopup = document.getElementById("teamSelectionPopup");
    const teamList = document.getElementById("teamList");

    // Funktion zum Erstellen der Teamliste im Popup
    function createTeamList() {
        teamList.innerHTML = ""; // Leere die bestehende Liste

        data.forEach(team => {
            const listItem = document.createElement("li");
            listItem.textContent = team.teamname;
            teamList.appendChild(listItem);
        });
    }

    // Event-Listener für das Anzeigen des Popups
    teamNameInput.addEventListener("focus", function () {
        createTeamList(); // Aktualisiere die Teamliste
        teamSelectionPopup.style.display = "block";
    });

    // Event-Listener für das Ausblenden des Popups
    teamNameInput.addEventListener("blur", function () {
        teamSelectionPopup.style.display = "none";
    });

    // Event-Listener für das Auswählen eines Teams im Popup
    teamList.addEventListener("click", function (event) {
        console.log("Team clicked:", event.target.textContent.trim());
    
        const selectedTeam = event.target.textContent.trim();
        if (selectedTeam) {
            teamNameInput.value = selectedTeam;
            teamSelectionPopup.style.display = "none";
        }
    });
}
