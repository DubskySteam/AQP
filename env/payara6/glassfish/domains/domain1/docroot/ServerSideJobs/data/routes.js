// Definition of routes
var routes = [];
routes[0] = {id: 0, rfrom: "*", rto: "#", name: "Server Side Jobs:"};
routes[1] = {id: 1, rfrom: "*", rto: "index.html", name: "Dashboard", parent: "ref://routes/0"};
routes[2] = {id: 2, rfrom: "*", rto: "jobs.html", name: "Jobs", parent: "ref://routes/0"};
routes[3] = {id: 3, rfrom: "*", rto: "logs.html", name: "Logs", parent: "ref://routes/0"};
