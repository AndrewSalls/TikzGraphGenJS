import { GRAPH_DATATYPE } from "./graph-data/graph-object.js";
import { GraphSession } from "./graph-session.js";
import { clearData } from "./tools/tool.js";
/**
 * Defines the list of valid edit types
 * @readonly
 * @enum {Number}
 */
export const EDIT_TYPE = {
    /** Adds an object to the graph data */
    ADD: 0,
    /** Removes an object from the graph data */
    REMOVE: 1,
    /** Changes the state of an existing graph data object */
    MUTATION: 2,
    /** Multiple sequential edits */
    COMPOSITE: 3
};

/**
 * Defines an arbitrary edit performed on the graph data.
 */
export class Edit {
    /**
     * @param {EDIT_TYPE} type The type of edit being created
     * @param {*} targetData semi-arbitrary data that describes the type of edit.
     * For add and remove edits, consists of the object being added or removed.
     * For composite edits, consists of a list of each individual edit.
     * For mutation operations, consists of an object with the following attributes:
     * - type: the type of object being edited
     * - id: the id of the object being edited, which should already exist in the graph data
     * - originalValues: all key-value pairs in the object that will be edited by the mutation, with their original values
     * - modifiedValues: all key-value pairs that will be edited, with the edited values
     */
    constructor(type, targetData) {
        this.type = type;
        this.targetData = targetData;
    }
}

const history = [];
let editPos = -1;
let maxHistory = 500;

/**
 * Takes an applied edit and appends it to the history stack, clearing any undone edits in the process.
 * @param {Edit} edit The edit being applied.
 */
export function makeEdit(edit) {
    //Cycle out old history
    if(history.length === maxHistory) {
        history.shift();
    }

    //Remove alternate history if undo was used
    for(let x = history.length - 1; x > editPos; x--) {
        history.pop();
    }

    //Add to history
    history.push(edit);
    editPos = editPos + 1;
    console.log(history);
}

/**
 * Undoes the previously performed edit based on the current position in the edit stack.
 * 
 * Does nothing if there are no previous edits. Clears any active graphData to avoid dereference errors.
 * @param {GraphSession} graphData the current state of the graph.
 */
export function undo(graphData) {
    clearData(graphData);
    if(editPos >= 0) {
        handleEdit(graphData, history[editPos], true);
        editPos = editPos - 1;
    }
}

/**
 * Redoes a previously undone edit based on the current position in the edit stack.
 * 
 * Does nothing if no edits have been undone since the last edit made. Clears any active graphData to avoid dereference errors.
 * @param {GraphSession} graphData the current state of the graph.
 */
export function redo(graphData) {
    clearData(graphData);
    if(editPos < history.length - 1) {
        editPos = editPos + 1;
        handleEdit(graphData, history[editPos], false);
    }
}

/**
 * Applies or undoes the specified edit.
 * @param {GraphSession} graphData the current state of the graph.
 * @param {Edit} edit the edit to apply to the graph.
 * @param {Boolean} inverted Whether the edit is being applied or undone (true is undone, defaults to false).
 */
function handleEdit(graphData, edit, inverted = false) {
    switch(edit.type) {
        case EDIT_TYPE.ADD:
            if(inverted) {
                removeEdit(graphData, edit.targetData);
            } else {
                addEdit(graphData, edit.targetData);
            }
            break;
        case EDIT_TYPE.REMOVE:
            if(inverted) {
                addEdit(graphData, edit.targetData);
            } else {
                removeEdit(graphData, edit.targetData);
            }
            break;
        case EDIT_TYPE.MUTATION:
            if(inverted) {
                mutationEdit(graphData, edit.targetData.type, edit.targetData.id, edit.targetData.originalValues);
            } else {
                mutationEdit(graphData, edit.targetData.type, edit.targetData.id, edit.targetData.modifiedValues);
            }
            break;
        case EDIT_TYPE.COMPOSITE:
            if(inverted) {
                for(let x = edit.targetData.length - 1; x >= 0; x--) {
                    handleEdit(graphData, edit.targetData[x], inverted);
                }
            } else {
                for(const subEdit of edit.targetData) {
                    handleEdit(graphData, subEdit, inverted);
                }
            }
            break;
        default:
            console.error("Unexpected edit type: recieved " + edit.type);
    }
}

/**
 * Adds an object to the graph.
 * @param {GraphSession} graphData the current state of the graph.
 * @param {*} editData the object to add to the graph.
 */
function addEdit(graphData, editData) {
    switch(editData.constructor.name) {
        case "Vertex":
            let x = 0;
            for(; x < graphData.vertices.length; x++) {
                if(graphData.vertices[x].id > editData.id) {
                    break;
                }
            }
            graphData.vertices.splice(x, 0, editData);
            break;
        case "Edge":
            let y = 0;
            for(; y < graphData.edges.length; y++) {
                if(graphData.edges[y].id > editData.id) {
                    break;
                }
            }
            graphData.edges.splice(y, 0, editData);
            break;
        default:
            console.error("Add edit not defined for type " + editData.constructor.name);
    }
}

/**
 * Removes an object from the graph.
 * @param {GraphSession} graphData the current state of the graph.
 * @param {*} editData the object to remove from the graph.
 */
function removeEdit(graphData, editData) {
    switch(editData.constructor.name) {
        case "Vertex":
            for(let x = graphData.vertices.length - 1; x >= 0; x--) {
                if(graphData.vertices[x].id === editData.id) {
                    graphData.vertices.splice(x, 1);
                }
            }
            break;
        case "Edge":
            for(let x = graphData.edges.length - 1; x >= 0; x--) {
                if(graphData.edges[x].id === editData.id) {
                    graphData.edges.splice(x, 1);
                }
            }
            break;
        default:
            console.error("Remove edit not defined for type " + editData.constructor.name);
    }
}

/**
 * Applies a change of state to an object in the current graph.
 * @param {GraphSession} graphData the current graph.
 * @param {GRAPH_DATATYPE} type the type of object being modified.
 * @param {Number} id the id of the object being modified.
 * @param {*} toModify An object containing exactly the set of key-value pairs that should be modified.
 * All keys should already exist in the target object, and the object id should not be modified.
 */
function mutationEdit(graphData, type, id, toModify) {
    // IMPORTANT: for simplicity & consistancy, objects should not gain or lose keys over their lifetime; 
    // otherwise this will not properly replace keys. Also, edits should not change object id
    switch(type) {
        case GRAPH_DATATYPE.VERTEX:
            for(let x = graphData.vertices.length - 1; x >= 0; x--) {
                if(graphData.vertices[x].id === id) {
                    for(const key of Object.keys(toModify)) {
                        graphData.vertices[x][key] = toModify[key];
                    }
                }
            }
            break;
        case GRAPH_DATATYPE.EDGE:
            for(let x = graphData.edges.length - 1; x >= 0; x--) {
                if(graphData.edges[x].id === id) {
                    for(const key of Object.keys(toModify)) {
                        graphData.edges[x][key] = toModify[key];
                    }
                }
            }
            break;
        default:
            console.error("Mutation edit not defined for type " + type);
    }
}