/* 
 * Configuration script for worldmap_example9
 */
document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function (requestors) {
        // Get search and worldmap component
        let searchcomp = requestors['worldmap_search'].swac_comp;
        let worldmapcomp = requestors['worldmap'].swac_comp;
        // Register searchsources
        searchcomp.addSearchsource({
            type: 'SearchProviderGeoREST',
//        url: '/GeodataREST/geodataapi/geocoding/search?expression={expression}'
            url: 'https://nominatim.openstreetmap.org/search?q={expression}&format=geojson&addressdetails=1',
            geolocationComp: requestors['worldmap_geolocate'].swac_comp
        });

        // Register searchEntryMaker
        searchcomp.options.searchresultentrymakers[0] = new SearchEntryMakerGeoJson();
        searchcomp.options.searchresultentrymakers[0].setOnClickEventListener(Worldmap.onClickSearchResult);

        // Register search on worldmap
        worldmapcomp.options.searchComp = searchcomp;
    }, 'worldmap', 'worldmap_search', 'worldmap_geolocate');
});