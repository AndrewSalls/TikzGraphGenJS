class Vertex {
    constructor(mouseX, mouseY) {
        this.x = mouseX;
        this.y = mouseY;
        this.shape = "circle";
        this.scale = 20;
        this.color = "#000000";
        this.fill = "transparent";
    }

    render(ctx) {
        //TODO: support other shapes
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.scale, 0, 2 * Math.PI);
        ctx.fillStyle = this.fill;
        ctx.fill();
        ctx.strokeStyle = this.color;
        ctx.stroke();
    }
}

class Edge {

}

class EdgeCap {

}

class Label {

}

export { Vertex, Edge, EdgeCap, Label }