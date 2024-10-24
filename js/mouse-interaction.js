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
     * @param {Number} mouseX The original x coordinate of the mouse.
     * @param {Number} mouseY The original y coordinate of the mouse.
     * @returns {{x: Number, y: Number}} The x and y coordinates of the closest grid line intersection.
     */
    static snapToGrid(mouseX, mouseY) {

    }
    
    /**
     * Snaps a mouse position to the closest angle and/or distance snap point from a given vertex.
     * @param {Number} mouseX The original x coordinate of the mouse.
     * @param {Number} mouseY The original y coordinate of the mouse.
     * @param {Vertex} vertex The vertex to use as reference for angle snap and distance snap points.
     * @returns {{x: Number, y: Number}} The x and y coordinates of the closest angle snap/distance snap point.
     */
    static snapToVertex(mouseX, mouseY, vertex) {

    }
}