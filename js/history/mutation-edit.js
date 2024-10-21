import { GRAPH_DATATYPE, GraphObject } from "../graph-data/graph-object.js";
import { GraphSession } from "../graph-session.js";
import { Edit } from "./edit.js";

/**
 * Defines an arbitrary mutation edit performed on the graph data. Mutation edits are edits which change the value of existing graph objects without adding or removing objects.
 */
export class MutationEdit extends Edit {
    /**
     * Initialize the mutation edit.
     * @param {GraphObject} mutatingObject The object that has been mutated.
     * @param {Object} oldValueMap An object which represents the original values prior to mutation.
     * @param {Object = undefined} newValueMap An object whose keys are the same as the keys that have been updated in the mutated object, and whose values are the updated values. If not defined, will instead use the provided object's key-values.
     */
    constructor(mutatingObject, oldValueMap, newValueMap = undefined) {
        super();
        this.type = mutatingObject.getType();
        this.id = mutatingObject.id;
        this.original = oldValueMap;
        if(newValueMap !== undefined) {
            this.updated = newValueMap;
        } else {
            this.updated = {};
            for(const key of Object.keys(oldValueMap)) {
                this.updated[key] = mutatingObject[key];
            }
        }
    }

    /**
     * Undoes this edit, assuming it has already been applied to the provided graph.
     * @param {GraphSession} graphData the current state of the graph.
     */
    undo(graphData) {
        this.anydo(graphData, this.original);
    }

    /**
     * Redpes this edit, assuming it has already been applied to the provided graph and then been undone.
     * @param {GraphSession} graphData the current state of the graph.
     */
    redo(graphData) {
        this.anydo(graphData, this.updated);
    }

    /**
     * Updates the object this edit references to share the key-value pairs specified by the provided object.
     * @param {GraphSession} graphData The graph containing this edit's referenced object.
     * @param {Object} valueMap The key-value pairs to copy to the referenced object.
     */
    anydo(graphData, valueMap) {
        // IMPORTANT: for simplicity & consistancy, objects should not gain or lose keys over their lifetime; 
        // otherwise this will not properly replace keys. Also, edits should never change object id
        switch(this.type) {
            case GRAPH_DATATYPE.VERTEX:
                for(let x = graphData.vertices.length - 1; x >= 0; x--) {
                    if(graphData.vertices[x].id === this.id) {
                        for(const key of Object.keys(valueMap)) {
                            graphData.vertices[x][key] = valueMap[key];
                        }
                    }
                }
                break;
            case GRAPH_DATATYPE.EDGE:
                for(let x = graphData.edges.length - 1; x >= 0; x--) {
                    if(graphData.edges[x].id === this.id) {
                        for(const key of Object.keys(valueMap)) {
                            graphData.edges[x][key] = valueMap[key];
                        }
                    }
                }
                break;
            default:
                console.error("Mutation edit not defined for type " + this.type);
        }
    }
}