import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Edge from "../graph-data/edge.js";
import Vertex from "../graph-data/vertex.js";
import { GraphSession, MouseInteraction } from "../graph-session.js";
import { Edit, EDIT_TYPE, makeEdit } from "../history.js";
import { Tool } from "./tool.js";

let EDGE_TOOL;

/**
 * Provides access to the edge tool.
 * @returns {Tool} The edge tool.
 */
export default function accessEdgeTool() {
    if(EDGE_TOOL === undefined) {
        EDGE_TOOL = new Tool("edge", onDown, onMove, onUp, onPaint);
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
    toolData = { startPos: graphData.getClickedObject(mouse.x, mouse.y, GRAPH_DATATYPE.VERTEX)};
        
    if(toolData.startPos !== null) {
        toolData.cursorVertex = new Vertex(mouse.x, mouse.y, true);
        toolData.cursorVertex.shape = "circle";
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
        toolData.cursorVertex.x = mouse.x;
        toolData.cursorVertex.y = mouse.y;
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
        const selectedEnd = graphData.getClickedObject(mouse.x, mouse.y, GRAPH_DATATYPE.VERTEX);
        if(selectedEnd !== null) {
            toolData.tempEdge.end = selectedEnd;
            makeEdit(new Edit(EDIT_TYPE.ADD, toolData.tempEdge));
            selectedData.clear();
            selectedData.add(toolData.tempEdge);
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

const onPaint = undefined;