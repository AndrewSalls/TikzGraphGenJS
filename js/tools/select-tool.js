import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import { GraphSession, MouseInteraction, RENDER_SETTINGS } from "../graph-session.js";
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
        dragging: false
    };
    
    if(selectedData.has(graphData.getClickedObject(mouse.x, mouse.y))) {
        toolData.dragging = true;
        //Prevent initial delta from being NaN
        toolData.newX = toolData.x;
        toolData.newY = toolData.y;
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
        const deltaX = mouse.x - toolData.newX;
        const deltaY = mouse.y - toolData.newY;

        const iter = selectedData.values();
        let next = iter.next();
        while(!next.done) {
            if(next.value.giveType() === GRAPH_DATATYPE.VERTEX) {
                next.value.x += deltaX;
                next.value.y += deltaY;
                next = iter.next();
            } else { // Relies on next always returning vertices first
                next.done = true;
            }
        }
        
        toolData.newX = mouse.x;
        toolData.newY = mouse.y;
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
                if(next.value.giveType() === GRAPH_DATATYPE.VERTEX) {
                    editList.push(new Edit(EDIT_TYPE.MUTATION, {
                        type: next.value.giveType(),
                        id: next.value.id,
                        originalValues: { x: next.value.x - deltaX, y: next.value.y - deltaY },
                        modifiedValues: { x: next.value.x, y: next.value.y }
                    }));
                }
                next = iter.next();
            }

            if(editList.length > 0) {
                if(editList.length === 1) {
                    makeEdit(editList[0]);
                } else {
                    makeEdit(new Edit(EDIT_TYPE.COMPOSITE, editList));
                }
            }
        } else if(toolData.isAreaSelect) {
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