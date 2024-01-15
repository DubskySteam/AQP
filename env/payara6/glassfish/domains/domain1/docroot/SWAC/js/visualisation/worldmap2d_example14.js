/* 
 * Configuration script for worldmap2d_example13
 */
window['worldmap2d_example14_options'] = {
    zoom: 17,
    datadescription: '#wordldmap2d_datadescription_example14',
    plugins: new Map()
};
window['worldmap2d_example14_options'].plugins.set('DataShowModal', {
    id: 'DataShowModal',
    active: true
});
window["DataShowModal_worldmap2d_example14_options"] = {
    attrsShown: ['measuredate', 'pm10', 'pm25', 'temperature','latitude'],
    attrsFormat: new Map()
};
// Formating instructions for values
window["DataShowModal_worldmap2d_example14_options"].attrsFormat.set('measuredate','datetime');

window["wordldmap2d_datadescription_example14_options"] = {
    visuAttribute: 'pm10'
};