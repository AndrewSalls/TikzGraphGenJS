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
            ctx.lineWidth = RENDER_SETTINGS.SELECT_WIDTH + this.scale;
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
        
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const startPos = this.start.borderPoint(angle);
        const endPos = this.end.borderPoint(angle + Math.PI);

        const t = Math.max(0, Math.min(1, 
            ((mouseX - startPos.x) * (endPos.x - startPos.x) + (mouseY - startPos.y) * (endPos.y - startPos.y))
            /
            (Math.pow(endPos.x - startPos.x, 2) + Math.pow(endPos.y-startPos.y, 2))));

        const minDistance = Math.sqrt(Math.pow(mouseX - startPos.x - t * (endPos.x - startPos.x), 2) + 
                                      Math.pow(mouseY - startPos.y - t * (endPos.y - startPos.y), 2));

        return minDistance <= MIN_OFFSET;
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