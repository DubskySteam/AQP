var PresentFactory = {};
PresentFactory.create = function (config) {
    return new Present(config);
};

/**
 * Component for display
 */
class Present extends Component {

    /*
     * Constructs a new component object and transfers the config to the
     * object
     */
    constructor(options) {
        super(options);
        this.name = 'Present';

        this.desc.text = 'Presents two dimensional datasets no matter of the number or names of columns. There are different templates for default presentation.';

        this.desc.templates[0] = {
            name: 'table_per_dataset',
            desc: 'Creates a table for each dataset.'
        };
        this.desc.templates[1] = {
            name: 'card_per_dataset',
            desc: 'Creates a card for each dataset.'
        };
        this.desc.templates[2] = {
            name: 'table_for_all_datasets',
            desc: 'Creates a table which displays all datasets.'
        };

        this.desc.reqPerSet[0] = {
            name: '*',
            desc: 'at least one value as an attribute (named whatever you want)'
        };

        this.desc.opts[0] = {
            name: 'sortable',
            desc: 'If true makes the presented data sortable'
        };
        this.options.sortable = false;
    }
    
    init() {
        return new Promise((resolve, reject) => {
            // Add sortable mechanism
            if (this.options.sortable) {
                let gridelem = document.querySelector('#' + this.requestor.id + ' [uk-grid]');
                if (gridelem !== null) {
                    gridelem.setAttribute('uk-sortable', "handle: .uk-card");
                } else {
                    Msg.warn('present', 'Option >sortable> for >'
                            + this.requestor.id + '< was set to true, but there is no '
                            + 'element in the template that is able to build '
                            + 'sortable elements.', this.requestor);
                }
            }
            resolve();
        });
    }
}