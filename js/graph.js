import { toolList, toolData } from "./tools.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("render");
    const ctx = canvas.getContext("2d");

    class GraphData {
        constructor() {
            this.vertices = [];
            this.edges = [];
        }
    
        getClickedObject(mouseX, mouseY) {
            let x = this.vertices.length - 1, y = this.edges.length - 1;
            while(x >= 0 && y >= 0) {
                if(this.vertices[x].id >= this.edges[y].id) {
                    if(this.vertices[x].intersects(mouseX, mouseY)) {
                        return this.vertices[x];
                    }
                    x = x - 1;
                } else {
                    if(this.edges[y].intersectsOrNear(mouseX, mouseY)) {
                        return this.edges[y];
                    }
                    y = y - 1;
                }
            }

            while(x >= 0) {
                if(this.vertices[x].intersects(mouseX, mouseY)) {
                    return this.vertices[x];
                }
                x = x - 1;
            }
            while(y >= 0) {
                if(this.edges[y].intersectsOrNear(mouseX, mouseY)) {
                    return this.edges[y];
                }
                y = y - 1;
            }

            return null;
        }
    
        drawGraph() {
            ctx.clearRect(0,0,canvas.width,canvas.height);

            for(let vertex of this.vertices) {
                vertex.render(ctx);
            }
    
            for(let edge of this.edges) {
                edge.render(ctx);
            }
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
            toolData = null; // Clear data on tool switch to avoid weird cross-tool errors
        })
    }

    canvas.addEventListener("mousedown", ev => {
        toolList.get(tool).onDown(ev, graphData);
    });
    canvas.addEventListener("mousemove", ev => {
        toolList.get(tool).onMove(ev, graphData);
    })
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