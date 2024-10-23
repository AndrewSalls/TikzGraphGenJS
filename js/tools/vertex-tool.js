import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Vertex from "../graph-data/vertex.js";
import { GraphSession } from "../graph-session.js";
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
        VERTEX_TOOL = new Tool("vertex", onDown, onMove, onUp, clearData, onPaint);
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
    toolData = {
        vertex: graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY, GRAPH_DATATYPE.VERTEX),
    };
    if(toolData.vertex instanceof Vertex) {
        toolData.originX = toolData.vertex.x;
        toolData.originY = toolData.vertex.y;
        graphData.clearSelected();
        graphData.select(toolData.vertex);
    } else {
        toolData = null;
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
    if(toolData !== null && !mouse.exitedBounds) {
        toolData.vertex.x = mouse.shiftedX;
        toolData.vertex.y = mouse.shiftedY;
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
        makeEdit(new MutationEdit(toolData.vertex,
            { x: toolData.originX, y: toolData.originY },
            { x: toolData.vertex.x, y: toolData.vertex.y }));
        
        graphData.clearSelected();
        graphData.select(toolData.vertex);
        toolData = null;
    } else {
        if(!mouse.exitedBounds) {
            const created = new Vertex(mouse.shiftedX, mouse.shiftedY);
            makeEdit(graphData.addVertex(created));
            graphData.clearSelected();
            graphData.select(created);
        }
    }

    return toolData;
}

const clearData = undefined;
const onPaint = undefined;