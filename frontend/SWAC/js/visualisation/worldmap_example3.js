/* 
 * Configuration script for worldmap_example3
 */
var worldmap_options = {
    datasources: [
        {
            url: '../../data/worldmap/example3/stadtgebiet.geojson',
            fillColor: '0x67ADDFFF', // Default color of models (white if no setting is given)
            outlineColor: 'blue', // Default color of models border (black if no setting is given)
            outlineWidth: 10, // Width of the outline (1 if no setting is given)
            extrudeHeight: 0.1,
            zoomTo: false
        }, {
            url: '../../data/worldmap/example3/hausumringe.geojson',
            extrudeHeight: 15,
            zoomTo: false
        }
    ]
};