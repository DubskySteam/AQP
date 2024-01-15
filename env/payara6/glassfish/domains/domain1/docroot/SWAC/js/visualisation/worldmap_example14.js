/* 
 * Configuration script for worldmap_example4
 */

var worldmap_options = {
    showTimedDataAtOnce: true
};
worldmap_options.datasources = [];

window.onload = function (evt) {
    worldmap_options.datasources[0] = {
        url: '../../data/worldmap/example14/co2_germany.json',
        latattr: 'latitude', // Name of the attribute that stores the latitude information
        lonattr: 'longitude', // Name of the attribute that stores the longitude information
        heightattr: null, // Name of the attribute that stores the height information (null is default, clamps to ground)
        datasetOffsetLat: 0, // This is the default value
        datasetOffsetLon: 0, // This is the default value
        datasetOffsetHeight: 1000,
        excludeAttrs: ['id'], // This is the default value
        displayKind: 'rect',
        displayRadius: 2500,
//        fillColor: 'yellow', // Default color of models (white if no setting is given)
//        outlineColor: 'blue', // Default color of models border (black if no setting is given)
//        outlineWidth: 10, // Width of the outline (1 if no setting is given)
//        extrudeHeight: 10, // Default height of models
//        fillColorProperty: 'Coloring property name', // Property from data that should be used as color for the model
//        outlineColorProperty: 'Border coloring property name', // Property from data that should be used as color for the models outline
//        extrudeHeightProperty: 'PHK_class', // Property from data that should be used for calculating the height
//        datacaptionProperty: 'PHK_text', // Property from data that should be used for model caption
        datadescription: document.getElementById('worldmap_legend'),
        zoomTo: true
    };
};

// Options defining WHAT is visualised
worldmap_legend_options = {};
worldmap_legend_options.visuAttribute = 'co2';
// Data defining HOW is visualised
//worldmap_legend_data = {};
//worldmap_legend_data.sourcename = "ECCAD 2000 - 2019";
//worldmap_legend_data.sourcelink = "https://eccad3.sedoo.fr/";
//worldmap_legend_data.co2 = {};
//worldmap_legend_data.co2.txt_title = 'Anthropogene CO2 Emissionen';
//worldmap_legend_data.co2.txt_desc = 'Höhe der Anthropogenen CO2 Emissionen';
//worldmap_legend_data.co2.txt_uknw = 'unbekannt';
//worldmap_legend_data.co2.col = '0xAA00A5FF';
//worldmap_legend_data.co2.scale = 1000000000000;
//worldmap_legend_data.co2.calcmode = '<';
//worldmap_legend_data.co2.values = {};
//worldmap_legend_data.co2.values['1.72e-14'] = {};
//worldmap_legend_data.co2.values['1.72e-14'].col = '0x77930508';
//worldmap_legend_data.co2.values['1.72e-14'].txt = '< 1.72e-14 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-13'] = {};
//worldmap_legend_data.co2.values['1.72e-13'].col = '0x77b7070d';
//worldmap_legend_data.co2.values['1.72e-13'].txt = '< 1.72e-13 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-12'] = {};
//worldmap_legend_data.co2.values['1.72e-12'].col = '0x77ff0f17';
//worldmap_legend_data.co2.values['1.72e-12'].txt = '< 1.72e-12 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-11'] = {};
//worldmap_legend_data.co2.values['1.72e-11'].col = '0x77fff836';
//worldmap_legend_data.co2.values['1.72e-11'].txt = '< 1.72e-11 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-10'] = {};
//worldmap_legend_data.co2.values['1.72e-10'].col = '0x7788ff70';
//worldmap_legend_data.co2.values['1.72e-10'].txt = '< 1.72e-10 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-9'] = {};
//worldmap_legend_data.co2.values['1.72e-9'].col = '0x7742ff9b';
//worldmap_legend_data.co2.values['1.72e-9'].txt = '< 1.72e-9 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-8'] = {};
//worldmap_legend_data.co2.values['1.72e-8'].col = '0x7700ffc8';
//worldmap_legend_data.co2.values['1.72e-8'].txt = '< 1.72e-8 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-7'] = {};
//worldmap_legend_data.co2.values['1.72e-7'].col = '0x7700cafd';
//worldmap_legend_data.co2.values['1.72e-7'].txt = '< 1.72e-7 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-6'] = {};
//worldmap_legend_data.co2.values['1.72e-6'].col = '0x770059fb';
//worldmap_legend_data.co2.values['1.72e-6'].txt = '< 1.72e-6 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-5'] = {};
//worldmap_legend_data.co2.values['1.72e-5'].col = '0x770000fb';
//worldmap_legend_data.co2.values['1.72e-5'].txt = '< 1.72e-5 kg m-2 s-1';
//worldmap_legend_data.co2.values['1.72e-4'] = {};
//worldmap_legend_data.co2.values['1.72e-4'].col = '0x7700008c';
//worldmap_legend_data.co2.values['1.72e-4'].txt = '< 1.72e-4 kg m-2 s-1';


// Data defining HOW is visualised
worldmap_legend_data = {
    sourcename: "ECCAD 2000 - 2019",
    sourcelink: "https://eccad3.sedoo.fr/",
    co2: {
        txt_title: 'Anthropogene CO2 Emissionen',
        txt_desc: 'Höhe der Anthropogenen CO2 Emissionen',
        txt_uknw: 'unbekannt',
        col: '0xAA00A5FF',
        scale: 1000000000000,
        calcmode: '<',
        values: {
            '1e-11': {
                col: '0x77930508',
                txt: 'Sehr niedrige CO2 Emissionen'
            },
            '1e-10': {
                col: '0x77fff836',
                txt: 'Niedrige CO2 Emissionen'
            },
            '1e-9': {
                col: '0x7742ff9b',
                txt: 'Mittlere CO2 Emissionen'
            },
            '1e-8': {
                col: '0x7700cafd',
                txt: 'Hohe CO2 Emissionen'
            },
            '1e-7': {
                col: '0x7700008c',
                txt: 'Sehr hohe CO2 Emissionen'
            }
        }
    }
};


// Data defining HOW is visualised (First try)
//worldmap_legend_data = {};
//worldmap_legend_data.co2 = {};
//worldmap_legend_data.co2.txt_title = 'Anthropogene CO2 Emissionen';
//worldmap_legend_data.co2.txt_desc = 'Höhe der Anthropogenen CO2 Emissionen';
//worldmap_legend_data.co2.txt_uknw = 'unbekannt';
//worldmap_legend_data.co2.col = '0xAA00A5FF';
//worldmap_legend_data.co2.scale = 1000000000000;
//worldmap_legend_data.co2.calcmode = '<';
//worldmap_legend_data.co2.values = {};
//worldmap_legend_data.co2.values['1e-11'] = {};
//worldmap_legend_data.co2.values['1e-11'].col = '0x77228B22';
//worldmap_legend_data.co2.values['1e-11'].txt = 'Niedrige CO2 Emissionen';
//worldmap_legend_data.co2.values['1e-10'] = {};
//worldmap_legend_data.co2.values['1e-10'].col = '0x7700FF00';
//worldmap_legend_data.co2.values['1e-10'].txt = 'Mittlere CO2 Emissionen';
//worldmap_legend_data.co2.values['1e-9'] = {};
//worldmap_legend_data.co2.values['1e-9'].col = '0xAA00A5FF';
//worldmap_legend_data.co2.values['1e-9'].txt = 'Hohe CO2 Emissionen';
//worldmap_legend_data.co2.values['1e-8'] = {};
//worldmap_legend_data.co2.values['1e-8'].col = '0xAA0000FF';
//worldmap_legend_data.co2.values['1e-8'].txt = 'Sehr hohe CO2 Emissionen';