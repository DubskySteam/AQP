// Empty source where booth componente share their data
var datatransform_example2_watchablesource = [];
// Because the source is empty at load time set the view to always visable
var datatransform_example2_view_options = {
    showWhenNoData: true
};

var DataTransform_example1_options = {
    ignoredAttributes: ['id','parent'],
    transformTarget: 'datatransform_example2_watchablesource', //Save the data in global variable for use in example 2
    transforms: {
        "../../data/datatransform/datatransform_exampleA.json": {
            "kind": "circle",
            "durchmesser": {
                "DN32": 40,
                "DN40": 48,
                "DN48": 50,
                "DN50": 63,
                "DN65": 75,
                "DN80": 90,
                "DN100": 110,
                "DN125": 140,
                "DN150": 160,
                "DN200": 225,
                "DN250": 280,
                "DN300": 315,
                '1/2"': 20,
                '3/4"': 26,
                '1"': 33,
                '1 1/4"': 40,
                '1 1/2"': 47,
                '2"': 59,
                '2 1/2"': 76,
                '3"': 89
            },
            // Gets the original dataset, must return the new value for the named attribute
            "x": function(set, transset) {
                return set.y;
            },
            // When changeing y recalculateing x and leave y
            "y": function(set, transset) {
                transset.x = set.y;
                return set.y;
            }
        }
    }
};

document.addEventListener('swac_components_complete', function () {
    let example2_viewElem = document.getElementById('datatransform_example2_view');
    
    // Load DataTransform
    window.swac.loadAlgorithm('DataTransform_example1','DataTransform').then(function (requestor) {
        // Get instantiated DataTransform
        let dt = requestor.swac_comp;
        dt.addDataFromReference('ref://../../data/datatransform/datatransform_exampleA.json').then(function() {
           let transformeddata = dt.transform('../../data/datatransform/datatransform_exampleA.json');
           example2_viewElem.swac_comp.addData('datatransform_example2_watchablesource',transformeddata);
        });
    });
});