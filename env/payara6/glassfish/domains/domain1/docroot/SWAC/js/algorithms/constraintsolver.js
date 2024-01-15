var ConstraintSolver_options = {};
ConstraintSolver_options.typeDefs = new Map();
ConstraintSolver_options.typeDefs.set('../../data/example_rohre.json', [
    {
//        name: 'id',
//        type: 'int',
//        required: true
//    },{
        name: 'din',
        type: 'string',
        possibleValues: ['10217', '10220', '10255']
    },
    {
        name: 'durchmesser',
        type: 'string',
        possibleValues: ['DN32', 'DN40', 'DN50', 'DN65', 'DN80', 'DN100', 'DN125', 'DN150', 'DN200', 'DN250', 'DN300', '1/2"', '3/4"', '1"', '1 1/4"', '1 1/2"', '2"', '2 1/2"', '3"']
    },
    {
        name: 'laenge',
        type: 'int4',
        min: 50,
        max: 10500
    },
    {
        name: 'beschichtung',
        type: 'string',
        possibleValues: ['grundiert (Handarbeit)', 'Lackierung', 'Pulverbeschichtung']
    },
    {
        name: 'farbe',
        type: 'string',
        possibleValues: ['1x rot-braun', '2x rot-braun', '1x grau', '2x grau', 'RAL3000', 'RAL9006 (grau)', 'RAL9002 (weiß)']
    },
    {
        name: 'abgeklebt',
        type: 'bool'
    },
    {
        name: 'abschluss_links',
        type: 'string',
        possibleValues: ['Sägeschnitt', 'Nut', 'Gewinde', 'Endboden, geschweißt', 'Gewinde-Kappe Nr 300, n GF-Katalog']
    },
    {
        name: 'abschluss_rechts',
        type: 'string',
        possibleValues: ['Sägeschnitt', 'Nut', 'Gewinde', 'Endboden, geschweißt', 'Gewinde-Kappe Nr 300, n GF-Katalog']
    },
    {
        name: 'no',
        type: 'int4'
    },
    {
        name: 'anzahl',
        type: 'int4'
    }
]);

//TODO add this eventlistener to documentation
document.addEventListener('swac_components_complete', function () {
    ConstraintSolver_options.domainDefs = example_rohrnetz_csp;

    // Load ConstraintSolver
    window.swac.loadAlgorithm('ConstraintSolver','ConstraintSolver').then(function (requestor) {
        // Get instantiated ConstraintSolver
        let cs = requestor.swac_comp;
        cs.calcCollections();
        cs.calcAllDomainCollections();
        console.log(cs.domainCollections);
        // Add main dataset
        let rohrset = cs.addSet('../../data/example_rohre.json', {
            id: 1,
            col: 'Rohr'
        });
        // Test Get initial definitions
        console.log('INITIAL Definitions for Rohr[1]:');
        console.log(cs.getDataDefinitionsForSet('../../data/example_rohre.json', 1));

        // Test set occupancy
        // Should be run without problems
//         set.din = '10220';
        // Should run without problem
        rohrset.beschichtung = 'Pulverbeschichtung';
        // Now there should only a length between 50 and 7800 possible
        // Should be run without problem
        rohrset.laenge = 7800;
         // Set abschluss rechts
        rohrset.abschluss_links = 'Nut';
        // Now there should only a durchmesser one of DN... possible
            // Set durchmesser
//        set.durchmesser = '1/2"'; // Failes only DN... allowed
//        set.durchmesser = 'DN32';
//        set.abgeklebt = true;
//        // Set farbe
//        set.farbe = 'RAL3000';
//        set.abschluss_rechtss = 'Nut';
//        
        // Get actual datadefinitions (show actual possibilites)
        let defs = cs.getDataDefinitionsForSet('../../data/example_rohre.json', 1);
        console.log('FINAL DataDefinitons:');
        console.log(defs);
        // Check if is complete
//        if(cs.isComplete()) {
//            console.log('Constraint objects occupancy is complete');
//        } else {
//            console.log('Constraint objects occupancy is NOT complete');
//            console.log(cs.getIncomplete());
//        }

        // Add abgang
        let abgangset = cs.addSet('../../data/example_abgaenge.json', {
            id: 1,
            col: 'Schweissmuffe',
            parent: 'ref://../../data/example_rohre.json/1'
        });
        abgangset.durchmesser = '1/2"';
    });
});

