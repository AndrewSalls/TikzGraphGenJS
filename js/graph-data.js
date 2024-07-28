let increment = Number.MIN_SAFE_INTEGER; // id system, has 2^53 possible values before collision occurs, so don't do that

class Vertex {
    constructor(mouseX, mouseY, dummy = false) {
        this.x = mouseX;
        this.y = mouseY;
        this.shape = "circle";
        this.scale = 20;
        this.borderScale = 2;
        this.color = "#000000";
        this.fill = "transparent";

        if(!dummy) {
            this.id = increment;
            increment = increment + 1;
        } else {
            this.id = "dummy";
        }
    }

    render(ctx) {
        //TODO: support other shapes
        ctx.beginPath();
        ctx.lineWidth = this.borderScale;
        ctx.strokeStyle = this.color;
        ctx.fillStyle = this.fill;

        ctx.arc(this.x, this.y, this.scale, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }

    intersects(mouseX, mouseY) {
        if(this.id === "dummy") {
            return false;
        }

        switch(this.shape) {
            case "circle":
                // Scale in this case is the radius
                return Math.sqrt(Math.pow(mouseX - this.x, 2) + Math.pow(mouseY - this.y, 2)) <= (this.scale + this.borderScale) / 2;
            default:
                console.error("Intersection not implemented for shape " + this.shape);
        }
    }

    borderPoint(angle) {
        switch(this.shape) {
            case "circle":
                return { x: this.x + this.scale * Math.cos(angle), y: this.y + this.scale * Math.sin(angle) };
            default:
                console.error("Border calculation not implemented for shape " + this.shape);
        }
    }
}

class Edge {
    constructor(vertexStart, vertexEnd, dummy = false) {
        this.start = vertexStart;
        this.end = vertexEnd;

        this.scale = 3;
        this.color = "#000000";

        if(!dummy) {
            this.id = increment;
            increment = increment + 1;
        } else {
            this.id = "dummy";
        }
    }

    render(ctx) {
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.scale;

        
        // TODO: Probably want to change to drawing to center and using clip path, easier than complex fill operations
        const angle = Math.atan2(this.end.y - this.start.y, this.end.x - this.start.x);
        const startPos = this.start.borderPoint(angle);
        const endPos = this.end.borderPoint(angle + Math.PI);

        ctx.moveTo(startPos.x, startPos.y);
        ctx.lineTo(endPos.x, endPos.y);
        ctx.stroke();
    }

    intersectsOrNear(mouseX, mouseY) {
        if(this.id === "dummy") {
            return false;
        }
        
        return false; //TODO
    }
}

class EdgeCap {

}

class Label {

}

export { Vertex, Edge, EdgeCap, Label }