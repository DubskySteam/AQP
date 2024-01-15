var misschart_options = {
    viewSetAttributes: 'missingentries,availableentries',
    xAxisAttrName: 'name',
    yAxis1AttrName: 'value',
    datadescription: '#misschart_legend'
};
misschart_options.plugins = new Map();
misschart_options.plugins.set('Piechart', {
    id: 'Piechart',
    active: true
});

// Options defining WHAT is visualised
var misschart_legend_options = {
    visuAttribute: 'name',
    showLegend: false
};
// Data defining HOW is visualised
misschart_legend_data = {};
misschart_legend_data.name = {};
misschart_legend_data.name.txt_title = 'Data attribute name';
misschart_legend_data.name.txt_desc = 'The name of the data';
misschart_legend_data.name.txt_uknw = 'Unkown value';
misschart_legend_data.name.values = {};
misschart_legend_data.name.values['missingentries'] = {};
misschart_legend_data.name.values['missingentries'].txt = 'Fehlende';
misschart_legend_data.name.values['missingentries'].col = 'red';
misschart_legend_data.name.values['availableentries'] = {};
misschart_legend_data.name.values['availableentries'].txt = 'Vorhandene';
misschart_legend_data.name.values['availableentries'].col = 'green';
