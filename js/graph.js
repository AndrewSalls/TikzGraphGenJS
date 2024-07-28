import toolList from "./tools.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("render");
    const ctx = canvas.getContext("2d");

    class GraphData {
        constructor() {
            this.vertices = [];
            this.edges = [];
        }
    
        getClickedObject(mouseX, mouseY) {
            // TODO
        }
    
        drawGraph() {
            ctx.clearRect(0,0,canvas.width,canvas.height);

            for(let vertex of this.vertices) {
                vertex.render(ctx);
            }
    
            // TODO also draw edges, edge caps, etc.

        }
    }
    
    let graphData = new GraphData();
    let tool = "vertex";
    
    const buttons = document.querySelectorAll("#tool-menu > *");
    for(const toolBtn of buttons) {
        if(toolBtn.title === tool) {
            toolBtn.classList.add("selected-tool");
        }

        toolBtn.addEventListener("click", () => {
            tool = toolBtn.title;
            for(const toolBtnMod of buttons) {
                toolBtnMod.classList.remove("selected-tool");
            }
            toolBtn.classList.add("selected-tool");
        })
    }

    canvas.addEventListener("mousedown", ev => {
        toolList.get(tool).onDown(ev, graphData);
    });
    canvas.addEventListener("mouseup", ev => {
        toolList.get(tool).onUp(ev, graphData);
    });
    canvas.addEventListener("resize", () => {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    });
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;

    setInterval(() => graphData.drawGraph(), 1000 / 30); // Refreshes 30 times per second
});