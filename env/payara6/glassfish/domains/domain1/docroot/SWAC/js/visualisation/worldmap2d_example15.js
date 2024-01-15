/* 
 * Configuration script for worldmap2d_example15
 */
window['worldmap2d_example15_options'] = {
    zoom: 17,
    plugins: new Map()
};
worldmap2d_example15_options.plugins.set('Timeline', {
    id: 'Timeline',
    active: true
});

window['Timeline_worldmap2d_example15_options'] = {
    tsAttr: 'measuredate' // Name of the attribute that contains time data
};