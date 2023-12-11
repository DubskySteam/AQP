/*
document.addEventListener('DOMContentLoaded', async (event) => {
    // Annahme: Ihre JSON-Daten sind in rewards_data.json vorhanden
    const response = await fetch('/frontend/SWAC/sites/rewards/rewards_data.json');
    const jsonData = await response.json();

    jsonData.forEach((data, index) => {
        var reward = document.getElementsByClassName('reward')[index];
        var rewardTitleElement = reward.querySelector('.title');
        var rewardMedalElement = reward.querySelector('.medal');
        var rewardBesitzElement = reward.querySelector('.besitz');

        // Überprüfen, ob die Elemente gefunden wurden
        if (rewardTitleElement && rewardMedalElement && rewardBesitzElement) {
            var rewardTitle = data.title;
            var rewardMedal = data.medal;
            var rewardBesitz = data.besitz;

            var updatedContent = `
                <h2>${rewardTitle}</h2>
                <p><strong>Medaille:</strong> ${rewardMedal}</p>
                <p><strong>Besitz:</strong> ${rewardBesitz === true ? 'Ja' : 'Nein'}</p>
            `;

            if (rewardBesitz === true) {
                reward.style.backgroundColor = '#398EDE';
                reward.style.color = 'white';
            }

            reward.innerHTML = updatedContent;
        } else {
            console.log('Fehler: Elemente nicht gefunden.');
        }
    });
});
*/

/*
document.addEventListener('DOMContentLoaded', () => {
    var rewardsData = [];

    var rewardElements = document.getElementsByClassName('reward');

    for (var i = 0; i < rewardElements.length; i++) {
        var reward = rewardElements[i];

        // Direkt auf die Kinder zugreifen
        var rewardTitleElement = reward.querySelector('.title').innerText;
        var rewardMedalElement = reward.querySelector('.medal').innerText;
        var rewardBesitzElement = reward.querySelector('.besitz').innerText.toLowerCase() === 'true';

        var rewardData = {
            title: rewardTitleElement,
            medal: rewardMedalElement,
            besitz: rewardBesitzElement
        };

        rewardsData.push(rewardData);
    }

    // Jetzt haben Sie die Daten in rewardsData und können darauf zugreifen.
    console.log('Rewards Daten:', rewardsData);

    // Hier können Sie weitere Aktionen mit den Daten durchführen, z.B. Anzeige, Filterung usw.
    rewardsData.forEach(reward => {
        console.log('Title:', reward.title);
        console.log('Medal:', reward.medal);
        console.log('Besitz:', reward.besitz);
        console.log('-----------------');
    });

    // Hier können Sie auch Ihre Funktion changeInnerHTML anrufen und das rewardsData-Array übergeben.
    // changeInnerHTML(rewardsData);
});
*/

/*
document.addEventListener('DOMContentLoaded', async function(){
    setTimeout(async function(){
        var rewardElements = document.getElementsByClassName('reward');
        var firstElement = rewardElements[0]
        var medalValue = firstElement.querySelector('.medal').innerHTML;
        console.log(medalValue);


    }, 1000);
});
*/

        /*
        var s = document.getElementById('present_example6');
        var a = s.swac_comp.getChilds("swac_repeatForSet");
        console.log(a[0]);
        */
document.addEventListener('swac_ready', function () {
    window.swac.reactions.addReaction(function (requestors) {
        // Get the component element
        mycompelem = requestors["present_example6"];
        // Get the component data array
        let datasources = mycompelem.swac_comp.data;
        // Get a datasource that name you know (else iterate through the array)
        let mydatasource = datasources['/frontend/SWAC/sites/rewards/rewards_data.json'];
        // Get sets
        let mydatasets = mydatasource.getSets();
        console.log("Proxy Test", mydatasets);
        // Access set with it 2
        let set2 = mydatasets[2];
        console.log("Datasources:" + datasources);
        console.log(datasources);
        console.log("test3", set2.besitz);
    }, "present_example6");
});