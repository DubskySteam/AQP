var DatadescriptionFactory = {};
DatadescriptionFactory.create = function (config) {
    return new Datadescription(config);
};

/* 
 * Component for describing data with rules
 */
class Datadescription extends Component {

    constructor(options = {}) {
        super(options);
        this.name = 'Datadescription';
        this.desc.text = 'Describe your data with text and colors. This component makes it possible to describe data. So a simple analysis is possible.';
        this.desc.depends[0] = {
            name: 'Colorcalculations.js',
            path: SWAC_config.swac_root + '/swac/algorithms/Colorcalculations.js',
            desc: 'Algorithms for color calculations'
        };
        this.desc.templates[0] = {
            name: 'datadescription',
            style: 'datadescription',
            desc: 'Shows the legend of the data'
        };
        this.desc.optPerTpl[0] = {
            selc: '#swac_datadescription_legendtitle',
            desc: 'Element where to insert the legends title'
        };
        this.desc.optPerTpl[1] = {
            selc: '.swac_datadescription_datatitle',
            desc: 'Element where to insert the datas title'
        };
        this.desc.optPerTpl[2] = {
            selc: '.swac_datadescription_datadesc',
            desc: 'Element where to insert the description of the data'
        };
        this.desc.optPerTpl[3] = {
            selc: '.swac_datadescription_attribution',
            desc: 'Element where to insert the attribution.'
        };
        this.desc.optPerSet[0] = {
            name: 'sourcename',
            desc: 'Name to display below the legend as attribution.'
        };
        this.desc.optPerSet[1] = {
            name: 'sourcelink',
            desc: 'Link to show in the attribution.'
        };
        this.desc.optPerSet[2] = {
            name: 'ATTRIBUTENAME.txt_title',
            desc: 'Title of the attribute as shown in the legend.'
        };
        this.desc.optPerSet[3] = {
            name: 'ATTRIBUTENAME.txt_desc',
            desc: 'Description of the attribute.'
        };
        this.desc.optPerSet[4] = {
            name: 'ATTRIBUTENAME.txt_uknw',
            desc: 'Default text for display, when no value is presend.'
        };
        this.desc.optPerSet[5] = {
            name: 'ATTRIBUTENAME.col',
            desc: 'Color to use for visualising the attribute. (Supports css color names, css hex codes and RGBA values)'
        };
        this.desc.optPerSet[6] = {
            name: 'ATTRIBUTENAME.minValue',
            desc: 'Estimated minimum value for this attribute. Used for normalizing the data.'
        };
        this.desc.optPerSet[7] = {
            name: 'ATTRIBUTENAME.maxValue',
            desc: 'Estimated maximum value for this attribute. Used for normalizing the data.'
        };
        this.desc.optPerSet[8] = {
            name: 'ATTRIBUTENAME.calcmode',
            desc: 'Mode the values (like color, text) will be calculated. Default is = (equality check on the values under ATTRIBUTENAME.values[VALUE]. Other supported: <'
        };
        this.desc.optPerSet[9] = {
            name: 'ATTRIBUTENAME.values',
            desc: 'Object containing the values that should be visualized as attributes with objects holding visualisation information, as described below.'
        };
        this.desc.optPerSet[10] = {
            name: 'ATTRIBUTENAME.scale',
            desc: 'Factor with wich the value should be scaled for presentation.'
        };
        this.desc.optPerSet[11] = {
            name: 'ATTRIBUTENAME.values[VALUE].col',
            desc: 'Color that should be used to visualise this value. (Supports css color names, css hex codes and RGBA values)'
        };
        this.desc.optPerSet[12] = {
            name: 'ATTRIBUTENAME.values[VALUE].txt',
            desc: 'Text describing this value. Used in legend and as vocable in description texts.'
        };
        this.desc.opts[0] = {
            name: 'visuDataset',
            desc: 'Name or id of the dataset that should be described. \n\
Searches the dataset in the given data. Example: var obj[0]={..}, obj[1]={...} \n\
can be accessed with visuDataset=1. Single objects can be accessed by setting \n\
this option to null.'
        };
        if (!options.visuDataset)
            this.options.visuDataset = null;
        this.desc.opts[1] = {
            name: 'visuAttribute',
            desc: 'Name of the attribute that should be visualised by default.\n\
Example: in obj[0] = { attr1=1, attr2=2} can the second attribute be accessed with visuAttribute=attr2.'
        };
// Options for setting event handlers
        this.desc.opts[2] = {
            name: 'onLegendEntryClick',
            desc: 'Array with event handler that will be called if the user clicks on a legend entry'
        };
        if (!options.onLegendEntryClick)
            this.options.onLegendEntryClick = null;
        this.desc.opts[3] = {
            name: 'showLegend',
            desc: 'If true the legend is shown in the requestors area.'
        };
        if (options.showLegend !== false)
            this.options.showLegend = true;

        // For further development only internal used yet
        this.options.activeSource = null;
        this.options.activeSet = null;

        this.desc.funcs[0] = {
            name: 'getLegend',
            desc: 'Builds a legend container',
            parameter: [
                {
                    name: 'requestor',
                    desc: 'SWAC Requestor'
                }
            ]
        };

        // Internal attributes
        this.msged_normedValues = new Map();
        this.msged_nodescValues = new Map();
        this.msged_nodescValue = new Map();
    }

    init() {
        return new Promise((resolve, reject) => {
            // Set first available source as active if no one is given
            if (!this.options.activeSource) {
                let firstsource;
                for (let curSource in this.data) {
                    firstsource = curSource;
                    break;
                }
                this.options.activeSource = firstsource;
            }
            // Set first available set as active if no one is given
            if (!this.options.activeSet) {
                this.options.activeSet = 1;
            }
            if (this.options.showLegend) {
                this.getLegend();
            } else {
                this.requestor.classList.add('swac_dontdisplay');
            }
            resolve();
        });
    }

    /**
     * Gets the descripted data from given data. Therefore it uses the 
     * options.visuDataset and options.visuAttribute option
     * 
     * @param {Object} data Object with data, may be with subdata or an array
     * @param {String} visuDataset Name or id of the dataset to visualize, overwrites the components option visuDataset for this call.
     * @returns {this.getDescribedDataset.dataset} The dataset that should be described.
     */
    getDescribedDataset(data, visuDataset = null) {
        if (typeof data === ' undefined' || data === null) {
            return [];
        }
        // Get default from datadescription_options
        let visuDatasetFromOpts = false;
        if (visuDataset === null && this.options.visuDataset) {
            visuDataset = this.options.visuDataset;
            visuDatasetFromOpts = true;
        }

        if (visuDataset === null && this.options.visuDataset) {

            Msg.warn('datadescription', 'There was nor a visuDataset or a datadescription_options.visuDataset option set. Will use whole given data');
            return data;
        } else if (visuDataset !== null
                && (typeof data[visuDataset] === 'undefined'
                        || data[visuDataset] === null)) {
            let msg = 'The visuDataset >' + visuDataset + '< was not found in data.';
            if (visuDatasetFromOpts) {
                msg += ' visuDataset was set by datadescription_optiom variable.';
            }
            Msg.warn('datadescription', msg);
            return [];
        } else if (visuDataset !== null) {
            data = data[visuDataset];
        }
        return data;
    }

    /**
     * Returns the described data from a single dataset.
     * 
     * @param {Object} dataset Dataset contining the data to describe
     * @param {String} visuAttribute Name of the attribute to visualize. Overwrites the components option visuAttribute for this call.
     * @returns {this.getDescribedValue.dataset} Value of the dataset
     */
    getDescribedValue(dataset, visuAttribute = null) {
        if (dataset === 'undefined' || dataset === null) {
            return null;
        }
        let visuAttributeFromOpts = false;
        if (visuAttribute === null
                && this.options.visuDataset) {
            visuAttribute = this.options.visuAttribute;
            visuAttributeFromOpts = true;
        }

        if (typeof dataset === 'object') {
            if (dataset[visuAttribute]) {
                return dataset[visuAttribute];
            } else {
                let msg = 'visuAttribute >' + visuAttribute + '< was not found in dataset.';
                if (visuAttributeFromOpts) {
                    msg += ' visuAttribute was defined in datadescription_options variable.';
                }
                Msg.warn('datadescription', msg, this.requestor);
            }
        } else {
            return dataset;
        }
        return null;
    }

    /**
     * Creates a description for the given dataset.
     *
     * @param {object[]} dataset The dataset to describe. Supported dataset DATALAYOUT:
     * data.ATTRIBUTENAME = VALUE
     * or
     * data[DATASETNO].ATTRIBUTENAME = VALUE
     * or
     * data.DATASETNAME.ATTRIBUTENAME = VALUE
     * @param {String} visuDataset Name or id of the dataset to visualize, overwrites the components option visuDataset for this call.
     * @returns {String} Description of the dataset
     */
    getDatasetDescription(dataset, visuDataset = null) {
        dataset = this.getDescribedDataset(dataset, visuDataset);
        if (dataset.length === 0) {
            return SWAC_language.datadescription.nodata;
        }

        let legenddata = this.data[this.options.activeSource][this.options.activeSet];

        var desc = '';
        for (var attribute in dataset) {
            var voc = this.getVocable(dataset, visuDataset, attribute);
            var desctpl;
            if (typeof legenddata[attribute] === 'undefined') {
                desctpl = SWAC_language.datadescription.nodescription;
            } else if (typeof voc !== 'undefined' && voc !== null) {
                desctpl = legenddata[attribute].txt_desc;
            } else {
                desctpl = legenddata[attribute].txt_uknw;
            }
            desc += desctpl.replace('{voc}', voc);
            desc += '<br>';
        }
        return desc;
    }

    /**
     * Gets the vocable that descripes the value
     *
     *@param {Object} data Data where to get a vocable from.
     * @param {String} visuDataset Name or id of the dataset to visualize, overwrites the components option visuDataset for this call.
     * @param {String} visuAttribute Name of the attribute to visualize, overwrites the components option visuAttribute for this call.
     * @returns vocable A desc description for the value or null, if not available
     */
    getVocable(data, visuDataset = null, visuAttribute = null) {
        let dataset = this.getDescribedDataset(data, visuDataset);
        if (visuAttribute === null
                && typeof this.options.visuAttribute !== 'undefined') {
            visuAttribute = this.options.visuAttribute;
        }
        // Get value
        let value = this.getDescribedValue(dataset, visuAttribute);

        let legenddata = this.data[this.options.activeSource][this.options.activeSet];

        if (typeof legenddata[visuAttribute] === 'undefined'
                || typeof legenddata[visuAttribute].values === 'undefined') {
            Msg.warn('datadescription', 'There is no ' + visuAttribute + '.values with description information in the data.');
        } else if (typeof legenddata[visuAttribute].values[value].txt !== 'undefined') {
            return legenddata[visuAttribute].values[value].txt;
        } else {
            Msg.warn('datadescription', 'For value >' + value + '< in >' + visuAttribute + '< is no vocable defined.');
        }
        return null;
    }

    /**
     * Calculates the value normed to minValue and maxValue attributes of the visudata.
     * 
     * @param {Object} data Data where to get the norm value from.
     * @param {String} visuDataset Name or id of the dataset to visualize, overwrites the components option visuDataset for this call.
     * @param {String} visuAttribute Name of the attribute to visualize, overwrites the components option visuAttribute for this call.
     * @returns {Number} Normed value between 0-100%, of original value, if no normation information is given
     */
    getNormedValue(data, visuDataset = null, visuAttribute = null) {
//        let dataset = this.getDescribedDataset(data, visuDataset);
//        if (visuAttribute === null
//                && typeof this.options.visuAttribute !== 'undefined') {
//            visuAttribute = this.options.visuAttribute;
//        }
        // Get value
        let value = this.getScaledValue(data, visuDataset, visuAttribute);
        let legenddate = this.data[this.options.activeSource][this.options.activeSet];

        if (typeof legenddate[visuAttribute] === 'undefined'
                || typeof legenddate[visuAttribute].minValue === 'undefined'
                || typeof legenddate[visuAttribute].maxValue === 'undefined') {
            if (!this.msged_normedValues.has(visuAttribute)) {
                Msg.warn('datadescription', 'There are no >' + visuAttribute + '.minValue< or >' + visuAttribute + '.maxValue<.');
                this.msged_normedValues.set(visuAttribute, true);
            }

            return value;
        } else {
            let range = legenddate[visuAttribute].maxValue - legenddate[visuAttribute].minValue;
            let rangeValue = value - legenddate[visuAttribute].minValue;
            let normValue = (rangeValue / range) * 100;

            return normValue;
    }
    }

    /**
     * Calculates the scaled value.
     * 
     * @param {Object} data Data where to get the norm value from.
     * @param {String} visuDataset Name or id of the dataset to visualize, overwrites the components option visuDataset for this call.
     * @param {String} visuAttribute Name of the attribute to visualize, overwrites the components option visuAttribute for this call.
     * @returns {Number} Scaled value if a scale is given, the original value otherwise
     */
    getScaledValue(data, visuDataset = null, visuAttribute = null) {
        let dataset = this.getDescribedDataset(data, visuDataset);
        if (visuAttribute === null
                && typeof this.options.visuAttribute !== 'undefined') {
            visuAttribute = this.options.visuAttribute;
        }
        // Get value
        let value = this.getDescribedValue(dataset, visuAttribute);
        let legenddata = this.data[this.options.activeSource][this.options.activeSet];
        if (!legenddata[visuAttribute] || !legenddata[visuAttribute].scale) {
            Msg.warn('Datadescription', 'There is no >' + visuAttribute + '.scale< defined');
            return value;
        } else {
            return value * legenddata[visuAttribute].scale;
    }
    }

    /**
     * Gets the color for an attribute name.
     * 
     * @param {String} visuAttribute Name of the attribute to get the color for. Defaults to null and then uses the visuAttribute option.
     * @returns {String} Color value for attribute
     */
    getAttributeColor(visuAttribute = null) {
        if (visuAttribute === null
                && typeof this.options.visuAttribute !== 'undefined') {
            visuAttribute = this.options.visuAttribute;
        }
        let legenddata = this.data[this.options.activeSource][this.options.activeSet];

        if (typeof legenddata[visuAttribute] !== 'undefined'
                && typeof legenddata[visuAttribute].col !== 'undefined') {
            Msg.warn('datadescription', 'Get color for attribute name >' + visuAttribute + '<');
            return legenddata[visuAttribute].col;
        } else {
            return 'GREY';
    }
    }

    /**
     * Gets the color that visualises the data from the dataset.
     * Uses the options.visuAttribute option to choose the attribute to get color for.
     *
     * @param {Object} data A dataset with values to get color for or the name of an attribute.
     * @param {String} visuDataset Name or id of the dataset to visualize, overwrites the components option visuDataset for this call.
     * @param {String} visuAttribute Name of the attribute to visualize, overwrites the components option visuAttribute for this call.
     * @returns {String} Name of the color
     */
    getValueColor(data, visuDataset = null, visuAttribute = null) {

        let color = this.getValueVisData(data, 'col', visuDataset, visuAttribute);
        if (color === null) {
            color = 'GREY';
        }
        return color;
    }

    /**
     * Gets the color that visualises the data from the dataset.
     * Uses the options.visuAttribute option to choose the attribute to get color for.
     *
     * @param {Object} data A dataset with values to get color for or the name of an attribute.
     * @param {String} visdataname Name of the visualisation attribute to get
     * @param {String} visuDataset Name or id of the dataset to visualize, overwrites the components option visuDataset for this call.
     * @param {String} visuAttribute Name of the attribute to visualize, overwrites the components option visuAttribute for this call.
     * @returns {String} Name of the color
     */
    getValueVisData(data, visdataname, visuDataset = null, visuAttribute = null) {
        if (visuAttribute === null
                && typeof this.options.visuAttribute !== 'undefined') {
            visuAttribute = this.options.visuAttribute;
        }

        if (!visuAttribute || visuAttribute === null) {
            Msg.warn('datadescription', 'Do not know which attribute should be visualised options.visuAttribute is not set.');
            return null;
        }

        if (!visdataname || visdataname === null) {
            Msg.error('datadescription', 'Do not know which attribute should be used from >' + visuAttribute + '<');
            return null;
        }

        let value;
        if (typeof data === 'object') {
            let dataset = this.getDescribedDataset(data, visuDataset);
            value = this.getDescribedValue(dataset, visuAttribute);
        } else {
            value = data;
        }

        if (!value || value === null) {
            Msg.warn('Datadescription', 'There is no value for attribute >' + visuAttribute + '<.', this.requestor);
            return null;
        }

        let legenddata = this.data[this.options.activeSource][this.options.activeSet];
        if (typeof legenddata[visuAttribute] === 'undefined') {
            Msg.warn('Datadescription', 'There is no visudata for attribute >' + visuAttribute + '<', this.requestor);
            return null;
        } else if (!legenddata[visuAttribute].values) {
            if (!this.msged_nodescValues.has(visuAttribute)) {
                Msg.warn('Datadescription', 'There is no >'
                        + visuAttribute + '.values< in the data describing how data should be visualised.', this.requestor);
                this.msged_nodescValues.set(visuAttribute, true);
            }
            return null;
        }

        // Get calculation mode
        let calcMode = legenddata[visuAttribute].calcmode;
        if (!calcMode || calcMode === '=') {
            if (!legenddata[visuAttribute].values[value]) {
                if (!this.msged_nodescValue.has(value)) {
                    Msg.warn('Datadescription',
                            'There is no >' + visuAttribute + '.values[' + value
                            + ']< in the data describing how data should be visualised.');
                    this.msged_nodescValue.set(value, true);
                }
                return null;
            }
            // Get color by direct equality
            return legenddata[visuAttribute].values[value][visdataname];
        } else if (calcMode === '<') {
            // Get attributes into array
            let attrs = Object.keys(legenddata[visuAttribute].values);

            for (let i in attrs) {
                let curAttr = attrs[i];
                let curAttrNumber = new Number(curAttr);

                if (value >= curAttrNumber) {

                } else {
                    return legenddata[visuAttribute].values[curAttr][visdataname];
                }
            }
        } else if (calcMode === '>') {
            console.error('calcMode > not implemented yet');
        } else {
            Msg.warn('Datadescription', 'Calculation mode >' + visuAttribute + '.calcmode = "' + calcMode + '< is not supported.');
        }

        return null;
    }

    /**
     * Builds a legend element (DIV Container) 
     * 
     * @returns {DOMElement} HTML DIV Element containing the legend
     */
    getLegend() {
        let requestor = this.requestor;

        // Get repeatable element
        let forAttributeElem = requestor.querySelector('.swac_repeatForLegend');

        let legenddata = this.data[this.options.activeSource][this.options.activeSet];
        for (var attribute in legenddata) {
            // Exclude functions
            if (typeof legenddata[attribute] !== 'object' || attribute === 'swac_observers') {
                continue;
            }
            // Create element copy
            let curAttrElem = forAttributeElem.cloneNode(true);
            var desc = legenddata[attribute];
            curAttrElem.classList.remove('swac_repeatForLegend');
            curAttrElem.classList.add('swac_repeatedForLegend');
            curAttrElem.innerHTML = curAttrElem.innerHTML.replace(new RegExp('{txt_desc}', 'g'), desc.txt_desc);
            let titleElem = curAttrElem.querySelector('.swac_datadescription_datatitle');
            titleElem.innerHTML = desc.txt_title;
            if (this.options.onLegendEntryClick !== null) {
                titleElem.addEventListener('click', this.options.onLegendEntryClick);
            }

            var acordCont = curAttrElem.querySelector('.swac_datadescription_datadesc');
            // Add legend for color meanings
            for (var i in legenddata[attribute].values) {
                var option = legenddata[attribute].values[i];
                var optionElem = document.createElement('div');
                optionElem.innerHTML = ' ' + option.txt;
                var colorButton = document.createElement('div');
                colorButton.classList.add('swac_datadescription_colorbutton');
                let col = option.col;
                // Change RGBA colors
                if (col.startsWith('0x')) {
                    col = col.substring(4);
                    let red = col.substring(4);
                    let green = col.substring(2, 4);
                    let blue = col.substring(0, 2);
                    col = '#' + red + green + blue;
                }
                colorButton.style.backgroundColor = col;
                optionElem.insertBefore(colorButton, optionElem.firstChild);
                acordCont.appendChild(optionElem);
                var brElem = document.createElement('br');
                acordCont.appendChild(brElem);
            }
            forAttributeElem.parentNode.appendChild(curAttrElem);
        }
        // Add attribution
        if (!legenddata.sourcename) {
            let sourceElem = this.requestor.querySelector(".swac_datadescrpiton_attribution");
            if (sourceElem)
                sourceElem.classList.add("swac_dontdisplay");
        }

        return requestor;
    }

    /**
     * Format all contents of an element by the datadescription.
     * This searches for elements with the class swac_attrname (that is automaticaly
     * added by the bind) and formats the containers with border color (for attribute
     * color) and background color (for value color)
     * @param {DOMElement} element Element which contents should be formated
     * @returns {undefined}
     */
    formatDataElement(element) {
        let legenddata = this.data[this.options.activeSource][this.options.activeSet];
        for (var attribute in legenddata) {
            let col = this.getAttributeColor(attribute);
            let sel = '[swac_attrname=' + attribute + ']';
            let elemsForAttr = element.querySelectorAll(sel);
            for (let curElemForAttr of elemsForAttr) {
                // Exclude attr elements
                if (curElemForAttr.classList.contains('swac_repeatedForAttribute')) {
                    continue;
                }
                if (col !== 'GREY') {
                    curElemForAttr.style.border = '1px solid ' + col;
                }
                // Get bindpoint
                let bp = curElemForAttr.querySelector('swac-bp');
                // Get color vor value
                let valcol = this.getValueColor(bp.innerHTML, null, attribute);
                if (valcol !== 'GREY') {
                    curElemForAttr.style.backgroundColor = valcol;
                    // Calculate contrast color
                    let textcolor = Colorcalculations.calculateContrastColor(valcol);
                    curElemForAttr.style.color = textcolor;
                }
            }
        }
    }

    getAttributeMinValue(visuAttribute = null) {
        if (visuAttribute === null
                && typeof this.options.visuAttribute !== 'undefined') {
            visuAttribute = this.options.visuAttribute;
        }
        let legenddata = this.data[this.options.activeSource][this.options.activeSet];
        if (typeof legenddata[visuAttribute] !== 'undefined'
                && typeof legenddata[visuAttribute].minValue !== 'undefined') {
            Msg.warn('datadescription', 'Get minValue for attribute name >' + visuAttribute + '<');
            return legenddata[visuAttribute].minValue;
        } else {
            Msg.warn('Datadescription', 'Could not get minValue for attribute >' + visuAttribute + '<');
            return null;
    }
    }

    getAttributeMaxValue(visuAttribute = null) {
        if (visuAttribute === null
                && typeof this.options.visuAttribute !== 'undefined') {
            visuAttribute = this.options.visuAttribute;
        }
        let legenddata = this.data[this.options.activeSource][this.options.activeSet];

        if (typeof legenddata[visuAttribute] !== 'undefined'
                && typeof legenddata[visuAttribute].maxValue !== 'undefined') {
            Msg.warn('datadescription', 'Get maxValue for attribute name >' + visuAttribute + '<');
            return legenddata[visuAttribute].maxValue;
        } else {
            Msg.warn('Datadescription', 'Could not get maxValue for attribute >' + visuAttribute + '<');
            return null;
    }
    }

    /**
     * Gets the description definition for the minimum value
     *  
     * @param {String} visuAttribute
     * @returns {Datadescription.getMinDefinition.block-27901.block-28300.sortedDefs|Array}
     */
    getMinDefinition(visuAttribute = this.options.visuAttribute) {
        if (visuAttribute === null
                && typeof this.options.visuAttribute !== 'undefined') {
            visuAttribute = this.options.visuAttribute;
        }
        let legenddata = this.data[this.options.activeSource][this.options.activeSet];
        if (typeof legenddata[visuAttribute] !== 'undefined'
                && typeof legenddata[visuAttribute].values !== 'undefined') {
            Msg.warn('datadescription', 'Get minimum description definition of attribute name >' + visuAttribute + '<');
            let defValues = [];
            for (let curAttr in legenddata[visuAttribute].values) {
                defValues.push(curAttr);
            }
            // Sort values
            let sortedDefs = defValues.sort();
            let lastDef = sortedDefs[0];

            return legenddata[visuAttribute].values[lastDef];
        } else {
            Msg.warn('Datadescription',
                    'Could not get minimum defined value for attribute >'
                    + visuAttribute + '< because there a no values defined.');
            return null;
    }
    }

    getMaxDefinition(visuAttribute = null) {
        if (visuAttribute === null
                && typeof this.options.visuAttribute !== 'undefined') {
            visuAttribute = this.options.visuAttribute;
        }
        let legenddata = this.data[this.options.activeSource][this.options.activeSet];
        if (typeof legenddata[visuAttribute] !== 'undefined'
                && typeof legenddata[visuAttribute].values !== 'undefined') {
            Msg.warn('datadescription', 'Get maximum description definition of attribute name >' + visuAttribute + '<');
            let defValues = [];
            for (let curAttr in legenddata[visuAttribute].values) {
                defValues.push(curAttr);
            }
            // Sort values
            let sortedDefs = defValues.sort();
            let lastDef = sortedDefs[sortedDefs.length - 1];

            return legenddata[visuAttribute].values[lastDef];
        } else {
            Msg.warn('Datadescription',
                    'Could not get minimum defined value for attribute >'
                    + visuAttribute + '< because there a no values defined.');
            return null;
    }
    }

    /**
     * Gets an array of definitions with all given attributes
     * 
     * @param {String} visuAttribute Attribute which definitions should be get
     * @returns {Object[]} Array of definitions
     */
    getDefinitions(visuAttribute = null) {
        if (visuAttribute === null
                && typeof this.options.visuAttribute !== 'undefined') {
            visuAttribute = this.options.visuAttribute;
        }
        let legenddata = this.data[this.options.activeSource][this.options.activeSet];
        if (typeof legenddata[visuAttribute] !== 'undefined'
                && typeof legenddata[visuAttribute].values !== 'undefined') {

            let definitions = [];

            for (let curDefValue in legenddata[visuAttribute].values) {
                definitions.push(legenddata[visuAttribute].values[curDefValue]);
                // Add value
                definitions[definitions.length-1].value = curDefValue;
            }
            
            for(let i=0; i < definitions.length; i++) {
                let curDef = definitions[i];
                // Get calculation mode
                let calcMode = legenddata[visuAttribute].calcmode;
                if (!calcMode || calcMode === '=') {
                    curDef.minValue = Number(curDef.value);
                    curDef.maxValue = Number(curDef.value);
                } else if (calcMode === '<') {
                    let prvDef = definitions[i-1];
                    if(prvDef) {
                        curDef.minValue = prvDef.value;
                    } else if(legenddata[visuAttribute].minValue
                            && legenddata[visuAttribute].minValue < Number(curDef.value)) {
                        curDef.minValue = legenddata[visuAttribute].minValue;
                    } else {
                        curDef.minValue = 0;
                    }
                    curDef.maxValue = Number(curDef.value);
                } else if (calcMode === '>') {
                    curDef.minValue = Number(curDef.value);
                    let nxtDef = definitions[i+1];
                    if(nxtDef) {
                        curDef.maxValue = nxtDef.value;
                    } else if(legenddata[visuAttribute].maxValue
                            && legenddata[visuAttribute].maxValue > Number(curDef.value)) {
                        curDef.maxValue = legenddata[visuAttribute].maxValue;
                    } else {
                        curDef.maxValue = 100;
                    }
                } else {
                    Msg.warn('Datadescription', 'Calculation mode >' + visuAttribute + '.calcmode = "' + calcMode + '< is not supported.');
                }
            }
            return definitions;
    }
    }
}