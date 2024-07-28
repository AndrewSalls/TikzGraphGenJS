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

function clearData() {
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
        toolData = graphData.getClickedObject(mouse.x, mouse.y, "vertex");
        //TODO: Show line from start point to mouse while dragging
    },
    (mouse, graphData) => {

    },
    (mouse, graphData) => {
        if(toolData === null) {
            return;
        }
        const selectedEnd = graphData.getClickedObject(mouse.x, mouse.y, "vertex");
        if(selectedEnd !== null) {
            graphData.edges.push(new GraphObject.Edge(toolData, selectedEnd));
        }
        //TODO: Show curve handlebars to make it easier to edit
    }
));

export { toolList, clearData };