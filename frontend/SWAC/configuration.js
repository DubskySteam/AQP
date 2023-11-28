/* 
 * This is the main configuration file for SWAC documentation.
 * 
 * You should only change values in these file for your setup. No need to
 * modify other files.
 */

var SWAC_config = {
    lang: 'de',
    notifyDuration: 5000,
    offlineNotify: true,
    debugmode: true,
    debug: '',
    app_root: '/SWAC',
    globalparams: {
        exampleglobal: 2
    },
    startuptests: [
        //'/test.txt'
    ],
    datasources: [
        {
            url: "/SWAC/data/[fromName]"
        },
//        {
//            url: "/SmartData/smartdata/[iface]/[fromName]?storage=smartmonitoring",
//            interfaces: {
//                get: ['GET', 'records'],
//                list: ['GET', 'records'],
//                defs: ['GET', 'collection'],
//                create: ['POST', 'records'],
//                update: ['PUT', 'records'],
//                delete: ['DELETE', 'records']
//            }
//        },
//        {
//            //url: "/SmartMonitoringBackend/observedobject/[fromName]/[iface]",
//            url: "/SmartMonitoringBackend/smartmonitoring/[fromName]",
//            interfaces: {
//                get: ['GET','get'],
//                list: ['GET','list'],
//                defs: ["GET",'definition'],
//                create: ['POST','create'],
//                update: ['UPDATE','update'],
//                delete: ['DELETE','delete']
//            }
//        },
    ],
    corsavoidurl: 'http://localhost:8080/SmartFile/smartfile/file/download?filespace=map_pictures_Gewaesser&url=%url%',
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
            '/content/logo.avif',
            '/content/logo.png',
            '/content/logo.webp',
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
var user_options = {
    loginurl: 'localhost:8080/SmartUser/smartuser/user/performLogin',
    afterLoginLoc: '../sites/userinterface/account.html',
    afterLogoutLoc: '../sites/userinterface/login.html'
};
user_options.loggedinRedirects = new Map();
user_options.loggedinRedirects.set('user_example3.html', '../sites/user_example2.html');

// Links for footer navigation
var footerlinks = [
    {id: 1, rfrom: "*", rto: "datenschutz.html", name: "Datenschutzerklärung"},
    {id: 2, rfrom: "*", rto: "impressum.html", name: "Impressum"},
    {id: 3, rfrom: "*", rto: "haftung.html", name: "Haftungsausschluss"},
    {id: 4, rfrom: "*", rto: "http://git01-ifm-min.ad.fh-bielefeld.de/scl/2015_03_SCL_SmartMonitoring_Frontend/wikis/home", name: "Über SmartMonitoring"}
];

var swac_devhelper_options = {
    showNoDataInfo: false
};
