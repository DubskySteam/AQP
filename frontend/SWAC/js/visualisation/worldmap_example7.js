/* 
 * Configuration script for worldmap_example7
 */

var worldmap_options = {};
worldmap_options.datasources = [];

window.onload = function (evt) {
    worldmap_options.datasources[0] = {
        url: 'http://localhost:8080/SmartMonitoringBackend/data/getSets?ooid=3&limit=100',
        datadescription: document.getElementById('worldmap_legend')
    };
    worldmap_options.showTimedDataAtOnce = true;
};

// Options defining WHAT is visualised
worldmap_legend_options = {};
worldmap_legend_options.visuAttribute = null;

var worldmap_legend_data = {};
worldmap_legend_data.temperature = {};
worldmap_legend_data.temperature.txt_title = 'Temperatur';
worldmap_legend_data.temperature.txt_desc = 'Lufttemperatur';
worldmap_legend_data.temperature.col = '0xAA00A5FF';
worldmap_legend_data.temperature.minValue = -20;
worldmap_legend_data.temperature.maxValue = 80;
worldmap_legend_data.humidity = {};
worldmap_legend_data.humidity.txt_title = 'Luftfeuchtigkeit';
worldmap_legend_data.humidity.txt_desc = 'Luftfeuchtigkeit';
worldmap_legend_data.humidity.col = '0xAAFFFFFF';
worldmap_legend_data.humidity.minValue = 0;
worldmap_legend_data.humidity.maxValue = 100;
worldmap_legend_data.pressure = {};
worldmap_legend_data.pressure.txt_title = 'Luftdruck';
worldmap_legend_data.pressure.txt_desc = 'Luftdruck';
worldmap_legend_data.pressure.col = '0x7790EE90';
worldmap_legend_data.pressure.minValue = 500;
worldmap_legend_data.pressure.maxValue = 1500;