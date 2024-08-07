
import { GRAPH_DATATYPE } from "./graph-data/graph-object.js";
import { isSelected, tool_onPaint } from "./tools/tool.js";

/**
 * An enum representing the type of click performed by a mouse. Multiple values can be set,
 * and ALT, SHIFT, and CTRL will always be set in addition to one of the click types.
 * 
 * Note that the first five options should be aligned to the options for {@link MouseEvent.buttons}.
 * @enum
 * @redonly
 */
export const MOUSE_CLICK_TYPE = {
    LEFT_CLICK: 1,
    RIGHT_CLICK: 2,
    MIDDLE_CLICK: 4,
    SIDE_BACK: 8,
    SIDE_FORWARD: 16,
    ALT_HELD: 32,
    SHIFT_HELD: 64,
    CTRL_HELD: 128
}

/**
 * Contains the minimum amount of relevant information for tools interacting to a mouse event.
 */
export class MouseInteraction {
    /**
     * Defines a mouse interaction.
     * @param {Number} mouseX The x coordinate of the mouse interaction relative to the canvas element.
     * @param {Number} mouseY The y coordinate of the mouse interaction relative to the canvas element.
     * @param {MOUSE_CLICK_TYPE} clickType The type of click recorded.
     */
    constructor(mouseX, mouseY, clickType) {
        this.x = mouseX;
        this.y = mouseY;
        this.clickType = clickType;
    }
}

/**
 * Describes built-in render settings, like highlighting color when selecting objects or using the select tool.
 */
export const RENDER_SETTINGS = {
    SELECT_MAIN: "#93b8e799",
    SELECT_BORDER: "#0078d499",
    SELECT_WIDTH: 3
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
        this.vertices = [];
        this.edges = [];
        this.ctx = ctx;
    }

    /**
     * Finds the topmost object in the graph that was clicked on, with "height" being determined by object id.
     * @param {Number} mouseX The x coordinate of the mouse click.
     * @param {Number} mouseY The y coordinate of the mouse click.
     * @param {GRAPH_DATATYPE} filter Restricts the clicked object to be of the provided datatype. Defaults to null if no filter is needed.
     * @returns The first object matching the filter, or null if no relevant object was clicked.
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

        while(x >= 0 && (filter === GRAPH_DATATYPE.VERTEX || filter === null)) {
            if(this.vertices[x].intersects(mouseX, mouseY)) {
                return this.vertices[x];
            }
            x = x - 1;
        }
        while(y >= 0 && (filter === GRAPH_DATATYPE.EDGE || filter === null)) {
            if(this.edges[y].intersects(mouseX, mouseY)) {
                return this.edges[y];
            }
            y = y - 1;
        }

        return null;
    }

    /**
     * Provides access to all graph objects at once in the form of an iterator.
     * @returns {Iterator} A single iterable array containing all graph objects stored in the session.
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
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

        for(let vertex of this.vertices) {
            vertex.render(this.ctx, isSelected(vertex));
        }

        for(let edge of this.edges) {
            edge.render(this.ctx, isSelected(edge));
        }

        tool_onPaint(this, this.ctx);
    }
}