/* 
 * Heatbridges plugin for SWAC_mediaeditor for detecting mediaanalysis.
 */
var helplinesFactory = {
    create: function (pluginconfig) {
        return new HelplinesSPL(pluginconfig);
    }
};

class HelplinesSPL extends ComponentPlugin {

    constructor(pluginconf) {
        super(pluginconf);
        this.name = 'Visualmodel/plugins/helplines';
        this.desc.templates[0] = {
            name: 'helplines',
            desc: 'Shows options for helplines'
        };

        this.desc.opts[0] = {
            name: 'horizontalGridSize',
            desc: 'Horizontal size of a grid element, false to deactivate'
        };
        if (!this.options.horizontalGridSize)
            this.options.horizontalGridSize = 10;

        this.desc.opts[1] = {
            name: 'verticalGridSize',
            desc: 'Vertical size of a grid element, false to deactivate'
        };
        if (!this.options.verticalGridSize)
            this.options.verticalGridSize = 10;

        this.desc.opts[2] = {
            name: 'sizeLineOffset',
            desc: 'Offset for sizeLines'
        };
        if (!this.options.sizeLineOffset)
            this.options.sizeLineOffset = 20;

        this.desc.opts[3] = {
            name: 'sizeLineUnit',
            desc: 'Unit for sizeLines'
        };
        if (!this.options.sizeLineUnit)
            this.options.sizeLineUnit = 'mm';

        this.desc.opts[4] = {
            name: 'sizeLineUnitFactor',
            desc: 'Factor with that the size in pixel is multiplied for unit display'
        };
        if (!this.options.sizeLineUnitFactor)
            this.options.sizeLineUnitFactor = 1;

        this.desc.opts[5] = {
            name: 'sizeLineMode',
            desc: 'Mode for size line drawing (parents, childs, booth)'
        };
        if (!this.options.sizeLineMode)
            this.options.sizeLineMode = 'parents';

        this.desc.opts[6] = {
            name: 'differenceLineMode',
            desc: 'Mode for differnece line calculation (border, middle)'
        };
        if (!this.options.differenceLineMode)
            this.options.differenceLineMode = 'middle';

        // Internal attributes
        this.stage = null;
        this.layer = null;
        this.sizelines = new Map();
    }

    init() {
        // Get stage from  requestors component
        this.stage = this.requestor.swac_comp.stage;
        this.layer = new Konva.Layer();
        this.stage.add(this.layer);

        // Initial handling
        for (let curSource in this.requestor.swac_comp.data) {
            for (let curDrawn of this.requestor.swac_comp.drawns.get(curSource)) {
                if (!curDrawn)
                    continue;
                // Draw sizeLine only for parents
                if (this.options.sizeLineMode === 'parents' && curDrawn.attrs.swac_childs.length > 0) {
                    this.drawSizeLines(curDrawn);
                } else if (this.options.sizeLineMode === 'childs' && curDrawn.attrs.swac_parent) {
                    this.drawSizeLines(curDrawn);
                } else if (this.options.sizeLineMode === 'booth') {
                    this.drawSizeLines(curDrawn);
                }
                // Register event handler for on change
                let thisRef = this;
                curDrawn.on('dragend', function (evt) {
                    if (thisRef.options.sizeLineMode === 'parents' && evt.target.attrs.swac_parent) {
                        thisRef.drawSizeLines(evt.target.attrs.swac_parent);
                    } else if (thisRef.options.sizeLineMode === 'parents' && evt.target.attrs.swac_childs.length > 0) {
                        thisRef.drawSizeLines(evt.target);
                    } else if (thisRef.options.sizeLineMode === 'childs' && evt.target.attrs.swac_parent) {
                        thisRef.drawSizeLines(evt.target);
                    } else if (thisRef.options.sizeLineMode === 'booth') {
                        thisRef.drawSizeLines(evt.target.attrs.swac_parent);
                        thisRef.drawSizeLines(evt.target);
                    }
                });
            }
        }
    }

    /**
     * Draws size lines
     * 
     * @param {Konva.Object} visuelem Element to draw size lines for
     * @returns {undefined}
     */
    drawSizeLines(visuelem) {
        // Get number of parents
        let maxNoOfDescendants = this.getMaxNoOfDescendants(visuelem);
        // Create line for element
        let sp_x = visuelem.attrs.x;
        let sp_y = visuelem.attrs.y + visuelem.attrs.height + maxNoOfDescendants * this.options.sizeLineOffset;
        let ep_x = visuelem.attrs.x + visuelem.attrs.width;
        let ep_y = visuelem.attrs.y + visuelem.attrs.height + maxNoOfDescendants * this.options.sizeLineOffset;
        this.drawSizeLine(sp_x, sp_y, ep_x, ep_y, visuelem.attrs.id);

        // Create difference line for parent
        if (visuelem.attrs.swac_childs) {
            let lastChild;
            let lastChildPosX = visuelem.attrs.x;
            let lastChildPosY = visuelem.attrs.y + visuelem.attrs.height + (maxNoOfDescendants - 1) * this.options.sizeLineOffset;
            let childs = this.getChildsSortedByX(visuelem);
            for (let curChild of childs) {
                let ds_x = lastChildPosX;
                let ds_y = lastChildPosY;
                let es_x = curChild.attrs.x;
                let es_y = lastChildPosY;
                if (this.options.differenceLineMode === 'border' && lastChild) {
                    ds_x = ds_x + lastChild.attrs.width;
                } else if (this.options.differenceLineMode === 'middle') {
                    // Move endpoint to half of curChild
                    es_x = es_x + (curChild.attrs.width / 2);
                }

                // Do not draw zero length
                if ((es_x - ds_x) !== 0)
                    this.drawSizeLine(ds_x, ds_y, es_x, es_y, curChild.attrs.id + '_diff');

                lastChild = curChild;
                lastChildPosX = es_x;
            }
        }

        this.layer.draw();
    }

    drawSizeLine(sp_x, sp_y, ep_x, ep_y, forElemId) {

        // Check if sizeLines exists
        let sizeLines = this.sizelines.get(forElemId);
        if (sizeLines) {
            for (let curSizeLine of sizeLines) {
                switch (curSizeLine.attrs.swac_type) {
                    case 'sizeLine':
                        curSizeLine.points([sp_x, sp_y, ep_x, ep_y]);
                        break;
                    case 'sizeLineStart':
                        curSizeLine.points([sp_x, sp_y - 5, sp_x, sp_y + 5]);
                        break;
                    case 'sizeLineEnd':
                        curSizeLine.points([ep_x, ep_y - 5, ep_x, ep_y + 5]);
                        break;
                    case 'sizeLineLabel':
                        curSizeLine.position({
                            x: sp_x + ((ep_x - sp_x) / 2),
                            y: sp_y + 2
                        });
                        let length = (ep_x - sp_x) * this.options.sizeLineUnitFactor;
                        curSizeLine.text(length + ' ' + this.options.sizeLineUnit);
                        break;
                    default:
                        Msg.error('HelplinesSPL', 'Element of unkwon type in sizeLines');
                }
            }
            return;
        }
        sizeLines = [];

        let sizeLineOpts = {
            swac_type: 'sizeLine',
            points: [sp_x, sp_y, ep_x, ep_y],
            stroke: '#000000',
            strokeWidth: 1
        };
        let sizeLine = new Konva.Line(sizeLineOpts);
        this.layer.add(sizeLine);
        sizeLines.push(sizeLine);
        let sizeLineStartOpts = {
            swac_type: 'sizeLineStart',
            points: [sp_x, sp_y - 5, sp_x, sp_y + 5],
            stroke: '#000000',
            strokeWidth: 1
        };
        let sizeLineStart = new Konva.Line(sizeLineStartOpts);
        this.layer.add(sizeLineStart);
        sizeLines.push(sizeLineStart);
        let sizeLineEndOpts = {
            swac_type: 'sizeLineEnd',
            points: [ep_x, ep_y - 5, ep_x, ep_y + 5],
            stroke: '#000000',
            strokeWidth: 1
        };
        let sizeLineEnd = new Konva.Line(sizeLineEndOpts);
        this.layer.add(sizeLineEnd);
        sizeLines.push(sizeLineEnd);

        // Create label
        let length = (ep_x - sp_x) * this.options.sizeLineUnitFactor;
        let lapelOpts = {
            swac_type: 'sizeLineLabel',
            text: length + ' ' + this.options.sizeLineUnit,
            x: sp_x + ((ep_x - sp_x) / 2),
            y: sp_y + 2
        };
        let label = new Konva.Text(lapelOpts);
        this.layer.add(label);
        sizeLines.push(label);
        this.sizelines.set(forElemId, sizeLines);
    }

    drawGrid() {
        // Horizontal lines
        if (this.options.horizontalGridSize) {

        }

        // Vertical lines
        if (this.options.verticalGridSize) {

        }
    }

    /**
     * Get the max number of nachfahren of a list of visuelems
     * 
     * @param {Konva.Object[]} visuelem Elem to get no of descants for
     * @param {int} level starting level to count
     * @returns {@this;@call;getChildsLevel|Number|@var;level}
     */
    getMaxNoOfDescendants(visuelem, level = 0) {
        level++;
        let newLevel = level;
        for (let curChild of visuelem.attrs.swac_childs) {
            if (curChild) {
                newLevel = this.getMaxNoOfDescendants(curChild, level);
            }
        }
        if (newLevel > level)
            level = newLevel;
        return level;
    }

    getChildsSortedByX(visualelem) {
        let sorted = visualelem.attrs.swac_childs.sort(function (a, b) {
            return a.attrs.x - b.attrs.x;
        });
        return sorted;
    }
}