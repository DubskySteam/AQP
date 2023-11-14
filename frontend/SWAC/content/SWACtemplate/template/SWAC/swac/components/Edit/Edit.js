var EditFactory = {};
EditFactory.create = function (config) {
    return new Edit(config);
};

/**
 * Editor for editing contents of any javascript object
 */
class Edit extends Component {

    /*
     * Constructs a new component object and transfers the config to the
     * object
     */
    constructor(options = {}) {
        super(options);
        this.name = 'Edit';

        this.desc.text = "Edit any contents of any javascript object";

        this.desc.templates[0] = {
            name: 'accordion',
            style: 'accordion',
            desc: 'Shows datasets in a accordion style with edit possibilities within the opend accordion.'
        };
        this.desc.templates[1] = {
            name: 'list',
            style: 'list',
            desc: 'Shows the names of the datasets in a list. The form is hidden inside but not intended to show there.'
        };
        this.desc.templates[2] = {
            name: 'table',
            style: 'table',
            desc: 'Shows the datasets in table form and makes the values editable.'
        };
        this.desc.templates[3] = {
            name: 'fulllist',
            style: 'fulllist',
            desc: 'Shows one single dataset.'
        };

        this.desc.reqPerTpl[0] = {
            selc: '.swac_editForm',
            desc: 'Form element used to created new or edit existing dataset'
        };
        this.desc.reqPerTpl[1] = {
            selc: '.swac_editSaveButton',
            desc: 'Button that saves an single dataset'
        };

        this.desc.optPerTpl[0] = {
            selc: '.swac_editSaveAllButton',
            desc: 'Button that saves all datasets'
        };
        this.desc.optPerTpl[1] = {
            selc: '.swac_editAddSetButton',
            desc: 'Button that opens the dialog for adding a dataset.'
        };
        this.desc.optPerTpl[2] = {
            selc: '[swac_editunique]',
            desc: 'When used input elements with the attribute value are unique.'
        };
        this.desc.optPerTpl[3] = {
            selc: '.swac_editForm',
            desc: 'The form where the inputs are placed. There can be one for each dataset or one for all datasets.'
        };
        this.desc.optPerTpl[4] = {
            selc: '.swac_editLegendElem',
            desc: 'Legend element for caption of edit forms.'
        };
        this.desc.optPerTpl[5] = {
            selc: '.swac_repeatForValue input',
            desc: 'Default input element for data. This can be replaced by a generated specific input element.'
        };
        this.desc.optPerTpl[6] = {
            selc: '.swac_edit_repeatForReftable',
            desc: 'Element that should be used for display references.'
        };
        this.desc.optPerTpl[7] = {
            selc: '.swac_edit_repeatForRef',
            desc: 'Element that should be repeated for every reference. Can contain bindpoints for data from the referenced object (default: name)'
        };
        this.desc.optPerTpl[8] = {
            selc: '.swac_edit_deleteref',
            desc: 'Button for delteing references.'
        };

        this.desc.reqPerSet[0] = {
            name: 'id',
            desc: 'Id for identifying the dataset.'
        };

        if (options.showWhenNoData !== false)
            this.options.showWhenNoData = true;
        this.desc.opts[1] = {
            name: 'editorTargetElement',
            desc: 'CSS Selector to the element where the editor form should be shown.'
        };
        if (!options.editorTargetElement)
            this.options.editorTargetElement = null;
        this.desc.opts[2] = {
            name: 'allowedToAddNew',
            desc: 'Boolean that indicates if new datasets can be created.'
        };
        if (!options.allowedToAddNew)
            this.options.allowedToAddNew = false;
        this.desc.opts[3] = {
            name: 'allowedToDelete',
            desc: 'Boolean that indicates if new datasets can be deleted.'
        };
        if (!options.allowedToDelete)
            this.options.allowedToDelete = false;
        this.desc.opts[4] = {
            name: 'possibleValues',
            desc: 'Map of attrName and value-list to set the possible values for attributes'
        };
        if (!options.possibleValues)
            this.options.possibleValues = new Map();
        this.desc.opts[5] = {
            name: 'allowDrag',
            desc: 'If true the listed datasets can be dragged with the mouse. key: "myattr", value: ["val1","val2",...]'
        };
        if (options.allowDrag !== false)
            this.options.allowDrag = true;
        this.desc.opts[6] = {
            name: 'dropAccepts',
            desc: 'Map of attrName and regex to determine which set is accepted to a drop field.'
        };
        if (!options.dropAccepts)
            this.options.dropAccepts = new Map();
        this.desc.opts[7] = {
            name: 'dropFunctions',
            desc: 'Map of attrName and function to execute if an element was dropped on the attrName dropzone.\n\
The function gets the droped dataset and the dropzone element.'
        };
        if (!options.dropFunctions)
            this.options.dropFunctions = new Map();
        this.desc.opts[8] = {
            name: 'dropJoinerTargets',
            desc: 'Map of attrName and configuration object that defines where (attribute targetSetName) and how (attributes referenceFronName and referenceDropName) a joiner information could be created.'
        };
        if (!options.dropJoinerTargets)
            this.options.dropJoinerTargets = new Map();

        this.desc.opts[9] = {
            name: 'fetchDefinitions',
            desc: 'If true the definition interface /source/definition will be used to fetch definitions for building forms.'
        };
        if (!options.fetchDefinitions)
            this.options.fetchDefinitions = false;

        this.desc.opts[10] = {
            name: 'definitions',
            desc: 'Map of definitions for input fields. The key is the name of the datasource the definitions apply to and the value is an arraylist of objects with name, type, required attributes.'
        };
        if (!options.definitions)
            this.options.definitions = new Map();

        this.desc.opts[11] = {
            name: 'sendAlongData',
            desc: 'DataCapsle with data that should be send with every save. This is an object of form {attr1: val1, ...}.'
        };
        if (!options.sendAlongData)
            this.options.sendAlongData = null;
        this.desc.opts[12] = {
            name: 'uniqueSetAttribute',
            desc: 'Name of an attribute that should be unique over all datasets. Ths will be checked when adding a new dataset.'
        };
        if (!options.uniqueSetAttribute)
            this.options.uniqueSetAttribute = null;
        this.desc.opts[13] = {
            name: 'directOpenNew',
            desc: 'If set to true the dialog to add a new dataset is opend at load.'
        };
        if (!options.directOpenNew)
        this.options.directOpenNew = false;
    }

    init() {
        return new Promise((resolve, reject) => {
            let addElem = this.requestor.querySelector('.swac_editAddSetButton');
            if (addElem !== null && this.options.allowedToAddNew) {
                addElem.classList.remove('swac_dontdisplay');
                // Register event handler for add new object button
                addElem.addEventListener('click', this.onClickAddButton.bind(this));
            } else if (addElem !== null) {
                addElem.classList.add('swac_dontdisplay');
                Msg.warn('Edit', 'Adding new objects is not permitted for >'
                        + this.requestor.id + '<. Deactivateing add button. You can activate '
                        + 'the button by adding allowedToAddNew=true to the options.',
                        this.requestor);
            } else {
                Msg.warn('Edit', 'There is no add button >.swac_editAddSetButton< in the template.', this.requestor);
            }
            // Directly open new dialog
            if(this.options.directOpenNew) {
                this.onClickAddButton();
            } 
            
            // Add handler for saveall button
            let saveAllButtons = this.requestor.querySelectorAll('.swac_editSaveAllButton');
            for (let saveAllButton of saveAllButtons) {
                saveAllButton.addEventListener('click', this.onClickSaveAll.bind(this));
            }

            // get all generated forms
            let repeateds = this.requestor.querySelectorAll('.swac_repeatedForSet');
            // Work with definitions or not
            if (this.options.fetchDefinitions) {
                // Create requestor for definitons
                let defRequestor = {};
                defRequestor.fromName = this.requestor.fromName;
                defRequestor.fromWheres = this.requestor.fromWheres;

                // Get definitions of createable object
                let thisRef = this;
                SWAC_model.getValueDefinitions(defRequestor).then(function (definitions) {
                    thisRef.options.definitions.set(definitions.metadata.fromSource, definitions.data);
                    // Create an id for every form
                    for (let curRepeated of repeateds) {
                        thisRef.transformRepeated(curRepeated);
                    }
                    resolve();
                }).catch(function (error) {
                    reject(error);
                });
            } else {
                if (!this.options.definitions || this.options.definitions.size < 1) {
                    this.options.definitions = this.getDataDefinitions();
                }
                // Create an id for every form
                for (let curRepeated of repeateds) {
                    this.transformRepeated(curRepeated);
                }
                resolve();
            }
        });
    }

    /**
     * Handling added sets
     * 
     * @param {String} fromName Name of the datasets source
     * @param {Object} set A dataset
     * @returns {undefined}
     */
    afterAddSet(fromName, set) {
        // Search unique set identifier
        let existingSet = this.requestor.querySelector('[swac_editunique=' + set[this.options.uniqueSetAttribute] + ']');
        if (existingSet !== null) {
            Msg.warn('edit', "Set with unique attribute >" + set[this.options.uniqueSetAttribute] + '< already exists.');
            return;
        }

        let repeatedForSets = this.requestor.querySelectorAll('[swac_setname="' + fromName + '"][swac_setid="' + set.id + '"]');
        // For every repeatableArea
        for (let curRepeatedElem of repeatedForSets) {
            // Add list entry functions
            this.transformRepeated(curRepeatedElem);
        }
    }

    /**
     * Transform the repeated element given. This means all contained input fields 
     * are transformed to matching types (if definition exists), missing fields
     * are added and input functions are added.
     * 
     * @param {DOMElement} inputAreaElem Element where input elements are contained
     * @returns {undefined}
     */
    transformRepeated(inputAreaElem) {
        // Register formToggel if marked
        if (inputAreaElem.classList.contains('swac_edit_formToggle')) {
            inputAreaElem.addEventListener('click', this.onFormToggle.bind(this));
        }

        // Check if template supports drag & drop and if it is active
        if (this.options.allowDrag) {
            let draggableElem;
            // Check if curRepeated is draggable itself
            if (inputAreaElem.getAttribute('draggable')) {
                draggableElem = inputAreaElem;
            } else {
                draggableElem = inputAreaElem.querySelector('[draggable="true"]');
            }
            if (draggableElem) {
                draggableElem.addEventListener('dragstart', this.onDragStart.bind(this));
            }
        }
        // Add function to save button
        let saveBtn = inputAreaElem.querySelector('.swac_editSaveButton');
        if (saveBtn)
            saveBtn.addEventListener('click', this.onClickSave.bind(this));
        // Add function to delete button
        let delBtn = inputAreaElem.querySelector('.swac_editDelButton');
        if (this.options.allowedToDelete && delBtn) {
            delBtn.addEventListener('click', this.onClickDelete.bind(this));
        } else if (delBtn) {
            delBtn.parentElement.removeChild(delBtn);
        }

        // Modify input area if there are definitions
        if (this.options.definitions.size > 0) {
            // Get dataset that should be edited
            let editSetName = inputAreaElem.getAttribute('swac_setname');
            let editSetId = inputAreaElem.getAttribute('swac_setid');
            let set = this.data[editSetName][editSetId];
            // Modify input area
            this.modifyInputArea(inputAreaElem, set);
        } else {
            Msg.warn('Edit', 'Useing plain text inputs, because there are no definitions.', this.requestor);
        }
    }

    /**
     * Modifies the inputArea. Adds missing input fields after definition and
     * change input fields according to the data type.
     * 
     * @param {DOMElement} inputAreaElem Element that should be modified
     * @param {Object} set Object with dataset if the inputs should be filled.
     * @returns {undefined}
     */
    modifyInputArea(inputAreaElem, set = null) {
        // Get template for input
        let inputTpl = inputAreaElem.querySelector('.swac_repeatForValue');
        // Go trough each source
        for (let curSource of this.options.definitions.keys()) {
            // Go trough awaited input fields
            for (let curDef of this.options.definitions.get(curSource)) {
                // Exclude empty definitions or metadata
                if (!curDef || curDef.name.startsWith('swac_')) {
                    continue;
                }
                // Check if there is an input element for that input
                let inputElem = inputAreaElem.querySelector('[name="' + curDef.name + '"]');
                if (inputElem) {
                    // Create matching input elem
                    let newInputElem = this.createMatchingInputElement(curDef, set);
                    // Replace old input elem
                    inputElem.parentNode.replaceChild(newInputElem, inputElem);
                    inputElem = newInputElem;
                } else {
                    // clone forValue template
                    let newInput = inputTpl.cloneNode(true);
                    newInput.classList.remove('swac_repeatForValue');
                    newInput.classList.add('swac_repeatedForValue');
                    newInput.innerHTML = newInput.innerHTML.replace('{attrName}', curDef.name);
                    // Create new input elem
                    inputElem = this.createMatchingInputElement(curDef, set);
                    // Replace template input element
                    let inputElemTpl = newInput.querySelector('input');
                    inputElemTpl.parentNode.replaceChild(inputElem, inputElemTpl);
                    inputTpl.parentNode.appendChild(newInput);
                }
            }
    }
    }

    /**
     * Creates and returns an input element either based on the given type.
     * 
     * @param {String} attrDef  Definition of the attributes
     * @param {Object} set      Dataset with data that can be edited, or null if field is new
     * @returns {DOMElement}    Element created for input
     */
    createMatchingInputElement(attrDef, set) {
        let msg = 'create matching input element for >'
                + attrDef.name + '<';
        // Create input id
        let elemId = 'swac_' + this.requestor.id + '_' + attrDef.name;
        if (set) {
            elemId += '_' + set.id;
            msg += ' for set >' + set.id + '<';
        } else {
            elemId += '_new';
            msg += ' for new set';
        }
        Msg.flow('Edit', msg, this.requestor);

        // Get value if exists
        let value = null;
        if (set && set[attrDef.name]) {
            value = set[attrDef.name];
        }

        let input = document.createElement('input');
        input = document.createElement('input');
        input.id = elemId;
        input.setAttribute('name', attrDef.name);
        if (attrDef.type === 'Boolean') {
            input.classList.add('uk-checkbox');
            input.setAttribute('type', 'checkbox');
            if (value === true) {
                input.setAttribute('checked', 'checked');
            }
        } else if (attrDef.type === 'password') {
            input.classList.add('uk-input');
            input.setAttribute('type', 'password');
        } else if (attrDef.type === 'Long') {
            input.classList.add('uk-input');
            input.classList.add('uk-form-width-small');
            input.setAttribute('type', 'number');
            input.setAttribute('step', '1');
            if (value) {
                input.setAttribute('value', value);
            }
            if (attrDef.generated) {
                input.setAttribute('disabled', 'disabled');
            }
        } else if (attrDef.type === 'Integer') {
            input.classList.add('uk-input');
            input.classList.add('uk-form-width-small');
            input.setAttribute('type', 'number');
            input.setAttribute('step', '1');
            if (value) {
                input.setAttribute('value', value);
            }
            if (attrDef.generated) {
                input.setAttribute('disabled', 'disabled');
            }
        } else if (attrDef.type === 'Double') {
            input.classList.add('uk-input');
            input.classList.add('uk-form-width-small');
            input.setAttribute('type', 'number');
            input.setAttribute('step', '0.01');
            if (value) {
                input.setAttribute('value', value);
            }
            if (attrDef.generated) {
                input.setAttribute('disabled', 'disabled');
            }
        } else if (attrDef.type === 'Date') {
            input.classList.add('uk-input');
            input.classList.add('uk-form-width-small');
            input.setAttribute('type', 'date');
            if (value) {
                input.setAttribute('value', value);
            }
            if (attrDef.generated) {
                input.setAttribute('disabled', 'disabled');
            }
        } else if (attrDef.type === 'DateTime') {
            input.classList.add('uk-input');
            input.classList.add('uk-form-width-medium');
            input.setAttribute('type', 'datetime-local');
            if (value) {
                input.setAttribute('value', value);
            }
            if (attrDef.generated) {
                input.setAttribute('disabled', 'disabled');
            }
        } else if (attrDef.type === 'Color') {
            input.classList.add('uk-input');
            input.classList.add('uk-form-width-small');
            input.setAttribute('type', 'color');
            if (value) {
                input.setAttribute('value', value);
            }
            if (attrDef.generated) {
                input.setAttribute('disabled', 'disabled');
            }
        } else if (attrDef.type === 'reference' || attrDef.type === 'Collection') {
            input = document.createElement('div');
            // Create drop area
            let dropzone = document.createElement('div');
            dropzone.id = elemId + '_dropzone';
            dropzone.classList.add('swac_edit_dropzone');
            dropzone.setAttribute('name', attrDef.name);
            dropzone.addEventListener('drop', this.onDrop.bind(this));
            dropzone.addEventListener('dragover', this.onDragover.bind(this));
            dropzone.innerHTML = SWAC_language.Edit.drophere;
            dropzone.requestor = this.requestor;
            input.appendChild(dropzone);
            // Get display area for refenreces
            let reftableTpl = this.requestor.querySelector('.swac_edit_repeatForReftable');
            let reftableElem = reftableTpl.cloneNode(true);
            reftableElem.classList.remove('swac_edit_repeatForReftable');
            reftableElem.setAttribute('swac_edit_reftable', attrDef.name);
            input.appendChild(reftableElem);

            if (value) {
                // If its a list of references
                if (Array.isArray(value)) {
                    reftableElem.classList.add('swac_edit_multiref');
                    for (let curRef of value) {
                        this.createReferenceDisplay(curRef, reftableElem);
                    }
                } else {
                    reftableElem.classList.add('swac_edit_singleref');
                    this.createReferenceDisplay(value, reftableElem);
                }
            }
        } else if (this.options.possibleValues.get(attrDef.name) || attrDef.possibleValues) {
            // If there is a closed list of options
            let options = this.options.possibleValues.get(attrDef.name);
            // If there are no possibleValues in options use them from interface
            if (!options) {
                options = attrDef.possibleValues;
            }

            input = document.createElement('select');
            input.id = elemId;
            input.classList.add('uk-select');
            input.setAttribute('name', attrDef.name);
            // Add select information
            let noSelectionNode = document.createElement('option');
            noSelectionNode.value = '';
            noSelectionNode.innerHTML = SWAC_language.Edit.noselection;
            input.appendChild(noSelectionNode);

            // Add options
            for (let curOption of options) {
                let optNode = document.createElement('option');
                optNode.value = curOption;
                optNode.innerHTML = curOption;
                input.appendChild(optNode);
                if (value && value !== null
                        && value === curOption) {
                    optNode.selected = 'selected';
                }
            }
        } else {
            input.classList.add('uk-input');
            input.setAttribute('type', 'text');
            if (value && value !== null) {
                input.setAttribute('value', value);
            }
        }

        // Add required information if applicable
        if (attrDef.required) {
            input.setAttribute('required', 'required');
        }

        return input;
    }

    /**
     * Creates a reference display element in the given reftable.
     * 
     * @param {String} ref Reference to other information (ref://)
     * @param {DOMElement} reftableElem Element where the reference display should be placed
     * @returns {undefined}
     */
    createReferenceDisplay(ref, reftableElem) {
        let repeatForRefElem = reftableElem.querySelector('.swac_edit_repeatForRef');
        let thisRef = this;
        // Load data from reference
        SWAC_model.getFromReference(ref).then(function (dataCapsle) {
            // There should be only one dataset so use it
            let refset = dataCapsle.data[0];
            // Create row
            let refRow = repeatForRefElem.cloneNode(true);
            refRow.classList.remove('swac_edit_repeatForRef');
            refRow.classList.remove('swac_edit_repeatedForRef');
            refRow.setAttribute('swac_setname', SWAC_model.getSetnameFromRefernece(ref));
            refRow.setAttribute('swac_setid', SWAC_model.getIdFromReference(ref));
            repeatForRefElem.parentNode.appendChild(refRow);
            // Search placeholders (created as bindPoints)
            let refBps = refRow.querySelectorAll('swac-bp');
            for (let curRefBp of refBps) {
                let refAttrName = curRefBp.getAttribute('attrName');
                // Check if there is a value for this attr
                if (refset[refAttrName]) {
                    //TODO create new bindpoint instead of textnode
                    let newAttrOut = document.createTextNode(refset[refAttrName]);
                    curRefBp.parentNode.replaceChild(newAttrOut, curRefBp);
                } else {
                    let newAttrOut = document.createTextNode('');
                    curRefBp.parentNode.replaceChild(newAttrOut, curRefBp);
                }
            }

            // Register delete function
            let deleteElem = refRow.querySelector('.swac_edit_deleteref');
            deleteElem.addEventListener('click', thisRef.onClickDeleteRef.bind(thisRef));
        }).catch(function (error) {
            Msg.error('edit', 'Could not get data for ref >' + ref + '<: ' + error);
            console.log(error);
        });
    }

    /**
     * Shows the editor form belonging to the clicked element.
     * 
     * @param {DOMEvent} evt Event that calls the toggle.
     * @returns {undefined}
     */
    onFormToggle(evt) {
        evt.preventDefault();
        // Find element repeated for set
        let inputAreaElem = this.requestor.swac_view.findReapeatedForSet(evt.target);
        // Search form within repeated for set
        let formElem = inputAreaElem.querySelector('form');
        if (formElem) {
            inputAreaElem = formElem;
        }

        this.showInputArea(inputAreaElem, inputAreaElem.parentElement);
    }

    /**
     * Performed when click the add button
     * 
     * @param {Event} evt Event that called the addButton action
     * @returns {undefined}
     */
    onClickAddButton(evt) {
        if(evt)
            evt.preventDefault();
        // Get template
        let inputAreaElemTpl = this.requestor.querySelector('.swac_repeatForSet');
        if (!inputAreaElemTpl) {
            Msg.error('Edit', 'There is no input area available (this is a .swac_repeatForSet).', this.requestor);
            return;
        }
        let inputAreaElem;
        // Check if there is a specialised form
        let inputFormElemTpl = inputAreaElemTpl.querySelector('form');
        if (inputFormElemTpl) {
            inputAreaElem = inputFormElemTpl.cloneNode(true);
        } else {
            inputAreaElem = inputAreaElemTpl.cloneNode(true);
            inputAreaElem.classList.remove('swac_repeatForSet');
        }
        inputAreaElem.classList.add('swac_repeatedForSet');
        let legendElem = inputAreaElem.querySelector('.swac_editFormLegend');
        if (legendElem) {
            legendElem.innerHTML = SWAC_language.Edit.newdataset;
        }
        // Setting a "new-id"
        inputAreaElem.id = 'swac_edit_new';

        // Add function to save button
//        let saveBtn = inputAreaElem.querySelector('.swac_editSaveButton');
//        if (saveBtn)
//            saveBtn.addEventListener('click', this.onClickSave.bind(this));
        // Add function to delete button
        let delBtn = inputAreaElem.querySelector('.swac_editDelButton');
        if (delBtn) {
            delBtn.parentElement.removeChild(delBtn);
        }

        this.modifyInputArea(inputAreaElem);
        this.showInputArea(inputAreaElem, inputAreaElemTpl.parentElement);
    }

    /**
     * Shows the input area, depending on the element and options:
     * - if options.editorTargetElemnt is set the area is puted into the target
     * - if there is no target and the inputAreaElem is not in DOM it's added at the end of the requestor
     * - if the inputAreaElem is allready in DOM and invisible, it's made visible
     * - if the inputAreaElem is allready in DOM and visible, nothing is modified. 
     * 
     * @param {DOMElement} inputAreaElem Element containing input elements
     * @param {DOMElement} appendToElem Element where to append the input area
     * @returns {undefined}
     */
    showInputArea(inputAreaElem, appendToElem) {
        let editorTarget = document.querySelector(this.options.editorTargetElement);
        // Reset and insert editor form
        if (editorTarget !== null) {
            this.hideInputArea();
            Msg.warn('Edit', 'Insert edit inputs into target >' + this.options.editorTargetElement + '<');
            // Note displaystate
            if (inputAreaElem.classList.contains('swac_dontdisplay')) {
                inputAreaElem.classList.remove('swac_dontdisplay');
                editorTarget.reappendHide = true;
            }
            // Note spring element if there is one
            if (inputAreaElem.parentElement) {
                editorTarget.reappendTo = inputAreaElem.parentElement;
            }

            editorTarget.appendChild(inputAreaElem);
        } else if (!inputAreaElem.parentElement && appendToElem) {
            Msg.warn('Edit', 'Append edit input to given element because \n\
                there is no options.editorTargetElement specified.');
            inputAreaElem.classList.remove('swac_dontdisplay');
            appendToElem.appendChild(inputAreaElem);
        } else if (!inputAreaElem.parentElement && appendToElem) {
            Msg.warn('Edit', 'Append edit input to requestor because \n\
                there is no options.editorTargetElement specified.');
            this.requestor.appendChild(inputAreaElem);
        } else if (inputAreaElem.classList.contains('swac_dontdisplay')) {
            Msg.warn('Edit', 'Makeing edit input visible at the place its defined in template.');
            inputAreaElem.classList.remove('swac_dontdisplay');
        } else {
            Msg.warn('Edit', 'Edit input is allready visible.');
        }
    }

    /**
     * Hides the input area.
     * 
     * @returns {undefined}
     */
    hideInputArea() {
        let editorTarget = document.querySelector(this.options.editorTargetElement);
        // Reset and insert editor form
        if (editorTarget !== null) {
            Msg.warn('Edit', 'Remove inputs from target >' + this.options.editorTargetElement + '<');
            // Make content again invisable
            if (editorTarget.reappendHide) {
                editorTarget.firstChild.classList.add('swac_dontdisplay');
            }
            // Move content back to its origin
            if (editorTarget.reappendTo) {
                editorTarget.reappendTo.appendChild(editorTarget.firstChild);
            } else {
                editorTarget.innerHTML = '';
            }
        }
    }

    /**
     * Function reciveing the click event on save button
     * Calls the save method.
     * 
     * @param {DOMEvent} evt Event calling the save action
     * @returns {undefined}
     */
    onClickSave(evt) {
        evt.preventDefault();
        // Search clicked form element
        let formElem = evt.target;
        while (formElem.parentNode !== null) {
            formElem = formElem.parentNode;
            if (formElem.nodeName === 'FORM') {
                break;
            }
        }
        // validate form
        if (formElem.reportValidity()) {
            Msg.warn('edit', 'Input in form >' + formElem.id + '< was validated succsessfully.');
            this.saveObject(formElem);
        } else {
            UIkit.modal.alert(SWAC_language.Edit.forgotteninput);
            console.log(evt);
        }
    }

    /**
     * Function executed when the user clicks on the delete button of a dataset.
     * 
     * @param {DOMEvent} evt Event calling the function
     * @returns {undefined}
     */
    onClickDelete(evt) {
        evt.preventDefault();
        // Search clicked form element
        let formElem = evt.target;
        while (formElem.parentNode !== null) {
            formElem = formElem.parentNode;
            if (formElem.nodeName === 'FORM') {
                break;
            }
        }

        let dataCapsle = {};
        dataCapsle.data = [];
        if (this.options.sendAlongData !== null) {
            dataCapsle.data[0] = Object.assign({}, this.options.sendAlongData);
        } else {
            dataCapsle.data[0] = {};
        }
        dataCapsle.metadata = {};
        // Set target for data saveing
        dataCapsle.metadata.fromSource = this.requestor.fromName;

        let idElem = formElem.querySelector('[name="id"]');
        let id = parseInt(idElem.value);
        // Get id and set it to the datacapsle
        dataCapsle.data[0].id = id;

        // Save data with model
        let thisRef = this;
        let delPromise = SWAC_model.delete(dataCapsle);
        delPromise.then(function (results) {
            thisRef.hideInputArea();
            thisRef.removeSets(thisRef.requestor.fromName, id);
        });
    }

    /**
     * Function for saveing object from form
     * 
     * @param {DOMElement} formElem Form to save values from
     * @param {boolean} supressMessages If set to true the model messages are not displayed
     * @returns {undefined}
     */
    saveObject(formElem, supressMessages) {
        Msg.warn('edit', 'Save information from form >' + formElem.id + '<');

        let dataCapsle = {};
        dataCapsle.data = [];
        if (this.options.sendAlongData !== null) {
            dataCapsle.data[0] = Object.assign({}, this.options.sendAlongData);
        } else {
            dataCapsle.data[0] = {};
        }
        dataCapsle.metadata = {};
        // Set target for data saveing
        dataCapsle.metadata.fromSource = this.requestor.fromName;

        // Get form data into dataobject
        for (let i in formElem.elements) {
            let name = formElem.elements[i].name;
            let value;
            if (typeof formElem.elements[i] !== 'function'
                    && name && name !== ''
                    && this.requestor.swac_view.findRepeatableForValue(formElem.elements[i]) === null) {

                if (formElem.elements[i].nodeName === 'INPUT') {
                    // Get value for checkbox
                    if (formElem.elements[i].type === 'checkbox') {
                        if (formElem.elements[i].checked) {
                            value = true;
                        } else {
                            value = false;
                        }
                        // Get value for normal input
                    } else {
                        value = formElem.elements[i].value;
                    }
                } else if (formElem.elements[i].nodeName === 'SELECT') {
                    // Get value for select
                    value = formElem.elements[i].options[formElem.elements[i].selectedIndex].value;
                } else {
                    Msg.error('Edit', 'Support for ' + formElem.elements[i].nodeName + " not implemented yet.");
                }
                if (value !== null) {
                    dataCapsle.data[0][name] = value;
                }
            } else if (!name || name === '') {
                let nodeName = formElem.elements[i].nodeName;
                if (nodeName !== 'BUTTON'
                        && nodeName !== 'FIELDSET'
                        && i !== 'length') {
                    Msg.warn('Edit',
                            'There is no name for the input element >'
                            + i + '<', this.requestor);
                }
                continue;
            }
        }
        // Get reference areas
        let refAreas = formElem.querySelectorAll('[swac_edit_reftable]');
        for (let curRefArea of refAreas) {
            let attrName = curRefArea.getAttribute('swac_edit_reftable');
            let isMultiRefArea = curRefArea.classList.contains('swac_edit_multiref');
            if (isMultiRefArea) {
                if (!dataCapsle.data[0][attrName]) {
                    dataCapsle.data[0][attrName] = [];
                }
            }

            // Find references in area
            let refElems = curRefArea.querySelectorAll('[swac_setname]');
            for (let curRefElem of refElems) {
                let curRef = 'ref://' + curRefElem.getAttribute('swac_setname') + '/' + curRefElem.getAttribute('swac_setid');
                if (isMultiRefArea) {
                    dataCapsle.data[0][attrName].push(curRef);
                } else {
                    dataCapsle.data[0][attrName] = curRef;
                    break;
                }
            }
        }

        // Save data with model
        let thisRef = this;
        let savePromise = SWAC_model.save(dataCapsle, supressMessages);
        savePromise.then(function (results) {
            // Add dataset to component if it is new
            if (!dataCapsle.data[0].id) {
                for (let curResult of results) {
                    thisRef.addSet(dataCapsle.metadata.fromSource, curResult);
                }
            } else {
                //Update dataset stored
                for (let curResult of results) {
                    thisRef.updateSet(dataCapsle.metadata.fromSource, curResult);
                }
            }
        });
    }

    /**
     * Execute when button saveAll is clicked
     * 
     * @param {Event} evt Event that called the action
     * @returns {undefined}
     */
    onClickSaveAll(evt) {
        evt.preventDefault();

        // Get all form elems
        let formElems = this.requestor.querySelectorAll('form');
        let onefailed = false;
        for (let curFormElem of formElems) {
            if (!curFormElem.reportValidity()) {
                onefailed = true;
            }
        }
        // validate form
        if (onefailed) {
            UIkit.modal.alert(SWAC_language.Edit.forgotteninput);
            console.log(evt);
            return;
        } else {
            Msg.warn('edit', 'Input in all forms was validated succsessfully.');
        }

        // Get all dataset areas
        let setElems = this.requestor.querySelectorAll('.swac_repeatedForSet');

        for (let setElem of setElems) {
            // Create data capsle for storing data
            let dataCapsle = {};
            dataCapsle.data = [];
            dataCapsle.metadata = {};
            dataCapsle.metadata.fromSource = this.requestor.fromName;

            let dataobject = {};
            // Get id if not template id
            let setid = setElem.getAttribute('swac_setid');
            if (setid) {
                dataobject['id'] = setid;
            }

            // Get input fields
            let inputElems = setElem.querySelectorAll('input');
            for (let inputElem of inputElems) {
                // Get value
                let value = inputElem.value;
                if (value !== null) {
                    dataobject[inputElem.name] = value;
                }
            }

            dataCapsle.data.push(dataobject);
            // Save data with model
            let savePromise = SWAC_model.save(dataCapsle);
            savePromise.then(function (result) {
                // There should be only one result as sets are saved one by one
                let dataset = result[0];
                setElem.setAttribute('swac_setid', dataset.id);
                // Fill input fields with recived data (if server modified some of the input)
                for (let curAttr in dataset) {
                    // Get element for data
                    let attrInput = setElem.querySelector('[name="' + curAttr + '"]');
                    if (attrInput) {
                        attrInput.value = dataset[curAttr];
                    }
                }
            });
        }
    }

    /**
     * Eventhandler executed when an list element was dragged.
     * 
     * @param {DOMEvent} evt Drag event
     * @returns {undefined}
     */
    onDragStart(evt) {
        evt.dataTransfer.setData("setname", evt.target.getAttribute('swac_setname'));
        evt.dataTransfer.setData("setid", evt.target.getAttribute('swac_setid'));
    }

    /**
     * Eventhandler executed when something was dropped
     * 
     * @param {DOMEvent} evt Drop event
     * @returns {undefined}
     */
    onDrop(evt) {
        evt.preventDefault();
        // Search form elem
        let formElem = evt.target;
        while (formElem.parentNode !== null) {
            formElem = formElem.parentNode;
            if (formElem.nodeName === 'FORM') {
                break;
            }
        }
        // validate form
        if (formElem.reportValidity()) {
            Msg.warn('edit', 'Input in form >' + formElem.getAttribute('id') + '< was validated succsessfully.');
            this.saveObject(formElem, true);
        } else {
            UIkit.modal.alert(SWAC_language.Edit.forgotteninput);
            return;
        }
        // Check if there is a acceptance regex
        let attrName = evt.target.getAttribute('name');
        let dropAccepts = this.options.dropAccepts.get(attrName);
        // Get transfered data
        let setname = evt.dataTransfer.getData("setname");
        let setid = evt.dataTransfer.getData("setid");

        // Check if drop is accepted
        if (setname.indexOf(dropAccepts + '/') === -1
                || (!dropAccepts && setname.indexOf(attrName) === -1)) {
            UIkit.modal.alert(SWAC_language.Edit.dropNotAccepted);
            return;
        }

        // Get data of the dropped element from reference
        let ref = 'ref://' + setname.replace('/list', '/get') + '?id=' + setid;
        let thisRef = this;
        SWAC_model.getFromReference(ref).then(function (set) {
            // Check if there is a special handling function
            let joinerTarget = thisRef.options.dropJoinerTargets.get(attrName);
            let dropfunc = thisRef.options.dropFunctions.get(attrName);
            if (dropfunc) {
                // Execute special handling function
                try {
                    dropfunc(set, evt.target, formElem);
                } catch (error) {
                    Msg.error('edit', 'Could not execute external drop-function >' + dropfunc.name + '< for ref >' + ref + '<: ' + error);
                }
            } else if (joinerTarget) {
                thisRef.createJoiner(set, joinerTarget, evt.target, formElem);
            } else {
                // Create list entry
                Msg.error('edit', 'Default drop generation is not implemented yet.');
            }
        }).catch(function (error) {
            Msg.error('edit', 'Could not fetch data for reference >' + ref + '<: ' + error);
            UIkit.modal.alert(SWAC_language.Edit.dropFetchError);
        });
    }

    onDragover(evt) {
        evt.preventDefault();
        //TOOO highligh drop area if dragged element could be dropped here
    }

    /**
     * Create a joiner between two datasets.
     * This is a default implementation for handling onDrop events. It can be
     * configured with a joinertarget.
     * 
     * @param {Object} set Data of the droppend element
     * @param {Object} joinerDef Definition of the joiner that should be created.
     * @param {DOMElement} dropzoneElem Element where the drop occured
     * @param {DOMElement} formElem Form element where the drop is referneced to
     * @returns {undefined}
     */
    createJoiner(set, joinerDef, dropzoneElem, formElem) {
        // Get dataset reference target
        let refTargetSetName = formElem.swac_setname.replace('/list', '');
        let refTargetSetId = formElem.swac_setid;

        // Create joiner
        let dataCapsle = {};
        dataCapsle.data = [];
        dataCapsle.data[0] = {};
        dataCapsle.data[0][joinerDef.referenceFromName] = 'ref://' + refTargetSetName + '/' + refTargetSetId;
        dataCapsle.data[0][joinerDef.referenceDropName] = set.referencedBy.replace('get?id=', '');
        dataCapsle.metadata = {};
        dataCapsle.metadata.fromSource = joinerDef.targetSetName;
        Msg.warn('Edit', 'Send data to source >' + joinerDef.targetSetName + '<', this.requestor);
        // Save joiner
        let thisRef = this;
        SWAC_model.save(dataCapsle).then(function (joiner) {
            let ref = 'ref://' + joinerDef.targetSetName
                    + '/' + SWAC_config.interfaces.get + "?id=" + joiner.id;
            let refTableElem = formElem.querySelector('[swac_edit_reftable="' + dropzoneElem.getAttribute('name') + '"]');
            // Create list entry
            thisRef.createReferenceDisplay(ref, refTableElem);
        }).catch(function (error) {
            UIkit.modal.alert(SWAC_language.Edit.couldnotsave + ' ' + error);
        });
    }

    /**
     * Method to execute if a reference should be deleted.
     * 
     * @param {DOMEvent} evt Event that is triggering the action
     * @returns {undefined}
     */
    onClickDeleteRef(evt) {
        evt.preventDefault();
        UIkit.modal.alert('Deletion of references is not implemented yet.');
    }
}