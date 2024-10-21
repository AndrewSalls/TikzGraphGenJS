/**
 * Defines an arbitrary edit performed on the graph data.
 */
export class Edit {
    constructor() {
        if(constructor.name === "Edit") {
            console.error("Edit is an abstract class and cannot be instantiated.");
        }
    }

    /**
     * Undoes this edit, assuming it has already been applied to the provided graph.
     * @param {GraphSession} graphData the current state of the graph.
     */
    undo(graphData) {
        console.error("Edit is an abstract class and cannot be instantiated.");
    }

    /**
     * Redpes this edit, assuming it has already been applied to the provided graph and then been undone.
     * @param {GraphSession} graphData the current state of the graph.
     */
    redo(graphData) {
        console.error("Edit is an abstract class and cannot be instantiated.");
    }
}