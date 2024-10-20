import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Vertex from "../graph-data/vertex.js";
import { Edit, EDIT_TYPE, makeEdit } from "../history.js";
import { Tool } from "./tool.js";

let MERGE_TOOL;

/**
 * Provides access to the merge tool.
 * @returns {Tool} The merge tool.
 */
export default function accessMergeTool() { 
    if(MERGE_TOOL === undefined) {
        MERGE_TOOL = new Tool("merge", onDown, onMove, onUp, clearData, onPaint);
    }

    return MERGE_TOOL;
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
    const clickedVertex = graphData.getClickedObject(mouse.x, mouse.y, GRAPH_DATATYPE.VERTEX);

    if(clickedVertex instanceof Vertex) {
        if(selectedData.has(clickedVertex)) {
            const merging = [...selectedData].filter(v => v instanceof Vertex && v !== clickedVertex);

            const editList = [];
            for(const vertex of merging) {
                for(const connectedEdge of vertex.adjacent) {
                    if(connectedEdge.start === vertex) {
                        connectedEdge.start = clickedVertex;
                        editList.push(new Edit(EDIT_TYPE.MUTATION, {
                            type: GRAPH_DATATYPE.EDGE,
                            id: connectedEdge.id,
                            originalValues: { start: vertex },
                            modifiedValues: { start: clickedVertex }
                        }));
                    } else { // connectedEdge.end === vertex
                        connectedEdge.end = clickedVertex;
                        editList.push(new Edit(EDIT_TYPE.MUTATION, {
                            type: GRAPH_DATATYPE.EDGE,
                            id: connectedEdge.id,
                            originalValues: { end: vertex },
                            modifiedValues: { end: clickedVertex }
                        }));
                    }
                }

                graphData.vertices.splice(graphData.vertices.indexOf(vertex), 1);
                selectedData.delete(vertex);
                editList.push(new Edit(EDIT_TYPE.REMOVE, vertex));
            }

            // Create composite edit, vertex deletion edit, or no edit
            if(editList.length > 0) {
                if(editList.length === 1) {
                    makeEdit(editList[0]);
                } else {
                    makeEdit(new Edit(EDIT_TYPE.COMPOSITE, editList));
                }
            }
        } else {
            selectedData.add(clickedVertex);
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

const onPaint = undefined;