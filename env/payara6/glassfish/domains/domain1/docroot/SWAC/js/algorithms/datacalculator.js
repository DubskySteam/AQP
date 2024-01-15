// Example 1
// Create empty global array for datasource
window['datacalculator_results1'] = [];
window['datacalculator_statistic1'] = [
    {id:1,modulecount_sum:0,yield_sum:0.0}
];
// Algorithm configuration
window["DataCalculator_example1_options"] = {
    targetSource: 'datacalculator_results1', // Use the above declared datasource for single calculation results
    statsSource: 'datacalculator_statistic1', // Use the above declared datasource for statistic
    calculations: [ // Specify calculations as formular with names of attributes and a target attribute name
        {formular: "(!voltage) ? 0 : 1",target: "modulecount"},
        {formular: "voltage * current",target: "yield"}
    ]
};

document.addEventListener('swac_components_complete', function () {
    // Load DataCalcualtor
    window.swac.loadAlgorithm('DataCalculator_example1','DataCalculator').then(function (requestor) {
        // Get instantiated DataCalcualtor
        let dc = requestor.swac_comp;
        // Add data
        dc.addDataFromReference('ref://../../data/algorithms/datacalculator/datacalculator_example1.json');
    });
});

// Exampel 2
window['datacalculator_results2'] = [
    {id:1,modulecount:0,yield:0.0}
];
window['datacalculator_statistic2'] = [
    {id:1,modulecount_sum:0,yield_sum:0.0}
];

// Algorithm configuration
window["DataCalculator_example2_options"] = {
    sourceAttr: 'source', // Attribute that contains the reference to the data that is used for calculation
    targetSource: 'datacalculator_results2',
    statsSource: 'datacalculator_statistic2',
    calculations: [
        {formular: "(!voltage) ? 0 : 1",target: "modulecount"},
        {formular: "voltage * current",target: "yield"}
    ]
};

document.addEventListener('swac_components_complete', function () {
    // Load DataCalcualtor
    window.swac.loadAlgorithm('DataCalculator_example2','DataCalculator').then(function (requestor) {
        // Get instantiated DataCalcualtor
        let dc = requestor.swac_comp;
        // Add data
        dc.addDataFromReference('ref://../../data/algorithms/datacalculator/datacalculator_example2.json');
    });
});