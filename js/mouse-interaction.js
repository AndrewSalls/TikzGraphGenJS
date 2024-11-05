import { RENDER_SETTINGS } from "./graph-session.js";
import { GraphViewport } from "./graph-viewport.js";

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
     * @param {MOUSE_CLICK_TYPE} activeClick The type of clicks actively taking place (mouse events that are in the mousedown or mousemove state)
     * @param {Boolean} exitedBounds Whether the mouse interaction was inside or outside of the canvas.
     */
    constructor(mouseX, mouseY, shiftedX, shiftedY, clickType, activeClick, exitedBounds) {
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
        /** @type {MOUSE_CLICK_TYPE} */
        this.activeClick = activeClick
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

    /**
     * Converts a generic mouse event into a specifically formatted MouseInteraction.
     * @param {MouseEvent} ev The original mouse event.
     * @param {HTMLCanvasElement} canvas The canvas the mouse event takes place with respect to.
     * @param {GraphViewport} viewport The viewport for the canvas.
     * @param {Boolean} onPage Whether the mouse event is for leaving the page
     * @param {Number} onMenubar The number of dropdown menus currently hovered over (Typically 0 or 1).
     * @returns {MouseInteraction} The corresponding MouseInteraction.
     */
    static convertMouse(ev, canvas, viewport, onPage, onMenubar) {
        let clickOptions = 0;
        clickOptions += ev.buttons;
        clickOptions += ev.shiftKey ? MOUSE_CLICK_TYPE.SHIFT_HELD : 0;
        clickOptions += ev.altKey ? MOUSE_CLICK_TYPE.ALT_HELD : 0;
        clickOptions += ev.ctrlKey ? MOUSE_CLICK_TYPE.CTRL_HELD : 0;

        // Why does ev.button use a different labelling system than ev.buttons for which buttons are selected ahh
        let activeButton = (ev.type === "mouseup" || ev.type === "mousedown") ? Math.pow(2, ev.button) : -1;
        if(activeButton === 2) { // e.g. why do the orderings of the secondary button and auxiliary button swap
            activeButton = 4;
        } else if(activeButton === 4) {
            activeButton =  2;
        }

        let withinCanvas = 0;
        if(ev.pageX < canvas.offsetLeft) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.LEFT;
        }
        if(ev.pageY < canvas.offsetTop || onMenubar > 0) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.TOP;
        }
        if(ev.pageX > canvas.offsetLeft + canvas.offsetWidth) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.RIGHT;
        }
        if(ev.pageY > canvas.offsetTop + canvas.offsetHeight) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.BOTTOM;
        }
        if(!onPage) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.WINDOW;
        }
        
        return new MouseInteraction(
            ev.pageX - canvas.offsetLeft,
            ev.pageY - canvas.offsetTop,
            (ev.pageX - canvas.offsetLeft) / viewport.scale + viewport.offsetX,
            (ev.pageY - canvas.offsetTop) / viewport.scale + viewport.offsetY,
            clickOptions,
            activeButton,
            withinCanvas);
    }
}