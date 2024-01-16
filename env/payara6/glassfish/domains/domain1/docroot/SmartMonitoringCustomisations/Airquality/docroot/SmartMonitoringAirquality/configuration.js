/* 
 * This is the main configuration file for SmartMonitoring Frontend.
 * 
 * You should only change values in these file for your setup. No need to
 * modify other files.
 */

var SmartMonitoring = {
    version: '3.0 dev'
};

var baseurl = window.location.protocol + "//" + window.location.host;
var SWAC_config = {
    lang: 'de',
    notifyDuration: 5000,
    debugmode: false,
    debug: '',
    globalparams: {
        smartdataurlnenc: baseurl + '/SmartDataAirquality',
        smartdataurl: encodeURIComponent(baseurl) + '%2FSmartDataAirquality',
        measurefreq: 10
    },
    datasources: [
        {
            url: "/SmartDataAirquality/smartdata/[iface]/[fromName]?storage=smartmonitoring",
            interfaces: {
                get: ['GET', 'records'],
                list: ['GET', 'records'],
                defs: ['GET', 'collection'],
                create: ['POST', 'records'],
                update: ['PUT', 'records'],
                delete: ['DELETE', 'records']
            },
            exclude: ['observedobject/create', 'listParents', 'listChilds', 'listForObservedObject']
        },
        {
            url: "/SmartMonitoringBackendAirquality/smartmonitoring/[fromName]",
            interfaces: {
                get: ['GET', 'get'],
                list: ['GET', 'list'],
                defs: ["GET", 'definition'],
                create: ['POST', 'create'],
                update: ['UPDATE', 'update'],
                delete: ['DELETE', 'delete']
            }
        }
    ],
    progressive: {
        active: false,
        cachetimeout: 30, // Timeout in days after that a reload should be done or unused pages leave the cache
        precache: [
            // List files here that should be available offline for the user after first visit
            // All files here are noted with SWAC.config.app_root as base
            '/css/global.css',
            '/sites/login.html',
            '/css/login.css',
            '/sites/object/dashboard.html',
            '/sites/object/list.html',
            '/sites/object/view.html',
            // basic content (design pictures)
            '/content/favicon.png',
            '/content/loginbg.jpg',
            '/content/logo-fhbi.png',
            '/content/logo-ife.png',
            '/content/logo.avif',
            '/content/logo.png',
            '/content/logo.webp',
            '/content/projekt.avif',
            '/content/projekt.jpg',
            '/content/object/icons/.avif',
            '/content/object/icons/.png',
            // default data
            '/manifest.json',
            '/configuration.js'
        ],
        // List components here that should be precached
        components: [
            'Navigation'
        ]
    },
    onlinereactions: [
//    {
//      path: SWAC_config.swac_root + '/swac/components/Upload/UploadOnReact.js',
//      config: {}
//    }
    ]
};

/**
 * Options for swac_user component
 * Used on every page
 */
var userform_options = {
    loginURL: '/SmartUser/smartuser/user/performLogin',
    afterLogoutLoc: '../sites/login.html',
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_userlogin&filter=active,eq,true'
        }
    }
};
//user_options.loggedinRedirects = new Map();
//user_options.loggedinRedirects.set('user_example3.html','../sites/user_example2.html');

// Links for footer navigation
var footerlinks = [
    {id: 1, rfrom: "*", rto: "about/datenschutz.html", name: "Datenschutzerklärung"},
    {id: 2, rfrom: "*", rto: "about/impressum.html", name: "Impressum"},
    {id: 3, rfrom: "*", rto: "about/system.html", name: "SmartMonitoring"}
];

// Options for favourites
window['favs_options'] = {
    showFavIcon: true,
    showFavList: false,
    showHistList: false,
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_userfavs&filter=active,eq,true'
        }
    }
};