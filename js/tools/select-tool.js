import Vertex from "../graph-data/vertex.js";
import { GraphSession, RENDER_SETTINGS } from "../graph-session/graph-session.js";
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
        SELECT_TOOL = new Tool("select", onDown, onMove, onUp, initializeData, clearData, onPaint);
    }

    return SELECT_TOOL;
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
        x: mouse.x,
        y: mouse.y,
        isAreaSelect: false,
        dragging: false,
        keepOldSelected: (mouse.clickType & MOUSE_CLICK_TYPE.SHIFT_HELD) > 0 // true if shift is held
    };
    
    const clicked = graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY);
    if(graphData.isSelected(clicked)) {
        toolData.dragging = true;

        if(graphData.snapGrid || graphData.snapAngle || graphData.snapDistance) {
            // midpoint of selected object
            const bBox = clicked.boundingBox();
            const viewportMidpoint = graphData.viewport.canvasToViewport(bBox.x + bBox.width / 2, bBox.y + bBox.height / 2);
            toolData.newX = viewportMidpoint.x;
            toolData.newY = viewportMidpoint.y;
        } else {
            // Current mouse position
            toolData.newX = mouse.shiftedX;
            toolData.newY = mouse.shiftedY;
        }
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
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onMove(mouse, graphData, toolData) {
    if(toolData !== null && toolData.dragging) {
        let newX = mouse.shiftedX;
        let newY = mouse.shiftedY;
        let deltaX = mouse.shiftedX - toolData.newX;
        let deltaY = mouse.shiftedY - toolData.newY;

        if(graphData.snapGrid) {
            const snap = MouseInteraction.snapToGrid(mouse.shiftedX, mouse.shiftedY);
            deltaX = snap.x - toolData.newX;
            deltaY = snap.y - toolData.newY;
            newX = snap.x;
            newY = snap.y;
        } else if(graphData.snapAngle || graphData.snapDistance) {
            const closest = graphData.getClosestVertex(mouse.shiftedX, mouse.shiftedY, RENDER_SETTINGS.VERTEX_SNAP_MAX_RANGE, false);
    
            if(closest !== null) {
                const snap = MouseInteraction.snapToVertex(mouse.shiftedX, mouse.shiftedY, closest, graphData.snapAngle, graphData.snapDistance);
                toolData.snapVertex = closest;

                deltaX = snap.x - toolData.newX;
                deltaY = snap.y - toolData.newY;
                newX = snap.x;
                newY = snap.y;
            }
        } 

        for(const vertex of graphData.selectedVertices) {
            vertex.x += deltaX;
            vertex.y += deltaY;
        }
        
        toolData.newX = newX;
        toolData.newY = newY;
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
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onUp(mouse, graphData, toolData) {
    if(toolData !== null) {
        if(toolData.dragging) {
            const deltaX = toolData.newX - toolData.x;
            const deltaY = toolData.newY - toolData.y;
            const editList = [];

            for(const vertex of graphData.selectedVertices) {
                editList.push(new MutationEdit(vertex,
                    { x: vertex.x - deltaX, y: vertex.y - deltaY },
                    { x: vertex.x, y: vertex.y }));
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
                graphData.clearSelected();
            }

            const iter = graphData.iterateThroughAllData();
            let next = iter.next();
            while(!next.done) {
                const bBox = next.value.boundingBox();
                if(bBox.x >= Math.min(mouse.shiftedX, toolData.shiftX) &&
                   bBox.y >= Math.min(mouse.shiftedY, toolData.shiftY) &&
                   bBox.x + bBox.width <= Math.max(mouse.shiftedX, toolData.shiftX) &&
                   bBox.y + bBox.height <= Math.max(mouse.shiftedY, toolData.shiftY)) {
                    graphData.select(next.value);
                }

                next = iter.next();
            }
        } else {
            if(!toolData.keepOldSelected) {
                graphData.clearSelected();
            }

            const clicked = graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY);
            if(clicked !== null) {
                graphData.select(clicked);
            }
        }
    }
    
    return null;
}

const initializeData = undefined;
const clearData = undefined;

/**
 * The callback used when this tool is selected and a paint event is called on the canvas.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {*} toolData Temporary data storage for this tool.
 * @param {CanvasRenderingContext2D} ctx The context of the canvas to be drawn on.
 */
function onPaint(graphData, toolData, ctx) {
    if(toolData !== null) {
        if(toolData.isAreaSelect) {
            ctx.beginPath();
            ctx.fillStyle = RENDER_SETTINGS.SELECT_MAIN;
            ctx.lineWidth = RENDER_SETTINGS.SELECT_BORDER_WIDTH;
            ctx.strokeStyle = RENDER_SETTINGS.SELECT_BORDER;
            ctx.fillRect(Math.min(toolData.newX, toolData.x), Math.min(toolData.newY, toolData.y), Math.abs(toolData.newX - toolData.x), Math.abs(toolData.newY - toolData.y));
            ctx.strokeRect(Math.min(toolData.newX, toolData.x), Math.min(toolData.newY, toolData.y), Math.abs(toolData.newX - toolData.x), Math.abs(toolData.newY - toolData.y));
            ctx.stroke();
            ctx.closePath();
        } else if (toolData.snapVertex instanceof Vertex) {
            Tool.renderVertexSnapLines(ctx, toolData.snapVertex, graphData.viewport, graphData.snapAngle, graphData.snapDistance);
        }
    }
}