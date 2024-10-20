import Edge from "../graph-data/edge.js";
import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Vertex from "../graph-data/vertex.js";
import { Edit, EDIT_TYPE, makeEdit } from "../history.js";
import { Tool } from "./tool.js";

let SPLIT_TOOL;

/**
 * Provides access to the split tool.
 * @returns {Tool} The split tool.
 */
export default function accessSplitTool() { 
    if(SPLIT_TOOL === undefined) {
        SPLIT_TOOL = new Tool("split", onDown, onMove, onUp, clearData, onPaint);
    }

    return SPLIT_TOOL;
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
    return null;
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
    return null;
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
    const clickedEdge = graphData.getClickedObject(mouse.x, mouse.y, GRAPH_DATATYPE.EDGE);
    if(clickedEdge instanceof Edge) {
        const closestPoint = clickedEdge.closestPoint(mouse.x, mouse.y);
        const addedVertex = new Vertex(closestPoint.x, closestPoint.y);
        const addedEdge1 = new Edge(clickedEdge.start, addedVertex);
        const addedEdge2 = new Edge(clickedEdge.end, addedVertex);

        clickedEdge.start.disconnect(clickedEdge);
        clickedEdge.end.disconnect(clickedEdge);

        graphData.edges.splice(graphData.edges.indexOf(clickedEdge), 1);
        graphData.vertices.push(addedVertex);
        graphData.edges.push(addedEdge1);
        graphData.edges.push(addedEdge2);

        makeEdit(new Edit(EDIT_TYPE.COMPOSITE, [
            new Edit(EDIT_TYPE.REMOVE, clickedEdge),
            new Edit(EDIT_TYPE.ADD, addedVertex),
            new Edit(EDIT_TYPE.ADD, addedEdge1),
            new Edit(EDIT_TYPE.ADD, addedEdge2)
        ]));
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

const onPaint = undefined;