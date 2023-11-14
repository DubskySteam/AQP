// Definition of routes
var routes = [];
routes[0] = {id: 0, rfrom: "*", rto: "#", name: "How to start"};
routes[1] = {id: 1, rfrom: "*", rto: "sitemap.html", name: "Sitemap", parent: "ref://routes/0"};
routes[2] = {id: 2, rfrom: "*", rto: "samplepage.html", name: "Sample page", parent: "ref://routes/0"};

routes[20] = {id: 20, rfrom: "*", rto: "#", name: "Predefined pages"};
routes[21] = {id: 21, rfrom: "*", rto: "index.html", name: "Startpage", parent: "ref://routes/20"};
routes[22] = {id: 22, rfrom: "*", rto: "about/imprint.html", name: "Imprint", parent: "ref://routes/20"};
routes[23] = {id: 23, rfrom: "*", rto: "about/privacy.html", name: "Privacy policy", parent: "ref://routes/20"};
