import { GRAPH_DATATYPE, GraphObject } from "../graph-data/graph-object.js";
import { GraphSession, MouseInteraction, RENDER_SETTINGS } from "../graph-session.js";
import { Edit, EDIT_TYPE, makeEdit } from "../history.js";
import { Tool } from "./tool.js";

let ERASER_TOOL;
const SWITCH_TO_DRAG_ERASE = 5; // Size of a "bubble" around starting erase position before switching to dragging eraser (default just erases where initial click is)
const ERASER_WIDTH = 20; // Area of eraser

/**
 * Provides access to the edge tool.
 * @returns {Tool} The edge tool.
 */
export default function accessEraserTool() {
    if(ERASER_TOOL === undefined) {
        ERASER_TOOL = new Tool("eraser", onDown, onMove, onUp, clearData, onPaint);
    }

    return ERASER_TOOL;
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
        x: mouse.x,
        y: mouse.y,
        vertices: [],
        edges: [],
        dragging: false
    };

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
    if(toolData !== null && !toolData.dragging) {
        const deltaX = mouse.x - toolData.x;
        const deltaY = mouse.y - toolData.y;
        
        if(Math.sqrt(deltaX * deltaX + deltaY + deltaY) >= SWITCH_TO_DRAG_ERASE) {
            toolData.dragging = true;
        }
    }

    if(toolData !== null && toolData.dragging) {
        toolData.currX = mouse.x; // For drawing eraser selection area
        toolData.currY = mouse.y;

        const clicked = graphData.getClickedObjectsInRange(mouse.x, mouse.y, ERASER_WIDTH);
        appendAndEraseData(clicked, graphData, toolData);
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
        if(!toolData.dragging) {
            const clicked = graphData.getClickedObjectsInRange(mouse.x, mouse.y, ERASER_WIDTH);
            appendAndEraseData(clicked, graphData, toolData);
        }

        createErasedHistory(toolData);
    }
    
    return null;
}

export function eraseSelected(graphData, selectedData) {
    const toolData = {
        vertices: [],
        edges: []
    };

    appendAndEraseData(selectedData, graphData, toolData);
    createErasedHistory(toolData);

}

/**
 * Clears the current tool data, making sure to clean up any dummy data from the graph data as well.
 * @param {GraphSession} graphData The graph data that the tool (potentially) modified with dummy data.
 * @param {Object|null} toolData The local data this tool is currently using.
 */
function clearData(graphData, toolData) {
    if(toolData !== null && toolData.dragging) {
        createErasedHistory(toolData);
    }
}

/**
 * The callback used when this tool is selected and a paint event is called on the canvas.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {*} toolData Temporary data storage for this tool.
 * @param {CanvasRenderingContext2D} ctx The context of the canvas to be drawn on.
 */
function onPaint(graphData, toolData, ctx) {
    if(toolData !== null && toolData.dragging) {
        ctx.beginPath();
        ctx.fillStyle = RENDER_SETTINGS.ERASE_MAIN;
        ctx.lineWidth = RENDER_SETTINGS.ERASE_BORDER_WIDTH;
        ctx.strokeStyle = RENDER_SETTINGS.ERASE_BORDER;
        ctx.ellipse(toolData.currX, toolData.currY, ERASER_WIDTH, ERASER_WIDTH, 0, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    }
}

/**
 * Attaches the selected data to the tool data to be erased once the current erase action is completed or interrupted.
 * @param {GraphObject[]} data the selected data. 
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {*} toolData Temporary data storage for this tool.
 */
function appendAndEraseData(data, graphData, toolData) {
    if(data.length === 0) {
        return;
    }

    const erasedVertices = new Set();
    const erasedEdges = new Set();

    for(let x = 0; x < data.length; x++) {
        switch(data[x].giveType()) {
            case GRAPH_DATATYPE.VERTEX:
                if(!erasedVertices.has(data[x])) {
                    toolData.vertices.push(data[x]);
                    erasedVertices.add(data[x]);

                    for(const edge of data[x].disconnectAll()) {
                        data.push(edge);
                    }
                }
                break;
            case GRAPH_DATATYPE.EDGE:
                if(!erasedEdges.has(data[x])) {
                    toolData.edges.push(data[x]);
                    erasedEdges.add(data[x]);
                    data[x].start.disconnect(data[x]);
                    data[x].end.disconnect(data[x]);
                }
                break;
            default:
                console.error("appendErasedData not implemented for type " + data[x].giveType());
                return;
        }
    }
    
    // Edge cap / label -> edges -> vertices
    graphData.edges = graphData.edges.filter(x => !erasedEdges.has(x));
    graphData.vertices = graphData.vertices.filter(x => !erasedVertices.has(x));
}

/**
 * Logs the erased data as a single composite edit in history.
 * @param {*} toolData Temporary data storage for this tool.
 */
function createErasedHistory(toolData) {
    // Edge cap / label -> edges -> vertices
    const editList = [];

    for(const entry of toolData.edges) {
        editList.push(new Edit(EDIT_TYPE.REMOVE, entry));
    }

    for(const entry of toolData.vertices) {
        editList.push(new Edit(EDIT_TYPE.REMOVE, entry));
    }

    if(editList.length > 0) {
        if(editList.length === 1) {
            makeEdit(editList[0]);
        } else {
            makeEdit(new Edit(EDIT_TYPE.COMPOSITE, editList));
        }
    }
}