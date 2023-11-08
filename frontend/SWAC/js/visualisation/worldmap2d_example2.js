/* 
 * Configuration script for worldmap2d_example2
 */
var worldmap2d_example2_options = {
    modelFiles: [
        {
            url: '../../data/worldmap/example3/stadtgebiet.geojson',
            name: 'Stadtgebiet Bielefeld',
            fillColor: '0x67ADDFFF', // Default color of models (white if no setting is given)
            outlineColor: 'blue', // Default color of models border (black if no setting is given)
            outlineWidth: 2, // Width of the outline (1 if no setting is given)
            zoomTo: true
        },
        {
            url: '../../data/worldmap/example3/hausumringe.geojson',
            name: 'Hausumrine Sennestadt',
            zoomTo: false
        }
    ]
};
