import * as GraphObject from "./graph-data.js";

class Tool {
    constructor(name, downEv, upEv) {
        this.name = name;
        this.onDown = downEv;
        this.onUp = upEv;
    }
}

let toolList = new Map();
let toolData = null;

toolList.set("vertex", new Tool("vertex", 
    (mouse, graphData) => {
    // Does nothing on mouse down for now,
    // TODO allow dragging only vertices
    },
    (mouse, graphData) => {

    },
    (mouse, graphData) => {
    // TODO stop dragging vertex once enabled
    //else 
    graphData.vertices.push(new GraphObject.Vertex(mouse.pageX - mouse.currentTarget.offsetLeft, mouse.pageY - mouse.currentTarget.offsetTop));
}));

toolList.set("edge", new Tool("edge",
    (mouse, graphData) => {
        toolData = graphData.getClickedObject(mouse.pageX - mouse.currentTarget.offsetLeft, mouse.pageY - mouse.currentTarget.offsetTop);
        //TODO: Show line from start point to mouse while dragging
    },
    (mouse, graphData) => {

    },
    (mouse, graphData) => {
        if(toolData === null) {
            return;
        }
        const selectedEnd = graphData.getClickedObject(mouse.pageX - mouse.currentTarget.offsetLeft, mouse.pageY - mouse.currentTarget.offsetTop);
        if(selectedEnd !== null) {
            graphData.edges.push(new GraphObject.Edge(toolData, selectedEnd));
        }
        //TODO: Show curve handlebars to make it easier to edit
}));

export default { toolList, toolData };