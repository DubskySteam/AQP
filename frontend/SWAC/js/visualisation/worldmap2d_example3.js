/* 
 * Configuration script for worldmap2d_example3
 */

var worldmap2d_example3_options = {
    zoom: 20,
    showTimedDataAtOnce: true,
    customMarkerOptions: {
        opacity: 0.5
    },
    userIcon: {
        iconUrl: '../../swac/libs/leaflet/images/marker_person.png',
        iconSize: [25, 50],
        iconAnchor: [12, 50],
        shadowSize: [60, 60],
        shadowAnchor: [20, 60],
        shadowUrl: '../../swac/libs/leaflet/images/marker-shadow.png',
    }

};
//add plugin to the worldmap2d component
worldmap2d_example3_options.plugins = new Map();
worldmap2d_example3_options.plugins.set('ToggleLatchOnLocation', {
    id: 'togglelatchonlocation',
    active: true
});
worldmap2d_example3_options.plugins.set('Help', {
    id: 'help',
    active: true
});

