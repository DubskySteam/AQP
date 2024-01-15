/** 
 * Example Configuration for the WorldMap2D Component
 */
var objectmap_options = {
    startPointLon: 8.905, //intial longitude of the map
    startPointLat: 52.296, //intial latitude of the map
    zoom: 15, //intial zoom level of the map
    maxZoom: 18, //maximum zoom level of the map
    zoomControl: true, //show zoom control buttons from leaflet
    showTimedDataAtOnce: true,
    customMarkerOptions: {
        opacity: 1
    },
    clusterMarkers: true, //whether to cluster markers together when zoomed out
    idGeolocationComponent: 'worldmap_geolocate', // id of the geolocation component
    // customIconOptions: {
    //     iconSize: [60, 60],
    //     shadowUrl: '../../../SWAC/swac/libs/leaflet/images/marker-shadow.png',
    //     shadowSize: [60, 60],
    //     shadowAnchor: [20, 60],
    //     iconAnchor: [30, 56]
    // },
    // customIconVisited: { //the icon used for visited locations
    //     iconUrl: '../../../SWAC/swac/libs/leaflet/images/marker_icon_custom_visited.svg'
    // },
    // customIconUnvisited: { //the icon used for unvisited locations
    //     iconUrl: '../../../SWAC/swac/libs/leaflet/images/marker_icon_custom_unvisited.svg'
    // },
    // userIcon: { //the icon used for the location of the user
    //     iconUrl: '../../../SWAC/swac/libs/leaflet/images/marker_person.png',
    //     iconSize: [25, 50],
    //     iconAnchor: [12, 25]
    // },
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
        }]
    ]),
    allowAddModels: true
};


//add plugins to the worldmap2d component
objectmap_options.plugins = new Map();

/* Plugin >CreateMeasurementModal< opens when clicked on the map, and lets you create a new measuremt point */
objectmap_options.plugins.set('CreateMeasurementModal', {
    id: 'createmeasurementmodal',
    active: true,
})

/* Plugin >CreateMeasurementModal< options */
var createmeasurementmodal_objectmap_options = {
    datacapsuleLoad: objectmap_options.datasources.get('tbl_observedobject').datacapsule,
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
    }, 
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_createobject&filter=active,eq,true'
        }
    }
};

/* Plugin >FilterMeasurementPoints< can be used to filter the points on the map by their type */
objectmap_options.plugins.set('FilterMeasurementPoints', {
    id: 'filtermeasurementpoints',
    active: true
});

/* Plugin >FilterMeasuermentsPoints< options */
var filtermeasurementpoints_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_filter&filter=active,eq,true'
        }
    }
};

/* Plugin >Help< adds a help button to the map that shows a help modal */
objectmap_options.plugins.set('Help', {
    id: 'help',
    active: true 
});

/* Plugin >Help< options */
var help_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_help&filter=active,eq,true'
        }
    }
};

/* Plugin >InterfaceMagicMapper< adds an interface to interact with the MagicMapper */
objectmap_options.plugins.set('InterfaceMagicMapper', {
    id: 'interfacemagicmapper',
    active: true
});

/* Plugin >InterfaceMagicMapper< options */
var interfacemagicmapper_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_magicmapper&filter=active,eq,true'
        }
    }
}

/* Plugin >MapPinModal< shows all measured data and recorded photos for the mappin that was clicked on */
objectmap_options.plugins.set('MapPinModal', {
    id: 'mappinmodal',
    active: true
});

/* Plugin >MapPinModal< options */
var mappinmodal_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_objectdata&filter=active,eq,true'
        }
    },
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

/* Plugin >SearchPlaces< adds a small search box to jump fast to specific pionts instead of scrolling through the map*/
objectmap_options.plugins.set('SearchPlaces', {
    id: 'searchplaces',
    active: true,
});

/* Plugin >SearchPlaces< options */
var searchplaces_objectmap_options = {
    activeOn:  {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_search&filter=active,eq,true'
        }
    },
}

/* Plugin >ToggleClickInteractionButton< adds the toggle button to enable/disable all map interactions */
objectmap_options.plugins.set('ToggleClickInteractionButton', {
    id: 'toggleclickinteractionbutton',
    active: true,
});

/* Plugin >ToggleClickInteractionButton< options */
var toggleclickinteractionbutton_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_toggleclickinteraction&filter=active,eq,true'
        }
    }
}

/* Plugin >ToggleLatchOnLocation< adds the toggle button to enable/disable the latch on location feature */
objectmap_options.plugins.set('ToggleLatchOnLocation', {
    id: 'togglelatchonlocation',
    active: true
});

/* Plugin >ToggleLatchOnLocation< options */
var togglelatchonlocation_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_togglelatchonlocation&filter=active,eq,true'
        }
    }
};

/* Plugin >Navigation< displays routes to points on the map */
objectmap_options.plugins.set('Navigation', {
    id: 'navigation',
    active: true
})

/* Plugin >Navigation< options */
var navigation_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_navigation&filter=active,eq,true'
        }
    }
};

/* Plugin >Labels< adds labels to the map */
objectmap_options.plugins.set('Labels', {
    id: 'labels',
    active: true
});

/* Plugin >Labels< options */
var labels_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_labels&filter=active,eq,true'
        }
    },
    observedobjects: true
};