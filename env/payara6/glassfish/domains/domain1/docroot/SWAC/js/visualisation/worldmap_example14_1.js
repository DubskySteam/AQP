/* 
 * Configuration script for worldmap_example4
 */

var worldmap_options = {
    showTimedDataAtOnce: true
};
worldmap_options.datasources = [];

window.onload = function (evt) {
    worldmap_options.datasources[0] = {
        url: '../data/worldmap/example14_1/sealing.json',
        latattr: 'point_y',// Name of the attribute that stores the latitude information
        lonattr: 'point_x', // Name of the attribute that stores the longitude information
        heightattr: null, // Name of the attribute that stores the height information (null is default, clamps to ground)
        datasetOffsetLat: 0, // This is the default value
        datasetOffsetLon: 0, // This is the default value
        datasetOffsetHeight: 100,
        excludeAttrs: ['id'], // This is the default value
        displayKind: 'rect',
        displayRadius: 20,
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
worldmap_legend_options.visuAttribute = 'sealing';
// Data defining HOW is visualised
worldmap_legend_data = {};
worldmap_legend_data.sourcename = "European Environment Agency (EEA)(2015)";
worldmap_legend_data.sourcelink = "https://land.copernicus.eu/pan-european/high-resolution-layers/imperviousness/status-maps/2015";
worldmap_legend_data.sealing = {};
worldmap_legend_data.sealing.txt_title = 'Flächenversiegelung';
worldmap_legend_data.sealing.txt_desc = 'Grad der Flächenversiegelung';
worldmap_legend_data.sealing.txt_uknw = 'unbekannt';
worldmap_legend_data.sealing.col = '0xAA00A5FF';
worldmap_legend_data.sealing.scale = 1;
worldmap_legend_data.sealing.calcmode = '<';
worldmap_legend_data.sealing.values = {};
worldmap_legend_data.sealing.values['20'] = {};
worldmap_legend_data.sealing.values['20'].col = '0x77228B22';
worldmap_legend_data.sealing.values['20'].txt = '< 20%';
worldmap_legend_data.sealing.values['40'] = {};
worldmap_legend_data.sealing.values['40'].col = '0x7700FF00';
worldmap_legend_data.sealing.values['40'].txt = '20% - 40%';
worldmap_legend_data.sealing.values['60'] = {};
worldmap_legend_data.sealing.values['60'].col = '0x7742ff9b';
worldmap_legend_data.sealing.values['60'].txt = '40% - 60%';
worldmap_legend_data.sealing.values['80'] = {};
worldmap_legend_data.sealing.values['80'].col = '0x7700A5FF';
worldmap_legend_data.sealing.values['80'].txt = '60% - 80%';
worldmap_legend_data.sealing.values['101'] = {};
worldmap_legend_data.sealing.values['101'].col = '0x770000FF';
worldmap_legend_data.sealing.values['101'].txt = '> 80%';
