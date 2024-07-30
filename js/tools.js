import * as GraphObject from "./graph-data.js";
import { Edit, makeEdit } from "./history.js";

class Tool {
    constructor(name, downEv, moveEv, upEv) {
        this.name = name;
        this.onDown = downEv;
        this.onMove = moveEv;
        this.onUp = upEv;
    }
}

let toolList = new Map();
let toolData = null;

function clearData(graphData) {
    if(toolData === null) {
        return;
    }

    if('cursorVertex' in toolData) {
        graphData.vertices.pop();
    }
    if('tempEdge' in toolData) {
        graphData.edges.pop();
    }

    toolData = null;
};

toolList.set("vertex", new Tool("vertex", 
    (mouse, graphData) => {
        toolData = {
            vertex: graphData.getClickedObject(mouse.x, mouse.y, "vertex"),
        };
        if(toolData.vertex instanceof GraphObject.Vertex) {
            toolData.originX = toolData.vertex.x;
            toolData.originY = toolData.vertex.y;
        } else {
            toolData = null;
        }
    },
    (mouse, graphData) => {
        if(toolData !== null) {
            toolData.vertex.x = mouse.x;
            toolData.vertex.y = mouse.y;
        }
    },
    (mouse, graphData) => {
        if(toolData !== null) {
            makeEdit(new Edit("mutation", {
                type: "Vertex",
                id: toolData.vertex.id,
                originalValues: { x: toolData.originX, y: toolData.originY },
                modifiedValues: { x: toolData.vertex.x, y: toolData.vertex.y }
            }));
            toolData = null;
        } else {
            const created = new GraphObject.Vertex(mouse.x, mouse.y);
            graphData.vertices.push(created);
            makeEdit(new Edit("add", created));
        }
    }
));

toolList.set("edge", new Tool("edge",
    (mouse, graphData) => {
        toolData = { startPos: graphData.getClickedObject(mouse.x, mouse.y, "vertex")};

        if(toolData.startPos !== null) {
            toolData.cursorVertex = new GraphObject.Vertex(mouse.x, mouse.y, true);
            toolData.cursorVertex.shape = "circle";
            toolData.cursorVertex.scale = 0;
            toolData.cursorVertex.borderScale = 0;
            toolData.cursorVertex.fill = "transparent";
            toolData.cursorVertex.color = "transparent";
            
            graphData.vertices.push(toolData.cursorVertex);
            toolData.tempEdge = new GraphObject.Edge(toolData.startPos, toolData.cursorVertex);
            graphData.edges.push(toolData.tempEdge);
        } else {
            toolData = null;
        }
    },
    (mouse, graphData) => {
        if(toolData !== null) {
            toolData.cursorVertex.x = mouse.x;
            toolData.cursorVertex.y = mouse.y;
        }
    },
    (mouse, graphData) => {
        if(toolData !== null) {
            const selectedEnd = graphData.getClickedObject(mouse.x, mouse.y, "vertex");
            if(selectedEnd !== null) {
                toolData.tempEdge.end = selectedEnd;
                makeEdit(new Edit("add", toolData.tempEdge));
                //TODO: Show curve handlebars to make it easier to edit
            } else {
                graphData.edges.pop();
            }
            graphData.vertices.pop();
            toolData = null;
        }
    }
));

export { toolList, clearData };