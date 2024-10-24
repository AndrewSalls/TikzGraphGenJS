import { GraphObject } from "../graph-data/graph-object.js";
import { GraphSession } from "../graph-session.js";
import accessEdgeTool from "./edge-tool.js";
import accessSelectTool from "./select-tool.js";
import accessVertexTool from "./vertex-tool.js";
import accessEraserTool, { eraseSelected } from "./eraser-tool.js";
import accessSplitTool from "./split-tool.js";
import accessMergeTool from "./merge-tool.js";
import { makeEdit } from "../history/history.js";
import { MOUSE_CLICK_TYPE, MOUSE_EXIT_BOUND_DIRECTION, MouseInteraction } from "../mouse-interaction.js";
import accessMouseTool from "./mouse-tool.js";

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
     * @param {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} downEv the event called when the user starts holding a mouse button on the graph.
     * @param {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} moveEv the event called when the user moves their mouse on the graph, regardless of if they clicked or not.
     * @param {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} upEv the event called when the user releases a mouse button on the graph.
     * @param {(graphData: GraphSession) => Object|null} initializeData the event called when this tool is made the active tool. 
     * @param {(graphData: GraphSession, toolData: Object|null)} clearData the event called when the tool is switched to another tool, used to clean up hanging data.
     * @param {(graphData: GraphSession, toolData: Object|null, CanvasRenderingContext2D ctx)} paintEv the event called when the canvas refreshes, called after all other paint effects.
     * @param {Boolean} acceptAllClicks Whether this tool should respond to all click events or only left click events.
     */
    constructor(name, downEv, moveEv, upEv, initializeData, clearData, paintEv = undefined, acceptAllClicks = false) {
        /** @type {String} */
        this.name = name;
        /** @type {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} */
        this.onDown = downEv;
        /** @type {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} */
        this.onMove = moveEv;
        /** @type {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} */
        this.onUp = upEv;
        /** @type {(graphData: GraphSession) => Object|null} */
        this.initializeData = initializeData;
        /** @type {(graphData: GraphSession, toolData: Object|null)} */
        this.clearData = clearData;
        /** @type {(graphData: GraphSession, toolData: Object|null, CanvasRenderingContext2D ctx)} */
        this.onPaint = paintEv;
        /** @type {Boolean} */
        this.acceptAllClicks = acceptAllClicks;
    }
};

const mouseHandler = accessMouseTool();
let universalToolData = null;

let activeTool = null;
let toolData = null;
let clickType = null;

/**
 * Sets the active tool.
 * @param {TOOL_TYPE} toolType The type of tool to switch to.
 * @param {GraphSession} graphData The graph data that the tool will be interacting with.
 */
export function setTool(toolType, graphData) {
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

    if(activeTool.initializeData !== undefined) {
        toolData = activeTool.initializeData(graphData);
    }
}

/**
 * Clears the current tool data, making sure to clean up any dummy data from the graph data as well.
 * @param {GraphSession} graphData The graph data that the tool (potentially) modified with dummy data.
 */
export function clearData(graphData) {
    if(activeTool.clearData !== undefined) {
        activeTool.clearData(graphData, toolData);
    }
    
    toolData = null;
};

/**
 * Calls the active tool's mouse down event handler.
 * @param {MouseInteraction} mouseData the relevant mouse data for the tool.
 * @param {GraphSession} graphData the graph data the tool can modify.
 */
export function tool_onMouseDown(mouseData, graphData) {
    clickType = mouseData.clickType;
    if(activeTool.acceptAllClicks || (clickType !== null && (clickType & MOUSE_CLICK_TYPE.LEFT_CLICK) > 0)) { // Only accept left click
        toolData = activeTool.onDown(mouseData, graphData, toolData);
    } else {
        universalToolData = mouseHandler.onDown(mouseData, graphData, universalToolData);
    }
}

/**
 * Calls the active tool's mouse move event handler. If the cursor is outside of the window, uses the mouse up event instead (treating leaving the window as letting go of click).
 * @param {MouseInteraction} mouseData the relevant mouse data for the tool.
 * @param {GraphSession} graphData the graph data the tool can modify.
 */
export function tool_onMouseMove(mouseData, graphData) {
    if(activeTool.acceptAllClicks || (clickType !== null && (clickType & MOUSE_CLICK_TYPE.LEFT_CLICK) > 0 || (clickType & 0b11111) === 0)) { // Only accept left click and no click
        if(mouseData.exitedBounds & MOUSE_EXIT_BOUND_DIRECTION.WINDOW) {
            toolData = activeTool.onUp(mouseData, graphData, toolData);
        } else {
            toolData = activeTool.onMove(mouseData, graphData, toolData);
        }
    } else {
        if(mouseData.exitedBounds & MOUSE_EXIT_BOUND_DIRECTION.WINDOW) {
            universalToolData = mouseHandler.onUp(mouseData, graphData, universalToolData);
        } else {
            universalToolData = mouseHandler.onMove(mouseData, graphData, universalToolData);
        }
    }
}

/**
 * Calls the active tool's mouse up event handler.
 * @param {MouseInteraction} mouseData the relevant mouse data for the tool.
 * @param {GraphSession} graphData the graph data the tool can modify.
 */
export function tool_onMouseUp(mouseData, graphData) {
    if(activeTool.acceptAllClicks || (clickType !== null && (clickType & MOUSE_CLICK_TYPE.LEFT_CLICK) > 0)) { // Only accept left click
        toolData = activeTool.onUp(mouseData, graphData, toolData);
    } else {
        universalToolData = mouseHandler.onUp(mouseData, graphData, universalToolData);
    }

    clickType = null;
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

/**
 * Removes all data from the graph, and resets the current tool.
 * @param {GraphSession} graphData the graph data the tool can modify.
 */
export function clearGraph(graphData) {
    clearData(graphData);
    graphData.clearSelected();

    const edit = graphData.clearObjects();
    
    if(edit !== null) {
        makeEdit(edit);
    }
}