
import { GRAPH_DATATYPE, GraphObject } from "./graph-data/graph-object.js";
import { GraphViewport } from "./graph-viewport.js";
import { isSelected, tool_onPaint } from "./tools/tool.js";

/**
 * Describes built-in render settings, like highlighting color when selecting objects or using the select tool.
 */
export const RENDER_SETTINGS = {
    SELECT_MAIN: "#93b8e799", // Selected object body color (for translucent objects)
    SELECT_BORDER: "#0078d499", // Selected object border color
    SELECT_BORDER_WIDTH: 3, // Area of select tool
    ERASE_MAIN: "#d9d9d944", // Eraser tool highlight (to visualize what's being erased) while dragging
    ERASE_BORDER: "#d9d9d988", // Eraser tool highlight border
    ERASE_BORDER_WIDTH: 1 // Eraser tool highlight border's radius
}

/**
 * The data of the active graph being drawn in the window and edited.
 * 
 * IMPORTANT: all graph data arrays should be sorted by id.
 */
export class GraphSession {
    /**
     * Initializes the graph data.
     * @param {CanvasRenderingContext2D} ctx The canvas context to draw the graph on.
     */
    constructor(ctx) {
        /** @type {Vertex[]} */
        this.vertices = [];
        /** @type {Edge[]} */
        this.edges = [];
        /** @type {CanvasRenderingContext2D} */
        this.ctx = ctx;
        /** @type {GraphViewport} */
        this.viewport = new GraphViewport();
    }

    /**
     * Finds the topmost object in the graph that was clicked on, with "height" being determined by object id.
     * @param {Number} mouseX The x coordinate of the mouse click.
     * @param {Number} mouseY The y coordinate of the mouse click.
     * @param {GRAPH_DATATYPE} filter Restricts the clicked object to be of the provided datatype(s). Defaults to null if no filter is needed.
     * @returns {GraphObject | null} The first object matching the filter, or null if no relevant object was clicked.
     */
    getClickedObject(mouseX, mouseY, filter = null) {
        let x = this.vertices.length - 1, y = this.edges.length - 1;
        while(x >= 0 && y >= 0 && filter === null) {
            if(this.vertices[x].id >= this.edges[y].id) {
                if(this.vertices[x].intersects(mouseX, mouseY)) {
                    return this.vertices[x];
                }
                x = x - 1;
            } else {
                if(this.edges[y].intersects(mouseX, mouseY)) {
                    return this.edges[y];
                }
                y = y - 1;
            }
        }

        while(x >= 0 && (filter & GRAPH_DATATYPE.VERTEX || filter === null)) {
            if(this.vertices[x].intersects(mouseX, mouseY)) {
                return this.vertices[x];
            }
            x = x - 1;
        }
        while(y >= 0 && (filter & GRAPH_DATATYPE.EDGE || filter === null)) {
            if(this.edges[y].intersects(mouseX, mouseY)) {
                return this.edges[y];
            }
            y = y - 1;
        }

        return null;
    }
    /**
     * Finds the topmost object in the graph that was clicked on, with "height" being determined by object id.
     * @param {Number} mouseX The x coordinate of the mouse click.
     * @param {Number} mouseY The y coordinate of the mouse click.
     * @param {Number} radius The maximum distance of objects from the provided mouse position to get included in the search.
     * @param {GRAPH_DATATYPE} filter Restricts the clicked object to be of the provided datatype(s). Defaults to null if no filter is needed.
     * @returns {GraphObject[]} An array of all objects matching the supplied filter within the specified radius of the mouse click, ordered by "height".
     */
    getClickedObjectsInRange(mouseX, mouseY, radius, filter = null) {        
        const clicked = [];
        let x = this.vertices.length - 1, y = this.edges.length - 1;
        while(x >= 0 && y >= 0 && filter === null) {
            if(this.vertices[x].id >= this.edges[y].id) {
                if(this.vertices[x].intersect(mouseX, mouseY, radius)) {
                    clicked.push(this.vertices[x]);
                }
                x = x - 1;
            } else {
                if(this.edges[y].intersect(mouseX, mouseY, radius)) {
                    clicked.push(this.edges[y]);
                }
                y = y - 1;
            }
        }

        while(x >= 0 && (filter & GRAPH_DATATYPE.VERTEX || filter === null)) {
            if(this.vertices[x].intersect(mouseX, mouseY, radius)) {
                clicked.push(this.vertices[x]);
            }
            x = x - 1;
        }
        while(y >= 0 && (filter & GRAPH_DATATYPE.EDGE || filter === null)) {
            if(this.edges[y].intersect(mouseX, mouseY, radius)) {
                clicked.push(this.edges[y]);
            }
            y = y - 1;
        }

        return clicked;
    }

    /**
     * Provides access to all graph objects at once in the form of an iterator.
     * @returns {Generator<GraphObject, void, Number>} A single iterable array containing all graph objects stored in the session.
     */
    *iterateThroughAllData() {
        for(let x = 0; x < this.vertices.length; x++) {
            yield this.vertices[x];
        }
        for(let x = 0; x < this.edges.length; x++) {
            yield this.edges[x];
        }
    }

    /**
     * Renders the graph on screen using the graph data's specified rendering methods.
     */
    drawGraph() {
        const canvasWidth = this.ctx.canvas.width;
        const canvasHeight = this.ctx.canvas.height;
        this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

        for(let vertex of this.vertices) {
            if(this.viewport.intersects(vertex.boundingBox(), canvasWidth, canvasHeight)) {
                vertex.render(this.ctx, this.viewport, isSelected(vertex));
            }
        }

        for(let edge of this.edges) {
            if(this.viewport.intersects(edge.boundingBox(), canvasWidth, canvasHeight)) {
                edge.render(this.ctx, this.viewport, isSelected(edge));
            }
        }

        tool_onPaint(this, this.ctx);
    }
}