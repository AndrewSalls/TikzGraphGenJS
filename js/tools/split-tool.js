import Edge from "../graph-data/edge.js";
import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Vertex from "../graph-data/vertex.js";
import { GraphSession } from "../graph-session.js";
import { CompositeEdit } from "../history/composite-edit.js";
import { makeEdit } from "../history/history.js";
import { MouseInteraction } from "../mouse-interaction.js";
import { Tool } from "./tool.js";

let SPLIT_TOOL;

/**
 * Provides access to the split tool.
 * @returns {Tool} The split tool.
 */
export default function accessSplitTool() { 
    if(SPLIT_TOOL === undefined) {
        SPLIT_TOOL = new Tool("split", onDown, onMove, onUp, initializeData, clearData, onPaint);
    }

    return SPLIT_TOOL;
}

/**
 * The callback used when pressing down on a mouse button.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onDown(mouse, graphData, toolData) {
    return null;
}

/**
 * The callback used when moving the mouse, regardless of if a button is pressed or not.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onMove(mouse, graphData, toolData) {
    return null;
}

/**
 * The callback used when a mouse button stops being pressed.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onUp(mouse, graphData, toolData) {
    const clickedEdge = graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY, GRAPH_DATATYPE.EDGE);
    if(clickedEdge instanceof Edge) {
        const closestPoint = clickedEdge.closestPoint(mouse.shiftedX, mouse.shiftedY);
        const addedVertex = new Vertex(closestPoint.x, closestPoint.y);
        const addedEdge1 = new Edge(clickedEdge.start, addedVertex);
        const addedEdge2 = new Edge(clickedEdge.end, addedVertex);

        if(graphData.isSelected(clickedEdge)) {
            graphData.deselect(clickedEdge);
            graphData.select(clickedEdge);
            graphData.select(addedEdge1);
            graphData.select(addedEdge2);
        }

        makeEdit(new CompositeEdit([
            graphData.removeEdge(clickedEdge),
            graphData.addVertex(addedVertex),
            graphData.addEdge(addedEdge1),
            graphData.addEdge(addedEdge2)
        ]));
    }

    return null;
}

const initializeData = undefined;
const clearData = undefined;
const onPaint = undefined;