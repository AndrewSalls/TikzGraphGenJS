import { GRAPH_DATATYPE, GraphObject } from "../graph-data/graph-object.js";
import { GraphSession, RENDER_SETTINGS } from "../graph-session/graph-session.js";
import { CompositeEdit } from "../history/composite-edit.js";
import { DeletionEdit } from "../history/entry-edit.js";
import { makeEdit } from "../history/history.js";
import { MouseInteraction } from "../mouse-interaction.js";
import { Tool } from "./tool.js";

let ERASER_TOOL;
const SWITCH_TO_DRAG_ERASE = 5; // Size of a "bubble" around starting erase position before switching to dragging eraser (default just erases where initial click is)
const ERASER_WIDTH = 20; // Area of eraser

/**
 * Provides access to the eraser tool.
 * @returns {Tool} The eraser tool.
 */
export default function accessEraserTool() {
    if(ERASER_TOOL === undefined) {
        ERASER_TOOL = new Tool("eraser", onDown, onMove, onUp, initializeData, clearData, onPaint);
    }

    return ERASER_TOOL;
}

/**
 * The callback used when pressing down on a mouse button.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onDown(mouse, graphData, toolData) {
    toolData = {
        currX: mouse.x,
        currY: mouse.y,
        editProgress: [],
        dragging: false,
        attemptDrag: true
    };

    return toolData;
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
        if(toolData.attemptDrag && !toolData.dragging) {
            const deltaX = mouse.x - toolData.currX;
            const deltaY = mouse.y - toolData.currY;
            
            if(Math.sqrt(deltaX * deltaX + deltaY + deltaY) >= SWITCH_TO_DRAG_ERASE) {
                toolData.dragging = true;
            }
        }
    
        toolData.currX = mouse.x;
        toolData.currY = mouse.y;
        if(toolData.dragging) {
            const clicked = graphData.getClickedObjectsInRange(mouse.shiftedX, mouse.shiftedY, ERASER_WIDTH);
            const eraseEditStep = eraseData(clicked, graphData, toolData);
            if(eraseEditStep.length > 0) {
                toolData.editProgress.push(...eraseEditStep);
            }
        }
    }

    return toolData;
}

/**
 * The callback used when a mouse button stops being pressed.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onUp(mouse, graphData, toolData) {
    if(toolData !== null && toolData.attemptDrag) {
        if(!toolData.dragging) {
            const clicked = graphData.getClickedObjectsInRange(mouse.shiftedX, mouse.shiftedY, ERASER_WIDTH);
            const eraseEditStep = eraseData(clicked, graphData, toolData);
            if(eraseEditStep.length > 0) {
                toolData.editProgress.push(...eraseEditStep);
            }
        }

        if(toolData.editProgress.length === 1) {
            makeEdit(toolData.editProgress[0]);
        } else if(toolData.editProgress.length > 1) {
            makeEdit(new CompositeEdit(toolData.editProgress));
        }

        return initializeData(graphData);
    }
    
    return toolData;
}

/**
 * Initializes the tool data, for when the tool has a constantly active effect (that doesn't rely on clicking)
 * @param {GraphSession} graphData The graph data that the tool will be interacting with.
 */
function initializeData(graphData) {
    return {
        currX: 0,
        currY: 0,
        attemptDrag: false
    };
}

/**
 * Clears the current tool data, making sure to clean up any dummy data from the graph data as well.
 * @param {GraphSession} graphData The graph data that the tool (potentially) modified with dummy data.
 * @param {Object|null} toolData The local data this tool is currently using.
 */
function clearData(graphData, toolData) {
    if(toolData !== null && toolData.dragging) {
        if(toolData.editProgress.length === 1) {
            makeEdit(toolData.editProgress[0]);
        } else if(toolData.editProgress.length > 1) {
            makeEdit(new CompositeEdit(toolData.editProgress));
        }
    }
}

/**
 * The callback used when this tool is selected and a paint event is called on the canvas.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @param {CanvasRenderingContext2D} ctx The context of the canvas to be drawn on.
 */
function onPaint(graphData, toolData, ctx) {
    if(toolData !== null) {
        ctx.beginPath();
        ctx.fillStyle = RENDER_SETTINGS.ERASE_MAIN;
        ctx.lineWidth = RENDER_SETTINGS.ERASE_BORDER_WIDTH;
        ctx.strokeStyle = RENDER_SETTINGS.ERASE_BORDER;
        ctx.ellipse(toolData.currX, toolData.currY, ERASER_WIDTH, ERASER_WIDTH, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}

/**
 * Removes the specified graph objects from the graph.
 * @param {GraphObject[]} data the selected data. 
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {(DeletionEdit|CompositeEdit)[]} A series of edits representing the removed objects, with composite edits representing the removal of a vertex that still has adjacent edges.
 */
function eraseData(data, graphData, toolData) {
    if(data.length === 0) {
        return [];
    }

    const editList = [];

    for(let x = 0; x < data.length; x++) {
        switch(data[x].getType()) {
            case GRAPH_DATATYPE.VERTEX:
                editList.push(graphData.removeVertex(data[x]));
                break;
            case GRAPH_DATATYPE.EDGE:
                if(graphData.edges.indexOf(data[x]) > -1) { // Only if graphData has edge, since it may have already been removed by vertex deletion.
                    editList.push(graphData.removeEdge(data[x]));
                }
                break;
            default:
                console.error("appendErasedData not implemented for type " + data[x].getType());
                return [];
        }
    }
    
    return editList;
}

/**
 * Erases all selected items using the same process the eraser tool uses.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 */
export function eraseSelected(graphData) {
    const toolData = {
        editProgress: []
    };

    eraseData(Array.from(graphData.iterateThroughSelectedData()), graphData, toolData);
    if(toolData.editProgress.length === 1) {
        makeEdit(toolData.editProgress[0]);
    } else if(toolData.editProgress.length > 1) {
        makeEdit(new CompositeEdit(toolData.editProgress));
    }
}