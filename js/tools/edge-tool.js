import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Edge from "../graph-data/edge.js";
import Vertex, { VERTEX_SHAPE } from "../graph-data/vertex.js";
import { GraphSession } from "../graph-session.js";
import { makeEdit } from "../history/history.js";
import { InsertionEdit } from "../history/entry-edit.js";
import { Tool } from "./tool.js";
import { MouseInteraction } from "../mouse-interaction.js";

let EDGE_TOOL;

/**
 * Provides access to the edge tool.
 * @returns {Tool} The edge tool.
 */
export default function accessEdgeTool() {
    if(EDGE_TOOL === undefined) {
        EDGE_TOOL = new Tool("edge", onDown, onMove, onUp, clearData, onPaint);
    }

    return EDGE_TOOL;
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
    toolData = { startPos: graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY, GRAPH_DATATYPE.VERTEX)};
        
    if(toolData.startPos !== null) {
        toolData.cursorVertex = new Vertex(mouse.shiftedX, mouse.shiftedY, true);
        toolData.cursorVertex.shape = VERTEX_SHAPE.CIRCLE;
        toolData.cursorVertex.scale = 0;
        toolData.cursorVertex.borderScale = 0;
        toolData.cursorVertex.fill = "transparent";
        toolData.cursorVertex.color = "transparent";
        
        graphData.vertices.push(toolData.cursorVertex);
        toolData.tempEdge = new Edge(toolData.startPos, toolData.cursorVertex);
        graphData.edges.push(toolData.tempEdge);
    } else {
        toolData = null;
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
    if(toolData !== null) {
        toolData.cursorVertex.x = mouse.shiftedX;
        toolData.cursorVertex.y = mouse.shiftedY;
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
        const selectedEnd = graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY, GRAPH_DATATYPE.VERTEX);
        if(selectedEnd !== null) {
            if(selectedEnd === toolData.startPos) {
                // TODO: Create loop instead of cancelling edge creation
                graphData.edges.pop();
                selectedData.clear();
            } else {
                toolData.tempEdge.end = selectedEnd;
                selectedEnd.connect(toolData.tempEdge);
                makeEdit(new InsertionEdit(toolData.tempEdge));
                
                selectedData.clear();
                selectedData.add(toolData.tempEdge);
            }
        } else {
            graphData.edges.pop();
            selectedData.clear();
        }
        
        graphData.vertices.pop();
        toolData = null;
    } else {
        selectedData.clear();
    }

    return toolData;
}

/**
 * Clears the current tool data, making sure to clean up any dummy data from the graph data as well.
 * @param {GraphSession} graphData The graph data that the tool (potentially) modified with dummy data.
 * @param {Object|null} toolData The local data this tool is currently using.
 */
function clearData(graphData, toolData) {
    if(toolData !== null) {
        if('cursorVertex' in toolData) {
            graphData.vertices.pop();
        }
        if('tempEdge' in toolData) {
            graphData.edges.pop();
        }
    }
}

const onPaint = undefined;