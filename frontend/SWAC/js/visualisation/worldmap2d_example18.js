/* 
 * Configuration script for worldmap2d_example18
 */

var worldmap2d_example18_options = {
    datasources: new Map([
        ['tbl_observedobject', {
            datacapsule: {
                fromName: 'tbl_observedobject',
                fromWheres: {
                    join: 'tbl_location_join_oo,tbl_location',
                },
            },
            latitudeAttr: 'tbl_location[0].coordinates.coordinates[0]',
            longitudeAttr: 'tbl_location[0].coordinates.coordinates[1]',
        }],
    ]),
    zoom: 18,
    showTimedDataAtOnce: true,
    clusterMarkers: true,
    maxZoom: 18,
};


//add plugin to the worldmap2d component
worldmap2d_example18_options.plugins = new Map();
worldmap2d_example18_options.plugins.set('ToggleClickInteractionButton', {
    id: 'toggleclickinteractionbutton',
    active: true
});

worldmap2d_example18_options.plugins.set('Help', {
    id: 'help',
    active: true
});

