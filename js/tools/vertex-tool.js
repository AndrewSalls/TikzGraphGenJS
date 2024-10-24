import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Vertex from "../graph-data/vertex.js";
import { GraphSession, RENDER_SETTINGS } from "../graph-session.js";
import { makeEdit } from "../history/history.js";
import { MutationEdit } from "../history/mutation-edit.js";
import { MouseInteraction } from "../mouse-interaction.js";
import { Tool } from "./tool.js";

let VERTEX_TOOL;

/**
 * Provides access to the vertex tool.
 * @returns {Tool} The vertex tool.
 */
export default function accessVertexTool() { 
    if(VERTEX_TOOL === undefined) {
        VERTEX_TOOL = new Tool("vertex", onDown, onMove, onUp, initializeData, clearData, onPaint);
    }

    return VERTEX_TOOL;
}

/**
 * The callback used when pressing down on a mouse button.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onDown(mouse, graphData, toolData) {
    const clickVertex = graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY, GRAPH_DATATYPE.VERTEX);

    if(clickVertex instanceof Vertex) {
        toolData.vertex = clickVertex;
        toolData.originX = toolData.vertex.x;
        toolData.originY = toolData.vertex.y;
        toolData.dragging = true;
        toolData.snapVertex = null;
        toolData.displayVertex.opacity = 0;
        graphData.clearSelected();
        graphData.select(toolData.vertex);
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
    let pos = {
        x: mouse.shiftedX,
        y: mouse.shiftedY
    }
    toolData.snapVertex = null;

    if(graphData.snapGrid) {
        pos = MouseInteraction.snapToGrid(mouse.shiftedX, mouse.shiftedY);
    } else if(graphData.snapAngle || graphData.snapDistance) {
        const closest = graphData.getClosestVertex(mouse.shiftedX, mouse.shiftedY, RENDER_SETTINGS.VERTEX_SNAP_MAX_RANGE, !toolData.dragging);
        toolData.snapVertex = closest;

        if(closest !== null) {
            pos = MouseInteraction.snapToVertex(mouse.shiftedX, mouse.shiftedY, closest, graphData.snapAngle, graphData.snapDistance);
        }
    }

    if(toolData.dragging && !mouse.exitedBounds) {
        toolData.vertex.x = pos.x;
        toolData.vertex.y = pos.y;
    } else if(!toolData.dragging) {
        toolData.displayVertex.x = pos.x;
        toolData.displayVertex.y = pos.y;
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
    if(toolData.dragging) {
        makeEdit(new MutationEdit(toolData.vertex,
            { x: toolData.originX, y: toolData.originY },
            { x: toolData.vertex.x, y: toolData.vertex.y }));
        
        graphData.clearSelected();
        graphData.select(toolData.vertex);
        toolData.displayVertex.opacity = RENDER_SETTINGS.VERTEX_PREVIEW_OPACITY;
        toolData.dragging = false;
    } else {
        if(!mouse.exitedBounds) {
            let created;
            if(graphData.snapGrid) {
                const snap = MouseInteraction.snapToGrid(mouse.shiftedX, mouse.shiftedY);
                created = new Vertex(snap.x, snap.y);
            } else if(graphData.snapAngle || graphData.snapDistance) {
                const closest = graphData.getClosestVertex(mouse.shiftedX, mouse.shiftedY, RENDER_SETTINGS.VERTEX_SNAP_MAX_RANGE);
        
                if(closest !== null) {
                    const snap = MouseInteraction.snapToVertex(mouse.shiftedX, mouse.shiftedY, closest, graphData.snapAngle, graphData.snapDistance);
                    created = new Vertex(snap.x, snap.y);
                } else {
                    created = new Vertex(mouse.shiftedX, mouse.shiftedY);
                }
            } else {
                created = new Vertex(mouse.shiftedX, mouse.shiftedY);
            }
            makeEdit(graphData.addVertex(created));
            graphData.clearSelected();
            graphData.select(created);
        }
    }

    return toolData;
}

/**
 * Initializes the tool data, for when the tool has a constantly active effect (that doesn't rely on clicking)
 * @param {GraphSession} graphData The graph data that the tool will be interacting with.
 */
function initializeData(graphData) {
    const offScreen = graphData.viewport.canvasToViewport(-10000, 0); // Don't make vertices large enough that this would cause problems
    const output = {
        displayVertex: new Vertex(offScreen.x, offScreen.y, true),
        dragging: false,
        snapVertex: null
    };
    output.displayVertex.opacity = RENDER_SETTINGS.VERTEX_PREVIEW_OPACITY;
    graphData.addVertex(output.displayVertex);

    return output;
}

/**
 * Clears the current tool data, making sure to clean up any dummy data from the graph data as well.
 * @param {GraphSession} graphData The graph data that the tool (potentially) modified with dummy data.
 * @param {Object|null} toolData The local data this tool is currently using.
 */
function clearData(graphData, toolData) {
    graphData.removeVertex(toolData.displayVertex);
}

/**
 * The callback used when this tool is selected and a paint event is called on the canvas.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {*} toolData Temporary data storage for this tool.
 * @param {CanvasRenderingContext2D} ctx The context of the canvas to be drawn on.
 */
function onPaint(graphData, toolData, ctx) {
    if((graphData.snapAngle || graphData.snapDistance) && toolData.snapVertex !== null) {
        Tool.renderVertexSnapLines(ctx, toolData.snapVertex, graphData.viewport, graphData.snapAngle, graphData.snapDistance);
    }
}