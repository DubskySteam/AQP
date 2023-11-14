/* 
 * Configuration script for worldmap2d_example15
 */
window['worldmap2d_example17_options'] = {
    zoom: 17,
    datadescription: '#wordldmap2d_datadescription_example17',
    plugins: new Map()
};
window['worldmap2d_example17_options'].plugins.set('Timeline', {
    id: 'Timeline',
    active: true
});

window['Timeline_worldmap2d_example17_options'] = {
    tsAttr: 'measuredate', // Name of the attribute that contains time data
    startTS: new Date('2023-02-01T08:59:00'),   // Timepoint to start timeline with
    endTS: new Date('2023-02-01T09:15:00'),     // Timepoint to end timeline with
    animationStepSize: 60,                      // Every animation step is 60 seconds father
    animationSpeed: 1000,                       // Every second a new animation step
    animationTimeRange: 30                      // Show data from 30 seconds before and after the animation time point
};

// Formating instructions for values
window["wordldmap2d_datadescription_example17_options"] = {
    visuAttribute: 'pm10'
};