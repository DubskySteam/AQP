
// Options for label headline
var labels_options = {
    showWhenNoData: true,
    labeledidAttr: 'oo_id',
    showNoDataInfo: false,
    labelSource: {
        fromName: 'label_labels',
        fromWheres: {
            filter: 'isavailforobjects,eq,true'
        }
    },
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objecttagging&filter=active,eq,true'
        }
    }
};

document.addEventListener('swac_ready', function () {
    // check if data visualisation is active
    window.swac.Model.load({
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datavisualisation&filter=active,eq,true'
        }
    }).then(function (res) {
        if (res.length === 0) {
            //Deactivate labeling column
            let labelElems = document.querySelectorAll('.data_visualisation');
            for (let curElem of labelElems) {
                curElem.remove();
            }
        }
    });

    // check if object map is active
    window.swac.Model.load({
        fromName: 'tbl_navigationroute', // Name of the datatable
        fromWheres: {
            filter: 'name,eq,menu_object_map&filter=active,eq,true'
        }
    }).then(function (res) {
        if (res.length === 0) {
            //Deactivate labeling column
            let labelElems = document.querySelectorAll('.objectmap');
            for (let curElem of labelElems) {
                curElem.remove();
            }
        }
    });

    // check if object map is active
    window.swac.Model.load({
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap&filter=active,eq,true'
        }
    }).then(function (res) {
        if (res.length === 0) {
            //Deactivate labeling column
            let labelElems = document.querySelectorAll('.datamap');
            for (let curElem of labelElems) {
                curElem.remove();
            }
        }
    });
});

// Options for breadrump
var parents_options = {
    showWhenNoData: false
};
// Options for child list
var childs_options = {
    showWhenNoData: true
};

var misschart_options = {
    viewSetAttributes: 'missingentries,availableentries',
    xAxisAttrName: 'name',
    yAxis1AttrName: 'value',
    datadescription: '#misschart_legend'
};
misschart_options.plugins = new Map();
misschart_options.plugins.set('Piechart', {
    id: 'Piechart',
    active: true
});

// Options defining WHAT is visualised
var misschart_legend_options = {
    visuAttribute: 'name',
    showLegend: false
};
// Data defining HOW is visualised
misschart_legend_data = {};
misschart_legend_data.name = {};
misschart_legend_data.name.txt_title = 'Data attribute name';
misschart_legend_data.name.txt_desc = 'The name of the data';
misschart_legend_data.name.txt_uknw = 'Unkown value';
misschart_legend_data.name.values = {};
misschart_legend_data.name.values['missingentries'] = {};
misschart_legend_data.name.values['missingentries'].txt = 'Fehlende';
misschart_legend_data.name.values['missingentries'].col = 'red';
misschart_legend_data.name.values['availableentries'] = {};
misschart_legend_data.name.values['availableentries'].txt = 'Vorhandene';
misschart_legend_data.name.values['availableentries'].col = 'green';

// Below this point are unrevisited codes
//
//var objectview = {};
//objectview.object;
//objectview.childs = [];
//objectview.showChildsRecursive = "menue";	// Changes the show behavior "none" shows nowere recursive childs, "menue" shows recursive only in menue, "booth" shows recursive childs in menue and overview
//objectview.mtypes = [];
//objectview.exchangeconfigs = [];
//objectview.selectedexchangeconfig = {};
//
//var exchangeconfigurations_options = {};
//exchangeconfigurations_options.allowedToAddNew = true;
//
//var settings_edit_options = {};
//settings_edit_options.objectTemplateTransforms = new Map();
//settings_edit_options.objectTemplateTransforms.set('id', 'type');
//settings_edit_options.uniqueSetAttribute = 'name';

//var linkedobject_options = {};
//linkedobject_options.selectedsSource = {
//    fromName: 'observedobjectjoindataset/listDescribingObservedObjects',
//    fromWheres: {
//        ooid: window.swac.getParameterFromURL('id', window.location)
//    }
//};
//linkedobject_options.onChange = function (evt) {
//    // Get observedobject id
//    let requestor = SWAC_view.findRequestor(evt.target);
//    let ooid = requestor.swac_comp.getInputs()[0].value;
//    // Get datasets for describing object
//    let dataRequestor = {
//        fromName: 'data/getSets',
//        fromWheres: {
//            ooid: ooid
//        }
//    };
//    SWAC_model.load(dataRequestor).then(
//            function (response) {
//                let datasetSelectElem = document.getElementById('linkedset');
//                datasetSelectElem.swac_comp.clearOptions();
//                datasetSelectElem.swac_comp.addOptions(response.data);
//                SWAC_view.removeNoDataInformation(datasetSelectElem);
//            }).catch(function (error) {
//        UIkit.notification({
//            message: 'Die Datensätze konnten nicht geladen werden ' + error,
//            status: 'error',
//            timeout: SWAC_config.notifyDuration,
//            pos: 'top-center'
//        });
//    });
//};

//var linkedset_options = {};
//linkedset_options.showWhenNoData = true;
//linkedset_options.selectedsSource = {
//    fromName: 'observedobjectjoindataset/getDataSetsForDescribedObservedObject',
//    fromWheres: {
//        ooid: SWAC.getParameterFromURL('id', window.location)
//    }
//};

/**
 * Wird aufgerufen, wenn global.js fertig geladen wurde
 */
//$(document).on("uiComplete", function () {
////    moment.locale("de");
//    objectview.performGetObservedObject();
//
//    let linkedDataSaveButton = document.querySelector('#linkeddata_savebutton');
//    linkedDataSaveButton.addEventListener('click', function (evt) {
//        evt.preventDefault();
//        let dataCapsle = {};
//        dataCapsle.data = [];
//        dataCapsle.data[0] = {};
//
//        let value = document.getElementById('linkedobject').swac_comp.getInputs()[0].value;
//        dataCapsle.data[0].describedObservedObject = SWAC.getParameterFromURL('id', window.location);
//        dataCapsle.data[0].describingObservedObject = value;
//        dataCapsle.data[0].dataset = value;
//        dataCapsle.metadata = {};
//        dataCapsle.metadata.fromSource = 'observedobjectjoindataset/create';
//        SWAC_model.save(dataCapsle).then(function (response) {
//
//        }).catch(function (error) {
//            UIkit.notification({
//                message: "Die Verbindung konnte nicht gespeichert werden. " + error,
//                status: 'error',
//                timeout: SWAC_config.notifyDuration,
//                pos: 'top-center'
//            });
//        });
//    });
//});

// Add reation for metadata editor
//SWAC_reactions.addReaction(function (requestors) {
//    // Get templates for metadata entries when observedobject type is known
//    if (typeof objectview.object !== 'undefined') {
//        let datasetTemplatesSource = {};
//        datasetTemplatesSource.fromName = 'observedobjecttypejoinmetadatatype/listForObservedObjectType';
//        datasetTemplatesSource.fromWheres = {};
//        let type_id = SWAC_model.getIdFromReference(objectview.object.type);
//        datasetTemplatesSource.fromWheres.ootype_id = type_id;
//
//        requestors.metadata_edit.swac_comp.addDatasetTemplates(datasetTemplatesSource);
//
//        // Set observedobject_id
//        var id = SWAC.getParameterFromURL('id', window.location);
//        let observedobjectElems = document.querySelectorAll('[name=observedobject]');
//        for (let observedobjectElem of observedobjectElems) {
//            observedobjectElem.value = 'ref://' + id;
//        }
//    }
//}, 'metadata_edit');

/**
 * Lade alle Komponenten der aktuellen Anlage aus der Datenbank
 * @returns {undefined}
 */
//objectview.performGetObservedObject = function () {
//    var id = SWAC.getParameterFromURL('id', window.location);
//    var querydata = {
//        id: id
//    };
//    remoteHandler.fetchGet("observedobject/get", querydata, false).then(function (data) {
//        objectview.object = data;
//
//        // Set value to every input field, that has name ooid
//        let ooidElems = document.querySelectorAll('[name=ooid]');
//        for (let curooidElem of ooidElems) {
//            curooidElem.setAttribute('value', data.id);
//        }
//        ;
//        // Register function for manual capture
//        let manualCaptureCheckbox = document.getElementById('manualdatacapture');
//        manualCaptureCheckbox.addEventListener("change", objectview.onManualCaptureChange);
//        // Add link if manual capture is activated
//        if (data.manualcapture === true) {
//            // Activate checkbox
//            let manualCaptureBox = document.getElementById("manualdatacapture");
//            manualCaptureBox.setAttribute("checked", "checked");
//
//            let manualCaptureLink = document.createElement('a');
//            manualCaptureLink.setAttribute('href', 'datacollector.html?id=' + objectview.object.id);
//            manualCaptureLink.innerHTML = 'Seite zur manuellen Datenerfassung';
//            manualCaptureBox.parentNode.insertBefore(manualCaptureLink, manualCaptureBox.nextSibling.nextSibling);
//        }
//    });
//};

/**
 * Loads information about the observedobjecttype
 
 * @returns {undefined}
 */
//objectview.performGetObservedObjectType = function (typeid) {
//    var querydata = {
//        id: typeid
//    };
//    remoteHandler.apiCallGet("observedobjecttype/get", querydata, objectview.getObservedObjectTypeCallback);
//};

/**
 * Recives the information about an type and puts it into the page
 */
//objectview.getObservedObjectTypeCallback = function (data) {
//    var typehtml = '<a href="#" onclick="routeHandler.redirectToAdminTemplates(' + data.id + ')">' + data.name + '</a>';
//    $('#ioType').html(typehtml);
//    // Show dataviews
//    if (typeof data.joiner !== 'undefined' && data.joiner.length > 0) {
//        $('.ribbon-nav').prepend('&nbsp; <span onclick="routeHandler.redirectToDataview(' + objectview.object.id + ');"><i class="uk-icon-bar-chart uk-icon-small"></i>Daten <div class="uk-badge uk-badge-notification">' + data.joiner.length + '</div></span>');
//        $('.ribbon').show();
//
//        //Request information about joiners
//        objectview.performGetJoiner(data.id);
//
//        $('#joinerBlock').show();
//    }
//};

//objectview.performGetJoiner = function (ootype_id) {
//    var querydata = {
//        ootype_id: ootype_id
//    };
//    remoteHandler.apiCallGet("measurementtype/listForOoType", querydata, objectview.performGetJoinerCallback);
//};

//objectview.performGetJoinerCallback = function (data) {
//    for (var curJoiner in data.list) {
//        
//        let description = '';
//        if (typeof data.list[curJoiner].description !== 'undefined') {
//            description = data.list[curJoiner].description;
//        }
//        let mtype_description = '';
//        if (typeof data.list[curJoiner].mtype_description !== 'undefined') {
//            description = data.list[curJoiner].mtype_description;
//        }
//        
//        $('#measurements-table tbody').append(
//                '<tr><td title="'+description+'">' + data.list[curJoiner].name + '</td>'
//                +'<td title="'+mtype_description+'">' 
//                + data.list[curJoiner].mtype_name 
//                +'</td><td id="latest_'+data.list[curJoiner].name+'"></td></tr>');
//    }
//    
//    objectview.performGetLatestValues(routeHandler.getRequestedId("ooid"),objectview.performGetLatestValuesForJoinerCallback);
//};

/**
 * Called after request for the latest data for the current shown oo
 * 
 * @param {type} data   Latest data
 * @returns {undefined}
 */
//objectview.performGetLatestValuesForJoinerCallback = function(data) {
//    console.log("test!JoinerCallback");
//    for(var dataname in data.dataList[0]) {
//        console.log(dataname);
//        $('#latest_'+dataname).html(data.dataList[0][dataname]);
//    }
//};

/**
 * Loads information about the objects location
 
 * @returns {undefined}
 */
//objectview.performGetLocationForObservedObject = function (objectid) {
//    var querydata = {
//        id: objectid
//    };
//    remoteHandler.apiCallGet("location/getForObservedObject", querydata, objectview.getLocationForObservedObjectCallback);
//};

/**
 * Recives the information about an location and places it in page
 * 
 * @param {array[]} data Data of location call
 */
//objectview.getLocationForObservedObjectCallback = function (data) {
//    var locationhtml = '';
//    if (typeof data.id === 'undefined') {
//        locationhtml = 'Dieses Objekt hat keine Location. Jetzt <a href="#" onclick="routeHandler.redirectToLocationView(0)">anlegen oder auswählen</a>';
//
//        $('#mapid').html('<div class="uk-card"><div class="uk-card-header"><h3 class="uk-card-title">Location</h3></div><div class="uk-card-body">Location <a href="#" onclick="routeHandler.redirectToLocationView(0)">anlegen oder auswählen</a></div></div>');
//    } else {
//        locationhtml = '<a href="#" onclick="routeHandler.redirectToLocationView(' + data.id + ')">' + data.name + '</a><p>' + data.street + ' ' + data.housenumber + ' ' + data.postcode + ' ' + data.city + ' ' + data.floor + ' (lat:' + data.latitude + ' lng: ' + data.longitude + ')</p>';
//        if (data.inheritted === 'true')
//            locationhtml += '<div class="uk-badge">geerbt</div>';
//        objectview.initMap(data);
//    }
//    $('#ioLocation').html(locationhtml);
//};

/**
 * Initialise map for displaying installation locations
 */
//objectview.initMap = function (data) {
//    // Create map an center on middle germany
//    map = L.map('mapid', {center: [data.latitude, data.longitude], zoom: 17});
//    // Add open streetmap layer
//    L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
//        attribution: "&copy; <a href=\"http://osm.org/copyright\">OpenStreetMap</a> contributors",
//        maxZoom: 22,
//        minZoom: 10
//    }).addTo(map);
//    // Place object marker
//    L.marker([data.latitude, data.longitude]).addTo(map);
//    map.on('click', function (e) {
//        routeHandler.redirectToLocationView(data.id);
//    });
//};

/**
 * Get all tags defined for the current object
 */
//objectview.performGetTags = function () {
//    var querydata = {
//        ooid: objectview.object.id
//    };
//    remoteHandler.apiCallGet("tagobservedobject/listForObservedObject", querydata, objectview.getTagsCallback);
//};

//objectview.getTagsCallback = function (data) {
//    for (var i = 0; i < data.list.length; i++) {
//        $("#tagoption_" + data.list[i].id).remove();
//        $("#ioTags").prepend('<div class="uk-badge" id="tag_' + data.list[i].id + '">' + data.list[i].name + '<a href="#" onclick="objectview.performRemoveTag(' + data.list[i].id + ')" class="uk-close"></a></div>');
//    }
//};

/**
 * Get all available tags
 */
//objectview.performGetAvailableTags = function () {
//    var querydata = {
//        type: "objectTag"
//    };
//    remoteHandler.apiCallGet("tagtype/listByType", querydata, objectview.performGetAvailableTagsCallback);
//};

/**
 * Called, when an list of tags was recived
 */
//objectview.performGetAvailableTagsCallback = function (data) {
//    for (var i = 0; i < data.list.length; i++) {
//        $('#tagslist').append('<option id="tagoption_' + data.list[i].id + '" value="' + data.list[i].id + '">' + data.list[i].name + '</option>');
//    }
//};

/**
 * Add an tag
 */
//objectview.performAddTag = function () {
//    if ($('#tagslist').val() != 'notselected') {
//        var querydata = {
//            tagid: parseInt($('#tagslist').val()),
//            oid: objectview.object.id
//        };
//        remoteHandler.apiCallCreate("tagobservedobject/addToObject", querydata, objectview.performAddTagCallback);
//    }
//};

//objectview.performAddTagCallback = function (data) {
//    $("#tagoption_" + data.id).remove();
//    $("#ioTags").prepend('<div class="uk-badge" id="tag_' + data.id + '">' + data.name + '<a href="#" onclick="objectview.performRemoveTag(' + data.id + ')" class="uk-close"></a></div>');
//};

/**
 * Remove an tag
 */
//objectview.performRemoveTag = function (tagid) {
//    var querydata = {
//        tagid: tagid,
//        oid: objectview.object.id
//    };
//    remoteHandler.apiCallCreate("tagobservedobject/removeFromObject", querydata, objectview.performRemoveTagCallback);
//};

/**
 * Called when an tag was sucsessfully removed
 */
//objectview.performRemoveTagCallback = function (data) {
//    $("#tag_" + data.id).remove();
//    $('#tagslist').append('<option id="tagoption_' + data.id + '" value="' + data.id + '">' + data.name + '</option>');
//};

/**
 * Öffnet den Dialog um ein neues Objekt anzulegen.
 * @returns {undefined}
 */
//objectview.startNewChildWizard = function () {
//    var querydata = {
//    };
//    remoteHandler.apiCallGet("observedobjecttype/list", querydata, objectview.getObservedObjectTypesCallback);
//
//    $.UIkit.modal("#addChildDialog").show();
//};

/**
 * Callback für performGetInstallationTypeList.
 * @param {type} data
 * @returns {undefined}
 */
//objectview.getObservedObjectTypesCallback = function (data) {
//    var selectValues = "";
//
//    for (var i = 0; i < data.list.length; i++) {
//        selectValues += '<option value="' + data.list[i].id + '">' + data.list[i].name + '</option>'
//    }
//    $('.selectinstallation').html(selectValues);
//};

/**
 * Creates an new child object
 */
//objectview.createNewChild = function () {
//    var querydata = {
//        name: $('#newchild_name').val(),
//        typeid: $('#newchild_type').val(),
//		parentid: objectview.object.id
//    };
//    remoteHandler.apiCallGet("observedobject/create", querydata, objectview.createNewChildCallback);
//}

/**
 * Callback für performAddNewInstallation.
 * @param {type} data
 * @returns {undefined}
 */
//objectview.createNewChildCallback = function (data) {
//    $.UIkit.modal("#addInstallationDialog").hide();
//    //TODO Only update childs list
//    location.reload();
//};

/**
 * Erstellt das Grid-HTML der Komponente mit der ID id
 * @param {Number} id
 * @returns {undefined}
 */
//objectview.createGridElement = function (object) {
//    var htmlGrid = "<li class=\"uk-grid-margin\"><div class=\"uk-panel uk-panel-box\">";
//    htmlGrid += '<div class="uk-card uk-card-default uk-card-body">';
//    htmlGrid += '<h3 class="sm-object-title" onclick="routeHandler.redirectToObjectview(' + object.id + ')" title="' + object.name + '">' + object.name + '</h3></div>';
//    htmlGrid += '<div class="sm-showtime" id="showtime_' + object.id + '"></div>';
//    htmlGrid += "<div id=\"showplace_" + object.id + "\">";
//    htmlGrid += "</div>";
//    htmlGrid += "</li>";
//    $('#childsSchema').append(htmlGrid);
//    objectview.performGetLatestValues(object.id, objectview.performGetLatestValuesCallback);
//};

/**
 * Gets the latest available values for the given objectid
 */
//objectview.performGetLatestValues = function (objectid, callbackfunc) {
//    var querydata = {
//        ooid: objectid,
//        orderby: "ts",
//        order: "DESC",
//        limit: 1
//    };
//
//    remoteHandler.apiCallGet("data/sets", querydata, callbackfunc);
//};

/**
 * Recives data and puts it into the grid elements
 */
//objectview.performGetLatestValuesCallback = function (data) {
//
//    if (typeof data.dataList !== 'undefined') {
//        var html = '';
//        if (data.dataList.length > 0) {
//            for (var valuename in data.dataList[0]) {
//                if (valuename !== 'id' && valuename !== 'ts' && valuename !== 'user_id') {
//                    // Search meta information about value
//                    for (var i = 0; i < data.dataInfo.length; i++) {
//                        if (data.dataInfo[i].name === valuename) {
//                            dataInfo = data.dataInfo[i];
//                            break;
//                        }
//                    }
//
//                    html += '<h4 class="sm-joiner-title" ';
//                    if (dataInfo.description !== null) {
//                        html += 'data-uk-tooltip="pos:\'bottom\'" title="' + dataInfo.description;
//                    }
//                    html += '">' + valuename + '</h4>';
//                    var value = data.dataList[0][valuename];
//
//                    if (dataInfo.possiblevalues !== null) {
//
//                        // Insert picture if available
//                        if (typeof dataInfo.possiblevalues !== 'undefined' && dataInfo.possiblevalues.indexOf('.svg') > 0 || dataInfo.possiblevalues.indexOf('.jpg') > 0) {
//                            var possvalues = dataInfo.possiblevalues.split("\n");
//                            for (var j = 0; j < possvalues.length; j++) {
//                                if (possvalues[j].indexOf(value) === 0) {
//                                    value = '<img src="../img/' + possvalues[j].replace(value + "=", "") + '" />';
//                                    break;
//                                }
//                            }
//                        }
//                    }
//
//                    html += '<span class="value_' + valuename + '">' + value + '</span> ';
//                    if (dataInfo.mtype_unit !== null) {
//                        html += '<span class="mtype_' + dataInfo.mtype_name + '" data-uk-tooltip="pos:\'right\'" ';
//                        if (dataInfo.mtype_description !== null) {
//                            html += 'title="' + dataInfo.mtype_description;
//                        }
//                        html += '">' + dataInfo.mtype_unit + '</span> ';
//                    }
//                } else if (valuename === 'ts') {
//                    value = moment(data.dataList[0][valuename]).format("L") + " " + moment(data.dataList[0][valuename]).format("LTS");
//                    $("#showtime_" + data.ooid).html("vom: " + value);
//                }
//            }
//        } else {
//            html += 'Keine Daten vorhanden';
//        }
//        $("#showplace_" + data.ooid).html(html);
//        //mtypeHandler.insertMeasurementTypeDetails();
//        objectview.latestValuesRecived = true;
//    } else if (typeof data.warnungen !== 'undefined' && data.warnungen[0] === 'No data expected for this object.') {
//        $("#showplace_" + data.ooid).html('Dieses Objekt sammelt keine Daten');
//    }
//};

//objectview.latestValuesRecived = false;
//
//var myVar = setInterval(function () {
//    refreshData();
//}, 5000);
//
//function refreshData() {
//    if (objectview.latestValuesRecived === true) {
//        for (var i = 0; i < objectview.childs.length; i++) {
//            objectview.performGetLatestValues(objectview.childs[i].id, objectview.performGetLatestValuesCallback);
//        }
//    }
//}
//;

/**
 * Opens and closes detail views.
 
 * @param {int} id
 * @returns {undefined}
 */
//objectview.changeDetailView = function (id) {
//
//    var iconid = 'icon' + id;
//    var listid = 'list' + id;
//    var iconclassname = $('#icon' + id).attr('class');
//    if (!iconclassname.includes(" uk-icon-spin")) {
//        // Get tags
//        objectview.performGetTags();
//        objectview.performGetAvailableTags();
//        // Get synchronisation information
//        objectview.performGetMasterURL();
//        objectview.getExchangeConfigurations();
//        // Get observedobject configuration
//        objectview.performGetAvailableConfigurations();
//
//        document.getElementById(iconid).className = document.getElementById(iconid).className + " uk-icon-spin";
//        document.getElementById(listid).style.display = "block";
//    } else if (iconclassname.includes("uk-icon-spin")) {
//        document.getElementById(iconid).className = document.getElementById(iconid).className.replace(" uk-icon-spin", '');
//        document.getElementById(listid).style.display = "none";
//    }
//};

/**
 * Creates an new exchange configuration
 */
//objectview.performSaveExchangeConfiguration = function (oid) {
//    var querydata = {
//        oid: objectview.object.id,
//        remoteUrl: $('#remoteUrl').val(),
//        remoteKey: $('#remoteKey').val(),
//        remoteObservedObjectId: parseInt($('#remoteObject').val()),
//        remoteObservedObjectName: $("#remoteObject option:selected").text(),
//        active: $('#active').is(':checked'),
//        encrypt: $('#encrypt').is(':checked')
//    };
//    remoteHandler.apiCallCreate("exchangeconfiguration/create", querydata, objectview.performSaveExchangeConfigurationCallback);
//};
//
///**
// * Performed on succsessfull created exchange configuration
// */
//objectview.performSaveExchangeConfigurationCallback = function (data) {
//    // Add new exchange conf to list of all available confs
//    objectview.exchangeconfigs.push(data);
//    // Create new table entry for conf
//    var conf = data;
//    var htmltr = '<tr id="exchange_' + conf.id + '">';
//    htmltr += "<td>" + conf.remoteUrl + "</td>";
//    htmltr += "<td>" + conf.remoteKey + "</td>";
//    htmltr += '<td><a href="' + conf.remoteUrl.replace("Backend", "") + '/sites/objectview.html?ooid=' + conf.remoteOoid + '">' + conf.remoteObservedObjectName + '</a></td>';
//    htmltr += "<td>" + conf.active + "</td>";
//    htmltr += "<td>" + conf.encrypt + "</td>";
//    htmltr += "<td>" + conf.exchange_ts_start + "</td>";
//    htmltr += "<td>" + conf.exchange_ts_end + "</td>";
//    htmltr += '<td><a href="" class="uk-icon-hover uk-icon-pencil" title="Bearbeiten" onclick="objectview.editExchangeConfiguration(' + conf.id + ')"></a>';
//    htmltr += '&nbsp; <a href="" class="uk-icon-hover uk-icon-upload" onclick="objectview.performStartExchange(' + conf.id + ')" title="Synchronisation starten"></a></td>';
//    htmltr += "</tr>";
//    $("#exchange-table").append(htmltr);
//    $("#exchange-table-status").hide();
//    $("#exchange-table").show();
//};

/**
 * Show exchange configuration in editor
 */
//objectview.editExchangeConfiguration = function (id) {
//    // Search for exchange config to edit
//    for (var i = 0; i < objectview.exchangeconfigs.length; i++) {
//        if (objectview.exchangeconfigs[i].id === id) {
//            objectview.selectedexchangeconfig = objectview.exchangeconfigs[i];
//        }
//    }
//
//    if (objectview.selectedexchangeconfig !== null) {
//        $('#remoteUrl').val(objectview.selectedexchangeconfig.remoteUrl);
//        objectview.performGetRemoteObjects(objectview.performGetRemoteObjectsCallbackForEditor);
//    }
//};
//
///**
// * Perform update of exchange configuration
// */
//objectview.performUpdateExchangeConfiguration = function () {
//    var querydata = {
//        oid: objectview.object.id,
//        id: $('#exchangeid').val(),
//        remoteUrl: $('#remoteUrl').val(),
//        remoteKey: $('#remoteKey').val(),
//        remoteObservedObjectId: parseInt($('#remoteObject').val()),
//        remoteObservedObjectName: $("#remoteObject option:selected").text(),
//        active: $('#active').is(':checked'),
//        encrypt: $('#encrypt').is(':checked')
//    };
//    remoteHandler.apiCallUpdate("exchangeconfiguration/update", querydata, objectview.performUpdateExchangeConfigurationCallback);
//};
//
///**
// * Executed when update of exchange configuration was succsessfull
// */
//objectview.performUpdateExchangeConfigurationCallback = function (data) {
//    var htmltr = "<td>" + data.remoteUrl + "</td>";
//    htmltr += "<td>" + data.remoteKey + "</td>";
//    htmltr += '<td><a href="' + data.remoteUrl.replace("Backend", "") + '/sites/objectview.html?ooid=' + data.remoteOoid + '">' + data.remoteObservedObjectName + '</a></td>';
//    htmltr += "<td>" + data.active + "</td>";
//    htmltr += "<td>" + data.encrypt + "</td>";
//    htmltr += "<td>" + data.exchange_ts_start + "</td>";
//    htmltr += "<td>" + data.exchange_ts_end + "</td>";
//    htmltr += '<td><a href="" class="uk-icon-hover uk-icon-pencil" title="Bearbeiten" onclick="objectview.editExchangeConfiguration(' + data.id + ')"></a>';
//    htmltr += '<a href="" class="uk-icon-hover uk-icon-upload" title="Synchronisation starten" onclick="objectview.performStartExchange(' + data.local_observedobject + ')"></a>';
//    htmltr += '<div class="uk-badge uk-badge-notification">bereit</div></td>';
//    $('#exchange_' + data.id).html(htmltr);
//
//    UIkit.notify({
//        message: "Die Änderungen wurden gespeichert",
//        status: 'succsess',
//        timeout: remoteHandler.alertDuration,
//        pos: 'top-center'
//    });
//};

/**
 * Callback for getting remote objects when data exists
 */
//objectview.performGetRemoteObjectsCallbackForEditor = function (data) {
//    var objSelectList = $('#remoteObject');
//    objSelectList.find("option").remove();
//    for (var i = 0; i < data.list.length; i++) {
//        var objSelect = '<option id="ro_' + data.list[i].id + '" value="' + data.list[i].id + '">' + data.list[i].name + '</option>';
//        objSelectList.append(objSelect);
//    }
//
//    $('#exchangeid').val(objectview.selectedexchangeconfig.id);
//    $('#remoteKey').val(objectview.selectedexchangeconfig.remoteKey);
//    $('#remoteObject option').removeAttr("selected");
//    $('#ro_' + objectview.selectedexchangeconfig.remoteOoid).attr('selected', 'selected');
//    $('#remoteObject option[value="' + objectview.selectedexchangeconfig.remoteOoid + '"]').attr('selected', 'selected');
//    $('#active').prop('checked', objectview.selectedexchangeconfig.active);
//    $('#encrypt').prop('checked', objectview.selectedexchangeconfig.encrypt);
//    $('#exchangeconfig_updatebtn').show();
//    $('#exchangeconfig_savebtn').hide();
//};

/**
 * Gets the latest data from database.
 */
//objectview.performGetLatestData = function (objectid) {
//    var querydata = {
//        ooid: objectid,
//        orderby: "ts",
//        order: "DESC",
//        limit: 100
//    };
//
//    remoteHandler.apiCallGet("data/setsAsRows", querydata, objectview.performGetLatestDataCallback);
//};

/**
 * Recives latest data and puts it into the little chart
 */
//objectview.performGetLatestDataCallback = function (data) {
//
//    if (typeof data !== 'undefined' && typeof data.keyList !== 'undefined') {
//
//        // Create data sets from lists
//        var datasets = [];
//        for (var i = 0; i < data.keyList.length; i++) {
//            var measurementname = data.keyList[i];
//
//            if (measurementname !== 'id' && measurementname !== 'ts') {
//                var dataset = {
//                    label: measurementname,
//                    fill: false,
//                    lineTension: 0.1,
//                    backgroundColor: "rgba(75,192,192,0.4)",
//                    borderColor: "rgba(75,192,192,1)",
//                    borderCapStyle: 'butt',
//                    borderDash: [],
//                    borderDashOffset: 0.0,
//                    borderJoinStyle: 'miter',
//                    pointBorderColor: "rgba(75,192,192,1)",
//                    pointBackgroundColor: "#fff",
//                    pointBorderWidth: 1,
//                    pointHoverRadius: 5,
//                    pointHoverBackgroundColor: "rgba(75,192,192,1)",
//                    pointHoverBorderColor: "rgba(220,220,220,1)",
//                    pointHoverBorderWidth: 2,
//                    pointRadius: 1,
//                    pointHitRadius: 10,
//                    data: data[measurementname],
//                    spanGaps: false
//                };
//                datasets.push(dataset);
//            }
//        }
//
//        // Build data object
//        var data = {
//            labels: data.ts,
//            datasets: datasets
//        };
//
//        var ctx = $("#datachart");
//        var myChart = new Chart(ctx, {
//            type: 'line',
//            data: data,
//            options: {
//                scales: {
//                    yAxes: [{
//                            ticks: {
//                                beginAtZero: true
//                            }
//                        }]
//                },
//                legend: {
//                    display: false,
//                    labels: {
//                        fontColor: 'rgb(255, 99, 132)'
//                    }
//                }
//            }
//        });
//    } else {
//        $('#slide-data').html("Für dieses Objekt werden keine Daten gesammelt.");
//    }
//};

/**
 * Gets the count of available medias for this observedobject
 */
//objectview.performGetCountMedia = function (ooid) {
//    var querydata = {
//        ooid: ooid
//    };
//
//    remoteHandler.apiCallGet("media/countForOo", querydata, objectview.performGetCountMediaCallback);
//};

//objectview.performGetCountMediaCallback = function (data) {
//    // Show link to media
//    $('.ribbon-nav').append('&nbsp; <span onclick="routeHandler.redirectToMediaGallery('
//            + routeHandler.getRequestedId("ooid")
//            + ');"><i class="uk-icon-picture-o uk-icon-small"></i> Medien <div class="uk-badge uk-badge-notification">'
//            + data.count + '</div></span>');
//    $('.ribbon').show();
//};

/**
 * Get available configurations for called observedobject
 */
//objectview.performGetAvailableConfigurations = function () {
//    $("#configuration-table tbody").html('');
//
//    var querydata = {
//        ootype_id: objectview.object.type
//    };
//
//    remoteHandler.apiCallGet("observedobjectmetadatatype/listForObservedObjectType", querydata, objectview.performGetAvailableConfigurationsCallback);
//};
//
///**
// * Called when reciving list of possible configuration entries
// */
//objectview.performGetAvailableConfigurationsCallback = function (data) {
//    var html = "";
//    // No configurations message
//    if (data.list.length === 0) {
//        html += "Dieses Objekt hat keine Konfigurationseinstellungen";
//    }
//
//    for (var i = 0; i < data.list.length; i++) {
//        html += '<tr id="configuration_' + data.list[i].id + '"><td title="' + data.list[i].description + '">'
//                + data.list[i].name
//                + '</td><td><input id="conftype_' + data.list[i].id + '" type="text" name="confvalue_0" /></td></tr>';
//    }
//
//    $("#configuration-table tbody").append(html);
//
//    // Now get existing values
//    objectview.performGetConfigurationValues();
//};
//
///**
// * Get existing configuration values
// */
//objectview.performGetConfigurationValues = function () {
//    var querydata = {
//        ooid: objectview.object.id
//    };
//
//    remoteHandler.apiCallGet("oometadata/listForObservedObject", querydata, objectview.performGetConfigurationValuesCallback);
//};
//
//objectview.performGetConfigurationValuesCallback = function (data) {
//    if (data.list.length > 0) {
//        for (var i = 0; i < data.list.length; i++) {
//            $("#conftype_" + data.list[i].type).val(data.list[i].value);
//            $("#conftype_" + data.list[i].type).attr("name", "confvalue_" + data.list[i].id);
//        }
//    }
//};
//
///**
// * Walks trough all available configurations and reads there field values, to save them to backend.
// */
//objectview.performUpdateOOConf = function () {
//    var tblentries = $("#configuration-table tbody").find('input');
//
//    for (var i = 0; i < tblentries.length; i++) {
//        var ooconftype_id = tblentries.attr('id').replace('conftype_', '');
//        var config_id = tblentries.attr('name').replace('confvalue_', '');
//        config_id = parseInt(config_id);
//
//        if (config_id === 0) {
//            var querydata = {
//                ooid: objectview.object.id,
//                ooconftype_id: parseInt(ooconftype_id),
//                value: tblentries.val()
//            };
//
//            remoteHandler.apiCallCreate("oometadata/create", querydata, objectview.performCreateOOConfCallback);
//        } else {
//            var querydata = {
//                id: parseInt(config_id),
//                ooid: objectview.object.id,
//                ooconftype_id: parseInt(ooconftype_id),
//                value: tblentries.val()
//            };
//            remoteHandler.apiCallUpdate("oometadata/update", querydata, objectview.performUpdateOOConfCallback);
//        }
//    }
//};
//
//objectview.performCreateOOConfCallback = function (data) {
//    let conftypeinput = $("#configuration-table tbody input[id='conftype_" + data['ooconftype_id'] + "']");
//    conftypeinput.attr("name", "confvalue_" + data['id']);
//    conftypeinput.after('<img title="Eintrag wurde gespeichert" alt="Eintrag wurde gespeichert" src="../img/check.png" height="25px" width="25px">');
//};
//
//objectview.performUpdateOOConfCallback = function (data) {
//    let conftypeinput = $("#configuration-table tbody input[id='conftype_" + data['ooconftype_id'] + "']");
//    conftypeinput.attr("name", "confvalue_" + data['id']);
//    conftypeinput.after('<img title="Eintrag wurde gespeichert" alt="Eintrag wurde gespeichert" src="../img/check.png" height="25px" width="25px">');
//};

/************************
 * Methods for manual capture configuration
 ***********************/
//TODO merge manualcapture with survey project

/**
 * Save changed value directly after click
 * 
 * @param {Event} evt Event that calls the actualise manuapcalture state
 * @returns {undefined}
 */
//objectview.onManualCaptureChange = function (evt) {
//    let checkboxElem = evt.target;
//    var querydata = {
//        id: objectview.object.id,
//        manualCapture: checkboxElem.checked
//    };
//    //TODO change this to RESTProxy update oo
//    remoteHandler.fetchUpdate("observedobject/setManualCapture", querydata, true).then(function (data) {
//        if (data.manualCapture === true) {
//            // Add manualcapturelink
//            let manualCaptureLink = document.createElement('a');
//            manualCaptureLink.setAttribute('href', 'datacollector.html?id=' + objectview.object.id);
//            manualCaptureLink.innerHTML = 'Seite zur manuellen Datenerfassung';
//            checkboxElem.parentNode.insertBefore(manualCaptureLink, checkboxElem.nextSibling.nextSibling);
//        } else {
//            // Remove manualcapturelink
//            checkboxElem.parentNode.removeChild(checkboxElem.nextSibling.nextSibling);
//        }
//    });
//};