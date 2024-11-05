import { makeEdit } from "../history/history.js";
import { MOUSE_CLICK_TYPE, MOUSE_EXIT_BOUND_DIRECTION } from "../mouse-interaction.js";
import accessEdgeTool from "../tools/edge-tool.js";
import accessEraserTool from "../tools/eraser-tool.js";
import accessLassoTool from "../tools/lasso-tool.js";
import accessMergeTool from "../tools/merge-tool.js";
import accessMouseTool from "../tools/mouse-tool.js";
import accessSelectTool from "../tools/select-tool.js";
import accessSplitTool from "../tools/split-tool.js";
import { TOOL_TYPE } from "../tools/tool.js";
import accessVertexTool from "../tools/vertex-tool.js";

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
    switch (toolType) {
        case TOOL_TYPE.VERTEX:
            activeTool = accessVertexTool();
            break;
        case TOOL_TYPE.EDGE:
            activeTool = accessEdgeTool();
            break;
        case TOOL_TYPE.SELECT:
            activeTool = accessSelectTool();
            break;
        case TOOL_TYPE.LASSO:
            activeTool = accessLassoTool();
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

    if (activeTool.initializeData !== undefined) {
        toolData = activeTool.initializeData(graphData);
    }
}
/**
 * Clears the current tool data, making sure to clean up any dummy data from the graph data as well.
 * @param {GraphSession} graphData The graph data that the tool (potentially) modified with dummy data.
 */

export function clearData(graphData) {
    if (activeTool.clearData !== undefined) {
        activeTool.clearData(graphData, toolData);
    }

    toolData = null;
}
;
/**
 * Calls the active tool's mouse down event handler.
 * @param {MouseInteraction} mouseData the relevant mouse data for the tool.
 * @param {GraphSession} graphData the graph data the tool can modify.
 */

export function tool_onMouseDown(mouseData, graphData) {
    if (clickType === null) { // Only one click type is allowed at a time
        clickType = mouseData.clickType;

        if (activeTool.acceptAllClicks || (clickType !== null && (clickType & MOUSE_CLICK_TYPE.LEFT_CLICK) > 0)) { // Only accept left click
            toolData = activeTool.onDown(mouseData, graphData, toolData);
        } else {
            universalToolData = mouseHandler.onDown(mouseData, graphData, universalToolData);
        }
    }
}
/**
 * Calls the active tool's mouse move event handler. If the cursor is outside of the window, uses the mouse up event instead (treating leaving the window as letting go of click).
 * @param {MouseInteraction} mouseData the relevant mouse data for the tool.
 * @param {GraphSession} graphData the graph data the tool can modify.
 */

export function tool_onMouseMove(mouseData, graphData) {
    if (activeTool.acceptAllClicks || (clickType !== null && (clickType & MOUSE_CLICK_TYPE.LEFT_CLICK) > 0 || (clickType & 0b11111) === 0)) { // Only accept left click and no click
        if (mouseData.exitedBounds & MOUSE_EXIT_BOUND_DIRECTION.WINDOW) {
            toolData = activeTool.onUp(mouseData, graphData, toolData);
        } else {
            toolData = activeTool.onMove(mouseData, graphData, toolData);
        }
    } else {
        if (mouseData.exitedBounds & MOUSE_EXIT_BOUND_DIRECTION.WINDOW) {
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
    if (clickType === null || mouseData.activeClick === clickType) { // Only triggers for same click type currently taking place
        if (activeTool.acceptAllClicks || (clickType !== null && (clickType & MOUSE_CLICK_TYPE.LEFT_CLICK) > 0)) { // Only accept left click
            toolData = activeTool.onUp(mouseData, graphData, toolData);
        } else {
            universalToolData = mouseHandler.onUp(mouseData, graphData, universalToolData);
        }

        clickType = null;
    }
}
/**
 * Calls the active tool's paint event handler.
 * @param {GraphSession} graphData the graph data the tool can modify.
 * @param {CanvasRenderingContext2D} ctx the canvas context to draw on.
 */

export function tool_onPaint(graphData, ctx) {
    if (activeTool.onPaint !== undefined) {
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

    if (edit !== null) {
        makeEdit(edit);
    }
}
/**
 * Controls zooming to the center of the scaled rendered area.
 * @param {GraphSession} graphData The graph data the camera is zooming in on.
 * @param {Number} viewportWidth The width of the viewport.
 * @param {Number} viewportHeight The height of the viewport.
 * @param {Boolean} zoomIn Whether this is to zoom in or zoom out.
 * @param {Boolean} fixedAmount Whether the zoom should snap to the nearest fixed zoom level or zoom by a percentage.
 * @returns {Number} The new zoom percentage.
 */

export function zoomToCenter(graphData, viewportWidth, viewportHeight, zoomIn, fixedAmount) {
    const oldScale = graphData.viewport.scale;

    if (clickType === null) {
        let newScale;
        if (zoomIn) {
            newScale = fixedAmount ? graphData.viewport.zoomInFixed() : graphData.viewport.zoomIn();
        } else {
            newScale = fixedAmount ? graphData.viewport.zoomOutFixed() : graphData.viewport.zoomOut();
        }

        graphData.viewport.pan((viewportWidth / oldScale - viewportWidth / newScale) / 2, (viewportHeight / oldScale - viewportHeight / newScale) / 2);
        return newScale;
    }

    return oldScale;
}
/**
 * Controls zooming to the user's mouse in the graph.
 * @param {MouseInteraction} mouseData The relevant mouse data for the tool.
 * @param {GraphSession} graphData The graph data the camera is zooming in on.
 * @param {Number} viewportWidth The width of the viewport.
 * @param {Number} viewportHeight The height of the viewport.
 * @param {Boolean} zoomIn Whether this is to zoom in or zoom out.
 * @param {Boolean} fixedAmount Whether the zoom should snap to the nearest fixed zoom level or zoom by a percentage.
 * @returns {Number} The new zoom percentage.
 */

export function zoomToMouse(mouseData, graphData, viewportWidth, viewportHeight, zoomIn, fixedAmount) {
    const oldScale = graphData.viewport.scale;

    if (clickType === null) {
        let newScale;
        if (zoomIn) {
            newScale = fixedAmount ? graphData.viewport.zoomInFixed() : graphData.viewport.zoomIn();
        } else {
            newScale = fixedAmount ? graphData.viewport.zoomOutFixed() : graphData.viewport.zoomOut();
        }

        graphData.viewport.pan((viewportWidth / oldScale - viewportWidth / newScale) * (mouseData.x / viewportWidth), (viewportHeight / oldScale - viewportHeight / newScale) * (mouseData.y / viewportHeight));
        return newScale;
    }

    return oldScale;
}
