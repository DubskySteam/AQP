class View {

    constructor(requestor) {
        this.requestor = requestor;
        this.component = requestor.swac_comp;
        this.templatecode = null;
        requestor.swac_view = this;
    }

    /**
     * Loads the template code from file or from requestor tag, calls the
     * prepareTemplate() and inserts the template into the requestor
     * 
     * @returns {Promise}
     */
    loadTemplate() {
        // Build component base path
        let basePath = SWAC_config.swac_root + '/swac/components/' + this.component.name + "/";

        // Return promise for loading and initialising the view
        return new Promise((resolve, reject) => {
            // Get template
            let template = null;
            if (typeof this.requestor.templateName !== 'undefined') {
                for (let curTemplate of this.component.desc.templates) {
                    if (curTemplate.name === this.requestor.templateName) {
                        template = curTemplate;
                    }
                }
            } else if (typeof this.component.desc.templates[0] !== 'undefined') {
                template = this.component.desc.templates[0];
            }

            if (template) {
                // Reset information about used template
                this.requestor.templateName = template.name;
            }

            // Load css
            if (template && template.style) {
                Msg.flow('view', 'Load CSS >' + template.style + '< for >' + this.component.name + '<');
                let cssLinkElem = document.createElement("link");
                cssLinkElem.setAttribute("href", basePath + template.style + ".css");
                cssLinkElem.setAttribute("type", "text/css");
                cssLinkElem.setAttribute("rel", "stylesheet");
                document.head.appendChild(cssLinkElem);
            }
            // If existend use template code from within requestor
            if (this.requestor.childNodes.length > 1) {
                Msg.flow('View', 'Useing onpage template for >' + this.requestor.id + '<', this.requestor);
                // Remove loading information
                this.removeLoadingElem();
                // Copy innerHTML as tempalte
                this.templatecode = this.requestor.innerHTML;
                this.prepareTemplate();
                resolve();
            } else if (template) {
                // Insert loading message
                this.insertLoadingElem(SWAC_language.core.loadingtemplate + ' ' + this.requestor.id);

                // Load template code
                let thisRef = this;
                fetch(basePath + template.name + ".html").then(function (response) {
                    // Get content from response
                    response.text().then(
                            function (templatecode) {
                                thisRef.templatecode = templatecode;
                                thisRef.prepareTemplate();
                                resolve();
                            }
                    );
                }).catch(function (error) {
                    Msg.error('view', 'Could not load HTML fragment >'
                            + template.name + '< for component >' + thisRef.component.name + "< : " + error, thisRef.requestor);
                    reject();
                });
            } else {
                Msg.warn('view', 'There is no template for component >' + this.component.name + "<", this.requestor);
                resolve();
            }
        });
    }

    /**
     * Prepares an template. Calls the translate and replaces requestor.id 
     * placeholders and inserts the template into the requestor
     * 
     * @returns {undefined}
     */
    prepareTemplate() {
        // Translate template code
        this.templatecode = this.translateTemplate();
        // Replace special placeholder for requestor.id
        this.templatecode = this.templatecode.replace('{requestor.id}', this.requestor.id);
        // Insert template code
        this.requestor.innerHTML = this.templatecode;
    }

    /**
     * Translates all found language marks (#entry#)
     * 
     * @returns {String} HTML code with replaces language marks
     */
    translateTemplate() {
        // Get all language entries
        let langmarks = this.templatecode.match(/##(.+?)##/g);
        if (langmarks === null) {
            Msg.info('view', 'Found no language marks in template >'
                    + this.component.name + '/' + this.requestor.templateName + '.html<');
            return this.templatecode;
        }
        Msg.info('view', 'Found ' + langmarks.length
                + ' language marks in template >'
                + this.component.name + '/' + this.requestor.templateName + '.html<');
        for (let i in langmarks) {
            let curLangmark = langmarks[i];
            let curLangmarkName = curLangmark.replace(new RegExp('##', 'g'), '');
            let curLangmarkPath = curLangmarkName.split('.');

            // Search language entry
            let langPath = SWAC_language;
            for (let j in curLangmarkPath) {
                let curLangPathAdd = curLangmarkPath[j];
                // Check if langpath is followable
                if (langPath[curLangPathAdd]) {
                    langPath = langPath[curLangPathAdd];
                } else {
                    Msg.warn('view', 'Language entry >' + curLangPathAdd + '< not found.');
                    break;
                }
                // Break if langpath reached an String
                if (typeof langPath === 'string') {
                    this.templatecode = this.templatecode.replace(new RegExp(curLangmark, 'g'), langPath);
                    break;
                }
            }
        }
        return this.templatecode;
    }

    /**
     * Inserts an information about loading to the requestors element
     * 
     * @param text text to show beside the loading symbol
     * @param screencentered if true the element is centered on screen
     * @returns {undefined}
     */
    insertLoadingElem(text = 'loading', screencentered = false) {
        let loadingElem = document.createElement('div');
        loadingElem.classList.add('swac_loading');
        if (screencentered === true) {
            loadingElem.classList.add('swac_screencentered');
        } else {
            loadingElem.classList.add('uk-position-center');
        }
        let spinnerElem = document.createElement('span');
        loadingElem.setAttribute('uk-spinner', 'ratio: 4.5');
        loadingElem.appendChild(spinnerElem);
        let spinnerText = document.createElement('span');
        spinnerText.classList.add('swac_loadingtext');
        spinnerText.innerHTML = text;
        loadingElem.appendChild(spinnerText);
        this.requestor.appendChild(loadingElem);
    }

    /**
     * Changes the text displayed on loading
     * 
     * @param {String} text Text to show in the loading element
     * @returns {undefined}
     */
    changeLoadingText(text) {
        let loadingTextElem = document.querySelector('#' + this.requestor.id + ' .swac_loading .swac_loadingtext');
        if (loadingTextElem !== null) {
            loadingTextElem.innerHTML = text;
        }
    }

    /**
     * Removes the loading symbol from the requestors element
     * 
     * @returns {undefined}
     */
    removeLoadingElem() {
        let loadingElem = document.querySelector('#' + this.requestor.id + ' .swac_loading');
        if (loadingElem !== null && loadingElem.parentNode !== null) {
            loadingElem.parentNode.removeChild(loadingElem);
        }
    }

    /**
     * Adds the information that no data is available to the template.
     * 
     * @param {String} noDataText Text to display, when not set language entry model.nodata is used
     * @returns {undefined}
     */
    addNoDataInformation(noDataText = SWAC_language.core.model_nodata) {
        // Get repeatable for sets
        let repeatables = this.findChildsRepeatableForSet(this.requestor);
        // Get repeatable for sets
        for (let repeatableElem of repeatables) {
            if (typeof repeatableElem !== 'function') {
                let nodeName = repeatableElem.nodeName;
                // Insert information for tables
                if (nodeName === 'TR') {
                    let noTemplatesTr = repeatableElem.cloneNode(false);
                    noTemplatesTr.classList.remove('swac_repeatForSet');
                    let noOfTds = 0;
                    for (let curNode of repeatableElem.childNodes) {
                        if (curNode.nodeName === 'TD') {
                            noOfTds++;
                        }
                    }

                    let noTemplatesTd = document.createElement('TD');
                    noTemplatesTd.setAttribute('colspan', noOfTds);
                    noTemplatesTd.classList.add('swac_nodatainfo');
                    noTemplatesTd.innerHTML = noDataText;
                    noTemplatesTr.appendChild(noTemplatesTd);
                    repeatableElem.parentNode.appendChild(noTemplatesTr);
                } else {
                    // Show no data message
                    let noTemplatesDiv = document.createElement('div');
                    noTemplatesDiv.classList.add('swac_nodatainfo');
                    noTemplatesDiv.innerHTML = noDataText;
                    if (repeatableElem.parentNode !== null) {
                        repeatableElem.parentNode.appendChild(noTemplatesDiv);
                    } else {
                        Msg.warn('view', 'The given repeatableElem has no parent.');
                    }
                }
            }
    }
    }

    /**
     * Removes all no data text elements found in the given element.
     * 
     * @param {DOMElement} element Element where to remove information
     * @returns {undefined}
     */
    removeNoDataInformation(element) {
        let noDataElems = element.querySelectorAll('.swac_nodatainfo');
        for (let noDataElem of noDataElems) {
            noDataElem.parentNode.removeChild(noDataElem);
        }
    }

    /**
     * Finds nodes in the template that should be repeated for every dataset
     * 
     * @param {type} element Element where to begin search
     * @returns {array} Array with elements that are repeatable for sets
     */
    findChildsRepeatableForSet(element) {
        let repeatableSets = [];
        if (typeof element.nodeType === 'undefined') {
            Msg.error('view', 'The given object for findRepeatableForSet() is not an element');
            throw "The given object for findRepeatableForSet() is not an element";
        }

        if (element.classList.contains("swac_repeatForSet")) {
            // Push and do not search child sets because nested sets are not supported
            repeatableSets.push(element);
        } else {
            for (let curChild of element.children) {
                repeatableSets = repeatableSets.concat(this.findChildsRepeatableForSet(curChild));
            }
        }
        return repeatableSets;
    }

    /**
     * Finds a repeatable for set element from bottom up.
     * 
     * @param {DOMElement} element Elemetn where to start search
     * @returns {DOMElement} Element that can be repeatet for sets
     */
    findRepeatableForSet(element) {
        if (typeof element.nodeType === 'undefined') {
            Msg.error('view', 'The given object for findRepeatableForSet() is not an element');
            throw "The given object for findRepeatableForSet() is not an element";
        }

        if (element.classList.contains("swac_repeatForSet")) {
            return element;
        } else if (typeof element.parentElement !== 'undefined' && element.parentElement !== null) {
            return this.findRepeatableForSet(element.parentElement);
        }
        return null;
    }

    /**
     * Creates an html element, that could be repeated for every set
     * 
     * @param {Object} set Dataset for whch the element should be created
     * @param {DOMElement} template Element (.swac_repeatForSet) for use as template
     * @returns {DOMElement} Element with created bindpoints and inserted data
     */
    createRepeatedForSet(set, template) {
        if (!template || !template.classList) {
            Msg.error('view', 'No template given.');
            return;
        }
        if (!template.classList.contains('swac_repeatForSet')) {
            Msg.error('view', 'Given element is no template');
        }

        // Create clone for insertion of set
        let clone = template.cloneNode(true);
        // Workaround for uikit bug when dynamically adding tabs
        if (clone.classList.contains('uk-active')) {
            clone.classList.remove('uk-active');
            clone.removeAttribute('aria-expanded');
        }

        clone.classList.remove("swac_repeatForSet");
        clone.classList.add("swac_repeatedForSet");
        clone.setAttribute('swac_setname', set.swac_fromName);
        clone.setAttribute('swac_setno', set.swac_setNo);
        clone.setAttribute('swac_setid', set.id);
        template.parentNode.appendChild(clone);
        clone.swac_dataset = set;
        // Find all bindPoints in cloned node
        clone.swac_bindPoints = this.findBindPoints(clone, ['swac_repeatForValue']);
        // Bind points and data
        for (let pbname in clone.swac_bindPoints) {
            for (let curBindPoint of clone.swac_bindPoints[pbname]) {
                curBindPoint.dataset = set;
                // A WatchableSet was created, set it to avoid multiple creation
                set = curBindPoint.dataset;
                clone.swac_dataset = set;
            }
        }

        // Find all repeatableForValues in cloned node
        let repeatablesForValue = this.findChildsRepeatableForValue(clone, set.setNo);
        for (let curRepeatableForValue of repeatablesForValue) {
            // Get all properties (including inherited) dont use Object.keys() or Object.getOwnPropertyNames here!
            let attrs = [];
            for (let attr in set) {
                attrs.push(attr);
            }
            // Sort attributes alphabetically
            attrs = attrs.sort();

            if (this.component.options.attributeOrder) {
                let newattrs = this.component.options.attributeOrder.slice();
                for (let attrid in attrs) {
                    if (!newattrs.includes(attrs[attrid])) {
                        newattrs.push(attrs[attrid]);
                    }
                }
                attrs = newattrs;
            }
            // Create for every value
            for (let attrid in attrs) {
                if (typeof set[attrs[attrid]] !== 'function'
                        && typeof set[attrs[attrid]] !== 'undefined') {
                    this.createRepeatedForValue(attrs[attrid], set, curRepeatableForValue);
                }
            }
        }
        return clone;
    }

    /**
     * Finds the next element upwards in hierarchy that was repeated for set.
     * 
     * @param {DOMElement} element Element where to start the search
     * @returns {unresolved}
     */
    findReapeatedForSet(element) {
        if (element.classList.contains("swac_repeatedForSet")) {
            return element;
        } else if (typeof element.parentElement !== 'undefined' && element.parentElement !== null) {
            return this.findReapeatedForSet(element.parentElement);
        }
        return null;
    }

    /**
     * Finds elements that are repeatable for values.
     * Does not search in repeatableForSet elements
     * 
     * @param {type} element Element where to start search
     * @param {string} setNo no of the set where this repeatableForValue is applicable to
     * @returns {array} Array with elements that are repeatable for values
     */
    findChildsRepeatableForValue(element, setNo) {
        let repeatableForVal = [];
        if (typeof element.nodeType === 'undefined') {
            Msg.error('view', 'The given object for findChildsRepeatableForValue() is not an element');
            throw "The given object for findChildsRepeatableForValue() is not an element";
        }

        if (element.classList.contains("swac_repeatForValue")) {
            // Add applicapleForSet info if setNo is given
            if (typeof setNo !== 'undefined') {
                element.setAttribute('swac_setid', setNo);
            }
            // Push and do not search child sets because nested sets are not supported
            repeatableForVal.push(element);
        } else {
            for (let curChild of element.children) {
                // Do not search within areas that are repeatable for sets
                if (!curChild.classList.contains("swac_repeatForSet")) {
                    repeatableForVal = repeatableForVal.concat(this.findChildsRepeatableForValue(curChild, setNo));
                }
            }
        }
        return repeatableForVal;
    }

    /*
     * Searches the next repeatable element in DOM hiearchy from bottom to up
     * 
     * @return element wich contains the swac_repeatForValue css-class or null if not found
     */
    findRepeatableForValue(element) {
        if (typeof element.nodeType === 'undefined') {
            Msg.error('view', 'The given object for findRepeatableForValue() is not an element');
            throw "The given object for findRepeatableForValue() is not an element";
        }

        if (element.classList.contains("swac_repeatForValue")) {
            return element;
        } else if (typeof element.parentElement !== 'undefined' && element.parentElement !== null) {
            return this.findRepeatableForValue(element.parentElement);
        }
        return null;
    }

    /**
     * Creates a new clone of the element that should be repeated for every value
     * 
     * @param {type} attr 
     * @param {type} set
     * @param {type} template
     * @returns {undefined}
     */
    createRepeatedForValue(attr, set, template) {
        Msg.flow('View', 'Create repeatForValue >' + attr + '< of set.id = >' + set.id + '<', this.requestor);
        let clone = template.cloneNode(true);
        clone.classList.remove('swac_repeatForValue');
        clone.classList.add('swac_repeatedForValue');
        clone.setAttribute('swac_setname', set.swac_fromName);
        clone.setAttribute('swac_setno', set.swac_setNo);
        clone.setAttribute('swac_attrname', attr);
        // Find all bindPoints in cloned node
        clone.swac_bindPoints = this.findBindPoints(clone);
        // Do not create askerik bindpoints for metadata
        if (clone.swac_bindPoints.hasOwnProperty('*') && attr.startsWith('swac_')) {
            return;
        }

        // Bind points and data
        for (let bpname in clone.swac_bindPoints) {
            let curBindPoints = clone.swac_bindPoints[bpname];
            for (let curBindPoint of curBindPoints) {
                // Special handling for askerik placeholder
                if (curBindPoint.getAttribute('attrName') === '*') {
                    curBindPoint.setAttribute('attrName', attr);
                }
                // Special handling for attrName metadata value
                if (curBindPoint.getAttribute('attrName') === 'attrName') {
                    curBindPoint.value = attr;
                    continue;
                }
                
                curBindPoint.dataset = set;
            }
        }
        template.parentElement.appendChild(clone);
    }

    /**
     * Get the element that was repeated for value
     * 
     * @param {type} element
     * @returns {unresolved}
     */
    findReapeatedForValue(element) {
        if (element.classList.contains("swac_repeatedForValue")) {
            return element;
        } else if (typeof element.parentElement !== 'undefined' && element.parentElement !== null) {
            return this.findReapeatedForValue(element.parentElement);
        }
        return null;
    }

    /**
     * Find elements that are repeatable for attributes.
     * Searches downwards
     * 
     * @param {DOMElement} element DOMElement where to start the recursive search
     * @returns {DOMElement[]} Array of DOMElements
     */
    findChildsRepeatableForAttribute(element) {
        let repeatableForAttr = [];
        if (typeof element.nodeType === 'undefined') {
            Msg.error('view', 'The given object for findChildsRepeatableForValue() is not an element');
            throw "The given object for findChildsRepeatableForValue() is not an element";
        }

        if (element.classList.contains("swac_repeatForAttribute")) {
            // Push and do not search child sets because nested sets are not supported
            repeatableForAttr.push(element);
        } else {
            for (let curChild of element.children) {
                repeatableForAttr = repeatableForAttr.concat(this.findChildsRepeatableForAttribute(curChild));
            }
        }
        return repeatableForAttr;
    }

    /**
     * Creates a new clone of the element that should be repeatet for every attribute
     * 
     * @param {Object} attrMetadata Object with metadata about the attribute
     * @param {DOMElement} template Template that should be used for every attribute
     * @returns {undefined}
     */
    createRepeatedForAttribute(attrMetadata, template) {
        // Create clone for insertion of set
        let clone = template.cloneNode(true);
        clone.classList.remove("swac_repeatForAttribute");
        clone.classList.add("swac_repeatedForAttribute");
        clone.setAttribute('swac_setname', attrMetadata.fromName);
        clone.setAttribute('swac_setno', attrMetadata.setNo);
        clone.setAttribute('swac_attrname', attrMetadata.attrName);

        // Find all bindPoints in cloned node
        clone.swac_bindPoints = this.findBindPoints(clone);
        // Bind points and data
        for (let bpname in clone.swac_bindPoints) {
            let curBindPoints = clone.swac_bindPoints[bpname];
            for (let curBindPoint of curBindPoints) {
                curBindPoint.dataset = attrMetadata;
            }
        }

        template.parentElement.appendChild(clone);
    }

    /**
     * Recursivly find all bindpoints
     * An bindpoint is a mark after the pattern {name} somewhere in attribute value
     * or text content.
     * 
     * @param {type} requestorElem  Element of the requestor with added template code
     * @param {string[]} stopatelementclass Names of classes that, if found stops the search downward in tree
     * @returns {BindPoint[]} Two dimensional Array with bindPoints orderd by bindpoint name
     */
    findBindPoints(requestorElem, stopatelementclass) {
        // Create list of bindPoints for return (use in bind.js for repeatables)
        let newBindPoints = {};
        let regex = /({.*?})/g;

        // Look at element itself
        if (requestorElem.nodeType === 1 && requestorElem.getAttribute('swac_bp')) {
            let markname = requestorElem.getAttribute('swac_bp');
            let bindPoint = new BindPoint(markname, this.requestor);
            bindPoint.startcont = requestorElem.innerHTML;
            bindPoint.element = requestorElem;
            if (!newBindPoints[markname]) {
                newBindPoints[markname] = [];
            }
            newBindPoints[markname].push(bindPoint);
        }

        // Move placeholder from textareas to value-attribute
        if(requestorElem.nodeName === 'TEXTAREA') {
            requestorElem.setAttribute('value',requestorElem.innerHTML);
        }

        // Look at attributes
        if (typeof requestorElem.attributes !== 'undefined') {
            for (var curAttr of requestorElem.attributes) {
                let matches = curAttr.value.match(regex);
                if (matches) {
                    for (let curMatch of matches) {
                        let markname = curMatch.replace('{', '').replace('}', '');
                        let bindPoint = new BindPoint(markname, this.requestor);
                        bindPoint.startcont = curAttr.value;
                        bindPoint.attribute = curAttr.name;
                        bindPoint.element = requestorElem;

                        if (typeof newBindPoints[markname] === 'undefined') {
                            newBindPoints[markname] = [];
                        }
                        newBindPoints[markname].push(bindPoint);
                    }
                }
            }
        }

        // Look at content
        if (requestorElem.nodeType === 3) {
            // Search bindpoint placeholder
            var regexp = /\{.*?\}/g;
            var matches_array = requestorElem.nodeValue.match(regexp);
            // Replace every found occurence
            for (let match in matches_array) {
                // Get name of the bindeable dataset attribute
                let bpexpr = matches_array[match];
                let markname = bpexpr.replace('{', '').replace('}', '');
                // Create bind point
                let bindPoint = new BindPoint(markname, this.requestor);

                // Get start and endpos of bpexpr
                let exprStartpos = requestorElem.nodeValue.indexOf(bpexpr);
                let exprEndpos = exprStartpos + bpexpr.length;

                // Content before new node
                let contbefore = requestorElem.nodeValue.substr(0, exprStartpos);
                let contafter = requestorElem.nodeValue.substr(exprEndpos, requestorElem.nodeValue.length);
                // Insert bindpoint
                requestorElem.nodeValue = contbefore;
                requestorElem.parentNode.insertBefore(document.createTextNode(contafter), requestorElem.nextSibling);
                requestorElem.parentNode.insertBefore(bindPoint, requestorElem.nextSibling);
                let attrName = bindPoint.getAttribute('attrName');
                if (typeof newBindPoints[attrName] === 'undefined') {
                    newBindPoints[attrName] = [];
                }
                newBindPoints[attrName].push(bindPoint);
            }
        }

        // Look at child nodes
        if (requestorElem.nodeType === 1) {
            for (var nextChild of requestorElem.childNodes) {
                if (typeof stopatelementclass !== 'undefined'
                        && nextChild.nodeType === 1) {
                    let stop = false;
                    for (let curStopClass of stopatelementclass) {
                        if (nextChild.classList.contains(curStopClass)) {
                            stop = true;
                        }
                    }
                    if (!stop) {
                        newBindPoints = this.concatBindPoints(newBindPoints, this.findBindPoints(nextChild, stopatelementclass));
                    }
                } else {
                    newBindPoints = this.concatBindPoints(newBindPoints, this.findBindPoints(nextChild, stopatelementclass));
                }
            }
        }

        return newBindPoints;
    }

    /**
     * Concats two lists of bindPoints
     * 
     * @param {Array} oldBindPoints List with existing bindPoints
     * @param {Array} newBindPoints List with new bindPoints
     * @returns {Array} Merged List of bindPoints
     */
    concatBindPoints(oldBindPoints, newBindPoints) {
        for (let i in newBindPoints) {
            if (typeof oldBindPoints[i] === 'undefined') {
                oldBindPoints[i] = [];
            }
            for (let k in newBindPoints[i]) {
                oldBindPoints[i].push(newBindPoints[i][k]);
            }
        }
        return oldBindPoints;
    }

    /**
     * Orders all child elements into their parent structure.
     * For this the content must be pased and bound completely. Also there
     * must be the swac_forChilds class at the element which is only shown up,
     * if there are childs, and the somewhere within there an element with the
     * swac_child class. New childs will be placed beside the defining child and
     * if an element is used as child this defining child is transfered to the parents
     * swac_forChilds element.
     * 
     * @returns {undefined}
     */
    orderChildElements() {
        let refLink;


        if (this.requestor.fromName.includes('.json')) {
            // If a file is used
            refLink = "ref://" + this.requestor.fromName;
        } else if (window[this.requestor.fromName]) {
            // If data comes from variable
            refLink = "ref://" + this.requestor.fromName;
        } else {
            // Find last slash
            let lastSlashPos = this.requestor.fromName.lastIndexOf("/");
            // If it is a REST Interface use path before
            refLink = "ref://" + this.requestor.fromName.substring(0, lastSlashPos);
            // When reciving data from list interface single instances are recived over get interface
            refLink = refLink.replace("/" + SWAC_config.interfaces.list + "/", '/');
            refLink = refLink + '/' + SWAC_config.interfaces.get;
        }

        let allchilds = this.requestor.querySelectorAll('[swac_parent]');

        // Add loading info
        let msg = SWAC_language.core.sortChildsSorting.replace('%requestor_id%', this.requestor.id);
        this.insertLoadingElem(msg, true);

        for (let child of allchilds) {
            let parentRef = child.getAttribute('swac_parent');
            // Exclude template
            if (!parentRef.startsWith("{")) {
                // Get element containing the child
                let childAreaElem = this.findReapeatedForSet(child);
                // Get element containing the list
                let repeatAreaElem = childAreaElem.parentNode;

                // Get dataset id from reference
                let parentid = parentRef;
                if (isNaN(parentRef)) {
                    parentid = SWAC_model.getIdFromReference(parentRef);

                    let lastIdPos = parentRef.lastIndexOf("?id=");
                    let urlpattern = refLink + '?id=[PARENT_ID]<';
                    let curRefLink = refLink;
                    if (lastIdPos < 0) {
                        lastIdPos = parentRef.lastIndexOf(parentid);
                        curRefLink += "/";
                        urlpattern = curRefLink + '[PARENT_ID]<';
                    }
                    let parentRefWithoutId = parentRef.slice(0, lastIdPos);
                    // If the found reference without id does not match the epected reference
                    let childid = child.getAttribute('swac_id');
                    if (parentRefWithoutId !== curRefLink) {
                        let msg = 'Parent reference >' + parentRef
                                + '< of dataset ' + this.requestor.fromName + '[' + childid
                                + '] does not match expected pattern >' + urlpattern;
                        Msg.warn('view', msg, child);
                        continue;
                    }
                }

                // Get parent element
                let parentElem = repeatAreaElem.querySelector('[swac_setid="' + parentid + '"]');
                if (parentElem === null) {
                    Msg.warn('view', 'No parentElem for parent >' + parentid + '< found.');
                    continue;
                }
                // Get area where to place childs
                let parentsChildArea = this.findForChildsArea(parentElem);
                if (parentsChildArea === null) {
                    Msg.warn('view', 'Could not find swac_forChilds element in parent >' + parentid + '<');
                    continue;
                }
                // Search childs asChild representation inside the child
                let childsAsChildElem = this.findChildRepresentation(child);
                if (childsAsChildElem === null) {
                    childsAsChildElem = this.findChildRepresentation(child.parentNode);
                }
                if (childsAsChildElem === null) {
                    Msg.warn('view', 'Could not find swac_child for display content as child for >' + childid + '<');
                    continue;
                }
                parentsChildArea.appendChild(childsAsChildElem);

                // Add set information
                childsAsChildElem.setAttribute('swac_setname', childAreaElem.getAttribute('swac_setname'));
                childsAsChildElem.setAttribute('swac_setno', childAreaElem.getAttribute('swac_setno'));
                childsAsChildElem.setAttribute('swac_setid', childAreaElem.getAttribute('swac_setid'));
                childsAsChildElem.setAttribute('swac_parent_setid', parentid);

                // Remove swac_child class, because the element is not again moveable
                childsAsChildElem.classList.remove('swac_child');

                child.parentNode.removeChild(child);
            }
        }

        this.removeLoadingElem();

        // Search and remove empty parent elements
        let allparentareas = this.requestor.querySelectorAll('[class*="swac_repeatedForSet"]');
        for (let parentarea of allparentareas) {
            if (parentarea.children.length === 0) {
                parentarea.parentNode.removeChild(parentarea);
            }
        }
    }

    /**
     * Get the element where childs should be placed
     * Searches downwards in hierarchy.
     * 
     * @param {DOMElement} element Element where to start search
     * @returns {unresolved}
     */
    findForChildsArea(element) {
        if (element === null) {
            Msg.error('view', 'Provided parameter >element< is null');
            return;
        }

        if (element.classList.contains("swac_forChilds")) {
            return element;
        } else {
            for (let elem of element.children) {
                let childArea = this.findForChildsArea(elem);
                if (childArea !== null)
                    return childArea;
            }
        }
        return null;
    }

    /**
     * Get the element is the representation for an dataset when used as child
     * Searches downwards in DOM
     * 
     * @param {DOMElement} element Element where to start the search.
     * @returns {unresolved}
     */
    findChildRepresentation(element) {
        if (element.classList.contains("swac_child")) {
            return element;
        } else {
            for (let elem of element.children) {
                let childRepresentation = this.findChildRepresentation(elem);
                if (childRepresentation !== null)
                    return childRepresentation;
            }
        }
        return null;
    }

    /**
     * Searches for a uikit slideshow and when the repeated for sets are
     * slides the template slide will be oberjumped.
     * 
     * @returns {undefined}
     */
    handleUIkitSlides() {
        // Get slideshow element
        let repeatableForSets = this.requestor.querySelectorAll('.swac_repeatForSet');
        for (let curRepeatableForSet of repeatableForSets) {
            // If is a slideshow element register (overjump template
            if (curRepeatableForSet.parentElement.classList.contains('uk-slideshow-items')) {
                let slideElem = curRepeatableForSet.parentElement.parentElement;
                UIkit.slideshow(slideElem).show(1);
                slideElem.addEventListener(
                        'beforeitemshow', function (evt) {
                            let nowShow = evt.target;
                            if (nowShow.classList.contains('swac_repeatForSet')) {
                                let prevShown = evt.detail[1];
                                // Slide one backward if slide comming from was setno = 0
                                if (prevShown && prevShown.getAttribute('swac_setno') === '0') {
                                    // Get how much slides there
                                    let slides = slideElem.querySelectorAll('li');
                                    let lastslideNo = slides.length - 1;
                                    UIkit.slideshow(slideElem).show(lastslideNo);
                                } else {
                                    try {
                                        UIkit.slideshow(slideElem).show(1);
                                    } catch (err) {
                                        console.log('chrome-uikit error: ' + err);
                                    }
                                }
                            }
                        }
                );
            }
        }
    }

    /**
     * Searches and replaces an expression inside an element and it's hierarchy.
     * This is the simple form of filling data into an template, it's use
     * is intended for metadata. There is no support for bind mechanism or
     * repeatables with this.
     * 
     * @param {String} search Search expression
     * @param {String} replace The replacement
     * @param {HTMLElement} elem Element where to replace (and childs) 
     * @returns {undefined}
     */
    searchAndReplace(search, replace, elem) {
        // Look at attributes
        if (typeof elem.attributes !== 'undefined') {
            for (var curAttr of elem.attributes) {
                curAttr.value = curAttr.value.replace(search, replace);
            }
        }
        if (typeof elem.nodeValue !== 'undefined' && elem.nodeValue !== null) {
            elem.nodeValue = elem.nodeValue.replace(search, replace);
        }
        // Look at child nodes
        if (elem.nodeType === 1) {
            for (var nextChild of elem.childNodes) {
                this.searchAndReplace(search, replace, nextChild);
            }
        }
    }

    /**
     * Adds an css rule to the view
     * 
     * @param {String} selector Selector to which the rule should apply
     * @param {String} rule CSS style rule
     * @returns {undefined}
     */
    addCSSRule(selector, rule) {
        // Add style tag
        let head = document.querySelector('head');
        head.appendChild(document.createElement('style'));
        // Get added stylesheet
        let style = document.styleSheets[document.styleSheets.length - 1];

        if (style.insertRule) {
            style.insertRule(selector + ' {' + rule + '}', style.cssRules.length);
        } else if (style.addRule) {
            // IE
            style.addRule(selector, rule, style.rules.length);
        }
    }
}