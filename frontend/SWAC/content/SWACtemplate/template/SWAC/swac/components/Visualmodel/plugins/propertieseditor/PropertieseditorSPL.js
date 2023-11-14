/* 
 * Heatbridges plugin for SWAC_mediaeditor for detecting mediaanalysis.
 */
var propertieseditorFactory = {};
propertieseditorFactory.create = function (pluginconfig) {
    return new PropertieseditorSPL(pluginconfig);
};

class PropertieseditorSPL extends ComponentPlugin {

    constructor(pluginconf) {
        super(pluginconf);
        this.name = 'Visualmodel/plugins/propertieseditor';
        this.desc.templates[0] = {
            name: 'propertieseditor',
            desc: 'Default template for show and edit properties'
        };

        this.desc.opts[0] = {
            name: 'analysisrequestor',
            desc: 'A datarequestor that specifies where the pictrue should be \n\
send to for analysis. All data from all form fields in the template will be \n\
added to that requestor as data payload. {media.id} can be used as placeholder\n\
for the id of the media. If id is send the picture itself will not be send.'
        };
        if (!this.options.analysisrequestor)
            this.options.analysisrequestor = null;

        // Internal attributes
        this.stage = null;
        this.layer = null;
        this.tabid = 0;
    }

    init() {
        // Get stage from  requestors component
        this.stage = this.requestor.swac_comp.stage;
        this.layer = this.requestor.swac_comp.layer;
        // Register event handling for on stage actions
        this.stage.on("click", this.onFocusElem.bind(this));
        // Register event handling for on scenegraph actions
        let sgElem = this.requestor.querySelector('.swac_visualmodel_scenegraph');
        if (sgElem) {
            let aElems = sgElem.querySelectorAll('a:not([swac_id="{id}"])');
            for (let curAElem of aElems) {
                curAElem.addEventListener('click', this.onClickScenegraphElem.bind(this));
            }
        }
        // Get propertieseditor tab id
        let switcherElem = this.requestor.querySelector('.swac_visualmodel_menueswitcher');
        let id = 0;
        for (let curChild of switcherElem.children) {
            if (curChild.id && curChild.id.includes('propertieseditor_nav')) {
                this.tabid = id;
                break;
            }
            id++;
        }
    }

    /**
     * Method to perform when a visuelement gets the focus
     * 
     * @param {KorvaEvent} evt Event that triggers the focus
     * @returns {undefined}
     */
    onFocusElem(evt) {
        this.stage.find("Circle").destroy();
        this.stage.find("Transformer").destroy();
        if (evt.target.className === "Rect") {
            // Mark visuelem with fous
            this.visuelemFocus = evt.target;
            // Make visuelem transformable
            var tr = new Konva.Transformer();
            tr.rotateEnabled(false);
            this.layer.add(tr);
            tr.attachTo(evt.target);
            this.stage.draggable(false);
            this.layer.draw();
        } else if (evt.target.constructor.name === "Arrow") {
            this.visuelemFocus = evt.target;
            let offsetx = evt.target.attrs.x;
            let offsety = evt.target.attrs.y;
            for (i = 0; i < evt.target.attrs.points.length; i = i + 2) {
                let circle = new Konva.Circle({
                    index: i,
                    x: evt.target.attrs.points[i] + offsetx,
                    y: evt.target.attrs.points[i + 1] + offsety,
                    radius: 10,
                    fill: "blue",
                    stroke: "black",
                    strokeWidth: 4,
                    draggable: true
                });
                circle.moveToTop();
                circle.on("dragmove", function () {
                    evt.target.attrs.points[circle.attrs.index] = circle.attrs.x - offsetx;
                    evt.target.attrs.points[circle.attrs.index + 1] =
                            circle.attrs.y - offsety;
                    evt.target.attrs.tooltip.attrs.updatePosition();
                    this.stage.find("Circle").moveToTop();
                    this.stage.batchDraw();
                });
                circle.on("mouseenter", function (e) {
                    if (e.target === circle) {
                        this.stage.draggable(false);
                    }
                });
                circle.on("mouseleave", function (e) {
                    if (e.target === circle) {
                        if (this.focusObject === null) {
                            this.stage.draggable(true);
                        }
                    }
                });
                this.layer.add(circle);
                this.stage.add(this.layer);
                this.layer.draw();
            }
        } else {
            this.layer.draw();
            this.visuelemFocus = null;
            this.stage.draggable(true);
        }

        if (this.visuelemFocus) {
            // Show properties editor
            this.showPropertiesEditor(this.visuelemFocus);
        } else {
            this.hidePropertiesEditor();
        }
    }

    /**
     * Executed when the user clicks on an element in the scenegraph
     * 
     * @param {DOMEvent} evt Event that calls the method
     * @returns {undefined}
     */
    onClickScenegraphElem(evt) {
        let idElem = evt.target;
        while (idElem.parentNode) {
            if (idElem.hasAttribute('swac_setid')) {
                break;
            }
            idElem = idElem.parentNode;
        }
        let id = idElem.getAttribute('swac_setid');
        let setname = idElem.getAttribute('swac_setname');
        this.visuelemFocus = this.stage.findOne('#' + setname + '_' + id);

        // Add transformer
        var tr = new Konva.Transformer();
        tr.rotateEnabled(false);
        this.layer.add(tr);
        tr.attachTo(this.visuelemFocus);
        this.layer.draw();

        this.showPropertiesEditor(this.visuelemFocus);
    }

    /**
     * Shows the properties editor with data from the given visuelem
     * 
     * @param {Konva.Node} visuelem Visualisation that should be eitable
     * @returns {undefined}
     */
    showPropertiesEditor(visuelem) {
        // Get nothing to show elem
        let msgElem = this.requestor.querySelector('.swac_visualmodel_nofocusmsg');
        msgElem.classList.add('swac_dontdisplay');
        // Get properties form
        let formElem = this.requestor.querySelector('.swac_visualmodel_propertiesform');
        formElem.classList.remove('swac_dontdisplay');
        formElem.setAttribute('swac_visuid', visuelem.attrs.id);
        // Get menue and change to properties tab
        let switcherElem = this.requestor.querySelector('.swac_visualmodel_menueswitcher');
        UIkit.switcher(switcherElem).show(this.tabid);

        let thisRef = this;
        let stage = this.stage;

        // Fill properties
        let nameElem = formElem.querySelector('.swac_visualmodel_name');
        nameElem.value = visuelem.attrs.text.attrs.text;
        nameElem.addEventListener('input', function (evt) {
            let visu = thisRef.getVisuelemForForm();
            if (visu) {
                visu.attrs.text.text(evt.target.value);
                stage.batchDraw();
            }
        });

        if (visuelem.attrs.desc) {
            let descElem = formElem.querySelector('.swac_visualmodel_desc');
            descElem.value = visuelem.attrs.desc;
        }

        let fillcolorElem = formElem.querySelector('.swac_visualmodel_fillcolor');
        fillcolorElem.value = visuelem.attrs.fill;
        fillcolorElem.addEventListener('change', function (evt) {
            let visu = thisRef.getVisuelemForForm();
            if (visu) {
                visu.fill(evt.target.value);
                stage.batchDraw();
            }
        });

        let bordercolorElem = formElem.querySelector('.swac_visualmodel_bordercolor');
        bordercolorElem.value = visuelem.attrs.stroke;
        bordercolorElem.addEventListener('change', function (evt) {
            let visu = thisRef.getVisuelemForForm();
            if (visu) {
                visu.stroke(evt.target.value);
                stage.batchDraw();
            }
        });

        let posXElem = formElem.querySelector('.swac_visualmodel_posx');
        posXElem.value = visuelem.attrs.x;

        let posYElem = formElem.querySelector('.swac_visualmodel_posy');
        posYElem.value = visuelem.attrs.y;

        let widthElem = formElem.querySelector('.swac_visualmodel_width');
        widthElem.value = visuelem.attrs.width * visuelem.attrs.scaleX;

        let heightElem = formElem.querySelector('.swac_visualmodel_height');
        heightElem.value = visuelem.attrs.height * visuelem.attrs.scaleY;

        let showElem = formElem.querySelector('.swac_visualmodel_show');
        if (visuelem.isVisible()) {
            showElem.checked = true;
        } else {
            showElem.checked = false;
        }
        showElem.addEventListener('click', function (evt) {
            let visu = thisRef.getVisuelemForForm();
            if (visu) {
                if (evt.target.checked) {
                    visu.show();
                    visu.attrs.text.show();
                } else {
                    visu.hide();
                    // also hide label
                    visu.attrs.text.hide();
                }
                stage.batchDraw();
            }
        });

        // Add event handler to detect movements
        visuelem.on("dragmove", function () {
            posXElem.value = visuelem.attrs.x;
            posYElem.value = visuelem.attrs.y;
        });
    }

    /**
     * Gets the visuElem thats properties are shwon in the propertiesform
     * 
     * @returns {KanvaShape} visuelem
     */
    getVisuelemForForm() {
        let formElem = this.requestor.querySelector('.swac_visualmodel_propertiesform');
        let visuId = formElem.getAttribute('swac_visuid');
        return this.stage.find('#' + visuId)[0];
    }

    /**
     * Hides the properties editor
     * 
     * @returns {undefined}
     */
    hidePropertiesEditor() {
        // Get nothing to show elem
        let msgElem = this.requestor.querySelector('.swac_visualmodel_nofocusmsg');
        msgElem.classList.remove('swac_dontdisplay');
        // Get properties form
        let formElem = this.requestor.querySelector('.swac_visualmodel_propertiesform');
        formElem.classList.add('swac_dontdisplay');
    }
}