/* 
 * Configuration script for worldmap2d_example4
 */

var worldmap2d_example4_options = {
    zoom: 18,
    showTimedDataAtOnce: true,
    maxZoom: 18
};


//add plugin to the worldmap2d component
worldmap2d_example4_options.plugins = new Map();
worldmap2d_example4_options.plugins.set('SearchPlaces', {
    id: 'searchplaces',
    active: true
});
worldmap2d_example4_options.plugins.set('Help', {
    id: 'help',
    active: true
});
