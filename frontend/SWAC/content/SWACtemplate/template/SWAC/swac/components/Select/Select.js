var SelectFactory = {};
SelectFactory.create = function (config) {
    return new Select(config);
};

/**
 * Component for createing a selection
 */
class Select extends Component {

    constructor(options = {}) {
        super(options);
        this.name = 'Select';

        this.desc.text = "Creates a flexible selectbox. Can use checkboxes, selectbox, multiselect and datalist for selection and allows getting and setting selected ones over a unified interface.";

        this.desc.templates[0] = {
            name: 'selectbox',
            style: false,
            desc: 'Creates a selectbox for each dataset.'
        };
        this.desc.templates[1] = {
            name: 'multiselectbox',
            style: false,
            desc: 'Creates a multiselectbox for each dataset.'
        };
        this.desc.templates[2] = {
            name: 'checkboxselect',
            style: false,
            desc: 'Creates a list of checkboxes for selection.'
        };
        this.desc.templates[3] = {
            name: 'datalist',
            style: false,
            desc: 'Creates a datalist for each dataset.'
        };
        this.desc.templates[4] = {
            name: 'multiselectbox_without_label',
            style: false,
            desc: 'Creates a multiselectbox without a label for each dataset.'
        };
        this.desc.optPerTpl[0] = {
            selc: '.swac_forChilds',
            desc: 'Area for the ObservedObject childen to create a hierarchical structure.'
        };
        this.desc.optPerTpl[1] = {
            selc: '.expand_input',
            desc: 'Marks the input for an Expand children.'
        };
        this.desc.reqPerSet[0] = {
            name: "id",
            desc: "Id that identifies the selection."
        };
        this.desc.reqPerSet[1] = {
            name: "name",
            desc: "Name of the selection."
        };
        this.desc.opts[0] = {
            name: "onChange",
            desc: "A function that is executed when an selection is changed"
        };
        if (!options.onChange)
            this.options.onChange = null;
        this.desc.opts[1] = {
            name: "onSelect",
            desc: "A function that is executed when an element is selected"
        };
        if (!options.onSelect)
            this.options.onSelect = null;
        this.desc.opts[2] = {
            name: "onUnselect",
            desc: "A function that is executed when an element is unselected"
        };
        if (!options.onUnselect)
            this.options.onUnselect = null;
        this.desc.opts[3] = {
            name: "selectedsSource",
            desc: "Requestor where to get the selected elements"
        };
        if (!options.selectedsSource)
            this.options.selectedsSource = null;
        this.desc.opts[4] = {
            name: "expandSources",
            desc: "Map of key (= name of the source where a click on should request for sub selections), value = (DataRequestor where subentries can get)"
        };
        if (!options.expandSources)
            this.options.expandSources = new Map();

        this.desc.funcs[0] = {
            name: 'getInputs',
            desc: 'Returns the key and value pairs from this input component in a object'
        };
        this.desc.funcs[1] = {
            name: 'setInputs',
            desc: 'Sets the selected or checked items on the component after the given data.',
            params: [
                {
                    name: 'inputs',
                    desc: '{Object{}} inputs Object with attribut (value) and its selectstate (true, false) \n\
Example parameter:\n\
 {\n\
 option1: true,\n\
  option2: false\n\
}\n\
 Each option that is not given in the parameter remains at its previous state'
                }
            ]
        };
        this.desc.funcs[2] = {
            name: 'simulateClick',
            desc: 'Simulate a click event on a option.',
            params: [
                {
                    name: 'id',
                    desc: 'id of the element to simulate a click on'
                }
            ]
        };
        this.desc.funcs[3] = {
            name: 'countOptions',
            desc: 'Counts the number of available options',
            return: 'Number of available options'
        };
        this.desc.funcs[4] = {
            name: 'addOptions',
            desc: 'Adds a list of possible options to the select element',
            params: [
                {
                    name: 'options',
                    desc: 'options List of objects for selection'
                }
            ]
        };
        this.desc.funcs[5] = {
            name: 'clearOptions',
            desc: 'Removes all options from the select element'
        };
    }

    init() {
        return new Promise((resolve, reject) => {

            this.registerBehaviors(this.requestor);

            // Get selected data
            let dataRequest = this.options.selectedsSource;
            if (dataRequest !== null) {
                let thisRef = this;
                SWAC_model.load(dataRequest).then(
                        function (response) {
                            for (let i in response.data) {
                                thisRef.setInputs(response.data[i]);
                            }
                            resolve();
                        });
            } else {
                resolve();
            }
        });
    }

    registerBehaviors(startElem) {
        // Register onChange function
        if (this.options.onChange !== null) {
            // Get select form element (for form-select based selection)
            let selectElem = startElem.querySelector('select');
            if (selectElem !== null) {
                selectElem.addEventListener('change', this.options.onChange.bind(this));
            }
            // Get input elements from requestor
            let inputElems = startElem.querySelectorAll('input');
            for (let curInputElem of inputElems) {
                curInputElem.addEventListener('change', this.options.onChange.bind(this));
            }
        }
        // Register onChange event listener for datalist shows
        if (this.requestor.templateName === 'datalist') {
            let inputElems = startElem.querySelectorAll('input');
            for (let curInputElem of inputElems) {
                curInputElem.addEventListener('input', this.onChangeDatalist.bind(this));
            }
        }

        // Register onSelected Eventlistener
        if (this.options.onSelect !== null
                || this.options.onUnselect !== null) {
            if (this.options.onChange !== null && SWAC_config.debugmode) {
                Msg.warn('Select', 'An funtion for onSelect'
                        + ' and / or onUnselect was configured, but also an '
                        + 'function for onChange. onChange function will '
                        + 'be also executed.');
            }
            let inputElems = startElem.querySelectorAll('input');
            for (let curInputElem of inputElems) {
                curInputElem.addEventListener('change', this.onChangeSelect.bind(this));
            }
        }

        if (this.options.expandSources.size > 0) {
            this.registerExpandfunctions();
        } else {
            // Remove expand elements
            let expandButtons = startElem.querySelectorAll('.swac_select_expandbutton');
            for (let expandElem of expandButtons) {
                expandElem.parentNode.removeChild(expandElem);
            }
        }
    }

    /**
     * Function executed onChange event if there are an onSelect and / or an
     * onUnselect function in options.
     * 
     * @param {type} evt
     * @returns {undefined}
     */
    onChangeSelect(evt) {
        // Get effected element
        let elem = evt.target;

        // Swich type of elem
        if (elem.nodeName === 'INPUT' && elem.getAttribute('type') === 'checkbox') {
            // Get checkbox state
            if (elem.checked === true) {
                // Now element is checked
                if (this.options.onSelect !== null) {
                    this.options.onSelect(evt, elem.value);

                }
            } else {
                // Now element is not longer checked
                if (this.options.onUnselect !== null) {
                    this.options.onUnselect(evt, elem.value);
                }
            }
        }
    }

    /**
     * Method executed on change if the datalist template is used.
     * 
     * @param {type} evt Chang event
     * @returns {undefined}
     */
    onChangeDatalist(evt) {
        // Get value from input
        let inputElem = this.requestor.querySelector('input');
        let value = inputElem.value;
        // Reset last viewed elements
        let listElems = this.requestor.querySelectorAll('[swac_datalistvalue]');
        for (let curElem of listElems) {
            curElem.classList.add('swac_dontdisplay');
        }

        // Search for element with that swac_datalistvalue
        let valueElems = this.requestor.querySelectorAll('[swac_datalistvalue="' + value + '"]');
        for (let curElem of valueElems) {
            curElem.classList.remove('swac_dontdisplay');
        }
    }

    /**
     * Returns the key and value pairs from this input component in a object
     * 
     * @returns {Object} Object with name (attributnames) and values
     */
    getInputs() {
        let inputs = [];
        // Get inputs from checkboxes
        let checkboxElems = this.requestor.querySelectorAll('[type="checkbox"]');
        for (let curInputElem of checkboxElems) {
            if (curInputElem.checked) {
                let selected = {
                    name: curInputElem.name,
                    value: curInputElem.value
                };
                inputs.push(selected);
            }
        }

        // Get inputs from single or multiple select box
        let selectElems = this.requestor.querySelectorAll('select');
        for (let selectElem of selectElems) {
            for (var i = 0; i < selectElem.length; i++) {
                let value = selectElem.options[i].value;
                if (selectElem.options[i].selected 
                        && value !== '') {
                    let selected = {
                        name: selectElem.options[i].getAttribute('name'),
                        value: value
                    };
                    inputs.push(selected);
                }
            }
        }

        // Get inputs from input with datalist
        let datalistElem = this.requestor.querySelector('datalist');
        if (datalistElem !== null) {
            let inputElem = this.requestor.querySelector('input');
            let value = inputElem.value;
            let listElem = this.requestor.querySelector('[value="' + value + '"]');
            let selected = {
                name: listElem.getAttribute('name'),
                value: value
            };
            inputs.push(selected);
        }

        return inputs;
    }

    /**
     * Sets the selected or checked items on the component
     * after the given data.
     * 
     * @param {Object{}} inputs Object with attribut (value) and its selectstate (true, false)
     * Example parameter:
     * {
     *  value1: true,
     *  value2: false,
     *  ...
     *  valueN: false
     * }
     * Each option that is not given in the parameter remains at its previous state
     * @returns {undefined}
     */
    setInputs(inputs) {
        for (let value in inputs) {
            let datalistElem = this.requestor.querySelector('datalist');
            if (datalistElem === null) {
                // Select in single or multiselect
                let selectedElem = this.requestor.querySelector('[value="' + value + '"]');
                // Only select if there is a elem with that value
                if (selectedElem !== null) {
                    if (inputs[value] === true) {
                        selectedElem.selected = 'selected';
                    } else {
                        selectedElem.removeAttribute('selected');
                    }
                    selectedElem.checked = inputs[value];
                } else {
                    Msg.warn('select', 'There is no option with the value >' + value + "< that could be selected.");
                }
            } else {
                // Set inputs for datalist
                // Get selected option from datalist
                let selectedListElem = datalistElem.querySelector('[swac_setid="' + value + '"]');
                if (selectedListElem !== null) {
                    let inputElem = this.requestor.querySelector('input');
                    inputElem.value = selectedListElem.value;
                } else {
                    Msg.error('select', 'There is no datalist entry for the selection of >' + value + '<');
                }
            }
        }
    }

    simulateClick(id) {
        let selectedElem = this.requestor.querySelector('#' + id);

        var evt = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        // If cancelled, don't dispatch our event
        !selectedElem.dispatchEvent(evt);

        return evt;
    }

    countOptions() {
        // Select in single, multiselect, checkbox or datalist
        let optionElems = this.requestor.querySelectorAll('[value]');
        return optionElems.length;
    }

    addOptions(options) {
        let requestor = this.requestor;
        // Get template from requestor
        let templateElems = requestor.querySelectorAll('.swac_repeatForSet');
        for (let curTemplateElem of templateElems) {
            let valueName;
            if (curTemplateElem.nodeName === 'OPTION') {
                valueName = curTemplateElem.value;
            } else if (curTemplateElem.hasAttribute('swac_datalistvalue')) {
                valueName = curTemplateElem.getAttribute('swac_datalistvalue');
            } else {
                valueName = curTemplateElem.querySelector('input').getAttribute('name');
            }
            valueName = valueName.replace('{', '').replace('}', '');

            // Delete unused elements with the class swac_select_delAddAttOpt
            let deleteList = curTemplateElem.querySelectorAll(".swac_select_delAddAtOpt");
            for (let elem of deleteList) {
                elem.parentNode.removeChild(elem);
            }

            // For each dataset
            for (let curOption of options) {
                // Check if option has needed value attribute
                if (typeof curOption[valueName] !== 'undefined') {
                    let newElem = curTemplateElem.cloneNode(true);
                    newElem.classList.remove('swac_repeatForSet');
                    newElem.classList.add('swac_repeatedForSet');
                    newElem.setAttribute('swac_datalistvalue', curOption[valueName]);
                    newElem.setAttribute('swac_setname', curOption.swac_setname);
                    newElem.setAttribute('swac_setid', curOption.id);

                    for (let curAttr in curOption) {
                        this.requestor.swac_view.searchAndReplace('\{' + curAttr + '\}', curOption[curAttr], newElem);
                    }
                    // Check if there is a repeatForValue area
                    let repeatForValElem = newElem.querySelector('.swac_repeatForValue');
                    if (repeatForValElem !== null) {
                        // Go trough each value
                        for (let curVal in curOption) {
                            let newValElem = repeatForValElem.cloneNode(true);
                            newValElem.classList.remove('swac_repeatForValue');
                            newValElem.classList.add('swac_repeatedForValue');
                            this.requestor.swac_view.searchAndReplace('{attrName}', curVal, newValElem);
                            this.requestor.swac_view.searchAndReplace('{*}', curOption[curVal], newValElem);
                            repeatForValElem.parentNode.appendChild(newValElem);
                        }
                    }
                    this.registerBehaviors(newElem);
                    curTemplateElem.parentNode.appendChild(newElem);
                } else {
                    Msg.warn('select', 'Could not add option, because the required attribute >' + valueName + '< is missing.');
                }
            }
        }
        // Recall child parent sorting
        this.requestor.swac_view.orderChildElements(this.requestor);
    }

    clearOptions() {
        // Get all options
        let options = this.requestor.querySelectorAll('.swac_repeatedForSet');
        for (let curOption of options) {
            curOption.parentElement.removeChild(curOption);
        }
    }

    /**
     * Toggles the display of the lazy loaded sub elements.
     * 
     * @param {DOMEvent} evt Event fired when clicking on a expand node
     * @returns {undefined}
     */
    toggleExpandDatasets(evt) {
        let expandElem = evt.target;
        if (expandElem.innerHTML === "+") {
            expandElem.innerHTML = "-";
            let childAreas = expandElem.parentNode.querySelectorAll(".swac_forChilds");
            for (let curChildArea of childAreas) {
                curChildArea.classList.remove('swac_dontdisplay');
            }
            if (!expandElem.expanded) {
                let availSets = expandElem.getAttribute('swac_select_availSets');
                this.showExpandDatasets(expandElem.parentNode, availSets);
                expandElem.expanded = true;
            }
        } else {
            expandElem.innerHTML = "+";
            this.hideExpandDatasets(expandElem.parentNode);
        }
    }

    /**
     * Shows the sub datasets
     * 
     * @param {DOMElement} expandableElem Element wichs sub datasets should be shown
     * @param {Long} dataLength The length of the data to be extended
     */
    showExpandDatasets(expandableElem, dataLength) {
        let parentId = expandableElem.getAttribute("swac_id");
        let parentSetname = expandableElem.getAttribute('swac_setname');
        // If setname is not on the expandableElem search at parent
        if (parentSetname === null)
            parentSetname = expandableElem.parentNode.getAttribute('swac_setname');
        // Create parent ref for fetched data
        let parentRef;
        if (parentSetname.includes('.json')) {
            parentRef = 'ref://' + parentSetname + '/' + parentId;
        } else {
            parentRef = 'ref://' + parentSetname + '/' + parentId;
        }

        let expandConf = this.options.expandSources.get(parentSetname);
        // Check if should be clusterd
        if (expandConf.clusterMinimum && dataLength >= expandConf.clusterMinimum) {
            this.showClusteredExpandDatasets(expandConf, dataLength, parentRef);
        } else {
            let expandElem = expandableElem.querySelector('.swac_select_expandbutton');
            // Get dataRequestor for sup datasets
            if (!expandConf.dataRequestor) {
                expandElem.classList.add('swac_select_notexpandable');
                expandElem.setAttribute('uk-tooltip', SWAC_language.Select.notexpandable);
                Msg.warn('Select',
                        'Cant load sub datasets because there is no dataRequestor configured '
                        + 'in the expandSources option for >' + parentSetname + '<');
            } else {
                let dataRequestor = SWAC_model.copyDataRequestor(expandConf.dataRequestor, expandElem);
                let thisRef = this;
                SWAC_model.load(dataRequestor)
                        .then(function (resolveObj) {
                            let newOpts = resolveObj.data;
                            // Add parent if no one exists
                            for (let curOption of newOpts) {
                                if (!curOption.parent)
                                    curOption.parent = parentRef;
                                curOption.swac_setname = dataRequestor.fromName;
                            }

                            //TODO change this to use addData()
                            thisRef.addOptions(newOpts);
                        }).catch(function (error) {
                    expandElem.classList.add('swac_select_notexpandable');
                    expandElem.setAttribute('uk-tooltip', SWAC_language.Select.notexpandable);
                    Msg.warn('Select',
                            'Could not fetch subElements for '
                            + expandableElem.getAttribute('swac_setname')
                            + '[' + expandableElem.getAttribute('swac_setid') + ']: '
                            + error);
                });
            }
        }
    }

    /**
     * Creates and shows clusters for subsets.
     * 
     * @param {Object} expandConf Configuration for expanding
     * @param {Long} dataLength Size of subsets
     * @param {String} parentRef Reference to the parent element
     * @returns {undefined}
     */
    showClusteredExpandDatasets(expandConf, dataLength, parentRef) {
        // Calculate cluster size
        let clusterPercentage = expandConf.clusterPercentage;

        // Calculates the limit rounded up 
        let clusterSize = Math.ceil(dataLength / 100 * clusterPercentage);
        let clusterCount = dataLength / clusterSize;
        let options = [];

        // Creates the individual options for the Extendedarea
        for (let i = 0; i < clusterCount; i++) {
            let option = {};
            option.id = (i + 1);
            option.name = "Datenset: " + (clusterSize * i) + " bis " + ((clusterSize * i) + clusterSize);
            option.swac_setname = expandConf.dataRequestor.fromName;
            option.parent = parentRef;
            option.limit = clusterSize;
            option.startset = clusterSize * i;
            options.push(option);
        }
        // Add the options
        this.addOptions(options);
    }

    /**
     * Deletes the ExpandArea under a specific element.
     * 
     * @param {parentElem} expandableElem the element that contains the extended ChildArea.
     * @returns {undefined}
     */
    hideExpandDatasets(expandableElem) {
        let childAreas = expandableElem.querySelectorAll(".swac_forChilds");
        for (let curChildArea of childAreas) {
            curChildArea.classList.add('swac_dontdisplay');
        }
    }

    /**
     * Register functions for lazy loading of sub entries
     * 
     * @returns {undefined}
     */
    registerExpandfunctions() {
        // Check if there are expandSources for the sources in data
        for (let sourceName in this.data) {
            if (this.options.expandSources.has(sourceName)) {
                let expandableElems = this.requestor.querySelectorAll('[swac_setname="' + sourceName + '"]');
                for (let curExpandableElem of expandableElems) {
                    this.registerExpandfunction(curExpandableElem, sourceName);
                }
            }
        }
    }

    /**
     * Register a expand function for one expandable element.
     * This method runs concurrent
     * 
     * @param {DOMElement} curExpandableElem Element that can be extended
     * @param {String} sourceName Name of the source the expandable element is from
     * @returns {undefined}
     */
    registerExpandfunction(curExpandableElem, sourceName) {
        let thisRef = this;
        // Get expand button
        let expandButton = curExpandableElem.querySelector('.swac_select_expandbutton');

        // Request size of possible expands
        this.getExpandableSize(curExpandableElem, sourceName).then(function (availSets) {
            // Register expand function
            if (availSets === null || availSets > 0) {
                if (availSets > 0)
                    expandButton.setAttribute('uk-tooltip', SWAC_language.Select.loadSubs.replace('%availSets%', availSets));
                if (availSets === null)
                    expandButton.setAttribute('uk-tooltip', SWAC_language.Select.loadMore);
                expandButton.addEventListener("click", thisRef.toggleExpandDatasets.bind(thisRef));
                expandButton.setAttribute('swac_select_availSets', availSets);
            } else {
                // Remove expand function
                expandButton.parentNode.removeChild(expandButton);
            }
        }).catch(function (reject) {
            // Remove expand function
            expandButton.parentNode.removeChild(expandButton);
        });
    }

    /**
     * Gets the count of datasets that must be fetched when the expand button
     * is pressed.
     * 
     * @param {DOMElement} curExpandableElem Element that can be extended
     * @param {String} sourceName Name of the source the expandable element is from
     * @returns {Promise} Promise that resolves with the number of sets fetchable 
     * or null if there is no configuration for fetching the size
     */
    getExpandableSize(curExpandableElem, sourceName) {
        return new Promise((resolve, reject) => {
            // Get expand configuration
            let expandConf = this.options.expandSources.get(sourceName);
            if (!expandConf.sizeRequestor) {
                resolve(null);
                return;
            }

            // Copy requestor
            let sizeRequestor = SWAC_model.copyDataRequestor(expandConf.sizeRequestor, curExpandableElem);

            SWAC_model.load(sizeRequestor)
                    .then(function (resolveObj) {
                        resolve(resolveObj.data[0].size);
                    }).catch(function (error) {
                Msg.warn('Select',
                        'Could not fetch size for subElements for '
                        + curExpandableElem.getAttribute('swac_setname')
                        + '[' + curExpandableElem.getAttribute('swac_setid') + ']: '
                        + error);
                resolve();
            });
        });
    }
}