import * as GraphObject from "./graph-data.js";

class Tool {
    constructor(name, downEv, upEv) {
        this.name = name;
        this.onDown = downEv;
        this.onUp = upEv;
    }
}

let toolList = new Map();

toolList.set("vertex", new Tool("vertex", 
    (mouse, graphData) => {
    // Does nothing on mouse down for now,
    // TODO allow dragging only vertices
}, (mouse, graphData) => {
    // TODO stop dragging vertex once enabled
    //else 
    graphData.vertices.push(new GraphObject.Vertex(mouse.clientX, mouse.clientY));
}));

export default toolList;