import { GraphSession } from "../graph-session/graph-session.js";
import { MOUSE_CLICK_TYPE, MouseInteraction } from "../mouse-interaction.js";
import { Tool } from "./tool.js";

let MOUSE_TOOL;

/**
 * Provides access to the mouse tool. This is a special tool that handles mouse inputs that are independent of specific tools (e.g. panning with middle click).
 * @returns {Tool} The mouse tool.
 */
export default function accessMouseTool() { 
    if(MOUSE_TOOL === undefined) {
        MOUSE_TOOL = new Tool("mouse", onDown, onMove, onUp, initializeData, clearData, onPaint);
    }

    return MOUSE_TOOL;
}

/**
 * The callback used when pressing down on a mouse button.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onDown(mouse, graphData, toolData) {
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
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onMove(mouse, graphData, toolData) {
    if(toolData !== null) {
        graphData.viewport.pan((toolData.panX - mouse.x) / graphData.viewport.scale, (toolData.panY - mouse.y) / graphData.viewport.scale);

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
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onUp(mouse, graphData, toolData) {
    return null;
}

const initializeData = undefined;
const clearData = undefined;
const onPaint = undefined;