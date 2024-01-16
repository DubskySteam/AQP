/* 
 * Configuration script for worldmap_example2 includeing data from worldmap ion
 */

var worldmap_options = {};
worldmap_options.plugins = new Map();
worldmap_options.plugins.set('modelmenue', {
    id: 'modelmenue',
    active: true
});
//worldmap_options.ionAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJhMzJiZjEzOS05ZWI0LTRhMzEtOGQyZC05ZGQzYzIwY2EzMDIiLCJpZCI6MTUxNSwiaWF0IjoxNTI4ODA0Mzg1fQ.xHuoWaJsRIuvXJ7_-bxVoGVxDgilCddv0jz8ajltRNI';
//worldmap_options.ionassets = [];
//worldmap_options.ionassets[0] = 19199;

worldmap_options.datasources = [];
window.onload = function (evt) {
    worldmap_options.datasources[0] = {
        url: '../data/worldmap/example11/3dhouse.geojson',
        fillColor: '0x67ADDFFF', // Default color of models (white if no setting is given)
        outlineColor: 'black', // Default color of models border (black if no setting is given)
        outlineWidth: 1, // Width of the outline (1 if no setting is given)
        zoomTo: false,
        datacaptionProperty: 'globalc', // Property from data that should be used for model caption
        datadescription: document.getElementById('worldmap_legend')
    };
//    worldmap_options.datasources[1] = {
//        url: '../data/worldmap_example11-2.geojson',
//        fillColor: '0x67ADDFFF', // Default color of models (white if no setting is given)
//        outlineColor: 'black', // Default color of models border (black if no setting is given)
//        outlineWidth: 1, // Width of the outline (1 if no setting is given)
//        zoomTo: false,
//        datacaptionProperty: 'globalc', // Property from data that should be used for model caption
//        datadescription: document.getElementById('worldmap_legend')
//    };
//    worldmap_options.datasources[2] = {
//        url: '../data/worldmap_example11-3.geojson',
//        fillColor: '0x67ADDFFF', // Default color of models (white if no setting is given)
//        outlineColor: 'black', // Default color of models border (black if no setting is given)
//        outlineWidth: 1, // Width of the outline (1 if no setting is given)
//        zoomTo: false,
//        datacaptionProperty: 'globalc', // Property from data that should be used for model caption
//        datadescription: document.getElementById('worldmap_legend')
//    };
};

// Options defining WHAT is visualised
worldmap_legend_options = {};
worldmap_legend_options.visuAttribute = 'globalc';
// Data defining HOW is visualised
worldmap_legend_data = {};
worldmap_legend_data.globalc = {};
worldmap_legend_data.globalc.txt_title = 'Einstrahlungsklassen';
worldmap_legend_data.globalc.txt_desc = 'Flächen mit solarer Einstrahlung';
worldmap_legend_data.globalc.txt_uknw = 'Keine Berechnung vorhanden';
worldmap_legend_data.globalc.values = {};
worldmap_legend_data.globalc.values['100'] = {};
worldmap_legend_data.globalc.values['100'].col = '0xFF00008B';
worldmap_legend_data.globalc.values['100'].txt = 'Einstrahlungsklasse: 100';
worldmap_legend_data.globalc.values['100'].desc = '100';
worldmap_legend_data.globalc.values['200'] = {};
worldmap_legend_data.globalc.values['200'].col = '0xFF0000FF';
worldmap_legend_data.globalc.values['200'].txt = 'Einstrahlungsklasse: 200 ';
worldmap_legend_data.globalc.values['200'].desc = '200';
worldmap_legend_data.globalc.values['300'] = {};
worldmap_legend_data.globalc.values['300'].col = '0xFF0045FF';
worldmap_legend_data.globalc.values['300'].txt = 'Einstrahlungsklasse: 300';
worldmap_legend_data.globalc.values['300'].desc = '300';
worldmap_legend_data.globalc.values['400'] = {};
worldmap_legend_data.globalc.values['400'].col = '0xFF008CFF';
worldmap_legend_data.globalc.values['400'].txt = 'Einstrahlungsklasse: 400';
worldmap_legend_data.globalc.values['400'].desc = '400';
worldmap_legend_data.globalc.values['500'] = {};
worldmap_legend_data.globalc.values['500'].col = '0xFF00FFFF';
worldmap_legend_data.globalc.values['500'].txt = 'Einstrahlungsklasse: 500';
worldmap_legend_data.globalc.values['500'].desc = '500';
worldmap_legend_data.globalc.values['600'] = {};
worldmap_legend_data.globalc.values['600'].col = '0xFF8CE6F0';
worldmap_legend_data.globalc.values['600'].txt = 'Einstrahlungsklasse; 600';
worldmap_legend_data.globalc.values['600'].desc = '600';
worldmap_legend_data.globalc.values['700'] = {};
worldmap_legend_data.globalc.values['700'].col = '0xFF90EE90';
worldmap_legend_data.globalc.values['700'].txt = 'Einstrahlungsklasse: 700';
worldmap_legend_data.globalc.values['700'].desc = '700';
worldmap_legend_data.globalc.values['800'] = {};
worldmap_legend_data.globalc.values['800'].col = '0xFF7CFC00';
worldmap_legend_data.globalc.values['800'].txt = 'Einstrahlungsklasse: 800';
worldmap_legend_data.globalc.values['800'].desc = '800';
worldmap_legend_data.globalc.values['900'] = {};
worldmap_legend_data.globalc.values['900'].col = '0xFF00FF00';
worldmap_legend_data.globalc.values['900'].txt = 'Einstrahlungsklasse: 900';
worldmap_legend_data.globalc.values['900'].desc = '900';
worldmap_legend_data.globalc.values['1000'] = {};
worldmap_legend_data.globalc.values['1000'].col = '0xFF228B22';
worldmap_legend_data.globalc.values['1000'].txt = 'Einstrahlungsklasse: 1000';
worldmap_legend_data.globalc.values['1000'].desc = '1000';
worldmap_legend_data.globalc.values['1100'] = {};
worldmap_legend_data.globalc.values['1100'].col = '0xFF006400';
worldmap_legend_data.globalc.values['1100'].txt = 'Einstrahlungsklasse: 1100';
worldmap_legend_data.globalc.values['1100'].desc = '1100';