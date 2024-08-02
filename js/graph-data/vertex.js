import { GraphObject } from "./graph-object.js";

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
        this.shape = "circle";
        this.scale = 20;
        this.borderScale = 2;
        this.color = "#000000";
        this.fill = "transparent";
    }

    /**
     * Draws the vertex based on its set properties.
     * @param {CanvasRenderingContext2D} ctx The canvas rendering context with which to draw the vertex.
     */
    render(ctx) {
        //TODO: support other shapes
        ctx.beginPath();
        ctx.lineWidth = this.borderScale;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.fill;

        ctx.arc(this.x, this.y, this.scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
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
            case "circle":
                // Scale in this case is the radius
                return Math.sqrt(Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)) <= (this.scale + this.borderScale) / 2;
            default:
                console.error("Intersection not implemented for shape " + this.shape);
        }
    }

    /**
     * Finds the outmost border coordinate from the center of the vertex.
     * @param {Number} angle the angle, in radians, to find the border point from.
     * @returns {Number} the offset from the center, along the provided angle, where the outmost border is located.
     */
    borderPoint(angle) {
        switch(this.shape) {
            case "circle":
                return { x: this.x + this.scale * Math.cos(angle), y: this.y + this.scale * Math.sin(angle) };
            default:
                console.error("Border calculation not implemented for shape " + this.shape);
        }
    }
}