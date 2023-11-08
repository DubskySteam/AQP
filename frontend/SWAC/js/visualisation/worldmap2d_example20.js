/* 
 * Configuration script for worldmap2d_example20
 */

var worldmap2d_example20_options = {
    zoom: 9,
    showTimedDataAtOnce: true,
    startPointLat: 42.361145,
    startPointLon: -71.057083,
    modelFiles: [{
            url: '../../data/worldmap2d/shapefiles/congress.zip',
            name: 'CongressionalDistricts',
            type: 'shapefile'
    }],
    maxZoom: 25,
    plugins: new Map()
};

