/* 
 * Configuration script for worldmap_example4
 */

var worldmap_options = {};
worldmap_options.datasources = [];

window.onload = function (evt) {
    worldmap_options.datasources[0] = {
        url: '../data/worldmap/example4/thermischewirkungen.geojson',
        fillColor: 'yellow', // Default color of models (white if no setting is given)
        outlineColor: 'blue', // Default color of models border (black if no setting is given)
        outlineWidth: 10, // Width of the outline (1 if no setting is given)
        extrudeHeight: 10, // Default height of models
//        fillColorProperty: 'Coloring property name', // Property from data that should be used as color for the model
//        outlineColorProperty: 'Border coloring property name', // Property from data that should be used as color for the models outline
        extrudeHeightProperty: 'PHK_class', // Property from data that should be used for calculating the height
        datacaptionProperty: 'PHK_text', // Property from data that should be used for model caption
        datadescription: document.getElementById('worldmap_legend'),
        zoomTo: false
    };
};

// Options defining WHAT is visualised
worldmap_legend_options = {};
worldmap_legend_options.visuAttribute = 'PHK_class';
// Data defining HOW is visualised
worldmap_legend_data = {};
worldmap_legend_data.sourcename = "Land NRW 2018";
worldmap_legend_data.sourcelink = "https://www.opengeodata.nrw.de";
worldmap_legend_data.PHK_class = {};
worldmap_legend_data.PHK_class.txt_title = 'Thermische Ausgleischsfunktion';
worldmap_legend_data.PHK_class.txt_desc = 'Auswirkung der Flächen auf den thermischen Ausgleich';
worldmap_legend_data.PHK_class.txt_uknw = 'Die Auswirkung ist unbekannt';
worldmap_legend_data.PHK_class.values = {};
worldmap_legend_data.PHK_class.values['1'] = {};
worldmap_legend_data.PHK_class.values['1'].col = '0xAA00A5FF';
worldmap_legend_data.PHK_class.values['1'].txt = 'Siedlung: sehr günstige thermische Situation';
worldmap_legend_data.PHK_class.values['2'] = {};
worldmap_legend_data.PHK_class.values['2'].col = '0xAA4763FF';
worldmap_legend_data.PHK_class.values['2'].txt = 'Siedlung: günstige thermische Situation';
worldmap_legend_data.PHK_class.values['3'] = {};
worldmap_legend_data.PHK_class.values['3'].col = '0xAA8080F0';
worldmap_legend_data.PHK_class.values['3'].txt = 'Siedlung: weniger günstige thermische Situation';
worldmap_legend_data.PHK_class.values['4'] = {};
worldmap_legend_data.PHK_class.values['4'].col = '0xAA3C14DC';
worldmap_legend_data.PHK_class.values['4'].txt = 'Siedlung: ungünstige thermische Situation';
worldmap_legend_data.PHK_class.values['5'] = {};
worldmap_legend_data.PHK_class.values['5'].col = '0xAA0000FF';
worldmap_legend_data.PHK_class.values['5'].txt = 'Siedlung: sehr ungünstige thermische Situation';
worldmap_legend_data.PHK_class.values['6'] = {};
worldmap_legend_data.PHK_class.values['6'].col = '0x7700FF00';
worldmap_legend_data.PHK_class.values['6'].txt = 'Grünfläche: geringe thermische Ausgleichsfunktion';
worldmap_legend_data.PHK_class.values['7'] = {};
worldmap_legend_data.PHK_class.values['7'].col = '0x777CFC00';
worldmap_legend_data.PHK_class.values['7'].txt = 'Grünfläche: mittlere thermische Ausgleichsfunktion';
worldmap_legend_data.PHK_class.values['8'] = {};
worldmap_legend_data.PHK_class.values['8'].col = '0x7790EE90';
worldmap_legend_data.PHK_class.values['8'].txt = 'Grünfläche: hohe thermische Ausgleichsfunktion';
worldmap_legend_data.PHK_class.values['9'] = {};
worldmap_legend_data.PHK_class.values['9'].col = '0x77228B22';
worldmap_legend_data.PHK_class.values['9'].txt = 'Grünfläche: sehr hohe thermische Ausgleichsfunktion';
worldmap_legend_data.PHK_class.values['10'] = {};
worldmap_legend_data.PHK_class.values['10'].col = '0x77006400';
worldmap_legend_data.PHK_class.values['10'].txt = 'Grünfläche: höchste Ausgleichsfunktion';
