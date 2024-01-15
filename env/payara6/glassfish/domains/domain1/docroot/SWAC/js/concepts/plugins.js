// Activate the Sample component and its sample plugin
window['sample_plugin_1_options'] = {
    plugins: new Map()
};
window['sample_plugin_1_options'].plugins.set('SamplePlugin', {
    id: 'SamplePlugin',
    active: true
});

// Activate the plugin again and set the plugins option to show modal
window['sample_plugin_2_options'] = {
    plugins: new Map()
};
window['sample_plugin_2_options'].plugins.set('SamplePlugin', {
    id: 'SamplePlugin',
    active: true
});
// Setting plugins options
window['SamplePlugin_sample_plugin_2_options'] = {
    modaloption: true
};