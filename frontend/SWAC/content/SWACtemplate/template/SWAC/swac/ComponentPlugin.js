/**
 * Plugin for chart component to create barcharts
 */
class ComponentPlugin {

    /*
     * Constructs a new component plugin object and transfers the config to the
     * object
     */
    constructor(pluginconfig) {
        // Plugin description
        this.desc = {};
        this.desc.text = 'ComponentPlugin';
        this.desc.depends = [];
        this.desc.templates = [];
        this.desc.reqPerTpl = [];
        this.desc.optPerTpl = [];
        this.desc.optPerPage = [];
        this.desc.reqPerSet = [];
        this.desc.optPerSet = [];
        this.desc.opts = [];
        this.options = {};
        this.desc.funcs = [];
        
        for(let attrname in pluginconfig) {
            this[attrname] = pluginconfig[attrname];
        }
        
        // Component data
        // key = fromName = Sooure of the data
        // value = array of objects (sets) with attributes
        this.data = {};
    }

    init(requestor) {
        throw('The concrete implementation has to implement the init() method.');
    }
}


