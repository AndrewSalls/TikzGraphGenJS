import { GraphSession } from "./graph-session.js";
import { deleteSelected, clearGraph } from "./tools/tool.js";
import { undo, redo } from "./history/history.js";
import { registerKey } from "./shortcut.js";

/**
 * Initializes the buttons in the menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
export default function initializeMenubar(graphData) {
    initializeFileMenu(graphData);
    initializeEditMenu(graphData);
    initializeViewMenu(graphData);
};

/**
 * Initializes the buttons in the file sub-menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
function initializeFileMenu(graphData) {
    document.querySelector("#new-graph-btn").onclick = () => clearGraph(graphData);
}

/**
 * Initializes the buttons in the edit sub-menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
function initializeEditMenu(graphData) {
    document.querySelector("#undo-btn").onclick = () => undo(graphData);
    document.querySelector("#redo-btn").onclick = () => redo(graphData);
    document.querySelector("#delete-btn").onclick = () => deleteSelected(graphData);

    const vertex = document.querySelector("#vertex-btn");
    document.querySelector("#vertex-menu-btn").onclick = () => vertex.click();
    const edge = document.querySelector("#edge-btn");
    document.querySelector("#edge-menu-btn").onclick = () => edge.click();
    const select = document.querySelector("#select-btn");
    document.querySelector("#select-menu-btn").onclick = () => select.click();
    const eraser = document.querySelector("#eraser-btn");
    document.querySelector("#eraser-menu-btn").onclick = () => eraser.click();
    const split = document.querySelector("#split-btn");
    document.querySelector("#split-menu-btn").onclick = () => split.click();
    const merge = document.querySelector("#merge-btn");
    document.querySelector("#merge-menu-btn").onclick = () => merge.click();

    registerKey(() => undo(graphData), "z");
    registerKey(() => redo(graphData), "y");
    registerKey(() => deleteSelected(graphData), "Delete", false);
    registerKey(() => deleteSelected(graphData), "Backspace", false);
}

let isShiftHeld = false;
let isAltHeld = false;
/**
 * Initializes the buttons in the view sub-menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
function initializeViewMenu(graphData) {
    document.querySelector("#zoom-in-btn").onclick = () => graphData.viewport.zoomIn();
    document.querySelector("#zoom-out-btn").onclick = () => graphData.viewport.zoomOut();

    registerKey(() => graphData.viewport.zoomIn(), "=", false, false, true);
    registerKey(() => graphData.viewport.zoomInFixed(), "+", false, true, true);
    registerKey(() => graphData.viewport.zoomOut(), "-", false, false, true);
    registerKey(() => graphData.viewport.zoomOutFixed(), "_", false, true, true);

    // Zooming with mouse wheel
    const canvas = document.querySelector("#render");
    document.addEventListener("keydown", ev => {
        if(ev.key === "Alt") {
            isAltHeld = true;
            ev.preventDefault();
        } else if(ev.key === "Shift") {
            isShiftHeld = true;
            ev.preventDefault();
        }
    });
    document.addEventListener("keyup", ev => {
        if(ev.key === "Alt") {
            isAltHeld = false;
            ev.preventDefault();
        } else if(ev.key === "Shift") {
            isShiftHeld = false;
            ev.preventDefault();
        }
    });

    canvas.addEventListener("wheel", ev => {
        if(isShiftHeld) {
            if(ev.deltaY < 0) { // Scrolling "up"
                if(isAltHeld) {
                    graphData.viewport.zoomInFixed();
                } else {
                    graphData.viewport.zoomIn();
                }
            } else {
                if(isAltHeld) {
                    graphData.viewport.zoomOutFixed();
                } else {
                    graphData.viewport.zoomOut();
                }
            }
        }
    });
}