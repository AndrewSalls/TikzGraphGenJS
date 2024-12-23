
import { GRAPH_DATATYPE, GraphObject } from "./graph-object.js";
import { RENDER_SETTINGS } from "../graph-session/graph-session.js";

const MIN_OFFSET = 6;

/**
 * A representation of a LaTeX Tikz path (specifically a line).
 */
export default class Edge extends GraphObject {
    /**
     * Creates an edge based on the default edge settings.
     * @param {Vertex} vertexStart The vertex that the edge should originate from.
     * @param {Vertex} vertexEnd The vertex that the edge should end at.
     * @param {Boolean} dummy whether the vertex is a dummy object.
     * Dummy graph data is not rendered and is intended for temporary use for e.g. displaying what an edge will look like ahead of time. 
     */
    constructor(vertexStart, vertexEnd, dummy = false) {
        super(dummy);

        /** @type {Vertex} */
        this.start = vertexStart;
        /** @type {Vertex} */
        this.end = vertexEnd;

        vertexStart.connect(this);
        vertexEnd.connect(this);

        /** @type {Number} */
        this.scale = 2;
        /** @type {String} a valid CSS color */
        this.color = "#000000";
    }

    /**
     * Draws the edge based on its set properties.
     * @param {CanvasRenderingContext2D} ctx The canvas rendering context with which to draw the edge.
     * @param {GraphViewport} viewport The viewport that defines panning and zoom of the canvas the edge is drawn on.
     * @param {Boolean} selected Whether this edge has been selected by the user.
     */
    render(ctx, viewport, selected = false) {
        // TODO: Probably want to change to drawing to center and using clip path, easier than complex fill operations
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const startPos = this.start.borderPoint(angle);
        const endPos = this.end.borderPoint(angle + Math.PI);
        
        if(selected) {
            ctx.beginPath();
            ctx.lineWidth = viewport.scale * (RENDER_SETTINGS.SELECT_BORDER_WIDTH + this.scale);
            ctx.strokeStyle = RENDER_SETTINGS.SELECT_BORDER;
            ctx.moveTo(viewport.scale * (startPos.x - viewport.offsetX), viewport.scale * (startPos.y - viewport.offsetY));
            ctx.lineTo(viewport.scale * (endPos.x - viewport.offsetX), viewport.scale * (endPos.y - viewport.offsetY));
            ctx.stroke();
            ctx.closePath();
        }

        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = viewport.scale * this.scale;
        
        ctx.moveTo(viewport.scale * (startPos.x - viewport.offsetX), viewport.scale * (startPos.y - viewport.offsetY));
        ctx.lineTo(viewport.scale * (endPos.x - viewport.offsetX), viewport.scale * (endPos.y - viewport.offsetY));
        ctx.stroke();
        ctx.closePath();
    }

    /**
     * Determines if the edge, based on its set properties, intersects the provided coordinates.
     * 
     * Also allows for "near" intersections, where there is no intersection
     * but the minimum offset is below a certain threshold, due to edges generally being thin.
     * @param {Number} mouseX the x position to check for a collision.
     * @param {Number} mouseY the y position to check for a collision.
     * @returns {Boolean} Whether the shape intersects the provided coordinates.
     */
    intersects(mouseX, mouseY) {
        if(this.id === "dummy") {
            return false;
        }

        const minDistance = this.smallestOffset(mouseX, mouseY);

        return minDistance <= MIN_OFFSET;
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

        const minDistance = this.smallestOffset(coordX, coordY);

        return minDistance <= radius;
    }

    /**
     * Finds the minimum distance from this edge to the specified point.
     * @param {Number} targetX The x coordinate of the target point.
     * @param {Number} targetY The y coordinate of the target point.
     * @returns {Number} The minimum distance to the point from anywhere along this edge.
     */
    smallestOffset(targetX, targetY) {
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const startPos = this.start.borderPoint(angle);
        const endPos = this.end.borderPoint(angle + Math.PI);

        const t = Math.max(0, Math.min(1, 
            ((targetX - startPos.x) * (endPos.x - startPos.x) + (targetY - startPos.y) * (endPos.y - startPos.y))
            / (Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y-startPos.y, 2))));

        return Math.sqrt(Math.pow(targetX - startPos.x - t * (endPos.x - startPos.x), 2) + 
               Math.pow(targetY - startPos.y - t * (endPos.y - startPos.y), 2));
    }

    closestPoint(targetX, targetY) {
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const startPos = this.start.borderPoint(angle);
        const endPos = this.end.borderPoint(angle + Math.PI);

        const t = Math.max(0, Math.min(1, 
            ((targetX - startPos.x) * (endPos.x - startPos.x) + (targetY - startPos.y) * (endPos.y - startPos.y))
            / (Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y-startPos.y, 2))));

        return {
            x: startPos.x + t *(endPos.x - startPos.x),
            y: startPos.y + t * (endPos.y - startPos.y)
        };
    }

    /**
     * Gives a bounding box for the object.
     * @returns {{x: Number, y: Number, width: Number, height: Number}} The upper left corner and bounding box dimensions.
     */
    boundingBox() {
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const startPos = this.start.borderPoint(angle);
        const endPos = this.end.borderPoint(angle + Math.PI);
        
        return {
            x: Math.min(startPos.x, endPos.x),
            y: Math.min(startPos.y, endPos.y),
            width: Math.abs(endPos.x - startPos.x),
            height: Math.abs(endPos.y - startPos.y)
        };
    }

    /**
     * Gives the {@link GRAPH_DATATYPE} associated with this object.
     * @returns {GRAPH_DATATYPE} The type of graph object that this represents.
     */
    getType() {
        return GRAPH_DATATYPE.EDGE;
    }
}