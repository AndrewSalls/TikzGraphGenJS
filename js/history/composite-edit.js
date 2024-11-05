import { GraphSession } from "../graph-session/graph-session.js";
import { Edit } from "./edit.js";

/**
 * Defines multiple sequential edits performed on the graph data. Each individual edit can be any type of edit,
 * although it is recommended to flatten composite edits of composite edits into a single composite edit if possible.
 */
export class CompositeEdit extends Edit {
    /**
     * Initialize the entry edit.
     * @param {Edit[]} edits A list of edits to be performed in order. Ensure that edits which rely on the effects of other edits occur later in the array.
     */
    constructor(edits) {
        super();
        /** @type {Edit[]} */
        this.editList = edits;
    }

    /**
     * Undoes this edit, assuming it has already been applied to the provided graph.
     * @param {GraphSession} graphData the current state of the graph.
     */
    undo(graphData) {
        // Reversed since undo is done in reverse order of redo
        for(let x = this.editList.length - 1; x >= 0; x--) {
            this.editList[x].undo(graphData);
        }
    }

    /**
     * Redpes this edit, assuming it has already been applied to the provided graph and then been undone.
     * @param {GraphSession} graphData the current state of the graph.
     */
    redo(graphData) {
        for(let x = 0; x < this.editList.length; x++) {
            this.editList[x].redo(graphData);
        }
    }
}