var explaincomponent_options = {
    componentName: 'Selectdatetime'
};

selectdatetime_example2_options = {
    timepicker: false
};

selectdatetime_example3_options = {
    datepicker: false
};

selectdatetime_example4_options = {
    actualTimeForEmpty: true,
    reloadInterval: 5
};

window.onload = function () {
    let example5Btn = document.querySelector('#selectdatetime_example5btn');
    // Avoid error if example is commented out
    if (!example5Btn)
        return;
    example5Btn.addEventListener('click', function (evt) {
        let dtElem = document.querySelector('#selectdatetime_example5');
        console.log(dtElem.swac_comp.data);

        // For example static implemented with given name of source and hardcoded dateset id (1)
        alert('The actual inputted date / time is: ' + dtElem.swac_comp.data['../../data/selectdatetime/exampleDatetimes.json'].getSet(1).datetime);
    });
};

// Wait for swac reaction system to be ready
document.addEventListener('swac_ready', function () {
    // Register reaction to the component with id "head_navigation"
    window.swac.reactions.addReaction(function (requestors) {
        let ex4observer = {
            notify: function (set, attrName, attrValue) {
                console.log('notification recived about change of >' + attrName + '< to >' + attrValue + '< for set: ' + set.id);
            }
        };

        let example4 = requestors['selectdatetime_example4'];
        let watchedSet = example4.swac_comp.data['../../data/selectdatetime/exampleEmptyDatetimes.json'].getSet(1);
        console.log('watch set:');
        console.log(watchedSet);
        watchedSet.addObserver(ex4observer);
    }, "selectdatetime_example4");
});

// Example 6
// Register event handler
document.addEventListener('swac_selectdatetime_example4_reloaded', function (evt) {
    let requestor = evt.detail;
    console.log('The actual time is: ');
    console.log(requestor.querySelector('.swac_repeatedForSet .swac_selectdatetime_time').getAttribute('value'));
});