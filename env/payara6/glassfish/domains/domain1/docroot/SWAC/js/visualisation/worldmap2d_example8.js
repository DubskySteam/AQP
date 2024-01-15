/* 
 * Configuration script for worldmap2d_example6
 */
var worldmap2d_example8_options = {
    zoom: 18,
    showTimedDataAtOnce: true,
    maxZoom: 18,
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
};
