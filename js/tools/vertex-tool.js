import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Vertex from "../graph-data/vertex.js";
import { Edit, EDIT_TYPE, makeEdit } from "../history.js";
import { Tool } from "./tool.js";

let VERTEX_TOOL;

/**
 * Provides access to the vertex tool.
 * @returns {Tool} The vertex tool.
 */
export default function accessVertexTool() { 
    if(VERTEX_TOOL === undefined) {
        VERTEX_TOOL = new Tool("vertex", onDown, onMove, onUp, onPaint);
    }

    return VERTEX_TOOL;
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
        vertex: graphData.getClickedObject(mouse.x, mouse.y, GRAPH_DATATYPE.VERTEX),
    };
    if(toolData.vertex instanceof Vertex) {
        toolData.originX = toolData.vertex.x;
        toolData.originY = toolData.vertex.y;
        selectedData.clear();
        selectedData.add(toolData.vertex);
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
        toolData.vertex.x = mouse.x;
        toolData.vertex.y = mouse.y;
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
        makeEdit(new Edit(EDIT_TYPE.MUTATION, {
            type: "Vertex",
            id: toolData.vertex.id,
            originalValues: { x: toolData.originX, y: toolData.originY },
            modifiedValues: { x: toolData.vertex.x, y: toolData.vertex.y }
        }));
        
        selectedData.clear();
        selectedData.add(toolData.vertex);
        toolData = null;
    } else {
        const created = new Vertex(mouse.x, mouse.y);
        graphData.vertices.push(created);
        makeEdit(new Edit(EDIT_TYPE.ADD, created));
        selectedData.clear();
        selectedData.add(created);
    }

    return toolData;
}

const onPaint = undefined;