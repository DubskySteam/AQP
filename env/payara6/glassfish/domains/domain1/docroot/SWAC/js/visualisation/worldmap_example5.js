/* 
 * Configuration script for worldmap_example5
 */
document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function (requestors) {
        let worldmapComp = requestors['worldmap'].swac_comp;
        requestors['worldmap_geolocate'].swac_comp.options.onLocateFunctions[0] = worldmapComp.onUserLocation.bind(worldmapComp);
    }, 'worldmap', 'worldmap_geolocate');
});