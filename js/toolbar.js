import { GraphSession } from "./graph-session/graph-session.js";
import { clearData, setTool } from "./graph-session/session-manager.js";
import { TOOL_TYPE } from "./tools/tool.js";

let lastSelectedTool;

/**
 * Initializes the buttons in the toolbar.
 * @param {GraphSession} graphData The graph state, so that it can be cleared of dummy/incomplete data when changing tools.
 */
export default function initializeToolbar(graphData) {
    lastSelectedTool = document.querySelector("#vertex-btn");
    lastSelectedTool.classList.add("selected-tool");
    setTool(TOOL_TYPE.VERTEX, graphData);

    document.querySelector("#vertex-btn").onclick = ev => setSelected(TOOL_TYPE.VERTEX, ev.target, graphData);
    document.querySelector("#edge-btn").onclick = ev => setSelected(TOOL_TYPE.EDGE, ev.target, graphData);
    document.querySelector("#select-btn").onclick = ev => setSelected(TOOL_TYPE.SELECT, ev.target, graphData);
    document.querySelector("#lasso-btn").onclick = ev => setSelected(TOOL_TYPE.LASSO, ev.target, graphData);
    document.querySelector("#eraser-btn").onclick = ev => setSelected(TOOL_TYPE.ERASER, ev.target, graphData);
    document.querySelector("#split-btn").onclick = ev => setSelected(TOOL_TYPE.SPLIT, ev.target, graphData);
    document.querySelector("#merge-btn").onclick = ev => setSelected(TOOL_TYPE.MERGE, ev.target, graphData);
};

/**
 * Sets the selected tool based on the clicked button, and clears the tool data.
 * @param {TOOL_TYPE} type The tool type to set as selected.
 * @param {HTMLElement} button The clicked button.
 * @param {GraphSession} graphData The graph data, necessary to pass to {@link clearData} in order to prevent
 * leftover data from being stored in the graph.
 */
function setSelected(type, button, graphData) {
    lastSelectedTool.classList.remove("selected-tool");
    button.classList.add("selected-tool");
    lastSelectedTool = button;

    clearData(graphData);
    setTool(type, graphData);
}