import { GraphViewport } from "../graph-session/graph-viewport.js";

/**
 * Variable that represents the next generated ID.
 */
let increment = Number.MIN_SAFE_INTEGER; // id system, has 2^53 possible values before collision occurs, so don't do that

export const DUMMY_ID = "DUMMY";

/**
 * An enum of the valid datatypes, used in filtering and describing data containing graph datatypes.
 * @readonly
 * @enum {Number}
 */
export const GRAPH_DATATYPE = {
    VERTEX: 1,
    EDGE: 2,
    EDGE_CAP: 4,
    LABEL: 8
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
            /** @type {Number} Normally */
            this.id = increment;
            increment = increment + 1;
        } else {
            /** @type {DUMMY_ID} If this graph object is used for rendering only and not as part of the graph. */
            this.id = DUMMY_ID;
        }
    }

    /**
     * Renders the object on the canvas. *SHOULD NOT BE CALLED DIRECTLY*
     * @param {CanvasRenderingContext2D} ctx The canvas rendering context with which to draw the object.
     * @param {GraphViewport} viewport The viewport that defines panning and zoom of the canvas the object is drawn on.
     * @param {Boolean} selected Whether this object has been selected by the user.
     */
    render(ctx, viewport, selected = false) {
        console.error("GraphObject is an abstract class and cannot be instantiated.");
    }

    /**
     * Determines if the object, based on its set properties, intersects the provided coordinates. *SHOULD NOT BE CALLED DIRECTLY*
     * @param {Number} mouseX the x position to check for a collision.
     * @param {Number} mouseY the y position to check for a collision.
     * @returns {Boolean} Whether the shape intersects the provided coordinates.
     */
    intersect(coordX, coordY) {
        console.error("GraphObject is an abstract class and cannot be instantiated.");
    }

    /**
     * Determines if the object, based on its set properties, intersects the provided circle. *SHOULD NOT BE CALLED DIRECTLY*
     * @param {Number} mouseX the x position of the circle's center.
     * @param {Number} mouseY the y position of the circle's center.
     * @param {Number} radius the radius of the circle.
     * @returns {Boolean} Whether the shape intersects the provided circle.
     */
    intersect(coordX, coordY, radius) {
        console.error("GraphObject is an abstract class and cannot be instantiated.");
    }

    /**
     * Gives a bounding box for the object. *SHOULD NOT BE CALLED DIRECTLY*
     * @returns {{x: Number, y: Number, width: Number, height: Number}} The upper left corner and bounding box dimensions.
     */
    boundingBox() {
        console.error("GraphObject is an abstract class and cannot be instantiated.");
    }

    /**
     * Gives the {@link GRAPH_DATATYPE} associated with this object. *SHOULD NOT BE CALLED DIRECTLY*
     * @returns {GRAPH_DATATYPE} The type of graph object that this represents.
     */
    getType() {
        console.error("GraphObject is an abstract class and cannot be instantiated.");
    }
}