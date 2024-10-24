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
    if(graphData.snapGrid) {
        pos = MouseInteraction.snapToGrid(mouse.shiftedX, mouse.shiftedY);
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
    const output = {
        displayVertex: new Vertex(0, 0, true),
        dragging: false
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

const onPaint = undefined;