var VisualmodelFactory = {};
VisualmodelFactory.create = function (config) {
    return new Visualmodel(config);
};

/**
 * Component to create visual models from data, that shows the dependencies
 * and hierarchie within the data.
 */
class Visualmodel extends Component {

    constructor(options = {}) {
        super(options);
        this.name = 'Visualmodel';

        this.desc.text = "Component to create visual models from data, that shows the dependencies and hierarchie within the data.";

        this.desc.depends[0] = {
            name: "Konva libary",
            path: SWAC_config.swac_root + "/swac/components/Visualmodel/libs/konva.min.js",
            desc: ""
        };
        this.desc.depends[1] = {
            name: "Colorcalcultions algorithms",
            path: SWAC_config.swac_root + "/swac/algorithms/Colorcalculations.js",
            desc: ""
        };


        this.desc.templates[0] = {
            name: 'visualmodel',
            style: 'visualmodel',
            desc: 'standard visualmodel'
        };

        this.desc.reqPerTpl[0] = {
            selc: '.swac_visualmodel_drawarea',
            desc: "Element where to draw the visualisation"
        };

        this.desc.reqPerSet[0] = {
            name: "id",
            desc: "Id that identifies the dataset."
        };
        this.desc.reqPerSet[1] = {
            name: "name",
            alt: "title",
            desc: "Name or title of the selection."
        };

        this.desc.optPerSet[0] = {
            name: "parent",
            desc: "If present the parent information will be used for layering."
        };
        this.desc.optPerSet[1] = {
            name: "width",
            desc: "Width of the sets visualisation."
        };
        this.desc.optPerSet[2] = {
            name: "height",
            desc: "Height of the sets visualisation."
        };
        this.desc.optPerSet[3] = {
            name: "fillcolor",
            desc: "Color that is the visualisation filled with."
        };
        this.desc.optPerSet[4] = {
            name: "bordercolor",
            desc: "Color of the visualisations border."
        };
        this.desc.optPerSet[5] = {
            name: "desc",
            desc: "Visualisations description."
        };
        this.desc.optPerSet[6] = {
            name: "type",
            desc: "Visualisations type. [dev,con] default: dev"
        };
        this.desc.optPerSet[7] = {
            name: "kind",
            desc: "Visualisations kind. For con: [line,arrow] default: line"
        };
        this.desc.optPerSet[8] = {
            name: "linecalc",
            desc: "Kind of line calculation. [direct,curve] default: direct"
        };
        this.desc.optPerSet[9] = {
            name: "part1",
            desc: "Id of the dataset representing the first partner of a connection."
        };
        this.desc.optPerSet[10] = {
            name: "part2",
            desc: "Id of the dataset representing the second partner of a connection."
        };
        this.desc.optPerSet[11] = {
            name: "labelX",
            desc: "Additional labels with numbers instead of X."
        };
        this.desc.optPerSet[12] = {
            name: 'strokeColor',
            desc: 'Color of connections.'
        };
        this.desc.optPerSet[13] = {
            name: 'strokeWidth',
            desc: 'Width of the connection line'
        };
        this.desc.optPerSet[14] = {
            name: 'strokeTension',
            desc: 'Tension of the interpolated connection line'
        };

        this.options.showWhenNoData = true;

        this.desc.opts[0] = {
            name: "defaultWidth",
            desc: "Default width of set visus when no width data is given"
        };
        if (!options.defaultWidth)
            this.options.defaultWidth = 100;
        this.desc.opts[1] = {
            name: "defaultHeight",
            desc: "Default height of set visus when no width data is given"
        };
        if (!options.defaultHeight)
            this.options.defaultHeight = 50;
        this.desc.opts[2] = {
            name: "defaultFillColor",
            desc: "Default color of the set visu if no set.fillcolor is given"
        };
        if (!options.defaultFillColor)
            this.options.defaultFillColor = null; //'#ffffff';
        this.desc.opts[3] = {
            name: "defaultStrokeColor",
            desc: "Default color of the set visus border if no set.strokecolor is given"
        };
        if (!options.defaultBorderColor)
            this.options.defaultBorderColor = '#000000';
        this.desc.opts[4] = {
            name: "visuMargin",
            desc: "Margin between the visu elements."
        };
        if (!options.visuMargin)
            this.options.visuMargin = 10;

        this.desc.opts[6] = {
            name: "showMenue",
            desc: "If true the menue is show"
        };

        if (options.showMenue === undefined)
            this.options.showMenue = true;
        this.desc.opts[7] = {
            name: "stageWidth",
            desc: "Width of the stage"
        };
        if (!options.stageWidth)
            this.options.stageWidth = 'contElem.clientWidth';

        this.desc.opts[8] = {
            name: "stageHeight",
            desc: "Height of the stage"
        };
        if (!options.stageHeight)
            this.options.stageHeight = window.innerHeight;

        this.desc.opts[9] = {
            name: "onClickCon",
            desc: "Function to be executed when a drawn connection element is clicked"
        };
        if (!options.onClickCon)
            this.options.onClickCon = null;

        this.desc.opts[10] = {
            name: "onClickElement",
            desc: "Function to be executed when other drawn element is clicked"
        };
        if (!options.onClickElement)
            this.options.onClickElement = null;

        this.desc.opts[11] = {
            name: "defaultLabelFrontFamily",
            desc: "Default font family for labels"
        };
        if (!options.defaultLabelFrontFamily)
            this.options.defaultLabelFrontFamily = 'Arial';

        this.desc.opts[12] = {
            name: "defaultLabelFrontStyle",
            desc: "Default font style for labels"
        };
        if (!options.defaultLabelFrontStyle)
            this.options.defaultLabelFrontStyle = 'Arial';

        this.desc.opts[13] = {
            name: "defaultLabelFrontSize",
            desc: "Default font size for labels"
        };
        if (!options.defaultLabelFrontSize)
            this.options.defaultLabelFrontSize = 12;

        this.desc.opts[14] = {
            name: "defaultLabelPadding",
            desc: "Default padding for labels"
        };
        if (!options.defaultLabelPadding)
            this.options.defaultLabelPadding = 2;

        this.desc.opts[15] = {
            name: "defaultLabelStrokeWidth",
            desc: "Default strokeWidth for labels"
        };
        if (!options.defaultLabelStrokeWidth)
            this.options.defaultLabelStrokeWidth = 0.3;

        this.desc.opts[16] = {
            name: "defaultLabelFillColor",
            desc: "Default fillColor for labels"
        };
        if (!options.defaultLabelFillColor)
            this.options.defaultLabelFillColor = '#000000';

        this.desc.opts[17] = {
            name: "defaultLabelBorderColor",
            desc: "Default borderColor for labels"
        };
        if (!options.defaultLabelBorderColor)
            this.options.defaultLabelBorderColor = '#000000';

        this.desc.opts[18] = {
            name: "conDefaultLinecalc",
            desc: "Default calculation mode used for lines of connections. [direct,curve]"
        };
        if (!options.conDefaultLinecalc)
            this.options.conDefaultLinecalc = 'direct';

        this.desc.opts[19] = {
            name: "defaultConColor",
            desc: "Default color for connection lines"
        };
        if (!options.defaultConColor)
            this.options.defaultConColor = '#000000';

        this.desc.opts[20] = {
            name: "defaulConWidth",
            desc: "Default width for connection lines"
        };
        if (!options.defaulConWidth)
            this.options.defaulConWidth = 1;

        this.desc.opts[21] = {
            name: "defaulConTension",
            desc: "Heigher values lead to more interpolated curves on curve connections"
        };
        if (!options.defaulConTension)
            this.options.defaulConTension = 0.5;

//        this.desc.opts[22] = {
//            name: "conDefaultConPoint",
//            desc: "Default point where to draw connections on elements. [topbottom,side]"
//        };
//        if (!options.conDefaultConPoint)
//            this.options.conDefaultConPoint = 'topbottom';

        this.desc.opts[23] = {
            name: "autosave",
            desc: "If true changes will be saved automatically"
        };
        if (!options.autosave)
            this.options.autosave = false;

        this.plugins.set('propertieseditor', {
            active: false
        });
        this.plugins.set('visucreator', {
            active: false
        });
        this.plugins.set('exporter', {
            active: false
        });
        this.plugins.set('helplines', {
            active: false
        });

        // Attributes for internal useage
        this.layer = null;          // Konva layer where the scene is drawn
        this.stage = null;          // Stage to put the layer on
        this.drawns = new Map();    // Map with key=fromName, value = array of set visus with index same index as dataset.id
        this.visuelemFocus = null;  // visuelem that has currently focus
        this.markerinterval = null; // Intervall in which the marker will be animated

        this.stopat = 0;
    }

    init() {
        return new Promise((resolve, reject) => {
            let contElem = this.requestor.querySelector('.swac_visualmodel_drawarea');

            // Hide menue
            if (!this.options.showMenue) {
                let menueElem = this.requestor.querySelector('.swac_visualmodel_menue');
                menueElem.classList.add('swac_dontdisplay');
            }

            // Create stage
            if (this.options.stageWidth === 'contElem.clientWidth') {
                this.options.stageWidth = contElem.clientWidth;
            }

            let cont = this.requestor.querySelector('.swac_visualmodel_drawarea');
            this.stage = new Konva.Stage({
                container: cont,
                width: this.options.stageWidth,
                height: this.options.stageHeight,
                draggable: true
            });
            Konva.showWarnings = true;
            this.layer = new Konva.Layer();
            this.stage.add(this.layer);
            this.layer.draw();

            // Bind event handlers
            this.stage.on("wheel", this.zoom.bind(this));

            // Create visual elements for data
            for (let curSource in this.data) {
                for (let curSet of this.data[curSource]) {
                    if (curSet)
                        this.afterAddSet(curSource, curSet);
                }
            }
            this.registerScenegraphFunctions();
            resolve();
        });
    }

    /**
     * Function to reset the zoom to normal
     */
    resetZoom() {
        this.stage.scale({x: 1, y: 1});
        this.stage.position({x: 0, y: 0});
        this.stage.batchDraw();
    }

    /**
     * Recalculate drawn elements when user zoom in or out on the stage
     * 
     * @param {KonvaEvent} evt Event that calls the zoom
     */
    zoom(evt) {
        var scaleBy = 0.99;
        evt.evt.preventDefault();
        var oldScale = this.stage.scaleX();
        var mousePointTo = {
            x:
                    this.stage.getPointerPosition().x / oldScale -
                    this.stage.x() / oldScale,
            y:
                    this.stage.getPointerPosition().y / oldScale -
                    this.stage.y() / oldScale
        };
        var newScale = evt.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

        this.stage.scale({x: newScale, y: newScale});
        var newPos = {
            x:
                    -(
                            mousePointTo.x -
                            this.stage.getPointerPosition().x / newScale
                            ) * newScale,
            y:
                    -(
                            mousePointTo.y -
                            this.stage.getPointerPosition().y / newScale
                            ) * newScale
        };
        this.stage.position(newPos);
        this.stage.batchDraw();
    }

    afterAddSet(fromName, set) {
        // Get colors
        let fillcolor = set.color ? set.color : this.options.defaultFillColor;
        // Get parent
        let parentDrawn = this.getParentDrawn(set, fromName);

        // Draw parent if not drawn yet
        if (parentDrawn && parentDrawn.notdrawn) {
            // Get parent set
            let parentSource = this.data[parentDrawn.fromname];
            if (parentSource) {
                let parentSet = parentSource[parentDrawn.id];
                Msg.warn('Visualmodel', 'Now drawing parent of >'
                        + fromName + '[' + set.id + ']<', this.requestor);
                this.afterAddSet(parentDrawn.fromname, parentSet);
                parentDrawn = this.getParentDrawn(set, fromName);
            } else {
                Msg.warn('Visualmodel', 'Parent >'
                        + parentDrawn.fromname + '[' + parentDrawn.id
                        + ']< is not in available data.', this.requestor);
            }
        }

        // Get labels
        let labels = this.createLabelsForSet(fromName, set, fillcolor);

        // Draw element
        let drawnElem;
        if (set.type === 'con') {
            drawnElem = this.drawSetAsConnection(fromName, set, parentDrawn, labels);
        } else {
            drawnElem = this.drawSetAsElement(fromName, set, parentDrawn, labels);
        }

        // Check if element was drawn
        if (!drawnElem)
            return null;

        // Draw labels
        this.drawLabelsForSet(fromName, set, labels, drawnElem);

        // Fill with image if given
        if (set.image) {
            let layer = this.layer;
            let imageObj = new Image();
            imageObj.onload = function () {
                drawnElem.fillPatternImage(imageObj);
                layer.draw();
            };
            imageObj.src = set.image;
        }

        if (parentDrawn) {
            // Note created child
            parentDrawn.attrs.swac_childs.push(drawnElem);
            // Calculate relative position
            drawnElem.swac_rel_x = drawnElem.attrs.x - parentDrawn.attrs.x;
            drawnElem.swac_rel_y = drawnElem.attrs.y - parentDrawn.attrs.y;
            // Set the level where to draw the set
            drawnElem.setZIndex(parentDrawn.index + 1);
        }

        this.putOnStage(fromName, set, drawnElem);

        this.stage.add(this.layer);
        this.layer.draw();
    }

    putOnStage(fromName, set, drawnElem) {
        // Add visu to layer
        this.layer.add(drawnElem);

        // Create drawns storage if not exists
        if (!this.drawns.has(fromName)) {
            this.drawns.set(fromName, []);
        }
        let drawnStorage = this.drawns.get(fromName);
        drawnStorage[set.id] = drawnElem;

        // ***************
        // Register event handlers for visuelem<
        // ***************

        let stage = this.stage;
        // Prevent stage from be dragged when on visuelem
        drawnElem.on("mouseenter", function (e) {
            if (e.target === drawnElem) {
                stage.draggable(false);
            }
        });
        // Set stage to be draggable again so that user can move over whole drawing
        drawnElem.on("mouseleave", function (e) {
            if (e.target === drawnElem) {
                if (this.focusObject === null) {
                    stage.draggable(true);
                }
            }
        });
        //drawnElem.strokeScaleEnabled(false);

        // When dragging
        let thisRef = this;
        drawnElem.on("dragmove", function (evt) {
            thisRef.moveElement(drawnElem, fromName);
        });
        drawnElem.on("dragend", function (evt) {
            if (thisRef.options.autosave)
                thisRef.saveData();
        });
        drawnElem.draggable(true);
    }

    /**
     * Draw a dataset as a connection
     * 
     * @param {String} fromName Name of the datasource
     * @param {Object} set Dataset with at least part1, part2 attributes
     * @param {KonvaObject} parentDrawn KonvaObject that is parent of the currently to draw object
     * @param {KonvaObject[]} labels List of label elements
     * @param {KonvaObject} drawnCon Connection object previous drawn to recalculate line
     * @returns {Visualmodel.drawSetAsConnection.drawnCon|Konva.Line|Konva.Arrow}
     */
    drawSetAsConnection(fromName, set, parentDrawn, labels, drawnCon) {
        if (!set.part1 || !set.part2) {
            Msg.error('Visualmodel', 'Dataset >' + set.id
                    + '< is no connection dataset, because part1 or part2 attribute is missing',
                    this.requestor);
            return null;
        }
        // Get sets and their drawn involved in connection
        let startFromName = fromName;
        let startSetId;
        if (isNaN(set.part1)) {
            startFromName = SWAC_model.getSetnameFromReference(set.part1);
            startSetId = SWAC_model.getIdFromReference(set.part1);
            //TODO correct backend (im Empfangenen Datensatz steht Tbl...)
            startFromName = 'resources/server/list';
        } else {
            startSetId = set.part1;
        }
        let startVisu = this.stage.find('#' + startFromName + '_' + startSetId)[0];
        if (!startVisu) {
            Msg.error('Visualmodel', 'Start element >' + set.part1
                    + '< for connection not found.',
                    this.requestor);
            return null;
        }
        let endSetFromName = fromName;
        let endSetId = set.part2;
        if (isNaN(set.part2)) {
            endSetFromName = SWAC_model.getSetnameFromReference(set.part2);
            endSetId = SWAC_model.getIdFromReference(set.part2);
            //TODO correct backend
            endSetFromName = 'resources/server/list';
        }
        let endVisu = this.stage.find('#' + endSetFromName + '_' + endSetId)[0];
        if (!endVisu) {
            Msg.error('Visualmodel', 'End element >' + set.part1
                    + '< for connection not found.',
                    this.requestor);
            return null;
        }

        // Get docking points of the connection
        let startPoint = this.calculateConPoint(startVisu, endVisu);
        let endPoint = this.calculateConPoint(endVisu, startVisu);

        // Use default line calc mode if no one specified
        if (!set.linecalc) {
            set.linecalc = this.options.conDefaultLinecalc;
        }

        // Get position of line points
        let posarray;
        if (set.linecalc === 'curve') {
            // Calculate curve point
            let cp_x = startPoint.x + ((endPoint.x - startPoint.x) / 2);
            let cp_y = startPoint.y + ((endPoint.y - startPoint.y) / 4);
            posarray = [startPoint.x, startPoint.y, cp_x, cp_y, endPoint.x, endPoint.y];
        } else {
            posarray = [startPoint.x, startPoint.y, endPoint.x, endPoint.y];
        }

        let conOpts = {
            id: fromName + '_' + set.id,
            swac_fromName: fromName,
            swac_set: set,
            swac_childs: [],
            swac_parent: parentDrawn,
            points: posarray,
            lineCap: 'butt',
            lineJoin: 'butt',
            listening: true
        };

        // Get stroke
        conOpts.stroke = set.strokeColor ? set.strokeColor : this.options.defaultConColor;
        conOpts.strokeWidth = set.strokeWidth ? set.strokeWidth : this.options.defaulConWidth;
        conOpts.tension = set.strokeTension ? set.strokeTension : this.options.defaulConTension;

        // Draw connwction
        if (!drawnCon) {
            if (set.kind === 'arrow') {
                conOpts.pointerLength = 10;
                conOpts.pointerWidth = 10;
                conOpts.pointerAtBeginning = false;
                drawnCon = new Konva.Arrow(conOpts);
            } else {
                drawnCon = new Konva.Line(conOpts);
            }

            startVisu.attrs.swac_connections.push(drawnCon);
            endVisu.attrs.swac_connections.push(drawnCon);

            // Add event handler for clicking onClickOtherDrawn
            if (this.options.onClickCon) {
                drawnCon.on('click', this.options.onClickCon.bind(this));
            }
        } else {
            drawnCon.setPoints(posarray);
        }

        return drawnCon;
    }

    /**
     * Calculate the position of the docking point of connection lines
     * 
     * @param {KonvaObject} startVisu Object that ist start point of the connection
     * @param {KonvaObject} endVisu Object that is endpoint of the connection
     * @returns {Visualmodel.calculateConPoint.xypos}
     */
    calculateConPoint(startVisu, endVisu) {
        let xypos = {};

        // Calculate middle points
        let smpointx = startVisu.attrs.x + (startVisu.attrs.width / 2);
        let smpointy = startVisu.attrs.y + (startVisu.attrs.height / 2);
        let empointx = endVisu.attrs.x + (endVisu.attrs.width / 2);
        let empointy = endVisu.attrs.y + (endVisu.attrs.height / 2);

        // Get length of line between points (this is radius of circle around watched element)
        let linelength = Math.sqrt(Math.pow((empointx - smpointx), 2) + Math.pow((empointy - smpointy), 2));

        // Create point where 0 degree is located on the circle
        let nullpointx = smpointx;
        let nullpointy = smpointy - linelength;
        // Create vector from center (watched element) to 0 degree
        let mTnVec = [(nullpointx - smpointx), (nullpointy - smpointy)];
        // Create vector from center (watched element) to second element
        let mTbVec = [(empointx - smpointx), (empointy - smpointy)];
        // Calculate scalar product of vectors 
        let skalarprod = (mTnVec[0] * mTbVec[0]) + (mTnVec[1] * mTbVec[1]);
        // Calculate length of vectors (https://de.serlo.org/mathe/1777/l%C3%A4nge-eines-vektors#:~:text=L%C3%A4nge%20eines%20Vektors%201%20Berechnung.%20Der%20Betrag%20eines,vielen%20Aspekten%20des%20realen%20Lebens%20eine%20Rolle.%20)
        let length_nVec = Math.sqrt(Math.pow(mTnVec[0], 2) + Math.pow(mTnVec[1], 2));
        let length_bVec = Math.sqrt(Math.pow(mTbVec[0], 2) + Math.pow(mTbVec[1], 2));
        // Calculate angle in radiant (https://www.mathebibel.de/winkel-zwischen-zwei-vektoren#:~:text=%20Winkel%20zwischen%20zwei%20Vektoren%20berechnen%20-%20Beispiel,betr%C3%A4gt%20etwa%20125%2C26%C2%B0%20Grad.%20Der%20Winkel...%20More%20)
        let rad = Math.acos(skalarprod / (length_nVec * length_bVec));

        // Calculate degree
        let deg = (rad * 180 / Math.PI);
        if (empointx < smpointx) {
            // Calculated angle is allways angle of the "spitze winkel"
            // But we need the angle complete arround the circle
            deg = 360 - deg;
        }

        // Chose connection location
        if (deg >= 45 && deg <= 135) {
            // Right
            xypos.x = startVisu.attrs.x + startVisu.attrs.width;
            xypos.y = startVisu.attrs.y + (startVisu.attrs.height / 2);
        } else if (deg > 135 && deg < 225) {
            // Bottom
            xypos.x = startVisu.attrs.x + (startVisu.attrs.width / 2);
            xypos.y = startVisu.attrs.y + startVisu.attrs.height;
        } else if (deg >= 225 && deg <= 315) {
            // Left
            xypos.x = startVisu.attrs.x;
            xypos.y = startVisu.attrs.y + (startVisu.attrs.height / 2);
        } else {
            // Top
            xypos.x = startVisu.attrs.x + (startVisu.attrs.width / 2);
            xypos.y = startVisu.attrs.y;
        }
        return xypos;
    }

    /** Draw a dataset as element
     * 
     * @param {String} fromName Name of the datasource
     * @param {Object} set Dataset to visualise
     * @param {KonvaObject} parentDrawn Parents dataset representation
     * @param {KonvaObject[]} labels List of label elements
     * @returns {Konva.Rect|Visualmodel.drawSetAsElement.drawnElem}
     */
    drawSetAsElement(fromName, set, parentDrawn, labels) {
        let elementOpts = {
            id: fromName + '_' + set.id,
            swac_fromName: fromName,
            swac_set: set,
            swac_parent: parentDrawn,
            swac_childs: [],
            swac_labels: labels,
            swac_connections: [],
            scaleX: 1,
            scaleY: 1,
            strokeWidth: 1
        };

        // Get coordinate
        elementOpts.x = set.x ? set.x : this.stage.width() / 2;
        elementOpts.y = set.y ? set.y : this.stage.height() / 2;

        // Get height and width
        elementOpts.width = !isNaN(set.width) ? set.width : this.options.defaultWidth;
        elementOpts.height = !isNaN(set.height) ? set.height : this.options.defaultHeight;

        // Get colors
        elementOpts.fill = set.color ? set.color : this.options.defaultFillColor;
        elementOpts.stroke = set.bordercolor ? set.bordercolor : this.options.defaultBorderColor;

        // Set description
        if (set.desc) {
            elementOpts.desc = set.desc;
        }

        let drawnElem = new Konva.Rect(elementOpts);

        // Add event handler for clicking onClickOtherDrawn
        if (this.options.onClickElement) {
            drawnElem.on('click', this.options.onClickElement.bind(this));
        }

        return drawnElem;
    }

    /**
     * Creates the labels for the set. There could be n labels.
     * 
     * @param {String} fromName Name of the datasource
     * @param {Object} set That contains labels (title, name, and labelX - Attributes are recognised)
     * @param {String} fillcolor Color that filles the element the label is placed on
     * @returns {Object[]} List of labels
     */
    createLabelsForSet(fromName, set, fillcolor) {
        let labels = [];        // Get label from title
        if (typeof set.title !== 'undefined') {
            set.label0 = set.title;
        } else if (typeof set.name !== 'undefined') {
            set.label0 = set.name;
        }

        // Get label from labelX attributes
        for (let curAttr in set) {
            if (!curAttr.startsWith('label') && !curAttr !== 'title' && !curAttr !== 'name') {
                continue;
            }
            // Create label obj
            let curLabel = {};
            // Special handling for title and name attributes
            if (curAttr === 'title' || curAttr === 'name') {
                curAttr = 'label0';
            }
            curLabel.setAttr = curAttr;
            // Get label text
            curLabel.text = set[curAttr];
            // Get label font
            curLabel.fontFamily = set[curAttr + 'frontFamily'] ? set[curAttr + 'frontFamily'] : this.options.defaultLabelFrontFamily;
            // Get label Style
            curLabel.fontStyle = set[curAttr + 'frontStyle'] ? set[curAttr + 'frontStyle'] : this.options.defaultLabelFrontStyle;
            // Get label size
            curLabel.fontSize = set[curAttr + 'frontSize'] ? set[curAttr + 'frontSize'] : this.options.defaultLabelFrontSize;
            // Get label padding
            curLabel.padding = set[curAttr + 'padding'] ? set[curAttr + 'padding'] : this.options.defaultLabelPadding;
            // Get label strokeWidth
            curLabel.strokeWidth = set[curAttr + 'strokeWidth'] ? set[curAttr + 'strokeWidth'] : this.options.defaultLabelStrokeWidth;
            // Get labelFillcolor
            if (fillcolor) {
                curLabel.fill = set[curAttr + 'fillColor'] ? set[curAttr + 'fillColor'] : Colorcalculations.calculateContrastColor(fillcolor);
            } else {
                curLabel.fill = set[curAttr + 'fillColor'] ? set[curAttr + 'fillColor'] : this.options.defaultLabelFillColor;
            }
            // Get labelBordercolor
            if (fillcolor) {
                curLabel.stroke = set[curAttr + 'borderColor'] ? set[curAttr + 'borderColor'] : Colorcalculations.calculateContrastColor(fillcolor);
            } else {
                curLabel.sroke = set[curAttr + 'borderColor'] ? curLabel.sroke = set[curAttr + 'borderColor'] : this.options.defaultLabelBorderColor;
            }
            // Make draggable
            curLabel.draggable = true;

            // Create label
            labels.push(new Konva.Text(curLabel));
        }

        return labels;
    }

    /**
     * Draws the labels
     * 
     * @param {String} fromName Name of the resource the labels dataset comes from
     * @param {Object} set Set that has the label (my have xoffset and yoffset values for labels)
     * @param {KonvaObject[]} labels List of created konva elements for the labels
     * @param {KonvaObject} drawnElem The drawn element the labels are for.
     * @returns {undefined}
     */
    drawLabelsForSet(fromName, set, labels, drawnElem) {
        let xOffset = 2;
        let yOffset = 2;
        let xOffsetPlus = 0;
        let yOffsetPlus = 10;

        for (let curLabel of labels) {
            // Check if dataset has an x-offset
            curLabel.attrs.xoffset = set[curLabel.setAttr + 'xoffset'] ? set[curLabel.setAttr + 'xoffset'] : xOffset;
            curLabel.attrs.x = drawnElem.attrs.x + curLabel.attrs.xoffset;
            curLabel.attrs.yoffset = set[curLabel.setAttr + 'yoffset'] ? set[curLabel.setAttr + 'yoffset'] : yOffset;
            curLabel.attrs.y = drawnElem.attrs.y + curLabel.attrs.yoffset;

            // Add label to layer
            this.layer.add(curLabel);

            // Add dragging listener
            curLabel.on('dragstart', function () {
                curLabel.stopDrag();
                drawnElem.startDrag();
            });

            // Add plus for next label
            xOffset += xOffsetPlus;
            yOffset += yOffsetPlus;
        }
    }

    afterRemoveSets(fromName, sets) {
        for (let curSet of sets) {
            let id = fromName + '_' + curSet.id;
            let drawn = this.stage.find('#' + id)[0];
            // Also delete text label
            drawn.attrs.text.destroy();
            // Also delete childs
            for (let curChild of drawn.attrs.swac_childs) {
                let fromName = curChild.attrs.swac_set.swac_fromName;
                let id = curChild.attrs.swac_set.id;
                this.requestor.swac_comp.removeSets(fromName, id);
            }

            // Auch Beschrifung und Kinder löschen!
            drawn.destroy();
        }
        this.layer.draw();
    }

    /**
     * Gets the drawn of the parent set
     * 
     * @param {Object} set Childset where to get the parentdrawn for
     * @param {String} fromName Resource the set comes from
     * @returns {Object} Parents drawn object, contains notdrawn=true if not drawn yet. null if there is no parent
     */
    getParentDrawn(set, fromName) {
        if (!set.parent)
            return null;
        // Get parent information
        let parent_fromname = fromName;
        let parent_id;
        if (isNaN(set.parent)) {
            parent_fromname = SWAC_model.getSetnameFromReference(set.parent);
            parent_id = SWAC_model.getIdFromReference(set.parent);
        } else {
            parent_id = set.parent;
        }

        // Check if parent exists in draw storeage
        let parentsStore = this.drawns.get(parent_fromname);
        if (parentsStore) {
            if (parentsStore[parent_id]) {
                return parentsStore[parent_id];
            } else {
                Msg.warn('Visualmodel', 'Drawn for >' + parent_fromname + '[' + parent_id + ']< not found.');
            }
        } else {
            Msg.warn('Visualmodel',
                    'Could not find parent storage >' + parent_fromname + '<',
                    this.requestor);
        }
        // Return not drawn information
        return {
            notdrawn: true,
            fromname: parent_fromname,
            id: parent_id
        };
    }

    /**
     * Moves an element 
     * 
     * @param {KonvaObject} visuelem Element to move
     * @returns {undefined}
     */
    moveElement(visuelem) {
        // Update relative position
        if (visuelem.attrs.swac_parent) {
            visuelem.swac_rel_x = visuelem.attrs.x - visuelem.attrs.swac_parent.attrs.x;
            visuelem.swac_rel_y = visuelem.attrs.y - visuelem.attrs.swac_parent.attrs.y;
        }

        this.moveLabelsAndCons(visuelem);

        // Move childs along
        this.moveChilds(visuelem);
    }

    /**
     * Positions the child visuelems in relation to their parent visuelem
     * 
     * @param {Object} visuelem Visualisation element which childs should be moved
     * @returns {undefined}
     */
    moveChilds(visuelem) {
        for (let curChild of visuelem.attrs.swac_childs) {
            // Move child
            curChild.position({
                x: visuelem.attrs.x + curChild.swac_rel_x,
                y: visuelem.attrs.y + curChild.swac_rel_y
            });
            this.moveLabelsAndCons(curChild);
            this.moveChilds(curChild);
        }
    }

    moveLabelsAndCons(visuelem) {
        // Move labels along
        for (let curLabel of visuelem.attrs.swac_labels) {
            curLabel.position({
                x: visuelem.attrs.x + curLabel.attrs.xoffset,
                y: visuelem.attrs.y + curLabel.attrs.yoffset
            });
        }
        // Move connections
        for (let curDrawn of visuelem.attrs.swac_connections) {
            let set = curDrawn.attrs.swac_set;
            // Change line points by reusing drawed line object
            this.drawSetAsConnection(set.swac_fromName, set, null, null, curDrawn);
        }
    }

    /****************************
     * SCENE GRAPH FUNCTIONS
     ****************************/

    /**
     * Register functions for scene graph useage
     * 
     * @returns {undefined}
     */
    registerScenegraphFunctions() {
        let sgElem = this.requestor.querySelector('.swac_visualmodel_scenegraph');
        let aElems = sgElem.querySelectorAll('a:not([swac_id="{id}"])');
        for (let curAElem of aElems) {
            curAElem.addEventListener('click', this.onClickScenegraphElem.bind(this));
        }
    }

    /**
     * Function that should be executed, when a element within scene graph is 
     * clicked. Selectes the visual element on screen and animates its positon
     * so it can be found easyly.
     * 
     * @param {DOMEvent} evt Event calling the function
     * @returns {undefined}
     */
    onClickScenegraphElem(evt) {
        // Unselect previous selected
        this.stage.find("Transformer").destroy();
        // Reset marker interval
        if (this.markerinterval) {
            window.clearInterval(this.markerinterval);
            this.markerinterval = null;
        }
        // Get element with swac_id
        let idElem = evt.target;
        while (idElem.parentNode) {
            if (idElem.hasAttribute('swac_setid')) {
                break;
            }
            idElem = idElem.parentNode;
        }
        let id = idElem.getAttribute('swac_setid');
        let setname = idElem.getAttribute('swac_setname');
        let visuelem = this.stage.findOne('#' + setname + '_' + id);

        var tween;
        if (tween) {
            tween.destroy();
        }

        tween = new Konva.Tween({
            node: visuelem,
            duration: 2,
            scaleX: 1.5,
            scaleY: 1.5,
            easing: Konva.Easings.ElasticEaseOut,
        });
        // Direct animation
        tween.play();
        setTimeout(function () {
            tween.reverse();
        }, 1000);
        // Repeating timed animation
        this.markerinterval = setInterval(function () {
            tween.play();
            setTimeout(function () {
                tween.reverse();
            }, 1000);
        }, 3000);
        // Stop animation on click onto stage
        let thisRef = this;
        this.stage.on("click", function () {
            if (thisRef.markerinterval) {
                window.clearInterval(thisRef.markerinterval);
                thisRef.markerinterval = null;
            }
        });
    }
}