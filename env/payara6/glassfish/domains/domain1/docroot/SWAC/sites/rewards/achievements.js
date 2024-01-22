data = [];
const userID = 2;
const achievementURL = `http://localhost:8080/SmartSocial/api/achievement/getByUserId/${userID}`;
const questURL = `http://localhost:8080/SmartSocial/api/quest/getById/`;

document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(async function (requestors) {
        comp = requestors["present_example6"];
        let datasources = comp.swac_comp.data;
        let mydatasource = datasources['achievement/getAll'];
        let json_data = mydatasource.getSets();

        if (Array.isArray(json_data)) {
            try {

                console.log("JSON DATA", json_data);

                // Erstelle ein Array von Promises für jede fetch-Anfrage
                const fetchPromises = json_data.map(async function (set) {
                    let convertedSet = {
                        achievementId: set.id,
                        title: set.name,
                        medal: "undefined",
                        besitz: false
                    };

                    // Führe die fetch-Anfrage aus und warte darauf, dass sie abgeschlossen ist
                    try {
                        const isCompletedValue = await isAchieved(achievementURL, convertedSet.achievementId);
                        convertedSet.besitz = isCompletedValue;
                    } catch (error) {
                        console.error('Error:', error);
                    }

                    try {
                        const medal_type = await getXpFromQuest(questURL, convertedSet.achievementId);
                        console.log("MEDAL:", medal_type)
                        convertedSet.medal = medal_type;
                    } catch (error) {
                        console.error('Error:', error);
                    }

                    console.log(convertedSet);
                    data.push(convertedSet);
                });

                // Warte darauf, dass alle Promises abgeschlossen sind
                await Promise.all(fetchPromises);

                console.log("data package", data);
                displayAchievements();
            } catch (error) {
                console.error('Error:', error);
            }
        } else {
            console.error("json_data ist kein Array.");
        }
    }, "present_example6");
});

function getXpFromQuest(baseUrl, questId) {
    const url = `${baseUrl}${questId}`;
    console.log("URL TEST", url);
    return fetch(url)
        .then(response => {
            if(!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(questArray => {
            const xpReward = questArray.xpReward;
            if (xpReward === 400){
                return "Bronze"
            }
            else if (xpReward === 800){
                return "Silber"
            }
            else if (xpReward === 1200){
                return "Gold"
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
            return false;
        });
}

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
            return dataArray.some(item => item.id.achievementId === achievementId);
        })
        .catch(error => {
            console.error('Fetch error:', error);
            return false;
        });
}

function displayAchievements() {
    var achievementContainer = document.getElementById('present_example6');
    achievementContainer.innerHTML = "";

    data.sort((a, b) => {
        return a.besitz === b.besitz ? 0 : a.besitz ? -1 : 1;
    })

    data.forEach(function (achievement) {
        var medalColor;
        switch (achievement.medal) {
            case "Gold":
                medalColor = "#FFE500";
                break;
            case "Silber":
                medalColor = "#DCDCDC";
                break;
            case "Bronze":
                medalColor = "#D97500";
                break;
            default:
                medalColor = "#000000";
        }

        var achievementDiv = document.createElement('div');
        achievementDiv.className = 'achievement ' + achievement.besitz;
        achievementDiv.innerHTML = `
        <div class="medal">
        <svg width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14.8584 8.68264L10.2677 1.03196C10.079 0.717229 9.81191 0.456756 9.49258 0.275908C9.17324 0.0950603 8.81251 4.50585e-06 8.44552 0H1.06445C0.204484 0 -0.298877 0.967542 0.193859 1.67211L7.5829 12.2281C9.5565 10.384 12.0667 9.11827 14.8584 8.68264ZM32.9356 0H25.5545C24.8081 0 24.1161 0.391798 23.7323 1.03196L19.1416 8.68264C21.9333 9.11827 24.4435 10.384 26.4171 12.2274L33.8061 1.67211C34.2989 0.967542 33.7955 0 32.9356 0ZM17 10.625C10.5453 10.625 5.31247 15.8579 5.31247 22.3126C5.31247 28.7673 10.5453 34.0001 17 34.0001C23.4547 34.0001 28.6875 28.7673 28.6875 22.3126C28.6875 15.8579 23.4547 10.625 17 10.625ZM23.1439 21.0681L20.6251 23.5225L21.2208 26.9902C21.327 27.6118 20.6723 28.0866 20.1151 27.7931L17 26.1562L13.8855 27.7931C13.3277 28.0886 12.6736 27.6111 12.7799 26.9902L13.3755 23.5225L10.8567 21.0681C10.4039 20.6272 10.6542 19.8575 11.2784 19.7672L14.7601 19.2599L16.316 16.1042C16.4561 15.82 16.7271 15.6799 16.9987 15.6799C17.2716 15.6799 17.5445 15.822 17.6847 16.1042L19.2406 19.2599L22.7222 19.7672C23.3465 19.8575 23.5968 20.6272 23.1439 21.0681Z" fill="${medalColor}"/>
        </svg>
        </div>
        <h3 class="title">${achievement.title}</h3>
    `;
        achievementContainer.appendChild(achievementDiv);
    })
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