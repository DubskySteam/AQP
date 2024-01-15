/**
 * Options for observedobjecttype editor
 */
observedobjecttypes_options = {
    showWhenNoData: true,
    mainSource: 'tbl_observedobject_type',
    notShownAttrs: {
        "tbl_observedobject_type": ['id']
    },
    allowAdd: true,
    allowDel: true,
    fetchDefinitions: true,
    editorTargetElement: '.swac_edit_editorTarget',
    dropAccepts: new Map(),
    dropFunctions: new Map(),
    dropJoinerTargets: new Map()
};
observedobjecttypes_options.dropAccepts.set('ootypejoinmtypes', 'measurementtype');
observedobjecttypes_options.dropJoinerTargets.set('ootypejoinmtypes', {
    targetSetName: 'observedobjecttypejoinmeasurementtype',
    referenceFromName: 'observedobjectType',
    referenceDropName: 'measurementType'
});

/**
 * Options for measurementtypes editor
 */
measurementtypes_options = {
    showWhenNoData: true,
    mainSource: 'tbl_measurement_type',
    notShownAttrs: {
        ["tbl_measurement_type"]: ['id']
    },
    allowAdd: true,
    allowDel: true,
    fetchDefinitions: true,
    editorTargetElement: '.swac_edit_editorTarget',
    possibleValues: new Map()
};
measurementtypes_options.possibleValues.set('type', ['integer', 'float8', 'boolean', 'varchar', 'text', 'timestamp', 'date', 'time', 'interval', 'geometry']);

/**
 * Options for joiner of objecttypes and measurementtypes
 */
ootypesjoinmtypes_options = {
    showWhenNoData: true,
    mainSource: 'tbl_ootype_join_mtype',
    notShownAttrs: {
        ["tbl_ootype_join_mtype"]: ['id']
    },
    allowAdd: true,
    allowDel: true,
    fetchDefinitions: true,
    editorTargetElement: '.swac_edit_editorTarget'
};

/**
 * Options for metadatatypes editor
 */
metadatatypes_options = {
    showWhenNoData: true,
    mainSource: 'tbl_observedobject_metadata_type',
    notShownAttrs: {
        ["tbl_observedobject_metadata_type"]: ['id']
    },
    allowAdd: true,
    allowDel: true,
    fetchDefinitions: true,
    editorTargetElement: '.swac_edit_editorTarget'
};

/**
 * Options for joiner of objecttypes and metadatatypes
 */
ootypesjoinmetatypes_options = {
    showWhenNoData: true,
    mainSource: 'tbl_ootype_join_oometadatatype',
    notShownAttrs: {
        ["tbl_ootype_join_oometadatatype"]: ['id']
    },
    allowAdd: true,
    allowDel: true,
    fetchDefinitions: true,
    editorTargetElement: '.swac_edit_editorTarget'
};


// Functions to execute when page is completely loaded
document.addEventListener('swac_ready', function () {

    // Get SmartData datasource
    for (let curSource of window.swac.config.datasources) {
        let index = curSource.url.indexOf('/smartdata/');
        if (index > 0) {
            sdsource = curSource.url.substring(0, index + 11);
            break;
        }
    }
    if (!sdsource) {
        UIkit.modal.alert(window.swac.lang.dict.app.adm_functionsnotavail);
        return;
    }

    // Register action for when functions list has loaded
    window.swac.reactions.addReaction(function (requestors) {
        let objtypesRequestor = requestors['admin_objecttypes'];
        let stateProms = [];
        // Check each functions state
        for (let curSet of objtypesRequestor.swac_comp.getMainSourceData().getSets()) {
            if (!curSet)
                continue;
            // Call each state function
            for (let curState of curSet.state) {
                let stateProm = new Promise((resolve, reject) => {
                    let stateinstalled = true;
                    if (curState.type === 'rest') {
                        fetch(sdsource + curState.url).then(function (res) {
                            res.json().then(function (data) {
                                // Look at first (and should be the only one) result object if response is from TreeQL api.
                                if (data.records) {
                                    data = data.records[0];
                                }
                                // Do checks if needed
                                if (curState.check) {
                                    let checks = curState.check.split(';');
                                    for (let curCheck of checks) {
                                        let checkparts = curCheck.split('=');
                                        if ((data[checkparts[0]] + '') != checkparts[1]) {
                                            stateinstalled = false;
                                            break;
                                        }
                                    }
                                } else if (res.ok === false || !data) {
                                    stateinstalled = false;
                                }
                                adm_objtypes.installstates.set(curSet.name + '_' + curState.name, stateinstalled);
                                resolve({curState, stateinstalled});
                            });
                        }).catch(function (err) {
                            reject(err);
                        });
                    } else {
                        reject("Type >" + curState.type + "< for checking functions state is currently not supported.");
                    }
                });
                stateProms.push(stateProm);
            }

            let funcElem = objtypesRequestor.querySelector('[swac_setid="' + curSet.id + '"]');
            // Wait until all state checks have a result
            Promise.all(stateProms).then(function (results) {
                let itrue = 0;
                let ifalse = 0;
                for (let curRes of results) {
                    if (curRes.stateinstalled)
                        itrue++;
                    else
                        ifalse++;
                }

                // Hide or show button
                if (itrue === results.length) {
                    funcElem.querySelector('.install').classList.add('swac_dontdisplay');
                    funcElem.querySelector('.uninstall').classList.remove('swac_dontdisplay');
                } else if (ifalse === results.length) {
                    funcElem.querySelector('.install').classList.remove('swac_dontdisplay');
                    funcElem.querySelector('.uninstall').classList.add('swac_dontdisplay');
                } else {
//                    funcElem.querySelector('.install').classList.add('swac_dontdisplay');
//                    funcElem.querySelector('.uninstall').classList.add('swac_dontdisplay');
                    funcElem.querySelector('.notice').innerHTML = window.swac.lang.dict.app.adm_objtypesstatesome;
                }
            }).catch(function (err) {
                funcElem.querySelector('.install').classList.add('swac_dontdisplay');
                funcElem.querySelector('.uninstall').classList.add('swac_dontdisplay');
                funcElem.querySelector('.notice').innerHTML = window.swac.lang.dict.app.adm_objtypesstateerr + ' ' + err;
            });
        }



        // Register event listener to buttons
        let activateBtns = document.querySelectorAll('.install, .uninstall');
        for (let curBtn of activateBtns) {
            curBtn.addEventListener('click', adm_objtypes.onUnInstall);
        }
    }, "admin_objecttypes", "translate");
});

var adm_objtypes = {};
adm_objtypes.installstates = new Map();
adm_objtypes.onUnInstall = function (evt) {
    evt.preventDefault();
    let setElem = evt.target;
    while (!setElem.classList.contains('swac_repeatedForSet') && setElem.parentElement) {
        setElem = setElem.parentElement;
    }

    let set = setElem.swac_dataset;
    let mode = 'install';
    if (evt.target.classList.contains('uninstall')) {
        mode = 'uninstall';
    }

    if (set.collections) {
        adm_objtypes.unInstallCollections(set, mode);
    } else {
        adm_objtypes.unInstallData(set, mode);
    }
};

/**
 * Create or delete collections
 * 
 * @param {WatchableSet} set    Set with collection definition
 * @param {String} mode     install or uninstall
 * @returns {undefined}
 */
adm_objtypes.unInstallCollections = function (set, mode) {

    // Get SmartData datasource
    for (let curSource of window.swac.config.datasources) {
        let index = curSource.url.indexOf('/smartdata/');
        if (index > 0) {
            sdsource = curSource.url.substring(0, index + 11);
            break;
        }
    }
    if (!sdsource) {
        UIkit.modal.alert(window.swac.lang.dict.app.adm_functionsnotavail);
        return;
    }

    // Create needed tables
    for (let curCol of set.collections) {
        // Install
        if (mode === 'install') {
            // Ignore if allready installed
            if (adm_objtypes.installstates.has(set.name + '_' + curCol.name) && adm_objtypes.installstates.get(set.name + '_' + curCol.name))
                continue;
            let body = curCol.body;
            if (typeof curCol.body === 'object')
                body = JSON.stringify(curCol.body);
            fetch(sdsource + curCol.url, {
                method: curCol.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: body
            }).then(function (res) {
                if (res.ok) {
                    adm_objtypes.unInstallData(set, mode);
                } else {
                    res.json().then(function (data) {
                        UIkit.modal.alert(window.swac.lang.adm_objinstallerr + ' ' + data);
                    });
                }
            }).catch(function (err) {
                console.error('Error: ' + err);
            });
        } else {
            fetch(sdsource + curCol.url, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(function (res) {
                if (res.ok) {
                    adm_objtypes.unInstallData(set, mode);
                } else {
                    res.json().then(function (data) {
                        UIkit.modal.alert(window.swac.lang.adm_objuninstallerr + ' ' + data);
                    });
                }
            }).catch(function (err) {
                console.error('Error: ' + err);
            });
        }
    }
};

/**
 * Create or delete data
 * 
 * @param {WatchableSet} set    Set with data definition
 * @param {String} mode     install or uninstall
 * @returns {undefined}
 */
adm_objtypes.unInstallData = function (set, mode) {
    // Get SmartData datasource
    for (let curSource of window.swac.config.datasources) {
        let index = curSource.url.indexOf('/smartdata/');
        if (index > 0) {
            sdsource = curSource.url.substring(0, index + 11);
            break;
        }
    }
    if (!sdsource) {
        UIkit.modal.alert(window.swac.lang.dict.app.adm_functionsnotavail);
        return;
    }

    let dataProms = [];
    // Add needed data
    for (let curData of set.data) {
        // Ignore if allready installed
        if (adm_objtypes.installstates.has(set.name + '_' + curData.name) && adm_objtypes.installstates.get(set.name + '_' + curData.name))
            continue;
        let dataProm = new Promise((resolve, reject) => {
            // Install
            if (mode === 'install') {
                let body = curData.body;
                if (typeof curData.body === 'object')
                    body = JSON.stringify(curData.body);
                fetch(sdsource + curData.url, {
                    method: curData.method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: body
                }).then(function (res) {
                    if (res.ok) {
                        resolve(true);
                    } else {
                        res.json().then(function (data) {
                            reject(data);
                        });
                    }
                }).catch(function (err) {
                    reject(err);
                });
            } else {
                // mode === 'uninstall'
                const resolved = false;
                // if the collection was deleted, the data can't be deleted
                for (let collection of curData.collection) {
                    if (collection.name === curData.name) {
                        resolve(true);
                        resolved = true;
                    }
                }
                if (!resolved) { 
                    reject("Datensätze können in dieser Version nicht deinstalliert werden. Bitte deinstallieren Sie diese manuell.");
                }
            }
        });
        dataProms.push(dataProm);
    }

    Promise.all(dataProms).then(function (results) {
        if (mode === 'install') {
            let modal = UIkit.modal.alert(window.swac.lang.dict.app.adm_objtypeinstalled);
            modal.then(function () {
                location.reload();
            });
        } else {
            // mode == 'uninstall
            if (results.every(result => result === true)) {
                let modal = UIkit.modal.alert(window.swac.lang.dict.app.adm_objtypeuninstalled);
                modal.then(function () {
                    location.reload();
                });
            } else {
                let modal = UIkit.modal.alert(window.swac.lang.dict.app.adm_objtypeuninstalled + "Datensätze können in dieser Version nicht deinstalliert werden. Bitte deinstallieren Sie diese manuell.");
                modal.then(function () {
                    location.reload();
                });
            }
        }
    }).catch(function (err) {
        let modal = UIkit.modal.alert(err);
        modal.then(function () {
            location.reload();
        });
    });
};