import { GraphSession } from "./graph-session.js";
import { clearData, setTool, deleteSelected, clearGraph } from "./tools/tool.js";
import { undo, redo } from "./history/history.js";
import { TOOL_TYPE } from "./tools/tool.js";
import { registerKey } from "./shortcut.js";

/**
 * Initializes the buttons in the menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
export default function initializeMenubar(graphData) {
    initializeFileMenu(graphData);
    initializeEditMenu(graphData);
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