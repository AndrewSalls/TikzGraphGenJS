import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import { GraphSession, RENDER_SETTINGS } from "../graph-session.js";
import { CompositeEdit } from "../history/composite-edit.js";
import { makeEdit } from "../history/history.js";
import { MutationEdit } from "../history/mutation-edit.js";
import { MOUSE_CLICK_TYPE, MouseInteraction } from "../mouse-interaction.js";
import { Tool } from "./tool.js";

let SELECT_TOOL;
const MIN_AREA_SELECT = 7; // Minimum distance in pixels before switching from click to area select

/**
 * Provides access to the select tool.
 * @returns {Tool} The select tool.
 */
export default function accessSelectTool() {
    if(SELECT_TOOL === undefined) {
        SELECT_TOOL = new Tool("select", onDown, onMove, onUp, clearData, onPaint);
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
        isAreaSelect: false,
        dragging: false,
        keepOldSelected: (mouse.clickType & MOUSE_CLICK_TYPE.SHIFT_HELD) > 0 // true if shift is held
    };
    
    if(selectedData.has(graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY))) {
        toolData.dragging = true;
        //Prevent initial delta from being NaN
        toolData.newX = mouse.shiftedX;
        toolData.newY = mouse.shiftedY;
    } else {
        toolData.shiftX = mouse.shiftedX;
        toolData.shiftY = mouse.shiftedY;
    }

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
    if(toolData !== null && toolData.dragging) {
        const deltaX = mouse.shiftedX - toolData.newX;
        const deltaY = mouse.shiftedY - toolData.newY;

        const iter = selectedData.values();
        let next = iter.next();
        while(!next.done) {
            if(next.value.getType() === GRAPH_DATATYPE.VERTEX) {
                next.value.x += deltaX;
                next.value.y += deltaY;
                next = iter.next();
            } else { // Relies on next always returning vertices first
                next.done = true;
            }
        }
        
        toolData.newX = mouse.shiftedX;
        toolData.newY = mouse.shiftedY;
    } else if(toolData !== null && (toolData.isAreaSelect || Math.sqrt(Math.pow(mouse.x - toolData.x, 2) + Math.pow(mouse.y - toolData.y, 2)) > MIN_AREA_SELECT)) {
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
        if(toolData.dragging) {
            const deltaX = toolData.newX - toolData.x;
            const deltaY = toolData.newY - toolData.y;

            const editList = [];
            const iter = selectedData.values();
            let next = iter.next();
            while(!next.done) {
                if(next.value.getType() === GRAPH_DATATYPE.VERTEX) {
                    editList.push(new MutationEdit(next.value,
                        { x: next.value.x - deltaX, y: next.value.y - deltaY },
                        { x: next.value.x, y: next.value.y }))
                }
                next = iter.next();
            }

            if(editList.length > 0) {
                if(editList.length === 1) {
                    makeEdit(editList[0]);
                } else {
                    makeEdit(new CompositeEdit(editList));
                }
            }
        } else if(toolData.isAreaSelect) {
            if(!toolData.keepOldSelected) {
                selectedData.clear();
            }

            const iter = graphData.iterateThroughAllData();
            let next = iter.next();
            while(!next.done) {
                const bBox = next.value.boundingBox();
                if(bBox.x >= Math.min(mouse.shiftedX, toolData.shiftX) &&
                   bBox.y >= Math.min(mouse.shiftedY, toolData.shiftY) &&
                   bBox.x + bBox.width <= Math.max(mouse.shiftedX, toolData.shiftX) &&
                   bBox.y + bBox.height <= Math.max(mouse.shiftedY, toolData.shiftY)) {
                    selectedData.add(next.value);
                }

                next = iter.next();
            }
        } else {
            if(!toolData.keepOldSelected) {
                selectedData.clear();
            }

            const clicked = graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY);
            if(clicked !== null) {
                selectedData.add(clicked);
            }
        }
    }
    
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

/**
 * The callback used when this tool is selected and a paint event is called on the canvas.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {*} toolData Temporary data storage for this tool.
 * @param {CanvasRenderingContext2D} ctx The context of the canvas to be drawn on.
 */
function onPaint(graphData, toolData, ctx) {
    if(toolData !== null && toolData.isAreaSelect) {
        ctx.beginPath();
        ctx.fillStyle = RENDER_SETTINGS.SELECT_MAIN;
        ctx.lineWidth = RENDER_SETTINGS.SELECT_BORDER_WIDTH;
        ctx.strokeStyle = RENDER_SETTINGS.SELECT_BORDER;
        ctx.fillRect(Math.min(toolData.newX, toolData.x), Math.min(toolData.newY, toolData.y), Math.abs(toolData.newX - toolData.x), Math.abs(toolData.newY - toolData.y));
        ctx.strokeRect(Math.min(toolData.newX, toolData.x), Math.min(toolData.newY, toolData.y), Math.abs(toolData.newX - toolData.x), Math.abs(toolData.newY - toolData.y));
        ctx.stroke();
        ctx.closePath();
    }
}