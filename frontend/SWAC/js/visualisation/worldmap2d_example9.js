/* 
 * Configuration script for worldmap2d_example9
 */

var worldmap2d_example9_options = {
    zoom: 20,
    showTimedDataAtOnce: true,
    customMarkerOptions: {
        opacity: 0.5
    },
    customIconOptions: {
        iconSize: [60, 60],
        shadowUrl: '../../swac/libs/leaflet/images/marker-shadow.png',
        shadowSize: [60, 60],
        shadowAnchor: [20, 60],
        iconAnchor: [30, 56]
    },
    customIconVisited: {
        iconUrl: '../../swac/libs/leaflet/images/marker_icon_custom_visited.svg'
    },
    customIconUnvisited: {
        iconUrl: '../../swac/libs/leaflet/images/marker_icon_custom_unvisited.svg'
    },
    clusterMarkers: true,
    maxZoom: 18,

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
        location_join_oo_table: {
            table_name: 'tbl_location_join_oo',
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
        createOoWithLocation: {
            table_name: 'observedobject/createWithLocation',
            ooName: 'ooName',
            ooDescription: 'ooDescription',
            ooType: 'ooType',
            ooCompleted: 'ooCompleted',
            ooCollection: 'ooCollection',
            locLatitude: 'locLatitude',
            locLongitude: 'locLongitude',
            locName: 'locName',
            locDescription: 'locDescription'
        },
        uploadfile_options : {
            uploadTargetURL: '/SmartFile/smartfile/file/map_pictures_Gewaesser',
            docroot: '../../../'
        }
    }

};

worldmap2d_example9_options.plugins = new Map();
worldmap2d_example9_options.plugins.set('FilterMeasurementPoints', {
    id: 'filtermeasurementpoints',
    active: true
});
worldmap2d_example9_options.plugins.set('Help', {
    id: 'help',
    active: true
});




