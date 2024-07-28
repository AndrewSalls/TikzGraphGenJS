import * as GraphObject from "./graph-data.js";

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
        toolData = graphData.getClickedObject(mouse.x, mouse.y, "vertex");
    },
    (mouse, graphData) => {
        if(toolData instanceof GraphObject.Vertex) {
            toolData.x = mouse.x;
            toolData.y = mouse.y;
        }
    },
    (mouse, graphData) => {
        if(toolData !== null) {
            toolData = null;
        } else {
            graphData.vertices.push(new GraphObject.Vertex(mouse.x, mouse.y));
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