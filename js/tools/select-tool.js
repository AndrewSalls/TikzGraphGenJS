import { GraphSession, MouseInteraction } from "../graph-session.js";
import { Edit, EDIT_TYPE, makeEdit } from "../history.js";
import { Tool } from "./tool.js";

let SELECT_TOOL;
const MIN_AREA_SELECT = 7; // Minimum distance in pixels before switching from click to area select

/**
 * Provides access to the select tool.
 * @returns {Tool} The select tool.
 */
export default function accessSelectTool() {
    if(SELECT_TOOL === undefined) {
        SELECT_TOOL = new Tool("select", onDown, onMove, onUp, onPaint);
    }

    return SELECT_TOOL;
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
        isAreaSelect: false
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
    //TODO: Alt behavior for mass dragging selected items if clicking on selected item

    if(toolData !== null && (toolData.isAreaSelect || Math.sqrt(Math.pow(mouse.x - toolData.x, 2) + Math.pow(mouse.y - toolData.y, 2)) > MIN_AREA_SELECT)) {
        toolData.newX = mouse.x;
        toolData.newY = mouse.y;
        toolData.isAreaSelect = true;
    }

    return toolData;
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
    if(toolData !== null) {
        if(toolData.isAreaSelect) {
            selectedData.clear();
            const iter = graphData.iterateThroughAllData();
            let next = iter.next();
            while(!next.done) {
                const bBox = next.value.boundingBox();
                if(bBox[0][0] >= Math.min(toolData.newX, toolData.x) &&
                   bBox[0][1] >= Math.min(toolData.newY, toolData.y) &&
                   bBox[1][0] <= Math.max(toolData.newX, toolData.x) &&
                   bBox[1][1] <= Math.max(toolData.newY, toolData.y) ) {
                    selectedData.add(next.value);
                }

                next = iter.next();
            }
        } else {
            selectedData.clear();
            const clicked = graphData.getClickedObject(mouse.x, mouse.y);
            if(clicked !== null) {
                selectedData.add(clicked);
            }
        }
    }
    
    return null;
}

/**
 * The callback used when this tool is selected and a paint event is called on the canvas.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {*} toolData Temporary data storage for this tool.
 * @param {CanvasRenderingContext2D} ctx The context of the canvas to be drawn on.
 */
function onPaint(graphData, toolData, ctx) {
    if(toolData !== null && toolData.isAreaSelect) {
        ctx.beginPath();
        ctx.fillStyle = "#93b8e799";
        ctx.lineWidth = "3px";
        ctx.strokeStyle = "#0078d499";
        ctx.fillRect(Math.min(toolData.newX, toolData.x), Math.min(toolData.newY, toolData.y), Math.abs(toolData.newX - toolData.x), Math.abs(toolData.newY - toolData.y));
        ctx.strokeRect(Math.min(toolData.newX, toolData.x), Math.min(toolData.newY, toolData.y), Math.abs(toolData.newX - toolData.x), Math.abs(toolData.newY - toolData.y));
        ctx.stroke();
    }
}