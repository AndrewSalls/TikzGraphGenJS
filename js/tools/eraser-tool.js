import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Edge from "../graph-data/edge.js";
import Vertex from "../graph-data/vertex.js";
import { GraphSession, MouseInteraction } from "../graph-session.js";
import { Edit, EDIT_TYPE, makeEdit } from "../history.js";
import { Tool } from "./tool.js";

let ERASER_TOOL;
const SWITCH_TO_DRAG_ERASE = 5; // Size of a "bubble" around starting erase position before switching to dragging eraser (default just erases where initial click is)
const ERASER_WIDTH = 5; // Area of eraser

/**
 * Provides access to the edge tool.
 * @returns {Tool} The edge tool.
 */
export default function accessEdgeTool() {
    if(ERASER_TOOL === undefined) {
        ERASER_TOOL = new Tool("eraser", onDown, onMove, onUp, onPaint);
    }

    return ERASER_TOOL;
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
    toolData = {
        x: mouse.x,
        y: mouse.y,
        dragging: false
    };

    return toolData;
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
    if(toolData !== null && !toolData.dragging) {
        const deltaX = mouse.x - toolData.newX;
        const deltaY = mouse.y - toolData.newY;
        
        if(Math.sqrt(deltaX * deltaX + deltaY + deltaY) >= SWITCH_TO_DRAG_ERASE) {
            toolData.dragging = true;
        }
    }

    if(toolData.dragging) {

    }
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
    if(toolData !== null && !toolData.dragging) {
        
    }
}

const onPaint = undefined;