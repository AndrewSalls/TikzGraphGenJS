export const FIXED_ZOOM_LEVELS = [
    0.1,
    0.25,
    0.5,
    0.75,
    1,
    1.25,
    1.5,
    2
];
export const MIN_ZOOM = 0.01;
export const MAX_ZOOM = 10;
export const ZOOM_SHIFT = 1.25; // Should be >= 1

/**
 * Defines the viewport used when rendering graph objects. Only objects with a bounding box inside the graph, or which are adjacent to an object with a bounding box inside the graph, are rendered.
 * Width of viewport is determined by the canvas width and scale factor.
 */
export class GraphViewport {
    constructor() {
        this.offsetX = 0;
        this.offsetY = 0;
        this.scale = 1;
    }

    /**
     * Zoom in by {@link ZOOM_SHIFT}, up to {@link MIN_ZOOM}.
     */
    zoomIn() {
        this.scale = Math.min(MAX_ZOOM, this.scale * ZOOM_SHIFT);
    }

    /**
     * Zoom in to the next smallest zoom in {@link FIXED_ZOOM_LEVELS}, doing nothing if already smaller then the smallest value in that scale.
     */
    zoomInFixed() {
        this.scale = FIXED_ZOOM_LEVELS.find(v => v > this.scale) ?? this.scale;
    }

    /**
     * Zoom out by {@link ZOOM_SHIFT}, up to {@link MAX_ZOOM}.
     */
    zoomOut() {
        this.scale = Math.max(MIN_ZOOM, this.scale / ZOOM_SHIFT);
    }

    /**
     * Zoom out to the next largest zoom in {@link FIXED_ZOOM_LEVELS}, doing nothing if already larger then the largest value in that scale.
     */
    zoomOutFixed() {
        this.scale = FIXED_ZOOM_LEVELS.findLast(v => v < this.scale) ?? this.scale;
    }

    /**
     * Pan the viewport.
     * @param {Number} deltaX The amount to pan along the x (horizontal) axis.
     * @param {Number} deltaY The amount to pan along the y (vertical axis).
     */
    pan(deltaX, deltaY) {
        this.offsetX += deltaX;
        this.offsetY += deltaY;
    }

    /**
     * Set the position of the viewport's top left corner.
     * @param {Number} x The position to set the top left corner to, along the x axis.
     * @param {Number} y The position to set the top left corner to, along the y axis.
     */
    warp(x, y) {
        this.offsetX = x;
        this.offsetY = y;
    }

    /**
     * Checks if a rectangular bounding box intersects this viewport when applied to a canvas.
     * @param {{x: Number, y: Number, width: Number, height: Number}} bBox The bounding box that is being checked.
     * @param {Number} canvasWidth The width of the unscaled canvas.
     * @param {Number} canvasHeight The height of the unscaled canvas.
     */
    intersects(bBox, canvasWidth, canvasHeight) {
        const shiftedBBox = {
            x: this.scale * (bBox.x - this.offsetX) + this.offsetX,
            y: this.scale * (bBox.y - this.offsetY) + this.offsetY,
            width: this.scale * bBox.width,
            height: this.scale * bBox.height
        };

        return ((shiftedBBox.x >= this.offsetX && shiftedBBox.x <= this.offsetX + canvasWidth / this.scale) ||
               (shiftedBBox.x + shiftedBBox.width >= this.offsetX && shiftedBBox.x + shiftedBBox.width <= this.offsetX + canvasWidth / this.scale)) &&
               ((shiftedBBox.y >= this.offsetY && shiftedBBox.y <= this.offsetY + canvasHeight / this.scale) ||
               (shiftedBBox.y + shiftedBBox.height >= this.offsetY && shiftedBBox.y + shiftedBBox.height <= this.offsetY + canvasHeight / this.scale));
    }
}