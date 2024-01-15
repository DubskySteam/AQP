import Plugin from '../../../../Plugin.js';

/* 
* This plugin allows filtering measurement points for their measurement point type
*/
export default class FilterMeasurementPointsSPL extends Plugin {
    constructor(options = {}) {
        super(options);
        this.name = 'Worldmap2d/plugins/FilterMeasurementPoints';
        this.desc.text = 'Adds the option to filter the measurementpoints by type';

        this.desc.templates[0] = {
            name: 'filtermeasurementpoints',
            style: 'filtermeasurementpoints',
            desc: 'Default template for FilterMeasurementPoints',
        };

        // Attributes for internal usage
        this.filtermeasurementpoints_menu_wrapper = null;
        this.selector_measurementpointtype = null;
        this.filtermeasurementpoints = null;
        this.button = null;
        this.map = null;
        this.menuOpened = false;
    }

    init() {
        return new Promise((resolve, reject) => {
            this.map = this.requestor.parent.swac_comp;

            this.filtermeasurementpoints = this.requestor.parent.querySelector(".filtermeasurementpoints");
            this.selector_measurementpointtype = this.filtermeasurementpoints.querySelector(".selector_measurementpointtype");
            this.button = this.filtermeasurementpoints.querySelector(".filtermeasurementpointsmenubutton")
            this.filtermeasurementpoints_menu_wrapper = this.filtermeasurementpoints.querySelector('.filtermeasurementpoints-menu-wrapper');

            if (!this.menuOpened) {
                this.filtermeasurementpoints_menu_wrapper.style.display = "none"
            }
            
            //disable click propagation
            L.DomEvent.on(this.filtermeasurementpoints, 'click', L.DomEvent.stopPropagation);
            L.DomEvent.on(this.filtermeasurementpoints, 'dblclick', L.DomEvent.stopPropagation);

            //plugin menu closes when pressing X button
            this.filtermeasurementpoints.querySelector('.button-close-filter').onclick = this.closeModal.bind(this);

            //plugin menu closes when not clicking on an input component
            this.filtermeasurementpoints_menu_wrapper.onclick = (e) => {
                if (e.target.closest('.filtermeasurementpoints-menu') == null) {
                    this.closeModal();
                }
            }; 
            
            //setup button for opening and closing themenu
            this.button.onclick = (e) => {
                if (this.menuOpened) {
                    this.filtermeasurementpoints_menu_wrapper.style.display = "none";
                    this.map.enableMapInteractions();
                } else {
                    this.filtermeasurementpoints_menu_wrapper.style.removeProperty("display");
                    this.map.disableMapInteractions();
                }
                this.menuOpened = !this.menuOpened
            }

            //when selecting another filter, the shown layer is updated
            this.selector_measurementpointtype.addEventListener('change', (event) => {
                const inputs = this.selector_measurementpointtype.swac_comp.getInputs();
                if(inputs.length == 0) return this.map.filterMarker(null);
                if(inputs.length == 1) return this.map.filterMarker(inputs[0].value);
            })
            resolve();
        });
    }
    closeModal() {
        this.map.enableMapInteractions();
        this.filtermeasurementpoints_menu_wrapper.style.display = "none"
        this.menuOpened = false;
    }
}
