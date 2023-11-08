var explaincomponent_options = {
    componentName: 'ConstraintVisualiser'
};

var constraintvisualiser_example1_options = {};
constraintvisualiser_example1_options.typeDefs = new Map();
constraintvisualiser_example1_options.typeDefs.set('../../data/example_rohre.json', [
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

document.addEventListener('swac_components_complete', function () {
    let constvisu = document.querySelector('#constraintvisualiser_example1');
    constvisu.swac_comp.options.domainDefs = example_rohrnetz_csp;
    constvisu.swac_comp.calculateCollections();
});