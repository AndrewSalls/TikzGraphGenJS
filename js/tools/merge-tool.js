import { GRAPH_DATATYPE } from "../graph-data/graph-object.js";
import Vertex from "../graph-data/vertex.js";
import { GraphSession } from "../graph-session.js";
import { CompositeEdit } from "../history/composite-edit.js";
import { DeletionEdit } from "../history/entry-edit.js";
import { makeEdit } from "../history/history.js";
import { MutationEdit } from "../history/mutation-edit.js";
import { MouseInteraction } from "../mouse-interaction.js";
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
    const clickedVertex = graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY, GRAPH_DATATYPE.VERTEX);

    if(clickedVertex instanceof Vertex) {
        if(selectedData.has(clickedVertex)) {
            const merging = [...selectedData].filter(v => v instanceof Vertex && v !== clickedVertex);

            const editList = [];
            for(const vertex of merging) {
                for(const connectedEdge of vertex.adjacent) {
                    if(connectedEdge.start === clickedVertex || connectedEdge.end === clickedVertex) {
                        // TODO: Create loop instead of deleting edge
                        graphData.edges.splice(graphData.edges.indexOf(connectedEdge), 1);
                        connectedEdge.start.disconnect(connectedEdge);
                        connectedEdge.end.disconnect(connectedEdge);
                        if(selectedData.has(connectedEdge)) {
                            selectedData.delete(connectedEdge);
                        }
                        editList.push(new DeletionEdit(connectedEdge));
                    } else if(connectedEdge.start === vertex) {
                        connectedEdge.start = clickedVertex;
                        clickedVertex.connect(connectedEdge);
                        editList.push(new MutationEdit(connectedEdge, { start: vertex }));
                    } else { // connectedEdge.end === vertex
                        connectedEdge.end = clickedVertex;
                        clickedVertex.connect(connectedEdge);
                        editList.push(new MutationEdit(connectedEdge, { end: vertex }));
                    }
                }

                graphData.vertices.splice(graphData.vertices.indexOf(vertex), 1);
                vertex.disconnectAll();
                selectedData.delete(vertex);
                editList.push(new DeletionEdit(vertex));
            }

            // Create composite edit, vertex deletion edit, or no edit
            if(editList.length > 0) {
                if(editList.length === 1) {
                    makeEdit(editList[0]);
                } else {
                    makeEdit(new CompositeEdit(editList));
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