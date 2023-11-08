/* 
 * Configuration script for worldmap_example7
 */

var worldmap_options = {};
worldmap_options.model_zoomlevels = [];
window.onload = function (evt) {
    worldmap_options.model_zoomlevels[0] = {
        below: 5000,
        hidurl: '/GeodataREST/geodataapi/building/ids/listByViewport?northlimit={northlat}&southlimit={southlat}&eastlimit={eastlon}&westlimit={westlon}',
        modelurl: '/SWAC/data/worldmap_example8/{hid}.geojson',
        fillColor: 'yellow', // Default color of models (white if no setting is given)
        outlineColor: 'blue', // Default color of models border (black if no setting is given)
        outlineWidth: 10, // Width of the outline (10 if no setting is given)
        extrudeHeight: 10, // Default height of models
//        fillColorProperty: 'Coloring property name', // Property from data that should be used as color for the model
//        outlineColorProperty: 'Border coloring property name', // Property from data that should be used as color for the models outline
        extrudeHeightProperty: 'pv_wall', // Property from data that should be used for calculating the height
        datacaptionProperty: 'pv_wall', // Property from data that should be used for model caption
        datadescription: document.getElementById('worldmap_legend')
    };
    worldmap_options.model_zoomlevels[1] = {
        below: 400,
        hidurl: '/GeodataREST/geodataapi/building/ids/listByViewport?northlimit={northlat}&southlimit={southlat}&eastlimit={eastlon}&westlimit={westlon}',
        modelurl: '/SWAC/data/worldmap_example8/{hid}.glb',
        datadescription: document.getElementById('worldmap_legend')
    };
};

// Options defining WHAT is visualised
worldmap_legend_options = {};
worldmap_legend_options.visuAttribute = 'pv_wall';

worldmap_legend_data = {};
worldmap_legend_data.pv_wall = {};
worldmap_legend_data.pv_wall.txt_title = 'Wand-Photovoltaik';
worldmap_legend_data.pv_wall.txt_desc = 'Die Waende sind fuer Photovoltaik {voc}.';
worldmap_legend_data.pv_wall.txt_uknw = 'Es ist nicht bekannt, ob die Wände für Photovoltaik geeignet sind.';
worldmap_legend_data.pv_wall.values = {};
worldmap_legend_data.pv_wall.values['2'] = {};
worldmap_legend_data.pv_wall.values['2'].txt = 'gut geeignet';
worldmap_legend_data.pv_wall.values['2'].col = 'green';
worldmap_legend_data.pv_wall.values['1'] = {};
worldmap_legend_data.pv_wall.values['1'].txt = 'geeignet';
worldmap_legend_data.pv_wall.values['1'].col = 'yellow';
worldmap_legend_data.pv_wall.values['7'] = {};
worldmap_legend_data.pv_wall.values['7'].txt = 'bedingt geeignet';
worldmap_legend_data.pv_wall.values['7'].col = 'orange';
worldmap_legend_data.pv_wall.values['0'] = {};
worldmap_legend_data.pv_wall.values['0'].txt = 'ungeeignet';
worldmap_legend_data.pv_wall.values['0'].col = 'red';
worldmap_legend_data.pv_roof = {};
worldmap_legend_data.pv_roof.txt_title = 'Dach-Photovoltaik';
worldmap_legend_data.pv_roof.txt_desc = 'Das Dach ist fuer Photovoltaik {voc}.';
worldmap_legend_data.pv_roof.values = {};
worldmap_legend_data.pv_roof.values['2'] = {};
worldmap_legend_data.pv_roof.values['2'].txt = 'gut geeignet';
worldmap_legend_data.pv_roof.values['2'].col = 'green';
worldmap_legend_data.pv_roof.values['1'] = {};
worldmap_legend_data.pv_roof.values['1'].txt = 'geeignet';
worldmap_legend_data.pv_roof.values['1'].col = 'yellow';
worldmap_legend_data.pv_roof.values['7'] = {};
worldmap_legend_data.pv_roof.values['7'].txt = 'bedingt geeignet';
worldmap_legend_data.pv_roof.values['7'].col = 'orange';
worldmap_legend_data.pv_roof.values['0'] = {};
worldmap_legend_data.pv_roof.values['0'].txt = 'ungeeignet';
worldmap_legend_data.pv_roof.values['0'].col = 'red';
worldmap_legend_data.st_roof = {};
worldmap_legend_data.st_roof.txt_title = 'Dach-Solarthermie';
worldmap_legend_data.st_roof.txt_desc = 'Das Dach ist fuer Solarthermie {voc}.';
worldmap_legend_data.st_roof.values = {};
worldmap_legend_data.st_roof.values['2'] = {};
worldmap_legend_data.st_roof.values['2'].txt = 'gut geeignet';
worldmap_legend_data.st_roof.values['2'].col = 'green';
worldmap_legend_data.st_roof.values['1'] = {};
worldmap_legend_data.st_roof.values['1'].txt = 'geeignet';
worldmap_legend_data.st_roof.values['1'].col = 'yellow';
worldmap_legend_data.st_roof.values['7'] = {};
worldmap_legend_data.st_roof.values['7'].txt = 'bedingt geeignet';
worldmap_legend_data.st_roof.values['7'].col = 'orange';
worldmap_legend_data.st_roof.values['0'] = {};
worldmap_legend_data.st_roof.values['0'].txt = 'ungeeignet';
worldmap_legend_data.st_roof.values['0'].col = 'red';
worldmap_legend_data.st_wall = {};
worldmap_legend_data.st_wall.txt_title = 'Wand-Solarthermie';
worldmap_legend_data.st_wall.txt_desc = 'Die Waende sind fuer Solarthermie {voc}.';
worldmap_legend_data.st_wall.values = {};
worldmap_legend_data.st_wall.values['2'] = {};
worldmap_legend_data.st_wall.values['2'].txt = 'gut geeignet';
worldmap_legend_data.st_wall.values['2'].col = 'green';
worldmap_legend_data.st_wall.values['1'] = {};
worldmap_legend_data.st_wall.values['1'].txt = 'geeignet';
worldmap_legend_data.st_wall.values['1'].col = 'yellow';
worldmap_legend_data.st_wall.values['7'] = {};
worldmap_legend_data.st_wall.values['7'].txt = 'bedingt geeignet';
worldmap_legend_data.st_wall.values['7'].col = 'orange';
worldmap_legend_data.st_wall.values['0'] = {};
worldmap_legend_data.st_wall.values['0'].txt = 'ungeeignet';
worldmap_legend_data.st_wall.values['0'].col = 'red';
worldmap_legend_data.gd_roof = {};
worldmap_legend_data.gd_roof.txt_title = 'Gr&uuml;ndachnutzung';
worldmap_legend_data.gd_roof.txt_desc = 'Das Dach ist fuer die Gruendachnutzung {voc}.';
worldmap_legend_data.gd_roof.values = {};
worldmap_legend_data.gd_roof.values['2'] = {};
worldmap_legend_data.gd_roof.values['2'].txt = 'gut geeignet';
worldmap_legend_data.gd_roof.values['2'].col = 'green';
worldmap_legend_data.gd_roof.values['1'] = {};
worldmap_legend_data.gd_roof.values['1'].txt = 'geeignet';
worldmap_legend_data.gd_roof.values['1'].col = 'yellow';
worldmap_legend_data.gd_roof.values['7'] = {};
worldmap_legend_data.gd_roof.values['7'].txt = 'bedingt geeignet';
worldmap_legend_data.gd_roof.values['7'].col = 'orange';
worldmap_legend_data.gd_roof.values['0'] = {};
worldmap_legend_data.gd_roof.values['0'].txt = 'ungeeignet';
worldmap_legend_data.gd_roof.values['0'].col = 'red';