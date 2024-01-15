/* 
 * Configuration script for worldmap2d_example13
 */
var worldmap2d_example13_options = {
    zoom: 18,
    plugins: new Map()
};
worldmap2d_example13_options.plugins.set('Navigation', {
    id: 'Navigation',
    active: true
});

window["Navigation_worldmap2d_example13_options"] = {
    createRouteFromData: true
};