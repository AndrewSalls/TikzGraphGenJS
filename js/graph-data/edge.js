
import { GRAPH_DATATYPE, GraphObject } from "./graph-object.js";
import { RENDER_SETTINGS } from "../graph-session.js";

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

        this.start = vertexStart;
        this.end = vertexEnd;
        vertexStart.connect(this);
        vertexEnd.connect(this);

        this.scale = 2;
        this.color = "#000000";
    }

    /**
     * Draws the edge based on its set properties.
     * @param {CanvasRenderingContext2D} ctx The canvas rendering context with which to draw the edge.
     * @param {Boolean} selected Whether this edge has been selected by the user.
     */
    render(ctx, selected = false) {
        // TODO: Probably want to change to drawing to center and using clip path, easier than complex fill operations
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const startPos = this.start.borderPoint(angle);
        const endPos = this.end.borderPoint(angle + Math.PI);
        
        if(selected) {
            ctx.beginPath();
            ctx.lineWidth = RENDER_SETTINGS.SELECT_BORDER_WIDTH + this.scale;
            ctx.strokeStyle = RENDER_SETTINGS.SELECT_BORDER;
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(endPos.x, endPos.y);
            ctx.stroke();
            ctx.closePath();
        }

        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.scale;
        
        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
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
     * Determines if the object, based on its set properties, intersects the provided circle. *SHOULD NOT BE CALLED DIRECTLY*
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
     * @returns {[[Number, Number], [Number, Number]]} The coordinates of the upper left and bottom right corner.
     */
    boundingBox() {
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const startPos = this.start.borderPoint(angle);
        const endPos = this.end.borderPoint(angle + Math.PI);
        
        return [[Math.min(startPos.x, endPos.x), Math.min(startPos.y, endPos.y)],
                [Math.max(startPos.x, endPos.x), Math.max(startPos.y, endPos.y)]];
    }

    /**
     * Gives the {@link GRAPH_DATATYPE} associated with this object. *SHOULD NOT BE CALLED DIRECTLY*
     * @returns {GRAPH_DATATYPE} The type of graph object that this represents.
     */
    giveType() {
        return GRAPH_DATATYPE.EDGE;
    }
}