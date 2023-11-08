var VisualiseFactory = {};
VisualiseFactory.create = function (config) {
    return new Visualise(config);
};

// Registry for all diagramtypes
var diagram_types = {};

/**
 * Component for visualising data
 */
class Visualise extends Component {

    constructor(options = {}) {
        super(options);

        this.name = 'Visualise';

        this.desc.text = "This components visualises the data given. It uses thermometer, hydrometer or icon representation. This component is not finished yet.";

        this.desc.depends[0] = {
            name: 'Diagram.js',
            path: SWAC_config.swac_root + '/swac/components/Visualise/Diagram.js',
            desc: 'Class representing diagrams'
        };
        this.desc.depends[1] = {
            name: 'DiagramRange.js',
            path: SWAC_config.swac_root + '/swac/components/Visualise/DiagramRange.js',
            desc: 'Class representing diagrams ranges'
        };
        this.desc.depends[2] = {
            name: 'ColorRange.js',
            path: SWAC_config.swac_root + '/swac/components/Visualise/ColorRange.js',
            desc: 'Class representing color ranges'
        };
        this.desc.depends[3] = {
            name: 'Hygrometer.js',
            path: SWAC_config.swac_root + '/swac/components/Visualise/diagrams/Hygrometer.js',
            desc: 'Hygrometer visualisation'
        };
        this.desc.depends[4] = {
            name: 'Thermometer.js',
            path: SWAC_config.swac_root + '/swac/components/Visualise/diagrams/Thermometer.js',
            desc: 'Thermometer visualisation'
        };
        this.desc.depends[5] = {
            name: 'Iconized.js',
            path: SWAC_config.swac_root + '/swac/components/Visualise/diagrams/Iconized.js',
            desc: 'Iconized visualisation'
        };

        this.desc.templates[0] = {
            name: 'visualise',
            style: 'visualise',
            desc: 'Shows a visualisation of the data.'
        };

        this.desc.reqPerTpl[0] = {
            selc: '.swac_visualise_diagram',
            desc: 'Element where to place the diagram in'
        };
        this.desc.reqPerTpl[1] = {
            selc: '.swac_visualise_legend',
            desc: 'Element where the legend of the diagram is defined'
        };

        this.desc.opts[0] = {
            name: 'visus',
            desc: 'Visualisation definitions with "attr" and "type" attributes.'
        };
        if (!options.visus)
            this.options.visus = [];
    }

    init() {
        return new Promise((resolve, reject) => {
            // Create diagram for each set
            for (let curSource in this.data) {
                for (let curSet of this.data[curSource]) {
                    if (curSet)
                        this.afterAddSet(curSource, curSet);
                }
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
        let repeatedForSets = this.requestor.querySelectorAll('[swac_setname="' + fromName + '"][swac_setid="' + set.id + '"]');
        // For every repeatableArea
        for (let curRepeatedElem of repeatedForSets) {
            // Get areas for values
            let forSetDefs = new Map();
            for (let curValueArea of curRepeatedElem.querySelectorAll('.swac_repeatedForValue')) {
                // Get the displayed attribute
                let attr = curValueArea.getAttribute('swac_attrname');
                // Search diagram definition
                let def = null;
                for (let curDef of this.options.visus) {
                    if (curDef.attr === attr) {
                        def = curDef;
                    } else if (curDef.attr === '*') {
                        forSetDefs.set(curDef, '1');
                    }
                }
                // Check if there is a diagram defined for that attribute
                if (def) {
                    // Add list entry functions
                    this.createDiagram(fromName, set, def, curValueArea);
                } else {
                    // Remove display because there is no visualisation defined
                    curValueArea.parentNode.removeChild(curValueArea);
                }
            }
            // Work on forSetDefs
            for (let curSetDef of forSetDefs.keys()) {
                this.createDiagram(fromName, set, curSetDef, curRepeatedElem);
            }
        }
    }

    /**
     * Creates a diagram for a single value
     * 
     * @param {String} fromName         Name of the datasource
     * @param {Object} set              Dataset object
     * @param {Object} diagramdef       Diagram options
     * @param {DOMElement} valueArea    Element where the diagram should be placed
     * @returns {undefined}
     */
    createDiagram(fromName, set, diagramdef, valueArea) {
        // Get diagram type
        let diagramtype = diagramdef.type;
        // Search diagram class
        let diagramClass = diagram_types[diagramtype];
        // Check if diagram type exists
        if (!diagramClass) {
            Msg.error('Visualise', 'The diagramtype >' + diagramtype + '< does not exists', this.requestor);
            return;
        }

        // Get attribute name
        let attr = diagramdef.attr;
        let value = set[attr];
        let unit = diagramdef.unit;
        if (!unit)
            unit = '';
        let name = diagramdef.name;
        if (!name)
            name = attr;
        let width = diagramdef.width;
        if (!width)
            width = window.innerHeight / 2;
        let height = diagramdef.height;
        if (!height)
            height = window.innerHeight / 2;
        let datadescription = null;
        if (diagramdef.datadescription) {
            datadescription = document.querySelector(diagramdef.datadescription).swac_comp;
        }

        let diagram;
        let diagramElem;
        if (diagramdef.attr === '*') {
            diagram = new diagramClass(unit, name, width, height, datadescription, diagramdef);
            diagramElem = diagram.drawSetDiagram(set);
            valueArea.appendChild(diagramElem);
        } else {
            //creates the diagram
            diagram = new diagramClass(unit, name, width, height, datadescription, diagramdef);
            diagramElem = diagram.drawValueDiagram(value);
            valueArea.querySelector('.swac_visualise_diagram').appendChild(diagramElem);
        }
    }
}