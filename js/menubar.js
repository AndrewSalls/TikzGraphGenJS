import { GraphSession } from "./graph-session.js";
import { undo, redo } from "./history.js";

/**
 * Initializes the buttons in the menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
export default function initializeMenubar(graphData) {
    document.querySelector("#undo-btn").onclick = () => undo(graphData);
    document.querySelector("#redo-btn").onclick = () => redo(graphData);

    document.addEventListener("keyup", ev => {
        if(ev.ctrlKey) {
            if(ev.key === "z") {
                undo(graphData);
            } else if(ev.key === "y") {
                redo(graphData);
            }
        }
    });
};