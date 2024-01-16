window['scheme_options'] = {
    showMenue: true,
    showScenegraph: false,
    initialZoom: 0.5,
    attributeDefaults: new Map(),
    plugins: new Map()
};
window['scheme_options'].plugins.set('Data', {
    id: 'Data',
    active: true
});
window['scheme_options'].attributeDefaults.set('visualmodel', {
    fillColor: '#000',
    borderColor: '#000',
    conColor: '#000'
});

window['Data_scheme_options'] = {
    datasouceattr: 'datasource',
    attrsShown: ['pm2_5','pm10_0','temp'],
    datareload: 5, // Time in seconds to auto update data
    datadescription: '#datadesc'
};


