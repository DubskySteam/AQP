var DataCompare_options = {
    excludeCompareAttrs: ['id','parent'],
    mainSource: '../../data/datacompare/datacompare_exampleA_A.json'
};

//TODO add this eventlistener to documentation
document.addEventListener('swac_components_complete', function () {
    // Load DataCompare
    window.swac.loadAlgorithm('DataCompare','DataCompare').then(function (requestor) {
        // Get instantiated ConstraintSolver
        let dc = requestor.swac_comp;
        let loadProms = [];
        // Add datasets (main and chids)
        loadProms[0] = dc.addDataFromReference('ref://../../data/datacompare/datacompare_exampleA_A.json');
        loadProms[1] = dc.addDataFromReference('ref://../../data/datacompare/datacompare_exampleA_B.json');
        // Wait for data to be loaded
        Promise.all(loadProms).then(function() {
           let duplicates = dc.findDuplicates('../../data/datacompare/datacompare_exampleA_A.json');
           console.log('found duplicates:');
           console.log(duplicates);
        });
    });
});

