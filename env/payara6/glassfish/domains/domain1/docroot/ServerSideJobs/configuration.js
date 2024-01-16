var SWAC_config = {
    lang: 'de',
    notifyDuration: 5000,
    debugmode: true,
    debug: '',
    globalparams: {
        exampleglobal: 2
    },
    datasources: [
        {
            url: "/ServerSideJobsBackend/serversidejobs/[fromName]"
        },
//    {
//        url: "/SmartMonitoringBackend/observedobject/[fromName]/[iface]",
//        interfaces: {
//            get: ['GET','get'],
//            list: ['GET','list'],
//            defs: ["GET",'definition'],
//            create: ['POST','create'],
//            update: ['UPDATE','update'],
//            delete: ['DELETE','delete']
//        }
//    }
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
            '/data/routes.js'
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
    mode: 'form',
    loginurl: '../data/user/exampleuserdata.json',
    afterLoginLoc: '../sites/user_example1.html',
    afterLogoutLoc: '../sites/user.html'
};
user_options.loggedinRedirects = new Map();
user_options.loggedinRedirects.set('user_example3.html', '../sites/user_example2.html');

/**
 * Links for footer navigation
 */
var footerlinks = [];
footerlinks[0] = {id: 1, rfrom: "*", rto: "datenschutz.html", name: "Datenschutzerklärung"};
footerlinks[1] = {id: 2, rfrom: "*", rto: "impressum.html", name: "Impressum"};
footerlinks[2] = {id: 3, rfrom: "*", rto: "haftung.html", name: "Haftungsausschluss"};
footerlinks[3] = {id: 4, rfrom: "*", rto: "http://git01-ifm-min.ad.fh-bielefeld.de/scl/2015_03_SCL_SmartMonitoring_Frontend/wikis/home", name: "Über SmartMonitoring"};
