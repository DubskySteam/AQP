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
    yield: '%voltage% * %current%',
    fillColor: '#000',
    borderColor: '#000',
    conColor: '#000'
});

window['Data_scheme_options'] = {
    datasouceattr: 'datasource',
    attrsShown: ['yield', 'voltage', 'current', 'temperature'],
    datareload: 5, // Time in seconds to auto update data
    datadescription: '#datadesc',
	attributeDefaults: new Map()
};

window['Data_scheme_options'].attributeDefaults.set('*', {
    yield: '%voltage% * %current%'
});
