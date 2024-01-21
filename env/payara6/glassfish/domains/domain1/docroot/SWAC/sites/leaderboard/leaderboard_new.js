data = [];

document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(function (requestors) {
        comp = requestors["present_example6"];
        let datasources = comp.swac_comp.data;
        let mydatasource = datasources['leaderboard/getList/2']
        let json_data = mydatasource.getSets();

        if (Array.isArray(json_data)) {
            json_data.forEach(function (set) {
                console.log("Vor dem Konvertieren: ", set);
                let convertedSet = {
                    userID: set.id,
                    username: set.users.username,
                    kilometers: set.kilometers,
                    finishedQuests: set.finishedQuests,
                };
                data.push(convertedSet);
            });
            console.log("Nach dem Konvertieren:", data);
            renderData();
        } else {
            console.error("json_data ist kein Array.");
        }
    }, "present_example6");
});

function renderData(){
    var leaderboardDiv = document.getElementById("present_example6");
    leaderboardDiv.innerHTML = "";
  
    var renderData = [...data];
  
    renderData.forEach(function(user, index) {
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
        valueDiv.innerText = user.kilometers;
        userDiv.appendChild(valueDiv);
  
        leaderboardDiv.appendChild(userDiv);
    });
}