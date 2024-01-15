/* global fetch, Promise, diagram_types */
/** 
 * @file Managing adminuserinterface.html by loading data from the database and saving changes to the database
 * @author Andre Kirsch
 */

/**
 * URL for accessing the backend
 * 
 * @const
 * @type String
 * @default
 * 
 * Replaced by SWAC_config.datasources[0].replace('[fromName]','') - ffehring
 */
//const BASE_URL_BACKEND = window.location.origin + '/SmartMonitoringBackend/';
/**
 * Default interface settings ID, used when no id has been specified in query params
 * 
 * @const
 * @type Number
 * @default
 */
const DFLT_INTERFACE_SETTINGS_ID = 1;

/**
 * @function
 * Executed when the page has been loaded. This function sets the most important
 * EventListeners and also starts loading all data from the backend
 */
$(document).on("uiComplete", function () {
    document.getElementById('alert_no_interface').hidden = true;
    ui_settings.id = getUiSettingsId();
    data_promises = ui_settings.loadObservedObjectsData();
    Promise.all(data_promises).then(() => {
        ui_settings.load();
    });
    ui_settings.view.prefabs.load();

    document.getElementById("btn_add_diagram").addEventListener('click', () => {
        ui_settings.createDiagram();
    });

    document.getElementById('btn_save').onclick = () => {
        ui_settings.view.saveDataFromView();
        let error = ui_settings.checkForWellFormedInterfaceSettings();
        if (error === null) {
            document.getElementById('btn_save').onclick = null;
            ui_settings.persist();
        } else {
            UIkit.modal.alert(error);
        }
    };
});

/**
 * ui_settings object is used to contain all the important data and handle all
 * interactions between frontend and backend
 */
let ui_settings = {};

ui_settings.error = false;

/**
 * Loads Observed Object Data and OoTypeJoinMType Data from the database
 * @returns {Array(Promise)}
 */
ui_settings.loadObservedObjectsData = () => {
    promises = [];
    promises.push(fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'observedobject/list')
            .then((response) => {
                return response.json();
            }).then((data) => {
                for (let i = 0; i < data.list.length; i++){
                    if(data.list[i].joiner !== undefined){
                        console.log(data.list[i]);
                    }
                }
        ui_settings.observed_objects = data.list;
    }).catch((error) => {
        console.error(error);
    }));
    promises.push(fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'observedobjecttypejoinmeasurementtype/list')
            .then((response) => {
                return response.json();
            }).then((data) => {
        ui_settings.ootype_join_mtypes = data.list;
    }).catch((error) => {
        console.error(error);
    }));
    promises.push(fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'measurementtype/list')
            .then((response) => {
                return response.json();
            }).then((data) => {
        ui_settings.measurement_types = data.list;
    }).catch((error) => {
        console.error(error);
    }));
    Promise.all(promises).then(() => {
        //ui_settings.observed_objects.forEach((observed_object) => {
        for (let observed_object in ui_settings.observed_objects){
            ui_settings.observed_objects[observed_object].joiner = [];
            for (let joiner in ui_settings.ootype_join_mtypes){       
                if (ui_settings.observed_objects[observed_object].type === ui_settings.ootype_join_mtypes[joiner].observedobjectType) {
                    let string = "";
                    string = ui_settings.ootype_join_mtypes[joiner].measurementType;
                    let joiner_mtype_id;
                    if (string.id === undefined){                      
                        let splitted_mtype = string.split('/');
                        joiner_mtype_id = parseInt(splitted_mtype[splitted_mtype.length - 1]);
                    }else 
                        joiner_mtype_id = string.id;
                    
                    ui_settings.measurement_types.forEach((mtype) => {
                        if (mtype.id === joiner_mtype_id) {
                            ui_settings.ootype_join_mtypes[joiner].measurementtype = mtype;
                        }
                    });
                    ui_settings.observed_objects[observed_object].joiner.push(ui_settings.ootype_join_mtypes[joiner]);
                }
            }
        }
        delete ui_settings.ootype_join_mtypes;
        delete ui_settings.measurement_types;
    });
    return promises;
};

/**
 * Returns the corresponding Observed Object Name to the given ooid
 * @param {int} ooid
 * @returns {String}
 */
ui_settings.ooidToOoName = (ooid) => {
    for (let oo in ui_settings.observed_objects) {
        if (ui_settings.observed_objects[oo].id === ooid) {
            return ui_settings.observed_objects[oo].name;
        }
    }
    return null;
};

/**
 * Returns the corresponding OoTypeJoinMType Name to the given joinerid
 * @param {int} joinerid
 * @returns {String}
 */
ui_settings.joinerIdToOoName = (joinerid) => {
    for (let oo in ui_settings.observed_objects) {
        for (let joiner in ui_settings.observed_objects[oo].joiner) {
            if (ui_settings.observed_objects[oo].joiner[joiner].id === joinerid) {
                return ui_settings.observed_objects[oo].joiner[joiner].aliasname;
            }
        }
    }
    return null;
};

/**
 * @method
 * load starts the loading process loading the interface settings and diagrams
 * from the backend
 */
ui_settings.load = () => {
    // Load interface settings
    fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataviewconfiguration/get?id=' + ui_settings.id)
            .then((response) => {
                return response.json();
            }).then((interfaceSettings) => {
        if (interfaceSettings === undefined || interfaceSettings.errors !== undefined)
            if (ui_settings.id === DFLT_INTERFACE_SETTINGS_ID) {
                let interfaceSettings = {};
                interfaceSettings.displayDuration = 300;
                interfaceSettings.hyperlink = "http://www.fh-bielefeld.de";
                interfaceSettings.historyTimeSpan = 7;
                fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataviewconfiguration/create', {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    body: JSON.stringify(interfaceSettings)
                }).then((data) => {
                    return data.json();
                }).then((json) => {
                    console.log(json);
                    if (json === undefined || json.errors !== undefined) {
                        throw json.errors;
                    } else {
                        setTimeout(() => {
                            location.reload();
                        }, 500);
                    }
                }).catch((error) => {
                    console.log("Unable to create default interfaceSettings");
                    UIkit.modal.alert(error);
                });
            } else {
                throw "InterfaceSettings loading error";
            }

        ui_settings.interfaceSettings = interfaceSettings;
        ui_settings.view.updateInterfaceSettings();
    }).catch((error) => {
        document.getElementById('alert_no_interface').hidden = false;
        ui_settings.error = true;
        console.error(error);
    });

    //Load diagrams
    fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataview/findByDataviewConfigurationId?dataviewConfiguration_id=' + ui_settings.id)
            .then((response) => {
                return response.json();
            }).then((diagrams) => {
        ui_settings.diagrams = [];
        if (diagrams === undefined || diagrams.error !== undefined)
            throw "No data could be loaded";
        diagrams.list.forEach((diagram) => {
            diagram.interfaceSettings_id = diagram.dataviewConfiguration.split('/').pop();
            delete diagram.interfaceSettings;
            
            diagram.ooTypeJoinMType_id = diagram.ooTypeJoinMType.split('/').pop();
            delete diagram.ooTypeJoinMType;
            
            if(diagram.observedObject !== undefined){
                diagram.observedObject_id = diagram.observedObject.split('/').pop();
                delete diagram.observedObject;                        
            }
            
            fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'measurementtype/get?id=' + diagram.ooTypeJoinMType_id)
                .then((response) => {
                    return response.json();
                }).then((measurement) => {
                    diagram.unit = measurement.unit;
                    diagram.ooTypeJoinMType_name = measurement.name;
                }).catch((error) => {
                
                });
            
            fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataview/colorRange/getByDataviewId?dataview_id=' + diagram.id)
                    .then((response) => {
                        return response.json();
                    }).then((colorRanges) => {
                if (colorRanges === undefined || colorRanges.error !== undefined)
                    throw "No data could be loaded";
                colorRanges.list.forEach((colorRange) => {
                    colorRange.diagram_id = colorRange.dataview.split('/').pop();
                    delete colorRange.diagram;
                });
                diagram.colorRanges = colorRanges.list;
            }).catch((error) => {
                console.error(error);
            }).finally(() => {
                ui_settings.diagrams.push(diagram);
                ui_settings.view.updateDiagrams();
            });
        });
    }).catch((error) => {
        console.error(error);
    });
};

/**
 * @method
 * persist calls all other persistence methods to persist all changes to the
 * database, waiting for finishing persistence to persist data in specified order.
 * When all data has been saved the page is reloaded.
 */
ui_settings.persist = () => {
    if (ui_settings.error) {
        console.log(ui_settings.error);
        UIkit.modal.alert("error " + ui_settings.error);
        return;
    }
    promises = ui_settings.persistColorRangeDeletions();
    promises.push(ui_settings.persistInterfaceSettings());
    promises.push(ui_settings.persistDiagrams());
    Promise.all(promises).then(() => {
        console.log(promises);
        promises = ui_settings.persistDiagramDeletions();
        Promise.all(promises).then(() => {
            setTimeout(() => {
                location.reload();
            }, 100);
        });
    });
};

/**
 * ui_settings.deletions contains lists of ids which corresponding objects should
 * be deleted
 */
ui_settings.deletions = {};
/**
 * ui_settings.deletions.diagrams contains a list of ids which corresponding
 * diagrams should be deleted
 * @type Array|Integer
 */
ui_settings.deletions.diagrams = [];
/**
 * ui_settings.deletions.color_ranges contains a list of ids which corresponding
 * color ranges should be deleted
 * @type Array|Integer
 */
ui_settings.deletions.color_ranges = [];

/**
 * @method
 * persistColorRangeDeletions is responsible for sending delete instructions for
 * color ranges to the backend
 * @returns {Array|Promise}
 */
ui_settings.persistColorRangeDeletions = () => {
    let promises = [];
    ui_settings.deletions.color_ranges.forEach((col_id) => {
        promises.push(fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataview/colorRange/delete?id=' + col_id, {
            method: 'delete'
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        }));
    });
    ui_settings.deletions.color_ranges = [];
    return promises;
};

/**
 * @method
 * persistDiagramDeletions is responsible for sending delete instructions for
 * diagrams to the backend
 * @returns {Array|Promise}
 */
ui_settings.persistDiagramDeletions = () => {
    let promises = [];
    ui_settings.deletions.diagrams.forEach((col_id) => {
        promises.push(fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataview/delete?id=' + col_id, {
            method: 'delete'
        }).then((response) => {
            console.log(response);
        }).catch((error) => {
            console.log(error);
        }));
    });
    ui_settings.deletions.diagrams = [];
    return promises;
};

/**
 * @method
 * persistInterfaceSettings is responsible for persisting changes to the interface
 * settings object in the database
 * @returns {Promise}
 */
ui_settings.persistInterfaceSettings = () => {
    return fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataviewconfiguration/update', {
        method: "PUT",
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(ui_settings.interfaceSettings)
    });
};

/**
 * @method
 * persistDiagrams is responsible for persisting changes to the diagram
 * objects in the database
 * @returns {Array|Promise}
 */
ui_settings.persistDiagrams = () => {
    promises = [];
    ui_settings.diagrams.forEach((diagram) => {
        promise = null;
        if (diagram.id === undefined) {
            promise = fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataview/create?', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(diagram)
            });
        } else {
            promise = fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataview/update?', {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify(diagram)
            });
        }
        promise.then((response) => {
            console.log(response);
            return response.json();
        }).then((diagram_data) => {
            console.log(diagram_data);
            diagram.id = diagram_data.id;
            for (let j in diagram.colorRanges) {
                color_range = diagram.colorRanges[j];
                color_range.dataview_id = diagram_data.id;
            }            
            ui_settings.persistColorRanges(diagram);
        }).catch((error) => {
            console.log(error);
        });
        promises.push(promise);
    });
     
    return promises;
};

/**
 * @method
 * persistColorRanges is responsible for persisting changes to the color range
 * objects in the database
 * @returns {Array|Promise}
 */
ui_settings.persistColorRanges = (diagram) => {
    promises = [];
        diagram.colorRanges.forEach((color_range) => {
            console.log(color_range);
            promise = null;
            
            fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataview/get?id=' + color_range.dataview_id)
            .then((response) => {
                return response.json();
            }).then((dataview) => {                 
                color_range.dataview = dataview;
                
                if (color_range.id === undefined) {
                    console.log("count");
                    promise = fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataview/colorRange/create', {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json; charset=utf-8"
                        },
                        body: JSON.stringify(color_range)
                    }).then((response) => {
                        return response.json();
                    }).then((color_range_data) => {
                        color_range.id = color_range_data.id;
                    }).catch((error) => {
                        console.log(error);
                    });
                } else {
                    promise = fetch(SWAC_config.datasources[0].replace('[fromName]', '') + 'dataview/colorRange/update?', {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json; charset=utf-8"
                    },
                    body: JSON.stringify(color_range)
                    }).then((response) => {
                        return response.json();
                    }).then((color_range_data) => {
                        color_range.id = color_range_data.id;
                    }).catch((error) => {
                        console.log(error);
                    });
                }              
            }).catch((error) => {            
            });        
        });
    return promise;
};

/**
 * @method
 * createDiagram is creating a new diagram in the diagram list
 * @param {string} name
 */
ui_settings.createDiagram = (name) => {
    let diagram = {};
    diagram.name = name;
    diagram.colorRanges = [];
    diagram.interfaceSettings_id = ui_settings.id;
    ui_settings.diagrams.push(diagram);
    ui_settings.view.updateDiagrams();
};

/**
 * ui_setttings is an object that contains all the necessary methods for
 * displaying data in the browser and to collect inputs from the view
 */
ui_settings.view = {};

/**
 * @method
 * updateInterfaceSettings displays loaded interface settings values in the browser
 */
ui_settings.view.updateInterfaceSettings = () => {
    if (ui_settings.interfaceSettings !== undefined) {
        document.getElementById("input_displayduration").value = ui_settings.interfaceSettings.displayDuration;
        document.getElementById("input_hyperlink").value = ui_settings.interfaceSettings.hyperlink;
        document.getElementById("input_timespan").value = ui_settings.interfaceSettings.historyTimeSpan;
    }
};

/**
 * @method
 * updateDiagrams displays loaded diagrams and its color ranges in the browser
 */
ui_settings.view.updateDiagrams = () => {
    let in_tab_before = document.getElementById("in_tab_before");
    let in_content_before = document.getElementById("in_content_before");
    let in_tab_parent = in_tab_before.parentNode;
    let in_content_parent = in_content_before.parentNode;
    while (in_tab_parent.firstChild) {
        in_tab_parent.removeChild(in_tab_parent.firstChild);
        in_content_parent.removeChild(in_content_parent.firstChild);
    }
    for (let diagram_id in ui_settings.diagrams) {
        let diagram = ui_settings.diagrams[diagram_id];
        let tab_view = ui_settings.view.prefabs.tab_view.cloneNode(true);
        tab_view.childNodes[0].innerHTML = "Diagramm " + diagram.id;
        let diagram_view = ui_settings.view.prefabs.diagram_view.cloneNode(true);
        diagram_view.childNodes[3].childNodes[1].value = diagram.id;
        diagram_view.childNodes[7].childNodes[1].value = "Diagramm " + diagram.id;
        diagram_view.childNodes[19].childNodes[1].value = diagram.unit;
        if (diagram.observedObject_id !== undefined) {
            diagram_view.childNodes[11].childNodes[1].innerText = ui_settings.ooidToOoName(parseInt(diagram.observedObject_id));
            diagram_view.childNodes[11].childNodes[1].setAttribute("ooid", parseInt(diagram.observedObject_id));
        }
        ui_settings.view.buildObservedObjectDropdown(diagram_view.childNodes[11].childNodes[3], diagram_view.childNodes[11].childNodes[1], diagram_view.childNodes[15].childNodes[3], diagram_view.childNodes[15].childNodes[1], diagram_view.childNodes[19].childNodes[1]);
        if (diagram.ooTypeJoinMType_id !== undefined) {
            if(diagram.ooTypeJoinMType_name !== undefined){
                diagram_view.childNodes[15].childNodes[1].innerText = diagram.ooTypeJoinMType_name;
            }else {
                diagram_view.childNodes[15].childNodes[1].innerText = ui_settings.joinerIdToOoName(parseInt(diagram.ooTypeJoinMType_id));               
            }
            diagram_view.childNodes[15].childNodes[1].setAttribute("joinerid", parseInt(diagram.ooTypeJoinMType_id));
        }
        ui_settings.view.buildOoTypeJoinMTypeDropdown(diagram_view.childNodes[15].childNodes[3], diagram_view.childNodes[15].childNodes[1], parseInt(diagram.observedObject_id), diagram_view.childNodes[19].childNodes[1]);
        if (diagram.unit !== undefined)
            diagram_view.childNodes[19].childNodes[1].value = diagram.unit;
        if (diagram.diagramType !== undefined) {
            diagram_view.childNodes[23].childNodes[1].innerText = diagram_types[parseInt(diagram.diagramType)].name;
            diagram_view.childNodes[23].childNodes[1].setAttribute("typeid", parseInt(diagram.diagramType));
        }
        ui_settings.view.buildDiagramTypeDropdown(diagram_view.childNodes[23].childNodes[3], diagram_view.childNodes[23].childNodes[1]);
        
        if (diagram.weatherDiagram === true) {
            diagram_view.childNodes[27].childNodes[3].value = 1;
        } else {
            diagram_view.childNodes[27].childNodes[3].value = 0;
        }
        let btn_add_color_range = diagram_view.childNodes[29];
        let btn_delete_diagram = diagram_view.childNodes[31];
        for (let color_range_id in diagram.colorRanges) {
            let color_range = diagram.colorRanges[color_range_id];
            let color_range_view = ui_settings.view.prefabs.color_range_view.cloneNode(true);
            color_range_view.childNodes[5].childNodes[1].value = color_range.id;
            color_range_view.childNodes[9].childNodes[1].value = color_range.minValue;
            color_range_view.childNodes[13].childNodes[1].value = color_range.maxValue;
            color_range_view.childNodes[17].childNodes[1].value = rgbDefinitionToHex(color_range.color);
            let btn_delete_color_range = color_range_view.childNodes[19];
            btn_delete_color_range.addEventListener('click', () => {
                if (btn_delete_color_range.parentNode.childNodes[5].childNodes[1].value !== undefined) {
                    ui_settings.deletions.color_ranges.push(color_range.id);
                }
                btn_delete_color_range.parentNode.remove();
            });
            diagram_view.insertBefore(color_range_view, btn_add_color_range);
        }
        btn_add_color_range.addEventListener('click', () => {
            let color_range_view = ui_settings.view.prefabs.color_range_view.cloneNode(true);
            let btn_delete_color_range = color_range_view.childNodes[19];
            btn_delete_color_range.addEventListener('click', () => {
                btn_delete_color_range.parentNode.remove();
            });
            diagram_view.insertBefore(color_range_view, btn_add_color_range);
        });
        btn_delete_diagram.addEventListener('click', () => {
            tab_view.remove();
            diagram_view.remove();
            for (let i in ui_settings.diagrams) {
                if (ui_settings.diagrams[i] === diagram) {
                    if (diagram.id !== undefined) {
                        ui_settings.deletions.diagrams.push(diagram.id);
                        diagram.colorRanges.forEach((color_range) => {
                            ui_settings.deletions.color_ranges.push(color_range.id);
                        });
                    }
                    ui_settings.diagrams.splice(i);
                }
            }
        });
        in_tab_parent.appendChild(tab_view);
        in_content_parent.appendChild(diagram_view);
    }
    in_tab_parent.appendChild(in_tab_before);
    in_content_parent.appendChild(in_content_before);
};

/**
 * @method
 * saveDataFromView is collecting all data from the browser and storing it into
 * the variables used to transport data on the frontend
 */
ui_settings.view.saveDataFromView = () => {
    if (ui_settings.error)
        return;
    ui_settings.interfaceSettings.id = ui_settings.id;
    ui_settings.interfaceSettings.displayDuration = parseInt(document.getElementById("input_displayduration").value);
    ui_settings.interfaceSettings.hyperlink = document.getElementById("input_hyperlink").value;
    ui_settings.interfaceSettings.historyTimeSpan = parseInt(document.getElementById("input_timespan").value);
    ui_settings.diagrams = [];
    Array.from(document.getElementsByClassName('sm_data_diagram')).forEach((diagram_view) => {
        let diagram = {};
        if (diagram_view.childNodes[3].childNodes[1].value !== '' && diagram_view.childNodes[3].childNodes[1].value !== 'undefined' && diagram_view.childNodes[3].childNodes[1].value !== undefined)
            diagram.id = parseInt(diagram_view.childNodes[3].childNodes[1].value);
        diagram.name = diagram_view.childNodes[7].childNodes[1].value;
        diagram.observedObject = "ref://" + parseInt(diagram_view.childNodes[11].childNodes[1].getAttribute('ooid'));
        diagram.ooTypeJoinMType = "ref://" + parseInt(diagram_view.childNodes[15].childNodes[1].getAttribute('joinerid'));
        diagram.unit = diagram_view.childNodes[19].childNodes[1].value;
        diagram.diagramType = parseInt(diagram_view.childNodes[23].childNodes[1].getAttribute('typeid'));
        
        if (parseInt(diagram_view.childNodes[27].childNodes[3].value) === 1) {
            diagram.weatherDiagram = true;
        } else {
            diagram.weatherDiagram = false;
        }        
        diagram.colorRanges = [];
        diagram.dataviewConfiguration = "ref://" + ui_settings.id;
        Array.from(document.getElementsByClassName('sm_data_color_range')).forEach((color_range_view) => {
            if (color_range_view.parentNode === diagram_view) {
                let color_range = {};
                if (color_range_view.childNodes[5].childNodes[1].value !== '')
                    color_range.id = color_range_view.childNodes[5].childNodes[1].value;
                color_range.dataview_id = parseInt(diagram.id);
                color_range.minValue = parseFloat(color_range_view.childNodes[9].childNodes[1].value);
                color_range.maxValue = parseFloat(color_range_view.childNodes[13].childNodes[1].value);
                color_range.color = hexToRgbDefinition(color_range_view.childNodes[17].childNodes[1].value);
                if (diagram.id !== undefined)
                    color_range.diagram_id = diagram.id;
                diagram.colorRanges.push(color_range);
            }
        });
        ui_settings.diagrams.push(diagram);
    });
};

/**
 * Checks wether all saved data is correct
 */
ui_settings.checkForWellFormedInterfaceSettings = () => {
    if (ui_settings.error)
        return "Ein unbekannter Fehler ist aufgetreten.";
    if (isNaN(ui_settings.interfaceSettings.displayDuration))
        return "Die Anzeigedauer wurde nicht korrekt gesetzt.";
    if (isNaN(ui_settings.interfaceSettings.historyTimeSpan))
        return "Die Zeitspanne der Historie wurde nicht korrekt gesetzt.";
    for (let diagram_id in ui_settings.diagrams) {
        let diagram = ui_settings.diagrams[diagram_id];
        if (isNaN(diagram.observedObject.split('/').pop()))
            return "Die ObservedObject Einstellung des Diagrams " + diagram.name + " wurde nicht korrekt gesetzt.";
        if (isNaN(diagram.ooTypeJoinMType.split('/').pop()))
            return "Die OoTypeJoinMType Einstellung des Diagrams " + diagram.name + " wurde nicht korrekt gesetzt.";
        if (isNaN(diagram.diagramType))
            return "Der Diagramm Typ des Diagrams " + diagram.name + " wurde nicht korrekt gesetzt.";
        if (diagram.colorRanges.length < 1)
            return "Das Diagramm " + diagram.name + " muss mindestens einen Farbbereich besitzen.";
        for (let colorRange_id in diagram.colorRanges) {
            let colorRange = diagram.colorRanges[colorRange_id];
            if (isNaN(colorRange.minValue))
                return "Der Von Wert eines Farbbereich des Diagrams " + diagram.name + " wurde nicht korrekt gesetzt.";
            if (isNaN(colorRange.maxValue))
                return "Der Bis Wert eines Farbbereich des Diagrams " + diagram.name + " wurde nicht korrekt gesetzt.";
            if (colorRange.minValue > colorRange.maxValue)
                return "Der Von Wert eines Farbbereiches des Diagrams " + diagram.name + " ist größer als dessen Bis Wert.";
        }
    }
    return null;
};

/**
 * Generates the dropdown for ObservedObject and adds an EventListener for each element in the
 * dropdown
 * @param {DOM-Element} dropdown
 * @param {DOM-Element} button
 */
ui_settings.view.buildObservedObjectDropdown = (dropdown, button, joinerDropdown, joinerButton, unit_input) => {
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }
    let list = document.createElement('ul');
    list.classList.add('uk-nav', 'uk-dropdown-nav');
    for (let oo_index in ui_settings.observed_objects) {
        if(ui_settings.observed_objects[oo_index].joiner !== undefined || ui_settings.observed_objects[oo_index].joiner.length !== 0) {
            let oo = ui_settings.observed_objects[oo_index];
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.innerText = oo.name;
            a.addEventListener('click', () => {
                button.innerText = oo.name;
                button.setAttribute('ooid', oo.id);
                joinerButton.innerText = null;
                unit_input.value = null;
                joinerButton.removeAttribute('joinerid');
                ui_settings.view.buildOoTypeJoinMTypeDropdown(joinerDropdown, joinerButton, oo.id, unit_input);
            });
            li.appendChild(a);
            list.appendChild(li);
        }
    }
    dropdown.appendChild(list);
};


/**
 * Generates the dropdown for OoTypeJoinMType and adds an EventListener for each element in the
 * dropdown
 * @param {DOM-Element} dropdown
 * @param {DOM-Element} button
 */
ui_settings.view.buildOoTypeJoinMTypeDropdown = (dropdown, button, ooid, unit_input) => {
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }
    let observedObject = null;
    for (let oo in ui_settings.observed_objects) {
        if (ui_settings.observed_objects[oo].id === parseInt(ooid)) {
            observedObject = ui_settings.observed_objects[oo];
        }
    }
    if (observedObject !== null) {
        let list = document.createElement('ul');
        list.classList.add('uk-nav', 'uk-dropdown-nav');
        for (let joiner_index in observedObject.joiner) {
            let joiner = observedObject.joiner[joiner_index];
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.innerText = joiner.aliasname;
            a.addEventListener('click', () => {
                button.innerText = joiner.aliasname;
                if (joiner.measurementtype.unit !== undefined)
                    unit_input.value = joiner.measurementtype.unit;
                else
                    unit_input.value = null;
                button.setAttribute('joinerid', joiner.id);
            });
            li.appendChild(a);
            list.appendChild(li);
        }
        dropdown.appendChild(list);
    }
};


/**
 * Generates the dropdown for DiagramType and adds an EventListener for each element in the
 * dropdown
 * @param {DOM-Element} dropdown
 * @param {DOM-Element} button
 */
ui_settings.view.buildDiagramTypeDropdown = (dropdown, button) => {
    while (dropdown.firstChild) {
        dropdown.removeChild(dropdown.firstChild);
    }
    let list = document.createElement('ul');
    list.classList.add('uk-nav', 'uk-dropdown-nav');
    for (let type_index in diagram_types) {
        let type = diagram_types[type_index];
        let li = document.createElement('li');
        let a = document.createElement('a');
        a.innerText = type.name;
        a.addEventListener('click', () => {
            button.innerText = type.name;
            button.setAttribute('typeid', type_index);
        });
        li.appendChild(a);
        list.appendChild(li);
    }
    dropdown.appendChild(list);
};

/**
 * ui_settings.view.prefabs is used to store and load all the predesigned prefabs
 * for using it to display data in the browser
 */
ui_settings.view.prefabs = {};

/**
 * @method
 * prefabs.load loads all created prefab from the html dom, deleting them there
 * and saving them for recreating them later when loading the diagrams into the
 * view
 */
ui_settings.view.prefabs.load = () => {
    ui_settings.view.prefabs.tab_view = document.getElementById("prefab_tab");
    ui_settings.view.prefabs.diagram_view = document.getElementById("prefab_diagram");
    ui_settings.view.prefabs.color_range_view = document.getElementById("prefab_color_range");
    ui_settings.view.prefabs.tab_view.hidden = false;
    ui_settings.view.prefabs.diagram_view.hidden = false;
    ui_settings.view.prefabs.color_range_view.hidden = false;
    ui_settings.view.prefabs.tab_view.remove();
    ui_settings.view.prefabs.diagram_view.remove();
    ui_settings.view.prefabs.color_range_view.remove();
};

/**
 * getUiSettingsId loads the interface settings id specified in the query params.
 * If none has been specified it is returning the DFLT_INTERFACE_SETTINGS_ID
 * @returns {Number|DFLT_INTERFACE_SETTINGS_ID}
 */
function getUiSettingsId() {
    let urlParams = new URLSearchParams(window.location.search);
    let id = undefined;
    if (urlParams.has('id')) {
        id = parseInt(urlParams.get('id'));
    } else {
        id = DFLT_INTERFACE_SETTINGS_ID;
    }
    return id;
}

//Helper Functions
/**
 * @function
 * converting a string of the format '#RRGGBB' into the format 'rgb(R,G,B)'
 * @param {String} hex
 * @returns {String}
 */
function hexToRgbDefinition(hex) {
    let rgb = hexToRgb(hex);
    return 'rgb(' + rgb.r + ', ' + rgb.g + ', ' + rgb.b + ')';
}

/**
 * @function
 * converting a string of the format '#RRGGBB' into an object with the attributes
 * r, g, and b
 * @param {String} hex
 * @returns {Object}
 */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

/**
 * @function
 * converting a string of the format 'rgb(R,G,B)' into the format '#RRGGBB'
 * @param {String} rgb
 * @returns {String}
 */
function rgbDefinitionToHex(rgb) {
    let rgbArray = rgb.split('(')[1].split(',');
    return rgbToHex(parseInt(rgbArray[0]), parseInt(rgbArray[1]), parseInt(rgbArray[2]));
}

/**
 * @function
 * converting the parameters into the format '#RRGGBB'
 * @param {Number} r
 * @param {Number} g
 * @param {Number} b
 * @returns {String}
 */
function rgbToHex(r, g, b) {
    return '#' + colorToHex(r) + colorToHex(g) + colorToHex(b);
}

/**
 * @function
 * converting a Number to its hex value
 * @param {Number} col
 * @returns {String}
 */
function colorToHex(col) {
    let hex = Number(col).toString(16);
    if (hex.length < 2)
        hex = '0' + hex;
    return hex;
}
