data = [];

document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(function (requestors) {
        comp = requestors["present_example6"];
        let datasources = comp.swac_comp.data;
        let mydatasource = datasources['rewards_data']
        let json_data = mydatasource.getSets();
        console.log("JSON-Data: ", json_data);

        if (Array.isArray(json_data)) {
            json_data.forEach(function (set) {
                let convertedSet = {
                    title: set.title,
                    medal: set.medal,
                    besitz: set.besitz
                };
                data.push(convertedSet);
            });

            // displayRewards(data);
        } else {
            console.error("json_data ist kein Array.");
        }
    }, "present_example6");
});

/*
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
*/

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