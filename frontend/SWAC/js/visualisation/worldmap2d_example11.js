/* 
 * Configuration script for worldmap2d_example11
 */

var worldmap2d_example11_options = {
    zoom: 18,
    showTimedDataAtOnce: true,
    latchOnLocation: true,
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

    clusterMarkers: true,
    maxZoom: 18
};


//add plugin to the worldmap2d component
worldmap2d_example11_options.plugins = new Map();
worldmap2d_example11_options.plugins.set('ToggleClickInteractionButton', {
    id: 'toggleclickinteractionbutton',
    active: true
});
worldmap2d_example11_options.plugins.set('CreateMeasurementModal', {
    id: 'createmeasurementmodal',
    active: true
});

var createmeasurementmodal_worldmap2d_example11_options = {
    datacapsuleLoad: worldmap2d_example11_options.datasources.get('tbl_observedobject').datacapsule,
    createOoWithLocation: {
        fromName: 'observedobject/createWithLocation',
        responseIdAttr: 'ooId',
        ooName: 'ooName',
        ooDescription: 'ooDescription',
        ooType: 'ooType',
        ooCompleted: 'ooCompleted',
        ooCollection: 'ooCollection',
        locLatitude: 'locLatitude',
        locLongitude: 'locLongitude',
        locName: 'locName',
        locDescription: 'locDescription',
    }
}

worldmap2d_example11_options.plugins.set('MapPinModal', {
    id: 'mappinmodal',
    active: true
});

var mappinmodal_worldmap2d_example11_options = {
    table_names : {
        locations_table: {
            table_name: 'tbl_location',
            idAttr: 'id',
            geojsonattr: 'coordinates',
        },
        oo_table: {
            table_name: 'tbl_observedobject',
            idAttr: 'id',
            completed: 'completed',
        },
        file_table: {
            table_name: 'tbl_file',
            idAttr: 'id'
        },
        file_join_oo_table: {
            table_name: 'tbl_file_join_oo',
            idAttr: 'id',
            file_id: 'file_id',
            oo_id: 'oo_id'
        },
        uploadfile_options : {
            uploadTargetURL: '/SmartFile/smartfile/file/map_pictures_Gewaesser',
            docroot: '../../../'
        }
    },
}


worldmap2d_example11_options.plugins.set('InterfaceMagicMapper', {
    id: 'interfacemagicmapper',
    active: true
});

worldmap2d_example11_options.plugins.set('ToggleLatchOnLocation', {
    id: 'togglelatchonlocation',
    active: true
});

worldmap2d_example11_options.plugins.set('Help', {
    id: 'help',
    active: true
});
