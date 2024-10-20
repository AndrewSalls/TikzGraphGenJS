import { GraphObject } from "../graph-data/graph-object.js";
import { GraphSession, MOUSE_EXIT_BOUND_DIRECTION, MouseInteraction } from "../graph-session.js";
import accessEdgeTool from "./edge-tool.js";
import accessSelectTool from "./select-tool.js";
import accessVertexTool from "./vertex-tool.js";
import accessEraserTool, { eraseSelected } from "./eraser-tool.js";
import accessSplitTool from "./split-tool.js";
import accessMergeTool from "./merge-tool.js";

/**
 * An enum containing the list of valid tool types.
 * @enum
 * @readonly
 */
export const TOOL_TYPE = {
    VERTEX: 0,
    EDGE: 1,
    SELECT: 4,
    ERASER: 5,
    SPLIT: 7,
    MERGE: 8
}

/**
 * Data associated with a generic tool.
 */
export class Tool {
    /**
     * Creates a tool.
     * @param {String} name The name of the tool.
     * @param {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null)} downEv the event called when the user starts holding a mouse button on the graph.
     * @param {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null)} moveEv the event called when the user moves their mouse on the graph, regardless of if they clicked or not.
     * @param {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null)} upEv the event called when the user releases a mouse button on the graph.
     * @param {(graphData: GraphSession, toolData: Object|null)} clearData the event called when the tool is switched to another tool, used to clean up hanging data
     * @param {(graphData: GraphSession, toolData: Object|null, CanvasRenderingContext2D ctx)} paintEv the event called when the canvas refreshes, called after all other paint effects
     */
    constructor(name, downEv, moveEv, upEv, clearData, paintEv = undefined) {
        this.name = name;
        this.onDown = downEv;
        this.onMove = moveEv;
        this.onUp = upEv;
        this.clearData = clearData;
        this.onPaint = paintEv;
    }
};

let activeTool = accessVertexTool();
let toolData = null;
let selectedData = new Set();

/**
 * Sets the active tool.
 * @param {TOOL_TYPE} toolType The type of tool to switch to.
 */
export function setTool(toolType) {
    switch(toolType) {
        case TOOL_TYPE.VERTEX:
            activeTool = accessVertexTool();
            break;
        case TOOL_TYPE.EDGE:
            activeTool = accessEdgeTool();
            break;
        case TOOL_TYPE.SELECT:
            activeTool = accessSelectTool();
            break;
        case TOOL_TYPE.ERASER:
            activeTool = accessEraserTool();
            break;
        case TOOL_TYPE.SPLIT:
            activeTool = accessSplitTool();
            break;
        case TOOL_TYPE.MERGE:
            activeTool = accessMergeTool();
            break;
        default:
            console.error("Missing tool link to tool of type " + toolType + ", or tool is not yet implemented.");
    }
}

/**
 * Determines if a graph object has been selected.
 * @param {GraphObject} graphObj the object to check.
 * @returns {Boolean} whether the object is selected.
 */
export function isSelected(graphObj) {
    return selectedData.has(graphObj);
}

/**
 * Clears the current tool data, making sure to clean up any dummy data from the graph data as well.
 * @param {GraphSession} graphData The graph data that the tool (potentially) modified with dummy data.
 */
export function clearData(graphData) {
    activeTool.clearData(graphData, toolData);
    toolData = null;
};

/**
 * Deletes all currently selected items.
 * @param {GraphSession} graphData The graph data that the tool will delete selected items from.
 */
export function deleteSelected(graphData) {
    eraseSelected(graphData, selectedData);
    selectedData.clear();
}

/**
 * Calls the active tool's mouse down event handler.
 * @param {MouseInteraction} mouseData the relevant mouse data for the tool.
 * @param {GraphSession} graphData the graph data the tool can modify.
 */
export function tool_onMouseDown(mouseData, graphData) {
    toolData = activeTool.onDown(mouseData, graphData, toolData, selectedData);
}

/**
 * Calls the active tool's mouse move event handler. If the cursor is outside of the window, uses the mouse up event instead (treating leaving the window as letting go of click).
 * @param {MouseInteraction} mouseData the relevant mouse data for the tool.
 * @param {GraphSession} graphData the graph data the tool can modify.
 */
export function tool_onMouseMove(mouseData, graphData) {
    if(mouseData.exitedBounds & MOUSE_EXIT_BOUND_DIRECTION.WINDOW) {
        toolData = activeTool.onUp(mouseData, graphData, toolData, selectedData);
    } else {
        toolData = activeTool.onMove(mouseData, graphData, toolData, selectedData);
    }
}

/**
 * Calls the active tool's mouse up event handler.
 * @param {MouseInteraction} mouseData the relevant mouse data for the tool.
 * @param {GraphSession} graphData the graph data the tool can modify.
 */
export function tool_onMouseUp(mouseData, graphData) {
    toolData = activeTool.onUp(mouseData, graphData, toolData, selectedData);
}

/**
 * Calls the active tool's paint event handler.
 * @param {GraphSession} graphData the graph data the tool can modify.
 * @param {CanvasRenderingContext2D} ctx the canvas context to draw on.
 */
export function tool_onPaint(graphData, ctx) {
    if(activeTool.onPaint !== undefined) {
        activeTool.onPaint(graphData, toolData, ctx);
    }
}