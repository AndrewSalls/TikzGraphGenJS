import { GraphSession } from "../graph-session.js";
import { clearData } from "../tools/tool.js";
import { Edit } from "./edit.js";

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
        history[editPos].undo(graphData);
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
        history[editPos].redo(graphData);
    }
}