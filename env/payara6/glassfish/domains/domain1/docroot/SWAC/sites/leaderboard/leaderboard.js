data = [];

document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(function (requestors) {
        comp = requestors["present_example6"];
        let datasources = comp.swac_comp.data;
        let mydatasource = datasources['leaderboard/getListByQuests/2']
        console.log("datasource", datasources)
        console.log("mydatasource", mydatasource)
        let json_data = mydatasource.getSets();

        if (Array.isArray(json_data)) {
            json_data.forEach(function (set) {
                console.log("test", set);
                let convertedSet = {
                    username: set.username,
                    kilometers: set.kilometers,
                    finishedquests: set.finishedquests,
                    amountrewards: set.amountrewards
                };
                console.log("rewards test", set.amountrewards);
                data.push(convertedSet);
            });
            console.log("data package", data);
            renderData("kilometers");
        } else {
            console.error("json_data ist kein Array.");
        }
    }, "present_example6");
});

function renderData(sortBy) {
    var leaderboardDiv = document.getElementById("present_example6");
    leaderboardDiv.innerHTML = "";
  
    var sortedData = [...data];
  
    sortedData.sort((a, b) => b[sortBy] - a[sortBy]);
  
    sortedData.forEach(function(user, index) {
        var userDiv = document.createElement("div");
        userDiv.classList.add("user-entry");
        userDiv.classList.add(index % 2 === 0 ? "blue-bg" : "white-bg");
  
        var iconDiv = document.createElement("div");
        iconDiv.classList.add("user-icon");
        userDiv.appendChild(iconDiv);
  
        // Hier kommt nachher das Icon des Nutzers
  
        var nameDiv = document.createElement("div");
        nameDiv.classList.add("user-name");
        nameDiv.innerText = user.username;
        userDiv.appendChild(nameDiv);
  
        var valueDiv = document.createElement("div");
        valueDiv.classList.add("user-value");
        valueDiv.innerText = user[sortBy];
        userDiv.appendChild(valueDiv);
  
        leaderboardDiv.appendChild(userDiv);
    });
  }
  
function handleSort() {
    var sortBy = document.getElementById("sortOptions").value;
    renderData(sortBy);
}