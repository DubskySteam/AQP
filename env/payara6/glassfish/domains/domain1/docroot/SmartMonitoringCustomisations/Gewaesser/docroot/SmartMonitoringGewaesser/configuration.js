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
    debugmode: true,
    debug: '',
    globalparams: {
        smartdataurlnenc: baseurl + '/SmartDataGewaesser',
        smartdataurl: encodeURIComponent(baseurl) + '%2FSmartDataGewaesser',
        measurefreq: 10
    },
    datasources: [
        {
            url: "/SmartDataGewaesser/smartdata/[iface]/[fromName]?storage=smartmonitoring",
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
            url: "/SmartMonitoringBackendGewaesser/smartmonitoring/[fromName]",
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
            '/sites/index.html',
            '/css/index.css',
            // basic content (design pictures)
            '/content/logo.png',
            // default data
            '/manifest.json',
            '/configuration.js',
            '/data/routes.json'
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