/* 
 * Configuration script for worldmap2d_example6
 */

var worldmap2d_example19_options = {
    zoom: 10,
    showTimedDataAtOnce: true,
    maxZoom: 25,
    plugins: new Map(),
};
  
worldmap2d_example19_options.plugins.set('Navigation', {
    id: 'navigation',
    active: true
})
