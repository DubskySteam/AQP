
document.addEventListener('swac_components_complete', function () {
// Wait for component to be ready
    window.swac.reactions.addReaction(function (requestors) {
        // Get the component element
        let mycompelem = document.querySelector('#present_example1');
        // If you are inside a reaction, you can use also use the requestors parameter
        mycompelem = requestors["present_example1"];
        // Access the component object
        console.log(mycompelem.swac_comp);

        let removedataBtn = document.querySelector('#example_removealldata');
        removedataBtn.addEventListener('click', function () {
            // Get the component element
            let mycompelem = document.querySelector('#present_example1');
            mycompelem.swac_comp.removeAllData();
        });

        let newdataBtn = document.querySelector('#example_addnewdata');
        newdataBtn.addEventListener('click', function () {
            // Get the component element
            let mycompelem = document.querySelector('#present_example1');
            mycompelem.swac_comp.addDataFromReference("ref://exampledata_timed.json");
            // You can also add data from REST interfaces, the datasource must be configured
            // in configuration.js
            //mycompelem.swac_comp.addDataFromReference("ref://collection/data_11/getAttributes?storage=smartmonitoring");
        });

    }, "present_example1");
});
