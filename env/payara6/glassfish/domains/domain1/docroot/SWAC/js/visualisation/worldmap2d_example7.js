/* 
 * Configuration script for worldmap2d_example7
 */
var worldmap2d_example7_options = {
    zoom: 18,
    plugins: new Map()
};
worldmap2d_example7_options.plugins.set('DataShowModal', {
    id: 'DataShowModal',
    active: true
});
window["DataShowModal_worldmap2d_example7_options"] = {
    attrsShown: ['measuredate', 'pm10', 'pm25', 'temperature'],
    attrsFormat: new Map()
};
window["DataShowModal_worldmap2d_example7_options"].attrsFormat.set('measuredate','datetime');