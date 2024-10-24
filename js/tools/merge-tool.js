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
        MERGE_TOOL = new Tool("merge", onDown, onMove, onUp, initializeData, clearData, onPaint);
    }

    return MERGE_TOOL;
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
    const clickedVertex = graphData.getClickedObject(mouse.shiftedX, mouse.shiftedY, GRAPH_DATATYPE.VERTEX);

    if(clickedVertex instanceof Vertex) {
        if(graphData.isSelected(clickedVertex)) {
            const merging = graphData.selectedVertices;

            const editList = [];
            for(const vertex of merging) {
                if(vertex === clickedVertex) { // merges all vertices into clicked vertex, so that one is not effected
                    continue;
                }

                for(const connectedEdge of vertex.adjacent) {
                    if(connectedEdge.start === clickedVertex || connectedEdge.end === clickedVertex) {
                        // TODO: Create loop instead of deleting edge
                        graphData.deselect(connectedEdge);
                        editList.push(graphData.removeEdge(connectedEdge));
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

                graphData.deselect(vertex);
                editList.push(graphData.removeVertex(vertex));
            }

            // Create composite edit, vertex deletion edit, or no edit
            if(editList.length === 1) {
                makeEdit(editList[0]);
            } else if(editList.length > 1) {
                makeEdit(new CompositeEdit(editList));
            }
        } else {
            graphData.select(clickedVertex);
        }
    }

    return null;
}

const initializeData = undefined;
const clearData = undefined;
const onPaint = undefined;