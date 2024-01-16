import SWAC from '../../swac.js';
import View from '../../View.js';
import Msg from '../../Msg.js';

export default class Datadescription extends View {

    constructor(options = {}) {
        super(options);
        this.name = 'Datadescription';
        this.desc.text = 'Describe your data with text and colors. This component makes it possible to describe data. So a simple analysis is possible.';
        this.desc.developers = 'Florian Fehring (FH Bielefeld)';
        this.desc.license = 'GNU Lesser General Public License';

        this.desc.depends[0] = {
            name: 'Colorcalculations.js',
            path: SWAC.config.swac_root + 'algorithms/Colorcalculations.js',
            desc: 'Algorithms for color calculations'
        };
        this.desc.templates[0] = {
            name: 'datadescription',
            style: 'datadescription',
            desc: 'Shows the legend of the data'
        };
        
        this.desc.reqPerTpl[0] = {
            selc: '.swac_repeatForLegend',
            desc: 'Element that is repeated for each legend.'
        };
        this.desc.optPerTpl[0] = {
            selc: '.swac_datadescription_legendtitle',
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
        this.desc.reqPerSet[0] = {
            name: 'txt_title',
            desc: 'Legends title.'
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
            name: 'txt_desc',
            desc: 'Description of the legend.'
        };
        this.desc.optPerSet[3] = {
            name: 'ATTRIBUTENAME.txt_title',
            desc: 'Title of the attribute as shown in the legend.'
        };
        this.desc.optPerSet[4] = {
            name: 'ATTRIBUTENAME.txt_desc',
            desc: 'Description of the attribute.'
        };
        this.desc.optPerSet[5] = {
            name: 'ATTRIBUTENAME.txt_uknw',
            desc: 'Default text for display, when no value is presend.'
        };
        this.desc.optPerSet[6] = {
            name: 'ATTRIBUTENAME.col',
            desc: 'Color to use for visualising the attribute. (Supports css color names, css hex codes and RGBA values)'
        };
        this.desc.optPerSet[7] = {
            name: 'ATTRIBUTENAME.minValue',
            desc: 'Estimated minimum value for this attribute. Used for normalizing the data.'
        };
        this.desc.optPerSet[8] = {
            name: 'ATTRIBUTENAME.maxValue',
            desc: 'Estimated maximum value for this attribute. Used for normalizing the data.'
        };
        this.desc.optPerSet[9] = {
            name: 'ATTRIBUTENAME.calcmode',
            desc: 'Mode the values (like color, text) will be calculated. Default is = (equality check on the values under ATTRIBUTENAME.values[VALUE]. Other supported: <'
        };
        this.desc.optPerSet[10] = {
            name: 'ATTRIBUTENAME.values',
            desc: 'Object containing the values that should be visualized as attributes with objects holding visualisation information, as described below.'
        };
        this.desc.optPerSet[11] = {
            name: 'ATTRIBUTENAME.scale',
            desc: 'Factor with wich the value should be scaled for presentation.'
        };
        this.desc.optPerSet[12] = {
            name: 'ATTRIBUTENAME.values[VALUE].col',
            desc: 'Color that should be used to visualise this value. (Supports css color names, css hex codes and RGBA values)'
        };
        this.desc.optPerSet[13] = {
            name: 'ATTRIBUTENAME.values[VALUE].txt',
            desc: 'Text describing this value. Used in legend and as vocable in description texts.'
        };
        this.desc.opts[0] = {
            name: 'visuDataset',
            desc: 'Name or id of the dataset that should be described. \n\
Searches the dataset in the given data. Example: var obj[0]={..}, obj[1]={...} \n\
can be accessed with visuDataset=1. Single objects can be accessed by setting \n\
this option to null.',
            example: 1
        };
        if (!options.visuDataset)
            this.options.visuDataset = null;
        this.desc.opts[1] = {
            name: 'visuAttribute',
            desc: 'Name of the attribute that should be visualised by default.\n\
Example: in obj[0] = { attr1=1, attr2=2} can the second attribute be accessed with visuAttribute=attr2.',
            example: 'attr2'
        };
        if (!options.visuAttribute)
            this.options.visuAttribute = null;
// Options for setting event handlers
        this.desc.opts[2] = {
            name: 'onLegendEntryClick',
            desc: 'Function to execute, if the user clicks on a legend entry',
            example: function(evt) { console.log('User clicked on legend entry.')}
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
        this.desc.opts[4] = {
            name: 'activeSource',
            desc: 'Name of the source the description is used from.',
            example: 'mysource'
        };
        if(!options.activeSource)
            this.options.activeSource = null;
        
        this.desc.opts[5] = {
            name: 'activeSet',
            desc: 'Id of the set the description is used from.',
            example: 1
        };
        if(!options.activeSet)
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
        this.desc.funcs[1] = {
            name: 'getValuesVisdata',
            desc: 'Gets a specific visdata (e.g. col, name, etc.) representing a value on a specified attribute.',
            parameter: [
                {
                    name: 'attr',
                    desc: 'Attributes name'
                },
                {
                    name: 'value',
                    desc: 'Value to get color for'
                },
                {
                    name: 'visdataname',
                    desc: 'Name of the visdata to get'
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
            let thisRef = this;
            document.addEventListener('swac_' + this.requestor.id + '_complete', function () {
                if (thisRef.options.showLegend) {
                    thisRef.getLegend();
                } else {
                    thisRef.requestor.classList.add('swac_dontdisplay');
                }
            });
            resolve();
        });
    }

    afterAddSet(set, repeateds) {
        // Set first available source as active if no one is given
        if (!this.options.activeSource) {
            this.options.activeSource = set.swac_fromName;
            // Set first available set as active if no one is given
            if (!this.options.activeSet) {
                this.options.activeSet = set.id;
            }
        }
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
     * @param {Object} set Dataset containing the data to describe
     * @param {String} visuAttribute Name of the attribute to visualize. Overwrites the components option visuAttribute for this call.
     * @returns {this.getDescribedValue.dataset} Value of the dataset
     */
    getDescribedValue(set, visuAttribute = null) {
        if (set === 'undefined' || set === null) {
            return null;
        }
        let visuAttributeFromOpts = false;
        if (visuAttribute === null
                && this.options.visuDataset) {
            visuAttribute = this.options.visuAttribute;
            visuAttributeFromOpts = true;
        }

        if (typeof set === 'object') {
            if (set[visuAttribute]) {
                return set[visuAttribute];
            } else {
                let msg = 'visuAttribute >' + visuAttribute + '< was not found in dataset.';
                if (visuAttributeFromOpts) {
                    msg += ' visuAttribute was defined in datadescription_options variable.';
                }
                Msg.warn('datadescription', msg, this.requestor);
            }
        } else {
            return set;
        }
        return null;
    }

    /**
     * Creates a description for the given dataset.
     *
     * @param {object[]} set The dataset to describe. Supported dataset DATALAYOUT:
     * data.ATTRIBUTENAME = VALUE
     * or
     * data[DATASETNO].ATTRIBUTENAME = VALUE
     * or
     * data.DATASETNAME.ATTRIBUTENAME = VALUE
     * @param {String} visuDataset Name or id of the dataset to visualize, overwrites the components option visuDataset for this call.
     * @returns {String} Description of the dataset
     */
    getDatasetDescription(set, visuDataset = null) {
        set = this.getDescribedDataset(set, visuDataset);
        if (set.length === 0) {
            return SWAC.lang.dict.datadescription.nodata;
        }
        // Check if datadescription is available
        if (!this.data[this.options.activeSource])
            Msg.error('Datadescription', 'There is no description definition for >' + this.options.activeSource + '<', this.requestor);

        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);

        var desc = '';
        for (var attribute in set) {
            var voc = this.getVocable(set, visuDataset, attribute);
            var desctpl;
            if (typeof legenddata[attribute] === 'undefined') {
                desctpl = SWAC.lang.dict.datadescription.nodescription;
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

        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);

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
        let legenddate = this.data[this.options.activeSource].getSet(this.options.activeSet);

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
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);
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
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);

        if (typeof legenddata[visuAttribute] !== 'undefined'
                && typeof legenddata[visuAttribute].col !== 'undefined') {
            Msg.warn('datadescription', 'Get color for attribute name >' + visuAttribute + '<');
            return legenddata[visuAttribute].col;
        } else {
            return '#808080'; // Grey
    }
    }

    /**
     * Gets the color that visualises the data from the dataset.
     * Uses the options.visuAttribute option to choose the attribute to get color for.
     *
     * @param {Object} set A dataset with values to get color for or the name of an attribute.
     * @param {String} visuDataset Name or id of the dataset to visualize, overwrites the components option visuDataset for this call.
     * @param {String} visuAttribute Name of the attribute to visualize, overwrites the components option visuAttribute for this call.
     * @returns {String} Name of the color
     */
    getValueColor(set, visuDataset = null, visuAttribute = null) {

        let color = this.getValueVisData(set, 'col', visuDataset, visuAttribute);
        if (color === null) {
            color = '#808080';
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
            // Automatic detect attribute to visualise
            for (let curSet of this.getMainSourceData().getSets()) {
                if (visuAttribute)
                    break;
                if (curSet) {
                    for (let attr in curSet) {
                        if (attr !== 'id' && !attr.startsWith('swac_')) {
                            visuAttribute = attr;
                            this.options.visuAttribute = attr;
                            break;
                        }
                    }
                }
            }
            Msg.info('datadescription', 'Automatic choosen visualising attribute >' + visuAttribute + '<. Set options.visuAttribute if you want to change.');
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
        return this.getValuesVisdata(visuAttribute, value, visdataname);
    }

    // public function
    getValuesVisdata(attr, value, visdataname) {
        // Get matching legends data
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);
        if (typeof legenddata[attr] === 'undefined') {
            Msg.warn('Datadescription', 'There is no visudata for attribute >' + attr + '<', this.requestor);
            return null;
        } else if (!legenddata[attr].values) {
            if (!this.msged_nodescValues.has(attr)) {
                Msg.warn('Datadescription', 'There is no >'
                        + attr + '.values< in the data describing how data should be visualised.', this.requestor);
                this.msged_nodescValues.set(attr, true);
            }
            return null;
        }

        // Get calculation mode
        let calcMode = legenddata[attr].calcmode;
        if (!calcMode || calcMode === '=') {
            if (!legenddata[attr].values[value]) {
                if (!this.msged_nodescValue.has(value)) {
                    Msg.warn('Datadescription',
                            'There is no >' + attr + '.values[' + value
                            + ']< in the data describing how data should be visualised.');
                    this.msged_nodescValue.set(value, true);
                }
                return null;
            }
            // Get color by direct equality
            return legenddata[attr].values[value][visdataname];
        } else if (calcMode === '<') {
            // Get attributes into array
            let vals = Object.keys(legenddata[attr].values);
            for (let curVal of vals) {
                let curValNumber = new Number(curVal);
                if (value >= curValNumber) {

                } else {
                    return legenddata[attr].values[curVal][visdataname];
                }
            }
        } else if (calcMode === 'gradient') {
            // Get attributes into array
            let vals = Object.keys(legenddata[attr].values);
            let prevVal = null;
            for (let curVal of vals) {
                let curValNumber = new Number(curVal);
                if (value <= curValNumber) {
                    // If is below any specified color use first color
                    if (!prevVal)
                        return legenddata[attr].values[curVal][visdataname];
                    // Else calculate from distances
                    const f = (value - prevVal) / (curValNumber - prevVal);
                    let rgb = this.hexToRgb(legenddata[attr].values[curVal][visdataname]);
                    let rgbPrev = this.hexToRgb(legenddata[attr].values[prevVal][visdataname]);
                    let rgbres = {
                        r: rgb.r * f + (1 - f) * rgbPrev.r,
                        g: rgb.g * f + (1 - f) * rgbPrev.g,
                        b: rgb.b * f + (1 - f) * rgbPrev.b
                    };
                    return Colorcalculations.rgbToHex(rgbres);
                }
                prevVal = curValNumber;
            }
        } else if (calcMode === '>') {
            console.error('calcMode > not implemented yet');
        } else {
            Msg.warn('Datadescription', 'Calculation mode >' + attr + '.calcmode = "' + calcMode + '< is not supported.');
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
        if (!forAttributeElem) {
            // If there is no legend code
            Msg.error('Datadescription', 'No legend code found.', this.requestor);
            return;
        }
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);
        for (var attribute in legenddata) {
            // Exclude functions
            if (typeof legenddata[attribute] !== 'object' || attribute.startsWith('swac_')) {
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
            if (legenddata[attribute].calcmode === 'gradient') {
                var canvas = document.createElement('canvas');
                canvas.id = "CursorLayer";
                canvas.width = 25;
                canvas.height = 100;
                canvas.style.border = "1px solid";

                let ctx = canvas.getContext("2d");
                // Create gradient
                var grd = ctx.createLinearGradient(0, 100, 0, 0);

                // Get min and max values
                let minVal = null;
                let maxVal = null;
                for (var i in legenddata[attribute].values) {
                    let iNum = new Number(i);
                    if (minVal === null || iNum < minVal)
                        minVal = iNum;
                    if (maxVal === null || iNum > maxVal)
                        maxVal = iNum;
                }

                for (var i in legenddata[attribute].values) {
                    let option = legenddata[attribute].values[i];
                    let iNum = new Number(i);
                    grd.addColorStop((iNum - minVal) / (maxVal - minVal), option.col);
                }

                // Fill with gradient
                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, 100, 250);
                let highElem = document.createElement('div');
                highElem.innerHTML = maxVal;
                acordCont.appendChild(highElem);
                acordCont.appendChild(canvas);
                let lowElem = document.createElement('div');
                lowElem.innerHTML = minVal;
                acordCont.appendChild(lowElem);
            } else {
                // Add legend for color meanings
                for (var i in legenddata[attribute].values) {
                    var option = legenddata[attribute].values[i];
                    var optionElem = document.createElement('div');
                    var colorBtn = document.createElement('div');
                    colorBtn.classList.add('swac_datadescription_colorbutton');
                    let col = option.col;
                    // Change RGBA colors
                    if (col.startsWith('0x')) {
                        col = col.substring(4);
                        let red = col.substring(4);
                        let green = col.substring(2, 4);
                        let blue = col.substring(0, 2);
                        col = '#' + red + green + blue;
                    }
                    colorBtn.style.backgroundColor = col;
                    optionElem.appendChild(colorBtn);
                    var titleBtn = document.createElement('div');
                    titleBtn.setAttribute('swac_lang', option.txt);
                    titleBtn.innerHTML = option.txt;
                    optionElem.appendChild(titleBtn);
                    acordCont.appendChild(optionElem);
                    var brElem = document.createElement('br');
                    acordCont.appendChild(brElem);
                }
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
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);
        for (var attribute in legenddata) {
            let col = this.getAttributeColor(attribute);
            let sel = '[swac_attrname=' + attribute + ']';
            let elemsForAttr = element.querySelectorAll(sel);
            for (let curElemForAttr of elemsForAttr) {
                // Exclude attr elements
                if (curElemForAttr.classList.contains('swac_repeatedForAttribute')) {
                    continue;
                }
                if (col !== '#808080') {
                    curElemForAttr.style.border = '1px solid ' + col;
                }
                // Get bindpoint
                let bp = curElemForAttr.querySelector('swac-bp');
                // Get color vor value
                let valcol = this.getValueColor(bp.innerHTML, null, attribute);
                if (valcol !== '#808080') {
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
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);
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
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);

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
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);
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
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);
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
        let legenddata = this.data[this.options.activeSource].getSet(this.options.activeSet);
        if (typeof legenddata[visuAttribute] !== 'undefined'
                && typeof legenddata[visuAttribute].values !== 'undefined') {

            let definitions = [];

            for (let curDefValue in legenddata[visuAttribute].values) {
                definitions.push(legenddata[visuAttribute].values[curDefValue]);
                // Add value
                definitions[definitions.length - 1].value = curDefValue;
            }

            for (let i = 0; i < definitions.length; i++) {
                let curDef = definitions[i];
                // Get calculation mode
                let calcMode = legenddata[visuAttribute].calcmode;
                if (!calcMode || calcMode === '=') {
                    curDef.minValue = Number(curDef.value);
                    curDef.maxValue = Number(curDef.value);
                } else if (calcMode === '<') {
                    let prvDef = definitions[i - 1];
                    if (prvDef) {
                        curDef.minValue = prvDef.value;
                    } else if (legenddata[visuAttribute].minValue
                            && legenddata[visuAttribute].minValue < Number(curDef.value)) {
                        curDef.minValue = legenddata[visuAttribute].minValue;
                    } else {
                        curDef.minValue = 0;
                    }
                    curDef.maxValue = Number(curDef.value);
                } else if (calcMode === '>') {
                    curDef.minValue = Number(curDef.value);
                    let nxtDef = definitions[i + 1];
                    if (nxtDef) {
                        curDef.maxValue = nxtDef.value;
                    } else if (legenddata[visuAttribute].maxValue
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

    /**
     * Converts a hex color into its rgb
     * 
     * @param {Hexcode} hex Hex color value
     * @returns {Object} Object with r,g,b values
     */
    hexToRgb(hex) {
        if (!hex.startsWith('#'))
            Msg.error('Datadescription', 'Given color value >' + hex + '< is not in hex. This mode only supports hex values', this.requestor);
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
}