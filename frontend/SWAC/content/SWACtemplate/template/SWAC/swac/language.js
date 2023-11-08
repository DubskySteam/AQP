/* 
 * Object for handling language
 */

var SWAC_language = {};
SWAC_language.activeLang = 'en';
SWAC_language.loadingLangs = new Map();
SWAC_language.loadedLangs = [];

SWAC_language.init = function () {
    return new Promise((resolve, reject) => {
        // Check if language was choosen
        if (typeof SWAC_config.lang !== 'undefined') {
            this.activeLang = SWAC_config.lang;
        } else {
            this.activeLang = navigator.language || navigator.userLanguage;
            let bindStrPos = this.activeLang.indexOf('-');
            if (bindStrPos > 0) {
                this.activeLang = this.activeLang.substring(0, bindStrPos);
            }
            Msg.warn('swac', 'There is no language configured in configuration. Automatic choosen >' + this.activeLang + '< from browser.');
        }
        // Core language file
        let langfile_url = SWAC_config.swac_root + '/swac/langs/';
        let objectname = 'core';
        this.loadTranslationFile(langfile_url, objectname).then(function () {
            resolve();
        }).catch(function (error) {
            Msg.error('language',
                    'Could not load core language file for >'
                    + this.activeLang + '<: ' + error);
            reject(error);
        });
    });
};

/**
 * Loads a components language file.
 * 
 * @param {SWACrequestor} requestor Requestor for which language should be loaded
 * @returns {Promise}
 */
SWAC_language.loadComponentTranslation = function (requestor) {
    return new Promise((resolve, reject) => {
        let langfile_url = SWAC_config.swac_root + '/swac/components/'
                + requestor.swac_comp.name
                + '/langs/';

        let objectname = requestor.swac_comp.name;
        objectname = objectname.replace('/plugins/', '/');
        objectname = objectname.replace('/', '_');

        SWAC_language.loadTranslationFile(langfile_url, objectname).then(function () {
            resolve();
        }).catch(function (error) {
            Msg.error('language', 'Could not load language file for >'
                    + this.activeLang + '< for component >'
                    + requestor.swac_comp.name + '<: ' + error);
            reject();
        });
    });
};

/**
 * Loads a translation file. (javascript object file)
 * 
 * @param {String} filepath Path to the translation file without language information
 * @param {String} objectname Name of the object within the language file
 * @returns {Promise}
 */
SWAC_language.loadTranslationFile = function (filepath, objectname) {
    return new Promise((resolve, reject) => {
        // Autodetect requested language
        if(!filepath.endsWith('/')) {
            filepath += '_';
        }
        filepath += this.activeLang + '.js';
        objectname += '_' + this.activeLang;
        
        // Check if translation was loaded before
        if (this.loadedLangs.includes(filepath)) {
            Msg.flow('Language','Language file >' + filepath + '< is allready loaded.');
            resolve();
            return;
        }
        // Check if translation is loading
        if (this.loadingLangs.has(filepath)) {
            Msg.flow('Language','Waiting for language file >' + filepath + '< to be loaded.');
            let s = this.loadingLangs.get(filepath);
            // Wait for loading the translation
            s.addEventListener('load', function (evt) {
                resolve();
            });
        } else {
            Msg.flow('Language','Loading language file >' + filepath + '<');
            // Load the translation
            let s = document.createElement('script');
            // Prevent others from loading same file
            this.loadingLangs.set(filepath, s);
            s.id = objectname + '_src';
            s.src = filepath; // + '?version=' + SWAC.version;
            s.type = "text/javascript";
            s.async = false;
            document.getElementsByTagName('head')[0].appendChild(s);
            let languageObj = this;
            s.addEventListener('load', function (evt) {
                let langObjName = evt.target.id.replace('_src', '');
                languageObj.addTranslation(langObjName);
                // Prevent from loading again
                languageObj.loadedLangs.push(filepath);
                languageObj.loadingLangs.delete(filepath);
                resolve();
            });
        }
    });
};

/**
 * Adds the contents of a given object given by its global name to the language
 * store.
 * 
 * @param {String} langObjName Name of the global object which contents should be 
 * added to the global language store.
 * @returns {undefined}
 */
SWAC_language.addTranslation = function (langObjName) {
    // seperate area and language names
    let parts = langObjName.split('_');
    let lngarea = this;
    for (let i in parts) {
        // Note: This must be a saw equals
        if (i == parts.length - 1) {
            lang = parts[i];
        } else {
            if (!lngarea[parts[i]]) {
                lngarea[parts[i]] = {};
            }
            lngarea = lngarea[parts[i]];
        }
    }
    
    lngarea.lang = lang;
    let lngname = parts.slice(0,-1).join('.');
    for (let attr in window[langObjName]) {
        lngarea[attr] = window[langObjName][attr];
        // Search and replace in document
        SWAC_language.replaceInText(document.body, '##'+lngname+'.'+attr+'##', lngarea[attr]);
    }
    
};

SWAC_language.replaceInText = function(element, pattern, replacement) {
    for (let node of element.childNodes) {
        switch (node.nodeType) {
            case Node.ELEMENT_NODE:
                SWAC_language.replaceInText(node, pattern, replacement);
                break;
            case Node.TEXT_NODE:
                node.textContent = node.textContent.replace(pattern, replacement);
                break;
            case Node.DOCUMENT_NODE:
                SWAC_language.replaceInText(node, pattern, replacement);
        }
    }
};

/**
 * Gets the given phrase returned with replaced placeholder.
 * 
 * @param {String} phrase Phrase where to replace
 * @param {String} placeholder Id of the placeholder
 * @param {String} value Value to insert
 * @returns {String} Phrase with replaced placeholder
 */
SWAC_language.replacePlaceholders = function(phrase,placeholder,value) {
    return phrase.replace(new RegExp('%'+placeholder+'%', 'g'), value);
};