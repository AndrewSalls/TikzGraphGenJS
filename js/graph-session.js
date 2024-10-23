
import Edge from "./graph-data/edge.js";
import { GRAPH_DATATYPE, GraphObject } from "./graph-data/graph-object.js";
import Vertex from "./graph-data/vertex.js";
import { GraphViewport } from "./graph-viewport.js";
import { CompositeEdit } from "./history/composite-edit.js";
import { DeletionEdit, InsertionEdit } from "./history/entry-edit.js";
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
     * Adds the specified vertex.
     * @param {Vertex} vertex The vertex being added.
     * @returns {InsertionEdit} An edit representing the added vertex.
     */
    addVertex(vertex) {
        if(this.vertices.length > 0 && this.vertices[this.vertices.length - 1].id > vertex.id) {
            const insertPoint = this.vertices.findIndex(x => x.id > vertex.id);
            this.vertices.splice(insertPoint, 0, vertex);
        } else {
            this.vertices.push(vertex);
        }

        return new InsertionEdit(vertex);
    }
    
    /**
     * Adds the specified edge.
     * @param {Edge} vertex The edge being added.
     * @returns {InsertionEdit} An edit representing the added edge.
     */
    addEdge(edge) {
        if(this.edges.length > 0 && this.edges[this.edges.length - 1].id > edge.id) {
            const insertPoint = this.edges.findIndex(x => x.id > edge.id);
            this.edges.splice(insertPoint, 0, edge);
        } else {
            this.edges.push(edge);
        }

        edge.start.connect(edge);
        edge.end.connect(edge);

        return new InsertionEdit(edge);
    }

    /**
     * Removes the specified vertex.
     * @param {Vertex} vertex The vertex being removed.
     * @returns {DeletionEdit|CompositeEdit} An edit representing the removed vertex, or a composite edit representing the removed vertex and subsequent removed edges.
     */
    removeVertex(vertex) {
        if(this.vertices[this.vertices.length - 1].id !== vertex.id) {
            this.vertices.splice(this.vertices.indexOf(vertex), 1);
        } else {
            this.vertices.pop();
        }

        const vertexRemoval = new DeletionEdit(vertex);

        const edgeRemovals = [];
        for(const edge of vertex.disconnectAll()) {
            edgeRemovals.push(this.removeEdge(edge));
        }

        return edgeRemovals.length > 0 ? new CompositeEdit([...edgeRemovals, vertexRemoval]) : vertexRemoval;
    }

    /**
     * Removes the specified edge.
     * @param {Edge} edge The edge being removed.
     * @returns {DeletionEdit} An edit representing the removed edge.
     */
    removeEdge(edge) {
        if(this.edges[this.edges.length - 1].id !== edge.id) {
            this.edges.splice(this.edges.indexOf(edge), 1);
        } else {
            this.edges.pop();
        }

        edge.start.disconnect(edge);
        edge.end.disconnect(edge);

        return new DeletionEdit(edge);
    }

    /**
     * Clears all objects from the graph.
     * @returns {DeletionEdit|CompositeEdit|null} The edit representing the removed objects, or null if there were no objects to remove.
     */
    clearObjects() {
        if(this.vertices.length === 0) {
            return null;
        }

        const editList = [];

        // Vertices automatically remove connected edges, so this is the only loop necessary (any edges must be connected to vertices)
        for(let x = this.vertices.length - 1; x >= 0; x--) {
            editList.push(this.removeVertex(this.vertices[[x]]));
        }

        if(editList.length === 1) {
            return editList[0];
        } else if(editList.length > 1) {
            return editList;
        }

        return null;
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