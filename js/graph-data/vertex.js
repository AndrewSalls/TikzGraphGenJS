import { GRAPH_DATATYPE, GraphObject } from "./graph-object.js";
import { RENDER_SETTINGS } from "../graph-session.js";

/**
 * An enum containing the list of valid vertex shapes.
 * @enum
 * @readonly
 */
export const VERTEX_SHAPE = {
    CIRCLE: 0
}

/**
 * A representation of a LaTeX Tikz node.
 */
export default class Vertex extends GraphObject {
    /**
     * Creates a vertex based on the default vertex settings.
     * @param {Number} mouseX the x position to place the vertex's center at.
     * @param {Number} mouseY the y position to place the vertex's center at.
     * @param {Boolean} dummy whether the vertex is a dummy object.
     * Dummy graph data is not rendered and is intended for temporary use for e.g. displaying what an edge will look like ahead of time. 
     */
    constructor(mouseX, mouseY, dummy = false) {
        super(dummy);

        this.x = mouseX;
        this.y = mouseY;
        this.shape = VERTEX_SHAPE.CIRCLE;
        this.scale = 20;
        this.borderScale = 2;
        this.color = "#000000";
        this.fill = "transparent";
        this.adjacent = new Set();
    }

    /**
     * Draws the vertex based on its set properties.
     * @param {CanvasRenderingContext2D} ctx The canvas rendering context with which to draw the vertex.
     * @param {GraphViewport} viewport The viewport that defines panning and zoom of the canvas the vertex is drawn on.
     * @param {Boolean} selected Whether this vertex has been selected by the user.
     */
    render(ctx, viewport, selected = false) {
        //TODO: support other shapes, move rendering for shapes into function to avoid duplicating code between select outline and actual shape

        if(selected) {
            ctx.beginPath();
            ctx.fillStyle = RENDER_SETTINGS.SELECT_MAIN;
            ctx.lineWidth = RENDER_SETTINGS.SELECT_WIDTH;
            ctx.strokeStyle = RENDER_SETTINGS.SELECT_BORDER;
            ctx.arc(this.x - viewport.offsetX, this.y - viewport.offsetY, this.scale + ctx.lineWidth, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            ctx.closePath();
        }

        ctx.beginPath();
        ctx.lineWidth = this.borderScale;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.fill;

        ctx.arc(this.x - viewport.offsetX, this.y - viewport.offsetY, this.scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Determines if the vertex, based on its set properties, intersects the provided coordinates.
     * @param {Number} mouseX the x position to check for a collision.
     * @param {Number} mouseY the y position to check for a collision.
     * @returns {Boolean} Whether the shape intersects the provided coordinates.
     */
    intersects(mouseX, mouseY) {
        if(this.id === "dummy") {
            return false;
        }

        switch(this.shape) {
            case VERTEX_SHAPE.CIRCLE:
                return Math.sqrt(Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)) <= (this.scale + this.borderScale);
            default:
                console.error("Intersection not implemented for shape " + this.shape);
        }
    }

    /**
     * Determines if the object, based on its set properties, intersects the provided circle.
     * @param {Number} mouseX the x position of the circle's center.
     * @param {Number} mouseY the y position of the circle's center.
     * @param {Number} radius the radius of the circle.
     * @returns {Boolean} Whether the shape intersects the provided circle.
     */
    intersect(coordX, coordY, radius) {
        if(this.id === "dummy") {
            return false;
        }

        switch(this.shape) {
            case VERTEX_SHAPE.CIRCLE:
                return Math.sqrt(Math.pow(coordX - this.x, 2) + Math.pow(coordY - this.y, 2)) <= (this.scale + this.borderScale + radius);
            default:
                console.error("Circle intersection not implemented for shape " + this.shape);
        }
    }

    /**
     * Finds the outmost border coordinate from the center of the vertex.
     * @param {Number} angle the angle, in radians, to find the border point from.
     * @returns {Number} the offset from the center, along the provided angle, where the outmost border is located.
     */
    borderPoint(angle) {
        switch(this.shape) {
            case VERTEX_SHAPE.CIRCLE:
                return { x: this.x + this.scale * Math.cos(angle), y: this.y + this.scale * Math.sin(angle) };
            default:
                console.error("Border calculation not implemented for shape " + this.shape);
        }
    }

    /**
     * Gives a bounding box for the vertex.
     * @returns {{x: Number, y: Number, width: Number, height: Number}} The upper left corner and bounding box dimensions.
     */
    boundingBox() {
        if(typeof this.scale === "number") {
            return {
                x: this.x - this.scale,
                y: this.y - this.scale,
                width: 2 * this.scale,
                height: 2 * this.scale
            };
        }

        return {
            x: this.x - this.scaleX,
            y: this.y - this.scaleY,
            width: 2 * this.scaleX,
            height: 2 * this.scaleY
        };
    }

    /**
     * Notes that an edge connects to this vertex. This is necessary for operations such as deleting this vertex and split/merge tools.
     * @param {Edge} edge The edge to connect.
     */
    connect(edge) {
        this.adjacent.add(edge);
    }

    /**
     * Removes an edge that has been added to this vertex. This is necessary for operations such as deleting this vertex and split/merge tools.
     * @param {Edge} edge The edge to disconnect.
     */
    disconnect(edge) {
        return this.adjacent.delete(edge);
    }

    /**
     * Removes all edges that have been added to this vertex. This is necessary for operations such as deleting this vertex and split/merge tools.
     */
    disconnectAll() {
        const adj = this.adjacent;
        this.adjacent = new Set();
        return adj;
    }

    /**
     * Gives the {@link GRAPH_DATATYPE} associated with this object.
     * @returns {GRAPH_DATATYPE} The type of graph object that this represents.
     */
    getType() {
        return GRAPH_DATATYPE.VERTEX;
    }
}