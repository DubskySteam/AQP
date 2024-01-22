data = [];
const userID = 2;
const url = `http://localhost:8080/SmartSocial/api/achievement/getByUserId/${userID}`;

document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(async function (requestors) {
        comp = requestors["present_example6"];
        let datasources = comp.swac_comp.data;
        let mydatasource = datasources['achievement/getAll'];
        let json_data = mydatasource.getSets();

        if (Array.isArray(json_data)) {
            try {
                // Erstelle ein Array von Promises für jede fetch-Anfrage
                const fetchPromises = json_data.map(async function (set) {
                    let convertedSet = {
                        achievementId: set.id,
                        title: set.name,
                        medal: "Silber",
                        besitz: false
                    };

                    // Führe die fetch-Anfrage aus und warte darauf, dass sie abgeschlossen ist
                    try {
                        const isCompletedValue = await isAchieved(url, convertedSet.achievementId);
                        convertedSet.besitz = isCompletedValue;
                    } catch (error) {
                        console.error('Error:', error);
                    }

                    console.log(convertedSet);
                    data.push(convertedSet);
                });

                // Warte darauf, dass alle Promises abgeschlossen sind
                await Promise.all(fetchPromises);

                console.log("data package", data);
                displayRewards(data);
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.error("json_data ist kein Array.");
        }
    }, "present_example6");
});

function isAchieved(url, achievementId) {
    return fetch(url)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(dataArray => {
            // Prüfe, ob die achievementId im JSON vorhanden ist
            console.log("data array", dataArray)
            return dataArray.some(item => item.id.achievementId === achievementId);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            return false;
        });
}

function displayRewards(rewards_list) {
    
    // var super_container = document.querySelector(".present_example6");
    // super_container.innerHTML = "";
    // var container = document.querySelector(".swac_repeatForSet");
    
    var container = document.querySelector(".swac_repeatForSet");
    container.innerHTML = "";

    rewards_list.forEach(function(reward) {
        var rewardDiv = document.createElement("div");
        rewardDiv.classList.add("reward");

        var titleDiv = document.createElement("div");
        titleDiv.classList.add("title");
        var title = document.createElement("h4");
        title.textContent = reward.title;
        titleDiv.appendChild(title)

        rewardDiv.appendChild(titleDiv);

        container.appendChild(rewardDiv);
    });
}

/*
function sortRewardsByMedal() {
    const medalOrder = { Gold: 1, Silber: 2, Bronze: 3 };
    data.sort((a, b) => medalOrder[a.medal] - medalOrder[b.medal]);
    displayRewards(data); // Aktualisierte Liste anzeigen
  }
  
  function sortRewardsByOwnership() {
    data.sort((a, b) => {
        if (a.besitz && !b.besitz) {
            return -1;
        } else if (!a.besitz && b.besitz) {
            return 1;
        } else {
            return 0;
        }
    });
  
    displayRewards(data); // Aktualisierte Liste anzeigen
  }

function handleSort() {
    var sortOptions = document.getElementById("sortOptions");
    var selectedOption = sortOptions.value;
  
    if (selectedOption === "medal") {
        sortRewardsByMedal();
    } else if (selectedOption === "besitz") {
        sortRewardsByOwnership();
    }
  }
*/ 