/* 
 * Configuration script for worldmap_example10
 */

var worldmap_options = {};
worldmap_options.plugins = new Map();
worldmap_options.plugins.set('modelmenue', {
    id: 'modelmenue',
    active: true
});
window.onload = function (evt) {
    worldmap_options.datasources = [];
    worldmap_options.datasources[0] = {
        url: '../data/worldmap/example6/house.glb',
        fillColor: '0x67ADDFFF', // Default color of models (white if no setting is given)
        outlineColor: 'blue', // Default color of models border (black if no setting is given)
        outlineWidth: 10, // Width of the outline (1 if no setting is given)
        extrudeHeight: 0.1,
        datadescription: document.getElementById('worldmap_legend'),
        zoomTo: true
    };
};

// Options defining WHAT is visualised
worldmap_legend_options = {};
worldmap_legend_options.visuAttribute = 'pv_wall';

worldmap_legend_data = {};
worldmap_legend_data.pv_wall = {};
worldmap_legend_data.pv_wall.txt_title = 'Wand-Photovoltaik';
worldmap_legend_data.pv_wall.txt_desc = 'Die Wände sind fuer Photovoltaik:';
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