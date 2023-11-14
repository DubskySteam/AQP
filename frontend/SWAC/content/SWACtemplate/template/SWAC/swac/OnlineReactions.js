/* 
 * Class for online / offline switch event handlings
 */

class OnlineReactions {
    constructor(config) {
        this.config = config;
        this.reactions = [];

        // Get configured reactions
        let loadPromises = [];
        for (let curReaction of SWAC_config.onlinereactions) {
            loadPromises.push(this.addReaction(curReaction));
        }
        let thisRef = this;
        Promise.all(loadPromises).then(
                function () {
                    window.addEventListener('online', thisRef.onOnline.bind(thisRef));
                    window.addEventListener('offline', thisRef.onOffline.bind(thisRef));
                    thisRef.reactOnCurrentState();
                    Msg.flow('OnlineReactions', 'SWAC OnlineReactions ready with ' + loadPromises.length + ' reactions.');
                }
        ).catch(
                function (error) {
                    Msg.error('OnlineReactions', 'Could not load all OnlineReactions: ' + error);
                }
        );
    }

    /**
     * Calls reactions to the current state.
     * 
     * @param {DOMEvent} evt
     * @returns {undefined}
     */
    reactOnCurrentState(evt) {
        let state = this.getState();
        switch (state) {
            case 'offline':
                this.onOffline(evt);
                break;
            case 'unreachable':
                this.onUnreachable(evt);
                break;
            case 'online':
                this.onOnline(evt, true);
                break;
            default:
                Msg.error('OnlineReactions', 'State >' + state + '< is unkown.');
        }
    }

    /**
     * Event handler for the browser online event
     * 
     * @param {DOMEvent} evt Event saying the online state
     * @param {boolean} proven If true online state is allready proved
     * @returns {undefined}
     */
    onOnline(evt, proven) {
        Msg.info('OnlineReactions', 'Application is now online');
        this.hideOfflineMessage();
        for (let curReaction of this.reactions) {
            if (typeof curReaction.onOnline === 'function') {
                curReaction.onOnline(evt);
            } else {
                Msg.error('OnlineReactions', 'Reaction >' + curReaction.path + '< has no onOnline reaction.');
            }
        }
    }

    /**
     * Event handler for the browser offline event
     * 
     * @param {DOMEvent} evt Event calling the onOffline reaction
     * @returns {undefined}
     */
    onOffline(evt) {
        Msg.warn('OnlineReactions', 'Application is now offline');
        let msg = SWAC_language.core.appOffline;
        if (SWAC_config.progressive.active) {
            msg = SWAC_language.core.appOfflineProgressive;
        }
        this.showOfflineMessage(msg);
        for (let curReaction of this.reactions) {
            if (typeof curReaction.onOffline === 'function') {
                curReaction.onOffline(evt);
            } else {
                Msg.error('OnlineReactions', 'Reaction >' + curReaction.path + '< has no onOffline reaction.');
            }
        }
    }

    /**
     * Performs all actions that are registred to the onUnreachable event
     * 
     * @param {DOMEvent} evt Event calling the onUnreachable action if available
     * @returns {undefined}
     */
    onUnreachable(evt) {
        let msg = SWAC_language.core.appUnreachable;
        if (SWAC_config.progressive.active) {
            msg = SWAC_language.core.appUnreachableProgressive;
        }
        this.showOfflineMessage(msg);
        for (let curReaction of this.reactions) {
            if (typeof curReaction.onUnreachable === 'function') {
                curReaction.onUnreachable(evt);
            } else {
                Msg.error('OnlineReactions', 'Reaction >' + curReaction.path + '< has no onUnreachable reaction.');
            }
        }
    }

    /**
     * Gets the current state of the webapplication
     * 
     * @returns {String} online, offline or unreachable
     */
    getState() {
        if (navigator.onLine === false) {
            return 'offline';
        } else {
            // Check datasource urls
            let someReachable = false;
            for (let curDatasource of SWAC_config.datasources) {
                if (this.isReachable(curDatasource)) {
                    someReachable = true;
                    break;
                }
            }
            if (someReachable || SWAC_config.datasources.length === 0) {
                return 'online';
            } else {
                return 'unreachable';
            }
        }
    }

    /**
     * Checks if an url is reachable. It can be either not reachable because
     * client is offline or when server is offline.
     * 
     * @param {String} url URL to check reachability
     * @returns {unresolved}
     */
    isReachable(url) {
        url = url.replace('[fromName]', '');
        return fetch(url, {method: 'HEAD', mode: 'no-cors'})
                .then(function (resp) {
                    return resp && (resp.ok || resp.type === 'opaque');
                })
                .catch(function (err) {
                    Msg.warn('OnlineReactions', 'URL >' + url + 'is not reachable: ' + err);
                });
    }

    /**
     * Shows the offlineMessage element on page
     * 
     * @param {String} text Text to show in message
     * @returns {undefined}
     */
    showOfflineMessage(text) {
        let alertElem = document.createElement("div");
        alertElem.classList.add('uk-alert-warning');
        alertElem.setAttribute("id", "swac_offlineMessage");
        alertElem.setAttribute("uk-alert", "");
        // Add close option
        let closeButton = document.createElement('a');
        closeButton.classList.add('uk-alert-close');
        closeButton.setAttribute('uk-close', '');
        alertElem.appendChild(closeButton);
        // Add msg area
        let msgElem = document.createElement('p');
        alertElem.appendChild(msgElem);
        // Add message to page
        let firstElem = document.body.firstChild;
        firstElem.parentNode.insertBefore(alertElem, firstElem);
        // Set text
        this.changeOfflineMessage(text);
    }

    /**
     * Changes the offlinemessage text
     * 
     * @param {String} text to show in the offline message
     * @returns {undefined}
     */
    changeOfflineMessage(text) {
        let msgElem = document.querySelector('#swac_offlineMessage p');
        if (msgElem) {
            if (text) {
                msgElem.innerHTML = text;
            } else {
                switch (this.getState()) {
                    case 'offline':
                        msgElem.innerHTML = SWAC_language.core.appOffline;
                        break;
                    case 'unreachable':
                        msgElem.innerHTML = SWAC_language.core.appUnreachable;
                        break;
                    default:
                        msgElem.innerHTML = this.getState();
                }
            }
        }
    }

    /**
     * Removes the offline message
     * 
     * @returns {undefined}
     */
    hideOfflineMessage() {
        let alertElem = document.getElementById('swac_offlineMessage');
        if (alertElem) {
            alertElem.parentNode.removeChild(alertElem);
        }
    }

    /**
     * Loads a reaction if neccessery
     * 
     * @param {Object} reactionDef Definition of the reaction with path and config object
     * @returns {undefined}
     */
    addReaction(reactionDef) {
        return new Promise((resolve, reject) => {
            // Load script file
            let dependencyStack = [];
            dependencyStack.push(reactionDef);
            let thisRef = this;
            let component = {};
            component.name = 'OnlineReactions';
            SWAC.loadDependenciesStack(dependencyStack, component).then(
                    function () {
                        // Extract class name
                        let lastSlashPos = reactionDef.path.lastIndexOf('/');
                        let className = reactionDef.path.substring(lastSlashPos + 1).replace('.js', '');
                        // Create new reaction instance
                        if (window[className + 'Factory']) {
                            let reactionObj = new window[className + 'Factory'].create(reactionDef.config);
                            reactionObj.path = reactionDef.path;
                            reactionDef = reactionObj;
                            thisRef.reactions.push(reactionObj);
                            Msg.warn('OnlineReactions', 'Reaction >' + className + '< created.');
                            resolve();
                        } else {
                            let msg = 'Script for onlinereaction >' + className + '< does not contain class.';
                            Msg.error('OnlineReactions', msg);
                            reject(msg);
                        }
                    }).catch(function (error) {
                reject('Could not load >' + reactionDef.path + '<');
            });
        });
    }
}