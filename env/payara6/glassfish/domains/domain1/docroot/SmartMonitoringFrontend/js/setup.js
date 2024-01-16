/**
 * Scripts for the about-page. This getting system infos for display.
 */

var setup = {};
setup.systemdata = {};
setup.objectlist_complete = false;
setup.systemdata_complete = false;
setup.searchDevicesInterval = null;

/**
 * Handler for failed api checkup
 */
$(document).on('swac_apicheckup_failed', function () {
    if (remoteHandler.apistatus === 404) {
        let statusinfoElem = document.getElementById("statusinfo");
        let statusheadline = statusinfoElem.querySelector("h1");
        statusheadline.innerHTML = 'Server erreichbar. Wir warten auf das Backend ...';
        UIkit.modal.dialog(
                SWAC_language.remote.backendnotready,
                {
                    bgClose: false,
                    escClose: false
                }
        );
    } else {
        UIkit.modal.dialog(
                SWAC_language.remote.backenderror,
                {
                    bgClose: false,
                    escClose: false
                }
        );
    }
});

/**
 * Executed when api is ready configured
 */
$(document).on('swac_apicheckup_succseeded', function () {
    let setupIsSet;
    var querydata = {
    };
    // check if the setup is already finished
    remoteHandler.fetchGet("records/tbl_setup?filter=name,eq,setup&storage=smartmonitoring", querydata, true).then(function (json) {
        setupIsSet = json.records[0].value;
        if (setupIsSet) {
            // setup is already finished
            setup.isFinished();
        } else {
            // the dataset was not found or the value is false => setup is not finished
            setup.isNotFinished();
        }
    }).catch(function () {
        // the table was not found => setup is not finished
        setup.isNotFinished();
    });
});

/**
 * Calls if the setup is already finished
 * @returns {undefined}
 */
setup.isFinished = function () {
    let statusinfoElem = document.getElementById("statusinfo");
    let statusspan = statusinfoElem.querySelector("span");
    statusinfoElem.removeChild(statusspan);
    let statusheadline = statusinfoElem.querySelector("h1");
    statusheadline.innerHTML = "<h1>Das Setup wurde bereits abgeschlossen.</h1>";
    let subinfo = document.createElement("h2");
    subinfo.innerHTML = "Verwenden Sie die Administrationsoberfläche um Einstellungen zu ändern.";
    statusinfoElem.appendChild(subinfo);
};

/**
 * Calls if the setup is not finished yet
 * @returns {undefined}
 */
setup.isNotFinished = function () {
    // Start clock
    setInterval(setup.updateClock, 1000);
    // Open setup dialog
    let setupElem1 = document.getElementById("modal-group-1");
    UIkit.modal(setupElem1).show();
    setup.performGetSystemInformations();
    let finishButton = document.getElementById('finishSetup');
    finishButton.addEventListener("click", setup.finishSetup, false);
    let installTemplatesBtn = document.getElementById('installTemplates');
    installTemplatesBtn.addEventListener("click", setup.installAllTemplates, false);
    let installObjectBtn = document.getElementById('installObject');
    installObjectBtn.addEventListener("click", setup.installObject, false);
    let statusinfoElem = document.getElementById("statusinfo");
    statusinfoElem.innerHTML = '';
    // create the location table
    // must be created once before entering the data
    // get the attributes for the table
    var querydata = {
    };
    remoteHandler.fetchGet("../data/templates/Location/tbl_location_attributes.json", querydata, false).then(function (attributes) {
        // create the table
        remoteHandler.fetchPost("collection/tbl_location?storage=smartmonitoring", attributes, false).catch(function (error) {
            if (error.status !== 304) {
                UIkit.notification({
                    message: 'Die Tabelle tbl_location konnte nicht angelegt werden. ' + error,
                    timeout: SWAC_config.notifyDuration,
                    pos: 'top-center',
                    status: 'error'
                });
            }
        });
    });
};

$(document).on('swac_objectlist_complete', function () {
    setup.objectlist_complete = true;
});

/**
 * Updates the clock
 * @returns {undefined}
 */
setup.updateClock = function () {
    var stunden, minuten, sekunden;
    var StundenZahl, MinutenZahl, SekundenZahl;
    var heute;

    heute = new Date();
    StundenZahl = heute.getHours();
    MinutenZahl = heute.getMinutes();
    SekundenZahl = heute.getSeconds();

    stunden = StundenZahl + ":";
    if (MinutenZahl < 10) {
        minuten = "0" + MinutenZahl + ":";
    } else {
        minuten = MinutenZahl + ":";
    }
    if (SekundenZahl < 10) {
        sekunden = "0" + SekundenZahl + " ";
    } else {
        sekunden = SekundenZahl + " ";
    }
    let zeit = stunden + minuten + sekunden + " Uhr";
    document.getElementById('clock').innerHTML = zeit;
};

/**
 * Get systeminfos from REST interface.
 * 
 * @returns {undefined}
 */
setup.performGetSystemInformations = function () {
    var querydata = {
    };
    remoteHandler.fetchGet("system/info", querydata, false).then(
        setup.performGetSystemInformationsCallback
    );
};

/**
 * Inserts the data from system information on page
 * 
 * @param {type} data
 * @returns {undefined}
 */
setup.performGetSystemInformationsCallback = function (data) {
    setup.systemdata = data;
    setup.systemdata_complete = true;

    // Check internet connectivity
    let icElem = document.querySelector("#internetConnectivity");
    if (data.internetConnectivity === true) {
        icElem.setAttribute('uk-icon', 'check');
    } else {
        icElem.setAttribute('style', 'color: red');
        icElem.setAttribute('uk-icon', 'close');
    }

    let mcElem = document.querySelector('#masterConnecticity');
    let httpsElem = document.querySelector('#httpsSupported');
    if (typeof data.masterURL !== 'undefined' && data.masterURL !== null && data.masterURL !== '') {
        // Check master connectivity
        if (data.masterConnecticity === true) {
            mcElem.setAttribute('uk-icon', 'check');
        } else {
            mcElem.setAttribute('style', 'color: red');
            mcElem.setAttribute('uk-icon', 'close');
        }

        if (data.httpsSupported === true) {
            httpsElem.setAttribute('uk-icon', 'check');
        } else {
            httpsElem.setAttribute('style', 'color: red');
            httpsElem.setAttribute('uk-icon', 'close');
        }
    } else {
        // Remove not needed page elements
        mcElem.parentNode.parentNode.parentNode.removeChild(mcElem.parentNode.parentNode);
        httpsElem.parentNode.parentNode.parentNode.removeChild(httpsElem.parentNode.parentNode);
        let reciverElem = document.getElementById("datareciver");
        reciverElem.parentNode.removeChild(reciverElem);
    }

    // Check automatic device creation option
    let adcElem = document.querySelector('#deviceAutomaticCreation');
    if (data.deviceAutomaticCreation === 'true') {
        adcElem.setAttribute('uk-icon', 'check');
    } else {
        adcElem.setAttribute('style', 'color: red');
        adcElem.setAttribute('uk-icon', 'close');
    }

    //Insert about information on page
    document.querySelector('#version').innerHTML = data.version;
    document.querySelector('#systemId').innerHTML = data.appid;
    document.querySelector('#publicIP').innerHTML = data.publicip;
    document.querySelector('#systemMAC').innerHTML = data.mac;
    if (typeof data.masterURL !== 'undefined' && data.masterURL !== null && data.masterURL !== '') {
        document.querySelector('#masterURL').innerHTML = '<a href="' + data.masterURL + '">' + data.masterURL + '</a>';
    }

    if (data.debugmode === 'true') {
        $('#debugmodemessage').html("DEBUGMODE aktiviert. Sie finden erweiterte Meldungen auf der JavaScriptKonsole und im ServerLog.");

        var debugtable = "<table>";
        debugtable += '<tr><td>Java Implementierung</td><td>' + data.systemJavaVendor + '</td></tr>';
        debugtable += '<tr><td>Java Version</td><td>' + data.systemJavaVersion + '</td></tr>';
        debugtable += '<tr><td>Systemname</td><td>' + data.systemName + '</td></tr>';
        debugtable += '<tr><td>Systemversion</td><td>' + data.systemVersion + '</td></tr>';
        debugtable += '<tr><td>Systemarchitektur</td><td>' + data.systemArchitecture + '</td></tr>';
        debugtable += "</table>";

        $('#debugtable').html(debugtable);
    }
};

/**
 * Function calls when button finishsetup is pressed. Completes the setup
 * 
 * @returns {undefined}
 */
setup.finishSetup = function () {
    // Update status message
    let statusinfoElem = document.getElementById("statusinfo");
    statusinfoElem.innerHTML = '<span uk-spinner="ratio: 4.5"></span><h1>Setup wird abgeschlossen...</h1>';
    // create the setup table
    // must be created once after the setup is finished
    // get the attributes for the table
    var querydata = {
    };
    remoteHandler.fetchGet("../data/templates/Setup/tbl_setup_attributes.json", querydata, false).then(function (attributes) {
        // create the table
        remoteHandler.fetchPost("collection/tbl_setup?storage=smartmonitoring", attributes, false).then(function() {
            // create a dataset, that the setup was been finished
            var record = {
                name: "setup",
                value: true
            };
            remoteHandler.fetchPost("records/tbl_setup?storage=smartmonitoring", record, false).then(function() {
                window.location.href = '../index.html';
            }).catch(function (error) {
                UIkit.notification({
                    message: 'Das Dataset konnte in die tbl_setup nicht eingefügt werden. ' + error,
                    timeout: SWAC_config.notifyDuration,
                    pos: 'top-center',
                    status: 'error'
                });
            });
        }).catch(function (error) {
            UIkit.notification({
                message: 'Die Tabelle tbl_setup konnte nicht angelegt werden. ' + error,
                timeout: SWAC_config.notifyDuration,
                pos: 'top-center',
                status: 'error'
            });
        });
    });
};

let templates;

let onChangeFunc = function() {
    templates = this.getInputs();
};

var datatemplatelist_options = {};
datatemplatelist_options.onChange = onChangeFunc;

/**
 * Install all selected templates
 * 
 * @returns {undefined}
 */
setup.installAllTemplates = function () {
    // Update status message
    let statusinfoElem = document.getElementById("statusinfo");
    statusinfoElem.innerHTML = '<span uk-spinner="ratio: 4.5"></span><h1>Templates werden installiert...</h1>';
    // Hide setup dialog
    let setupElem = document.getElementById("modal-group-3");
    UIkit.modal(setupElem).hide();
    //install the default templates
    setup.installTemplate("DefaultDataviewConfiguration");
    setup.installTemplate("DefaultNavigationRoutes");
    setup.installTemplate("DefaultTimeControlledJobs");
    setup.installTemplate("DefaultUserResources");
    //install the selected templates
    if (templates) {
        templates.forEach(function (template) {
            setup.installTemplate(template.name);
        });
    }
    // show the next step
    setupElem = document.getElementById("modal-group-4");
    UIkit.modal(setupElem).show();
    statusinfoElem.innerHTML = '';
};

/**
 * Install a template
 * 
 * @returns {undefined}
 */
setup.installTemplate = function (template_name) {
    switch (template_name) {
        case "Dunkelkennlinie":
        case "Hellkennlinie":
        case "PapendorfPVKennlinien":
        case "WeatherDataDeviceType":
            //needs 3 tables: tbl_measurement_type, tbl_observedobject_type and tbl_ootype_join_mtype
            setup.installTable(template_name, "tbl_measurement_type");
            setup.installTable(template_name, "tbl_observedobject_type");
            setup.installTable(template_name, "tbl_ootype_join_mtype");
            break;
        case "LaborDunkelkennlinienDeviceType":
        case "LaborHellkennlinienDeviceType":
        case "PVModulDatenblattType":
        case "PVPMHellkennlinienDeviceType":
        case "PVServeDunkelkennlinienDeviceType":
            setup.installTable(template_name, "tbl_measurement_type");
            setup.installTable(template_name, "tbl_observedobject_type");
            setup.installTable(template_name, "tbl_ootype_join_mtype");
            setup.installTable(template_name, "tbl_tag_type");
            break;
        case "EnvironHomeDeviceTypes":
        case "FeelingsDeviceType":
            //needs 6 tables: tbl_measurement_type, tbl_observedobject_metadata_type, tbl_observedobject_type, tbl_ootype_join_mtype, tbl_ootype_join_oometadatatype and tbl_value_definition
            setup.installTable(template_name, "tbl_measurement_type");
            setup.installTable(template_name, "tbl_observedobject_metadata_type");
            setup.installTable(template_name, "tbl_observedobject_type");
            setup.installTable(template_name, "tbl_ootype_join_mtype");
            setup.installTable(template_name, "tbl_ootype_join_oometadatatype");
            setup.installTable(template_name, "tbl_value_definition");
            break;
        case "EnvironNeighborComparison":
            //needs 5 tables: tbl_measurement_type, tbl_observedobject_metadata_type, tbl_observedobject_type, tbl_ootype_join_mtype and tbl_ootype_join_oometadatatype
            setup.installTable(template_name, "tbl_measurement_type");
            setup.installTable(template_name, "tbl_observedobject_metadata_type");
            setup.installTable(template_name, "tbl_observedobject_type");
            setup.installTable(template_name, "tbl_ootype_join_mtype");
            setup.installTable(template_name, "tbl_ootype_join_oometadatatype");
            break;
        case "DefaultNavigationRoutes":
            //needs 1 table: tbl_navigationroute
            setup.installTable(template_name, "tbl_navigationroute");
            break;
        case "DefaultTimeControlledJobs":
            //needs 1 table: tbl_timecontrolledjob
            setup.installTable(template_name, "tbl_timecontrolledjob");
            break;
        case "DefaultUserResources":
            //needs 3 tables: resources, userrights, users
            setup.installTable(template_name, "resources", "usermanager");
            setup.installTable(template_name, "userrights", "usermanager");
            setup.installTable(template_name, "users", "usermanager");
            break;
    }
};

/**
 * Create a table and insert the datasets
 * 
 * @returns {undefined}
 */
setup.installTable = function (template_name, table_name, storage = "smartmonitoring") {
    var querydata = {
    };
    //get the attributes for the table
    remoteHandler.fetchGet("../data/templates/" + template_name + "/" + table_name + "_attributes.json", querydata, false).then(function (attributes) {
        //create the table
        remoteHandler.fetchPost("collection/" + table_name + "?storage=" + storage, attributes, false).then(function () {
            //get the records for the table
            remoteHandler.fetchGet("../data/templates/" + template_name + "/" + table_name + "_records.json", querydata, false).then(function (records) {
                //insert the records
                remoteHandler.fetchPost("records/" + table_name + "?storage=" + storage, records, false).catch(function (error) {
                    UIkit.notification({
                        message: template_name + ' konnte nicht installiert werden. ' + error,
                        timeout: SWAC_config.notifyDuration,
                        pos: 'top-center',
                        status: 'error'
                    });
                });
            });
        }).catch(function (response) {
            if (response.status === 304) {
                //the table is already exist
                //get the records for the table
                remoteHandler.fetchGet("../data/templates/" + template_name + "/" + table_name + "_records.json", querydata, false).then(function (records) {
                    //insert the records
                    remoteHandler.fetchPost("records/" + table_name + "?storage=" + storage, records, false).catch(function (error) {
                        UIkit.notification({
                            message: template_name + ' konnte nicht installiert werden. ' + error,
                            timeout: SWAC_config.notifyDuration,
                            pos: 'top-center',
                            status: 'error'
                        });
                    });
                });
            }
        });
    });
};

// change the after save text of the location question component
var question_location_options = {};
question_location_options.afterSaveTxt = 'Die Daten wurden gespeichert';

let object_type_id;

// Add event listener to install link, when object list is loaded
SWAC_reactions.addReaction(function () {
    let installlinksElem = document.querySelectorAll('.installObject');
    for (let installinkElem of installlinksElem) {
        installinkElem.addEventListener('click', setup.onInstallObject);
    }
}, "objectlist");

/**
 * Get the type id of the object
 * 
 * @param {Event} evt Event calling the installation
 * @returns {undefined}
 */
setup.onInstallObject = function (evt) {
    evt.preventDefault();
    // Get the type id of the object
    let idElem = evt.target.parentNode.parentNode.querySelector('td swac-bp');
    object_type_id = idElem.innerHTML;
};

/**
 * Install a object
 * 
 * @returns {undefined}
 */
setup.installObject = function () {
    // Get the name of the object
    let object_name = document.getElementById("objectName").value;
    console.log("id: " + object_type_id + ", name: " + name);
    // close the object modal
    let objectElem = document.getElementById("modal-object");
    UIkit.modal(objectElem).hide();
    // show the setup modal
    let setupElem = document.getElementById("modal-group-4");
    UIkit.modal(setupElem).show();
    // create a object
    var object = {
        type: object_type_id,
        name: object_name
    };
    remoteHandler.fetchPost("observedobject/create", object, false).then(function() {
        UIkit.notification({
            message: object_name + ' wurde installiert.',
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'success'
        });
    }).catch(function(error) {
        UIkit.notification({
            message: object_name + ' konnte nicht installiert werden. ' + error,
            timeout: SWAC_config.notifyDuration,
            pos: 'top-center',
            status: 'error'
        });
    });
};