import { RENDER_SETTINGS } from "./graph-session.js";

/**
 * An enum representing the type of click performed by a mouse. Multiple values can be set,
 * and ALT, SHIFT, and CTRL will always be set in addition to one of the click types.
 * 
 * Note that the first five options should be aligned to the options for {@link MouseEvent.buttons}.
 * @enum
 * @redonly
 */
export const MOUSE_CLICK_TYPE = {
    LEFT_CLICK: 1,
    RIGHT_CLICK: 2,
    MIDDLE_CLICK: 4,
    SIDE_BACK: 8,
    SIDE_FORWARD: 16,
    ALT_HELD: 32,
    SHIFT_HELD: 64,
    CTRL_HELD: 128
}

/**
 * An enum representing the possible ways the mouse can leave the canvas. WINDOW can be any direction, with the mouse leaving the entire window instead of just the canvas.
 * @enum
 * @redonly
 */
export const MOUSE_EXIT_BOUND_DIRECTION = {
    LEFT: 1,
    TOP: 2,
    RIGHT: 4,
    BOTTOM: 8,
    WINDOW: 16
}

/**
 * Contains the minimum amount of relevant information for tools interacting to a mouse event.
 */
export class MouseInteraction {
    /**
     * Defines a mouse interaction.
     * @param {Number} mouseX The x coordinate of the mouse interaction relative to the canvas element.
     * @param {Number} mouseY The y coordinate of the mouse interaction relative to the canvas element.
     * @param {Number} shiftedX The x coordinate of the mouse interaction relative to the viewport.
     * @param {Number} shiftedY The y coordinate of the mouse interaction relative to the viewport.
     * @param {MOUSE_CLICK_TYPE} clickType The type of click recorded.
     * @param {Boolean} exitedBounds Whether the mouse interaction was inside or outside of the canvas.
     */
    constructor(mouseX, mouseY, shiftedX, shiftedY, clickType, exitedBounds) {
        /** @type {Number} */
        this.x = mouseX;
        /** @type {Number} */
        this.y = mouseY;
        /** @type {Number} */
        this.shiftedX = shiftedX;
        /** @type {Number} */
        this.shiftedY = shiftedY;
        /** @type {MOUSE_CLICK_TYPE} */
        this.clickType = clickType;
        /** @type {Boolean} */
        this.exitedBounds = exitedBounds;
    }

    /**
     * Snaps a mouse position to the closest grid position.
     * @param {Number} shiftedX The original x coordinate of the mouse relative to the viewport.
     * @param {Number} shiftedY The original y coordinate of the mouse relative to the viewport.
     * @returns {{x: Number, y: Number}} The x and y coordinates of the closest grid line intersection.
     */
    static snapToGrid(shiftedX, shiftedY) {        
        return {
            x: MouseInteraction.roundToMultiple(shiftedX - RENDER_SETTINGS.GRID_HORIZONTAL_OFFSET, RENDER_SETTINGS.GRID_HORIZONTAL_SPACING) + RENDER_SETTINGS.GRID_HORIZONTAL_OFFSET,
            y: MouseInteraction.roundToMultiple(shiftedY - RENDER_SETTINGS.GRID_VERTICAL_OFFSET, RENDER_SETTINGS.GRID_VERTICAL_SPACING) + RENDER_SETTINGS.GRID_VERTICAL_OFFSET
        };
    }
    
    /**
     * Snaps a mouse position to the closest angle and/or distance snap point from a given vertex.
     * @param {Number} shiftedX The original x coordinate of the mouse relative to the viewport.
     * @param {Number} shiftedY The original y coordinate of the mouse relative to the viewport.
     * @param {Vertex} vertex The vertex to use as reference for angle snap and distance snap points.
     * @param {Boolean} angleSnap Whether to consider the closest angle when snapping. One of this and distanceSnap are assumed to be true.
     * @param {Boolean} distanceSnap Whether to consider the closest multiple of the distance constant when snapping. One of this and distanceSnap are assumed to be true.
     * @returns {{x: Number, y: Number}} The x and y coordinates of the closest angle snap/distance snap point.
     */
    static snapToVertex(shiftedX, shiftedY, vertex, angleSnap, distanceSnap) {
        let distance = Math.sqrt(Math.pow(shiftedY - vertex.y, 2) + Math.pow(shiftedX - vertex.x, 2));

        if(distance > RENDER_SETTINGS.VERTEX_SNAP_MAX_RANGE) {
            return {
                x: shiftedX,
                y: shiftedY
            };
        }

        let angle = Math.atan2(shiftedY - vertex.y, shiftedX - vertex.x);
        
        if(angleSnap) {
            angle = angle / Math.PI * 180;
            angle = MouseInteraction.roundToMultiple(angle - RENDER_SETTINGS.ANGLE_SNAP_OFFSET, RENDER_SETTINGS.ANGLE_SNAP_DEGREE) + RENDER_SETTINGS.ANGLE_SNAP_OFFSET;
            angle = angle * Math.PI / 180;
        }
        if(distanceSnap) {
            distance = Math.max(RENDER_SETTINGS.DISTANCE_SNAP_OFFSET, MouseInteraction.roundToMultiple(distance - RENDER_SETTINGS.DISTANCE_SNAP_OFFSET, RENDER_SETTINGS.DISTANCE_SNAP_SPACING) + RENDER_SETTINGS.DISTANCE_SNAP_OFFSET);
        }

        return {
            x: vertex.x + Math.cos(angle) * distance,
            y: vertex.y + Math.sin(angle) * distance
        }
    }

    /**
     * Rounds a value to the nearest multiple of a number.
     * @param {Number} val The value to be rounded.
     * @param {Number} multiple The number to round to the nearest multiple of.
     * @returns {Number} The nearest number to {@link val} that is a multiple of {@link multiple}.
     */
    static roundToMultiple(val, multiple) {
        const valLower = Math.floor(val / multiple) * multiple;
        const valUpper = valLower + multiple;

        return Math.abs(val - valLower) < Math.abs(val - valUpper) ? valLower : valUpper;
    }
}