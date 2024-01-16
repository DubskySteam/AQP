var explaincomponent_options = {
    componentName: 'Search'
};

// Example 1
search_example1_options = {
    searchsources: [
        {
            type: 'SearchProviderFile',
            url: '/SWAC/sites/{expression}.html'
        }
    ]
};

// Example 2
search_example2_options = {
    searchsources: [
        {
            type: 'SearchProviderRest',
            url: '/SWAC/data/search/search.json?query={expression}'
        }
    ]
};

// Example 3
search_example3_options = {
    searchsources: [
        {
            type: 'SearchProviderRest',
            url: '/SWAC/data/search/search.json?query={expression}'
        }
    ]
};

document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function (requestors) {
        // Get search component
        let searchcomp = requestors['search_example3'].swac_comp;
        // Register searchEntryMaker
        searchcomp.options.searchresultentrymakers = [];
        searchcomp.options.searchresultentrymakers[0] = new SearchEntryMakerDescription();
        // Name of the attribute that holds the title
        searchcomp.options.searchresultentrymakers[0].titleattr = 'title';
        // Name of the attribut that holds the description
        searchcomp.options.searchresultentrymakers[0].descattr = 'desc';
        // There are linkattr and linktitleattr too
    }, 'search_example3');
});

// Example 4
search_example4_options = {
    searchsources: [
        {
            type: 'SearchProviderRest',
            url: '/SWAC/data/search/search.json?query={expression}'
        }
    ],
    indexSearchsources: [
        {
            name: 'Example4SearchSource',
            type: 'SearchProviderRest',
            url: '/SWAC/data/search/{expression}.json',
            options: {
                minchars: 1
            }
        }
    ]
};

document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function (requestors) {
        // Get search component
        let searchcomp = requestors['search_example4'].swac_comp;
        // Register searchEntryMaker
        searchcomp.options.searchresultentrymakers = [];
        searchcomp.options.searchresultentrymakers[0] = new SearchEntryMakerTable();
        // Name of the attribute that holds the title
        searchcomp.options.searchresultentrymakers[0].titles = ['Title', 'Description', 'Category'];
        // Name of the attribut that holds the description
        searchcomp.options.searchresultentrymakers[0].attrs = ['title', 'desc', 'cat'];
        searchcomp.options.searchresultentrymakers[0].resulturl = 'result.html?id={id}';
        // There are linkattr and linktitleattr too
    }, 'search_example4');
});

// Example 5
search_example5_options = {
    searchsources: [
        {
            type: 'SearchProviderRest',
            url: '/SWAC/data/search/search.json?query={expression}'
        },
        {
            type: 'SearchProviderRest',
            url: '/SWAC/data/search/a.json?query={expression}'
        }
    ],
    indexSearchsources: [
        {
            type: 'SearchProviderRest',
            url: '/SWAC/data/search/{expression}.json',
            name: 'Obst',
            options: {
                minchars: 1
            }
        },
        {
            type: 'SearchProviderRest',
            url: '/SWAC/data/search/G_{expression}.json',
            name: 'Gemüse',
            options: {
                minchars: 1
            }
        }
    ]
};

document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function (requestors) {
        // Get search component
        let searchcomp = requestors['search_example5'].swac_comp;
        // Register searchEntryMaker
        searchcomp.options.searchresultentrymakers = [];
        searchcomp.options.searchresultentrymakers[0] = new SearchEntryMakerTable();
        // Name of the attribute that holds the title
        searchcomp.options.searchresultentrymakers[0].titles = ['Title', 'Description', 'Category'];
        // Name of the attribut that holds the description
        searchcomp.options.searchresultentrymakers[0].attrs = ['title', 'desc', 'cat'];
        searchcomp.options.searchresultentrymakers[0].resulturl = 'result.html?id={id}';
        // There are linkattr and linktitleattr too
    }, 'search_example5');
});

// Example 6
search_example6_options = {
    searchsources: [
        {
            type: 'SearchProviderRest',
            url: 'https://www.govdata.de/ckan/api/3/action/package_search?q={expression}'
        }
    ]
};
document.addEventListener('swac_components_complete', function () {
    window.swac.reactions.addReaction(function (requestors) {
        // Get search component
        let searchcomp = requestors['search_example6'].swac_comp;
        // Register searchEntryMaker
        searchcomp.options.searchresultentrymakers = [];
        searchcomp.options.searchresultentrymakers[0] = new SearchEntryMakerDatasource({
            nameAttrs: ['name','title'],        // Name of the attribute that holds the title
            descAttrs: ['description', 'desc'], // Name of the attribut that holds the description
            urlAttrs: ['url'],                  // Attribute names where to find the url
            knowntypesonly: false,               // Show results with unsupported file types, too
            importurl: '/SmartFile/smartfile/download?filespace=test&url=%url%&type=%type%',
            mapurl: '/SWAC/sites/visualisation/worldmap2d_example21.html?modelurl=%url%&type=%type%',
            listurl: '/SWAC/sites/visualisation/present_example10.html?url=%url%&type=%type%'
        });
    }, 'search_example6');
});