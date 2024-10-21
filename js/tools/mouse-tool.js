import { GraphSession } from "../graph-session.js";
import { MOUSE_CLICK_TYPE, MouseInteraction } from "../mouse-interaction.js";
import { Tool } from "./tool.js";

let MOUSE_TOOL;

/**
 * Provides access to the mouse tool. This is a special tool that handles mouse inputs that are independent of specific tools (e.g. panning with middle click).
 * @returns {Tool} The mouse tool.
 */
export default function accessMouseTool() { 
    if(MOUSE_TOOL === undefined) {
        MOUSE_TOOL = new Tool("mouse", onDown, onMove, onUp, clearData, onPaint);
    }

    return MOUSE_TOOL;
}

/**
 * The callback used when pressing down on a mouse button.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {*} toolData Temporary data storage for this tool.
 * @param {Set} selectedData The set of objects that should be displayed/marked as selected.
 * @returns {*} The updated value for toolData.
 */
function onDown(mouse, graphData, toolData, selectedData) {
    if((mouse.clickType & MOUSE_CLICK_TYPE.MIDDLE_CLICK) > 0) {
        return {
            panX: mouse.x,
            panY: mouse.y
        };
    }

    return null;
}

/**
 * The callback used when moving the mouse, regardless of if a button is pressed or not.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {*} toolData Temporary data storage for this tool.
 * @param {Set} selectedData The set of objects that should be displayed/marked as selected.
 * @returns {*} The updated value for toolData.
 */
function onMove(mouse, graphData, toolData, selectedData) {
    if(toolData !== null) {
        graphData.viewport.pan(toolData.panX - mouse.x, toolData.panY - mouse.y);

        return {
            panX: mouse.x,
            panY: mouse.y
        };
    }

    return null;
}

/**
 * The callback used when a mouse button stops being pressed.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {*} toolData Temporary data storage for this tool.
 * @param {Set} selectedData The set of objects that should be displayed/marked as selected.
 * @returns {*} The updated value for toolData.
 */
function onUp(mouse, graphData, toolData, selectedData) {
    return null;
}

/**
 * Clears the current tool data, making sure to clean up any dummy data from the graph data as well.
 * @param {GraphSession} graphData The graph data that the tool (potentially) modified with dummy data.
 * @param {Object|null} toolData The local data this tool is currently using.
 */
function clearData(graphData, toolData) {
    return null;
}

const onPaint = undefined;