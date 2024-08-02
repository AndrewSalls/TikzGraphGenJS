/**
 * Variable that represents the next generated ID.
 */
let increment = Number.MIN_SAFE_INTEGER; // id system, has 2^53 possible values before collision occurs, so don't do that

/**
 * An enum of the valid datatypes, used in filtering and describing data containing graph datatypes.
 * @readonly
 * @enum {Number}
 */
export const GRAPH_DATATYPE = {
    VERTEX: 0,
    EDGE: 1,
    EDGE_CAP: 2,
    LABEL: 3
}

/**
 * A generic graph data object that exists on the canvas and can be interacted with.
 * @abstract
 */
export class GraphObject {
    /**
     * Defines a graph object. *SHOULD NOT BE CALLED DIRECTLY*
     */
    constructor(dummy = false) {
        if(constructor.name === "GraphObject") {
            console.error("GraphObject is an abstract class and cannot be instantiated.");
        }

        if(!dummy) {
            this.id = increment;
            increment = increment + 1;
        } else {
            this.id = "dummy";
        }
    }

    /**
     * Renders the object on the canvas. *SHOULD NOT BE CALLED DIRECTLY*
     * @param {CanvasRenderingContext2D} ctx The canvas rendering context with which to draw the object.
     */
    render() {
        if(constructor.name === "GraphObject") {
            console.error("GraphObject is an abstract class and cannot be instantiated.");
        }
    }

    /**
     * Determines if the object, based on its set properties, intersects the provided coordinates. *SHOULD NOT BE CALLED DIRECTLY*
     * @param {Number} mouseX the x position to check for a collision.
     * @param {Number} mouseY the y position to check for a collision.
     * @returns {Boolean} Whether the shape intersects the provided coordinates.
     */
    intersect(coordX, coordY) {
        if(constructor.name === "GraphObject") {
            console.error("GraphObject is an abstract class and cannot be instantiated.");
        }
    }

    /**
     * Gives a bounding box for the object. *SHOULD NOT BE CALLED DIRECTLY*
     * @returns {[[Number, Number], [Number, Number]]} The coordinates of the upper left and bottom right corner.
     */
    boundingBox() {
        if(constructor.name === "GraphObject") {
            console.error("GraphObject is an abstract class and cannot be instantiated.")
        }
    }

    /**
     * Gives the {@link GRAPH_DATATYPE} associated with this object. *SHOULD NOT BE CALLED DIRECTLY*
     * @returns {GRAPH_DATATYPE} The type of graph object that this represents.
     */
    giveType() {
        console.error("GraphObject is an abstract class and cannot be instantiated.");
        return null;
    }
}