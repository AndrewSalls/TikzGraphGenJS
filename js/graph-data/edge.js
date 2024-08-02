import { GraphObject } from "./graph-object.js";

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

        this.scale = 3;
        this.color = "#000000";
    }

    /**
     * Draws the edge based on its set properties.
     * @param {CanvasRenderingContext2D} ctx The canvas rendering context with which to draw the edge.
     */
    render(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.scale;
        
        // TODO: Probably want to change to drawing to center and using clip path, easier than complex fill operations
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const startPos = this.start.borderPoint(angle);
        const endPos = this.end.borderPoint(angle + Math.PI);

        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
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
        
        return false; //TODO
    }
}