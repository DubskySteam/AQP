/**
 * Scripts and options for components on the admin functions page
 */

var sdsource;
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
        let funcRequestor = requestors['admin_functions'];

        // Check each functions state
        for (let curSet of funcRequestor.swac_comp.getMainSourceData().getSets()) {
            if (!curSet || !curSet.state)
                continue;
            // Call each state function
            let stateactive = true;
            for (let curState of curSet.state) {
                if (curState.type === 'rest') {
                    fetch(sdsource + curState.url).then(function (res) {
                        res.json().then(function (data) {
                            // Look at first (and should be the only one) result object if response is from TreeQL api.
                            if (data.records) {
                                data = data.records[0];
                            }
                            let funcElem = funcRequestor.querySelector('[swac_setid="' + curSet.id + '"]');
                            // If there is no data
                            if (!data) {
                                console.warn('Function >' + curSet.name + '< is not available in this installation. Check the tbl_systemconfiguration entry exists, if you thnink this is an error.');
                                funcElem.querySelector('.activate').classList.add('swac_dontdisplay');
                                funcElem.querySelector('.deactivate').classList.add('swac_dontdisplay');
                                let msgElem = document.createElement('div');
                                msgElem.classList.add('uk-alert-danger');
                                msgElem.innerHTML = window.swac.lang.dict.app.adm_functionsnoentry;
                                funcElem.querySelector('.uk-card').appendChild(msgElem);
                                return;
                            }

                            // Do checks if needed
                            if (curState.check) {
                                let checks = curState.check.split(';');
                                for (let curCheck of checks) {
                                    let checkparts = curCheck.split('=');
                                    if ((data[checkparts[0]] + '') != checkparts[1]) {
                                        stateactive = false;
                                        break;
                                    }
                                }
                            } else if (res.ok === false || !data) {
                                stateactive = false;
                            }



                            // Hide or show button
                            if (stateactive) {
                                funcElem.querySelector('.activate').classList.add('swac_dontdisplay');
                                funcElem.querySelector('.deactivate').classList.remove('swac_dontdisplay');
                            } else {
                                funcElem.querySelector('.activate').classList.remove('swac_dontdisplay');
                                funcElem.querySelector('.deactivate').classList.add('swac_dontdisplay');
                            }
                        });
                    }).catch(function (err) {
                        console.error('Error: ' + err);
                    });
                } else {
                    console.error("Type >" + curState.type + "< for checking functions state is currently not supported.");
                }
            }
        }

        // Register event listener to buttons
        let activateBtns = document.querySelectorAll('.activate, .deactivate');
        for (let curBtn of activateBtns) {
            curBtn.addEventListener('click', adm_functions.onDeActivate);
        }
    }, "admin_functions", "translate");
});


var adm_functions = {};

/**
 * Activate or deactivate a function
 * 
 * @param {Event} evt Event calling the state toggle
 * @returns {undefined}
 */
adm_functions.onDeActivate = function (evt) {
    evt.preventDefault();
    let setElem = evt.target;
    while (!setElem.classList.contains('swac_repeatedForSet') && setElem.parentElement) {
        setElem = setElem.parentElement;
    }

    let set = setElem.swac_dataset;

    // Check if collection is needed
    let colProms = [];
    if (set.collections) {
        for (let curCol of set.collections) {
            // Check if collection allready exists
            let curProm = new Promise((resolve, reject) => {
                fetch(sdsource + 'collection/' + curCol.name + '?storage=smartmonitoring', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(function (res) {
                    if (res.ok) {
                        if (evt.target.classList.contains('deactivate')) {
                            UIkit.modal.alert(window.swac.lang.dict.app.adm_funtioncoluninstalled).then(function() {
                                resolve();
                            });
                        } else {
                            resolve();
                        }
                    } else {
                        // Create collection
                        if (evt.target.classList.contains('activate')) {
                            fetch(sdsource + 'collection/' + curCol.name + '?storage=smartmonitoring', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify(curCol)
                            }).then(function (res) {
                                if (res.ok) {
                                    resolve();
                                } else {
                                    reject();
                                }
                            }).catch(function (err) {
                                reject();
                            });
                        } else {
                            resolve();
                        }
                    }
                });
            });
            colProms.push(curProm);
        }
    }

    // Wait for table installations
    Promise.all(colProms).then(function () {
        let def = set.deactivate;
        if (evt.target.classList.contains('activate')) {
            def = set.activate;
        }
        // Perform actions for toggle
        for (let curAct of def) {
            if (curAct.type === 'rest') {
                let body = curAct.body;
                if (typeof curAct.body === 'object')
                    body = JSON.stringify(curAct.body);

                fetch(sdsource + curAct.url, {
                    method: curAct.method,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: body
                }).then(function (res) {
                    if (res.ok) {
                        if (evt.target.classList.contains('activate')) {
                            UIkit.modal.alert(window.swac.lang.dict.app.adm_funtionactivated);
                        } else {
                            UIkit.modal.alert(window.swac.lang.dict.app.adm_funtiondeactivated);
                        }
                        location.reload();
                    } else {
                        res.json().then(function (data) {
                            UIkit.modal.alert(window.swac.lang.adm_funtionactivaterr + ' ' + data);
                        });
                    }
                }).catch(function (err) {
                    console.error('Error: ' + err);
                });
            } else {
                console.error('Type >' + def.type + '< is currently not supported for activateing / deactivateing functions.');
            }
        }
    }).catch(function () {
        console.log('at least one table could not be installed.');
    });
};