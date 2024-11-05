import { GraphSession, RENDER_SETTINGS } from "../graph-session/graph-session.js";
import { MouseInteraction } from "../mouse-interaction.js";
import { GraphViewport } from "../graph-session/graph-viewport.js";

/**
 * An enum containing the list of valid tool types.
 * @enum
 * @readonly
 */
export const TOOL_TYPE = {
    VERTEX: 0,
    EDGE: 1,
    SELECT: 4,
    LASSO: 5,
    ERASER: 7,
    SPLIT: 8,
    MERGE: 9,
}

/**
 * Data associated with a generic tool.
 */
export class Tool {
    /**
     * Creates a tool.
     * @param {String} name The name of the tool.
     * @param {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} downEv the event called when the user starts holding a mouse button on the graph.
     * @param {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} moveEv the event called when the user moves their mouse on the graph, regardless of if they clicked or not.
     * @param {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} upEv the event called when the user releases a mouse button on the graph.
     * @param {(graphData: GraphSession) => Object|null} initializeData the event called when this tool is made the active tool. 
     * @param {(graphData: GraphSession, toolData: Object|null)} clearData the event called when the tool is switched to another tool, used to clean up hanging data.
     * @param {(graphData: GraphSession, toolData: Object|null, CanvasRenderingContext2D ctx)} paintEv the event called when the canvas refreshes, called after all other paint effects.
     * @param {Boolean} acceptAllClicks Whether this tool should respond to all click events or only left click events.
     */
    constructor(name, downEv, moveEv, upEv, initializeData, clearData, paintEv = undefined, acceptAllClicks = false) {
        /** @type {String} */
        this.name = name;
        /** @type {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} */
        this.onDown = downEv;
        /** @type {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} */
        this.onMove = moveEv;
        /** @type {(mouseData: MouseInteraction, graphData: GraphSession, toolData: Object|null) => Object|null} */
        this.onUp = upEv;
        /** @type {(graphData: GraphSession) => Object|null} */
        this.initializeData = initializeData;
        /** @type {(graphData: GraphSession, toolData: Object|null)} */
        this.clearData = clearData;
        /** @type {(graphData: GraphSession, toolData: Object|null, CanvasRenderingContext2D ctx)} */
        this.onPaint = paintEv;
        /** @type {Boolean} */
        this.acceptAllClicks = acceptAllClicks;
    }

    /**
     * Helper function used for tools to visually display the snap points of the vertex they are snapping to.
     * @param {CanvasRenderingContext2D} ctx the canvas context to draw on.
     * @param {Vertex} target The vertex that is being snapped to.
     * @param {GraphViewport} viewport The viewport that the vertex is drawn on.
     * @param {Boolean} angleSnap Whether to consider the closest angle when snapping. One of this and distanceSnap are assumed to be true.
     * @param {Boolean} distanceSnap Whether to consider the closest multiple of the distance constant when snapping. One of this and distanceSnap are assumed to be true.
     */
    static renderVertexSnapLines(ctx, target, viewport, angleSnap, distanceSnap) {
        const shiftedPos = viewport.viewportToCanvas(target.x, target.y);

        ctx.lineWidth = RENDER_SETTINGS.VERTEX_SNAP_LINE_WIDTH;
        ctx.strokeStyle = RENDER_SETTINGS.VERTEX_SNAP_LINE_COLOR;

        ctx.beginPath();
        if(angleSnap) {
            for(let angle = RENDER_SETTINGS.ANGLE_SNAP_OFFSET; angle <= RENDER_SETTINGS.ANGLE_SNAP_OFFSET + 360; angle += RENDER_SETTINGS.ANGLE_SNAP_DEGREE) {
                const angleRad = angle / 180 * Math.PI;
                let startPoint = target.borderPoint(angleRad);
                startPoint = viewport.viewportToCanvas(startPoint.x, startPoint.y);
                const borderDistance = Math.sqrt(Math.pow(startPoint.x - shiftedPos.x, 2) + Math.pow(startPoint.y - shiftedPos.y, 2));
                ctx.moveTo(startPoint.x, startPoint.y);
                ctx.lineTo(startPoint.x + Math.cos(angleRad) * (viewport.scale * RENDER_SETTINGS.VERTEX_SNAP_MAX_RANGE - borderDistance), startPoint.y + Math.sin(angleRad) * (viewport.scale * RENDER_SETTINGS.VERTEX_SNAP_MAX_RANGE - borderDistance));
            }
        }

        if(distanceSnap) {
            for(let distance = RENDER_SETTINGS.DISTANCE_SNAP_OFFSET; distance <= RENDER_SETTINGS.VERTEX_SNAP_MAX_RANGE; distance += RENDER_SETTINGS.DISTANCE_SNAP_SPACING) {
                ctx.moveTo(shiftedPos.x + viewport.scale * distance, shiftedPos.y);
                ctx.arc(shiftedPos.x, shiftedPos.y, viewport.scale * (distance - RENDER_SETTINGS.VERTEX_SNAP_LINE_WIDTH / 2), 0, 2 * Math.PI);
            }
        }
        ctx.stroke();
    }
};

