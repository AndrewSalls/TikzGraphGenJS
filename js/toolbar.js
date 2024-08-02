import { GraphSession } from "./graph-session.js";
import { clearData, setTool, TOOL_TYPE } from "./tools/tool.js";

let lastSelectedTool;

/**
 * Initializes the buttons in the toolbar.
 * @param {GraphSession} graphData The graph state, so that it can be cleared of dummy/incomplete data when changing tools.
 */
export default function initializeToolbar(graphData) {
    lastSelectedTool = document.querySelector("#vertex-btn");
    lastSelectedTool.classList.add("selected-tool");
    document.querySelector("#vertex-btn").onclick = ev => setSelected(TOOL_TYPE.VERTEX, ev.target, graphData);
    document.querySelector("#edge-btn").onclick = ev => setSelected(TOOL_TYPE.EDGE, ev.target, graphData);
    document.querySelector("#select-btn").onclick = ev => setSelected(TOOL_TYPE.SELECT, ev.target, graphData);

    document.addEventListener("keyup", ev => {
        // if(ev.ctrlKey) {
        //     if(ev.key === "z") {
        //         undo(graphData);
        //     } else if(ev.key === "y") {
        //         redo(graphData);
        //     }
        // }
    });
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

    setTool(type);
    clearData(graphData);
}