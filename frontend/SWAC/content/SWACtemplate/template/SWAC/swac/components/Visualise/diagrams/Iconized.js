/**
 * @class Meter
 * 
 * creates icons for values
 * 
 */
class Iconized extends Diagram {
    constructor(value, unit, name, width, height, datadescription, diagramDef) {
        super(value, unit, name, width, height, datadescription, diagramDef);
    }

    /**
     * Draws the diagram for a value
     * 
     * @param {Object} value The value that should be displayed
     * @returns {DOMNode} A node containing the diagram (maybe svg, img,...)
     */
    drawValueDiagram(value) {
        Msg.error('Iconized', 'The Iconized Diagram supports does not support single values.');
    }

    /**
     * @function
     * creates the diagram
     * 
     * @param {Object} set The set a diagram should be created for
     * @returns {Element|Iconized.drawDiagram.svgViewBox} svg viewbox with the diagram
     */
    drawSetDiagram(set) {
        // Get icon definitions
        let icons = this.diagramDef.icons;

        // Go trough definitions and find matching
        let bestMatching = {
            curIcon: null,
            matchPoints: 0
        };
        for (let curIcon of icons) {
            let allConditions = 0;
            let matchingConds = 0;
            // Check rules
            if (curIcon.conditions) {
                allConditions = curIcon.conditions.length;
                for (let curRule of curIcon.conditions) {
                    let parts = curRule.split(' ');
                    if (set[parts[0]]) {
                        let value = set[parts[0]];
                        // Swtich test method
                        switch (parts[1]) {
                            case '=':
                                if (value == parts[2]) {
                                    matchingConds++;
                                }
                                break;
                            case '<':
                                if (value < parts[2]) {
                                    matchingConds++;
                                }
                                break;
                            case '>':
                                if (value > parts[2]) {
                                    matchingConds++;
                                }
                                break;
                            default:
                                Msg.warn('Iconized', 'There is no test method for >' + parts[1] + '<');
                        }
                    }
                }
            }
            // Check if rule was fullfilled
            if (matchingConds === allConditions
                    && matchingConds >= bestMatching.matchPoints) {
                bestMatching.matchPoints = matchingConds;
                bestMatching.curIcon = curIcon;
            }
        }

        let iconPath;
        // Check if icon was found
        if (!bestMatching.curIcon) {
            iconPath = '../swac/components/Icon/imgs/unknown.svg';
            Msg.warn('Iconized', 'Found no icon for set >' + set.id + '<');
        } else {
            iconPath = bestMatching.curIcon.path;
        }

        let iconElem = document.createElement('img');
        iconElem.setAttribute('src', iconPath);
        iconElem.setAttribute('alt', 'place');
        iconElem.setAttribute('height', 100);
        iconElem.setAttribute('width', 100);
        return iconElem;
    }
}

diagram_types['Iconized'] = Iconized;