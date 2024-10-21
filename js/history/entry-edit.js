import { GRAPH_DATATYPE, GraphObject } from "../graph-data/graph-object.js";
import { GraphSession } from "../graph-session.js";
import { Edit } from "./edit.js";

/**
 * Defines an arbitrary entry edit performed on the graph data. Entry edits are edits which add or remove a graph object.
 */
class EntryEdit extends Edit {
    /**
     * Initialize the entry edit.
     * @param {GraphObject} entryObject The object whose entry in the graph is being edited.
     * @param {Boolean} inserting Whether the object is being inserted or removed.
     */
    constructor(entryObject, inserting) {
        super();
        this.target = entryObject;
        this.inserting = inserting;
    }

    /**
     * Undoes this edit, assuming it has already been applied to the provided graph.
     * @param {GraphSession} graphData the current state of the graph.
     */
    undo(graphData) {
        if(this.inserting) {
            this.removeEdit(graphData);
        } else {
            this.insertEdit(graphData);
        }
    }

    /**
     * Redpes this edit, assuming it has already been applied to the provided graph and then been undone.
     * @param {GraphSession} graphData the current state of the graph.
     */
    redo(graphData) {
        if(this.inserting) {
            this.insertEdit(graphData);
        } else {
            this.removeEdit(graphData);
        }
    }

    /**
     * Adds an object to the graph.
     * @param {GraphSession} graphData the current state of the graph.
     */
    insertEdit(graphData) {
        switch(this.target.getType()) {
            case GRAPH_DATATYPE.VERTEX:
                let x = 0;
                for(; x < graphData.vertices.length; x++) {
                    if(graphData.vertices[x].id > this.target.id) {
                        break;
                    }
                }
                graphData.vertices.splice(x, 0, this.target);
                break;
            case GRAPH_DATATYPE.EDGE:
                let y = 0;
                for(; y < graphData.edges.length; y++) {
                    if(graphData.edges[y].id > this.target.id) {
                        break;
                    }
                }
                graphData.edges.splice(y, 0, this.target);
                this.target.start.connect(this.target);
                this.target.end.connect(this.target);
                break;
            default:
                console.error("Add edit not defined for type " + this.target.getType());
        }
    }

    /**
     * Removes an object from the graph.
     * @param {GraphSession} graphData the current state of the graph.
     */
    removeEdit(graphData) {
        switch(this.target.getType()) {
            case GRAPH_DATATYPE.VERTEX:
                for(let x = graphData.vertices.length - 1; x >= 0; x--) {
                    if(graphData.vertices[x].id === this.target.id) {
                        graphData.vertices.splice(x, 1);
                    }
                }
                break;
            case GRAPH_DATATYPE.EDGE:
                for(let x = graphData.edges.length - 1; x >= 0; x--) {
                    if(graphData.edges[x].id === this.target.id) {
                        graphData.edges[x].start.disconnect(graphData.edges[x]);
                        graphData.edges[x].end.disconnect(graphData.edges[x]);
                        graphData.edges.splice(x, 1);
                    }
                }
                break;
            default:
                console.error("Remove edit not defined for type " + this.target.getType());
        }
    }
}

/**
 * Defines an insertion edit performed on graph data. Insertion edits are edits which add new graph objects.
 */
export class InsertionEdit extends EntryEdit {
    /**
     * Initializes insertion edit.
     * @param {GraphObject} entryObject The object being inserted.
     */
    constructor(entryObject) {
        super(entryObject, true);
    }
}

/**
 * Defines a deletion edit performed on graph data. Deletion edits are edits which remove existing graph objects.
 */
export class DeletionEdit extends EntryEdit {
    /**
     * Initializes deletion edit.
     * @param {GraphObject} entryObject The object being deleted.
     */
    constructor(entryObject) {
        super(entryObject, false);
    }
}