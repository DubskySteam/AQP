/**
 * @class
 * Abstract class for diagrams
 * 
 */
class Diagram {

    /**
     * Constructor for diagrams
     * 
     * @param {String} unit Name or short of the unit that belongs to the data
     * @param {String} name Name of the Data
     * @param {Float} width Width of the diagram
     * @param {Float} height Height of the diagram
     * @param {DOMElem} datadescription Requestor of a datadescription
     * @param {Object} diagramDef The whole diagram definition
     * @returns {Diagram}
     */
    constructor(unit, name, width, height, datadescription, diagramDef) {
        this.unit = unit;
        this.name = name;
        this.width = width;
        this.height = height;
        this.datadescription = datadescription;
        this.diagramDef = diagramDef;
    }

    /**
     * Draws the diagram for a value
     * 
     * @param {Object} value The value that should be displayed
     * @returns {DOMNode} A node containing the diagram (maybe svg, img,...)
     */
    drawValueDiagram(value) {
        Msg.error('Diagram', 'The called method belongs to an abstract class. Use a implementing class.');
    }
    
    /**
     * Draws the diagram for a set
     * 
     * @param {Object} set The set a diagram should be created for
     * @returns {DOMNode} A node containing the diagram (maybe svg, img,...)
     */
    drawSetDiagram(set) {
        Msg.error('Diagram', 'The called method belongs to an abstract class. Use a implementing class.');
    }
}