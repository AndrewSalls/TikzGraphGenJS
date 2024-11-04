import { GraphSession, RENDER_SETTINGS } from "../graph-session.js";
import { MouseInteraction } from "../mouse-interaction.js";
import { Tool } from "./tool.js";

let LASSO_TOOL;
const MAX_FINISH_SNAP = 7; // The maximum distance where the tool will attempt to connect the current line back to the starting line instead of creating a new connection point.
const MAX_NEW_LINE = 7; // The maximum distance where the tool considers a click an attempt to end the shape early instead of an attempt to create a new point.
const EVEN_ODD = false; // Whether selection uses even-odd or non-zero fill for selection shape.

/**
 * Provides access to the lasso tool.
 * @returns {Tool} The lasso tool.
 */
export default function accessLassoTool() {
    if(LASSO_TOOL === undefined) {
        LASSO_TOOL = new Tool("lasso", onDown, onMove, onUp, initializeData, clearData, onPaint);
    }

    return LASSO_TOOL;
}

/**
 * The callback used when pressing down on a mouse button.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onDown(mouse, graphData, toolData) {
    return toolData;
}

/**
 * The callback used when moving the mouse, regardless of if a button is pressed or not.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onMove(mouse, graphData, toolData) {
    if(toolData !== null && toolData.points.length > 0) {
        toolData.currX = mouse.x;
        toolData.currY = mouse.y;
        toolData.selectX = mouse.shiftedX;
        toolData.selectY = mouse.shiftedY;
    }

    return toolData;
}

/**
 * The callback used when a mouse button stops being pressed.
 * @param {MouseInteraction} mouse Mouse data relevant to tools.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @returns {Object|null} The updated value for toolData.
 */
function onUp(mouse, graphData, toolData) {
    const pos = {
        currX: mouse.x,
        currY: mouse.y,
        selectX: mouse.shiftedX,
        selectY: mouse.shiftedY
    };

    if(!mouse.exitedBounds) {
        if(toolData === null) {
            toolData = {
                points: [pos]
            };
        } else {
            if(withinRange(toolData.points[0], pos, MAX_FINISH_SNAP) || (toolData.points.length > 1 && withinRange(toolData.points[toolData.points.length - 1], pos, MAX_NEW_LINE))) {
                if(!toolData.keepOldSelected) {
                    graphData.clearSelected();
                }

                // Add start point to end of points to create closed loop. This makes iterating through points easier.
                toolData.points.push(toolData.points[0]);

                const iter = graphData.iterateThroughAllData();
                let next = iter.next();
                while(!next.done) {
                    const bBox = next.value.boundingBox();
            
                    if(intersect(bBox, toolData.points)) {
                        next = iter.next();
                        continue;
                    }
            
                    const topCount = getRightCount({x: bBox.x + bBox.width / 2, y: bBox.y + bBox.height / 2}, toolData.points); // Only need to check one point, since there are no intersections.
                    if(EVEN_ODD && topCount.count % 2 === 1) {
                        // corner is in polygon if drawing line to the right intersects odd number of polygon lines
                        graphData.select(next.value);
                    } else if(!EVEN_ODD && topCount.winding !== 0) {
                        // winding number starts at 0, increases by 1 for every line with positive slope, and decreases by 1 for line with negative slope. 
                        // Corner is in polygon if winding number is not 0
                        graphData.select(next.value);
                    }

                    next = iter.next();
                }

                toolData = null;
            } else {
                toolData.points.push(pos);
            }
        }
    }

    return toolData;
}

const initializeData = undefined;
const clearData = undefined;

/**
 * The callback used when this tool is selected and a paint event is called on the canvas.
 * @param {GraphSession} graphData The graph data this tool is interacting with.
 * @param {Object|null} toolData Temporary data storage for this tool.
 * @param {CanvasRenderingContext2D} ctx The context of the canvas to be drawn on.
 */
function onPaint(graphData, toolData, ctx) {
    if(toolData !== null) {
        ctx.lineWidth = RENDER_SETTINGS.SELECT_BORDER_WIDTH;
        ctx.fillStyle = RENDER_SETTINGS.SELECT_BORDER;

        toolData.points.push({
            currX: toolData.currX,
            currY: toolData.currY
        });

        const pointRadius = (RENDER_SETTINGS.SELECT_BORDER_WIDTH + RENDER_SETTINGS.LASSO_BORDER_POINT_INCREASE) / 2;
        for(const point of toolData.points) {
            ctx.beginPath();
            ctx.ellipse(point.currX, point.currY, pointRadius, pointRadius, 0, 0, 2 * Math.PI);
            ctx.fill();
            ctx.closePath();
        }

        if(toolData.points.length > 2) {
            ctx.strokeStyle = RENDER_SETTINGS.SELECT_BORDER;
            ctx.fillStyle = RENDER_SETTINGS.SELECT_MAIN;

            ctx.beginPath(); // fill, separate from stroke because edge back to start position doesn't have a stroke
            ctx.moveTo(toolData.points[0].currX, toolData.points[0].currY);
            for(let i = 0; i < toolData.points.length - 1; i++) {
                ctx.lineTo(toolData.points[i + 1].currX, toolData.points[i + 1].currY);
            }
            ctx.closePath();
            ctx.fill(EVEN_ODD ? "evenodd" : "nonzero");
            
            ctx.beginPath(); // fill, separate from stroke because edge back to start position doesn't have a stroke
            ctx.moveTo(toolData.points[0].currX, toolData.points[0].currY);
            for(let i = 0; i < toolData.points.length - 1; i++) {
                ctx.lineTo(toolData.points[i + 1].currX, toolData.points[i + 1].currY);
            }
            ctx.stroke();
        }

        toolData.points.pop();
    }
}

/**
 * Determines if two points are within the specified range of each other.
 * @param {{currX: Number, currY: Number, selectX: Number, selectY: Number}} point1 The first point.
 * @param {{currX: Number, currY: Number, selectX: Number, selectY: Number}} point2 The second point.
 * @param {Number} range The max distance between points.
 */
function withinRange(point1, point2, range) {
    return Math.sqrt(Math.pow(point2.currX - point1.currX, 2) + Math.pow(point2.currY - point1.currY, 2)) <= range;
}

/**
 * Checks if any edges of a bounding box intersect a specified region's edges.
 * @param {{x: Number, y: Number, width: Number, height: Number}} bBox A boudning box.
 * @param {{currX: Number, currY: Number, selectX: Number, selectY: Number}[]} region An ordered list of points that define the selection shape, starting and ending with the same point to represent a closed shape.
 * @returns {Boolean} Whether any edge of the region intersects the bounding box.
 */
function intersect(bBox, region) {
    for(let first = 0; first < region.length - 1; first++) {
        const line1 = {
            startX: region[first].selectX,
            startY: region[first].selectY,
            endX: region[first + 1].selectX,
            endY: region[first + 1].selectY
        };

        if (intersectLineSegments(line1, { startX: bBox.x, endX: bBox.x + bBox.width, startY: bBox.y, endY: bBox.y}) || // intersects top of bounding box
            intersectLineSegments(line1, { startX: bBox.x, endX: bBox.x + bBox.width, startY: bBox.y + bBox.height, endY: bBox.y + bBox.height}) || // intersects bottom
            intersectLineSegments(line1, { startX: bBox.x, endX: bBox.x, startY: bBox.y, endY: bBox.y + bBox.height}) || // intersects left side
            intersectLineSegments(line1, { startX: bBox.x + bBox.width, endX: bBox.x + bBox.width, startY: bBox.y, endY: bBox.y + bBox.height})) { // intersects right side
            return true;
        }
    }

    return false;
}

/**
 * Determines if two line segments intersect.
 * @param {{startX: Number, startY: Number, endX: Number, endY: Number}} line1 The first line segment.
 * @param {{startX: Number, startY: Number, endX: Number, endY: Number}} line2 The second line segment.
 * @returns {Boolean} Whether the line segments intersect.
 */
function intersectLineSegments(line1, line2) {
    const orientA = (line2.endX - line2.startX) * (line1.startY - line2.startY) - (line2.endY - line2.startY) * (line1.startX - line2.startX);
    const orientB = (line2.endX - line2.startX) * (line1.endY - line2.startY) - (line2.endY - line2.startY) * (line1.endX - line2.startX);
    const orientC = (line1.endX - line1.startX) * (line2.startY - line1.startY) - (line1.endY - line1.startY) * (line2.startX - line1.startX);
    const orientD = (line1.endX - line1.startX) * (line2.endY - line1.startY) - (line1.endY - line1.startY) * (line2.endX - line1.startX);

    return (orientA * orientB < 0 && orientC * orientD < 0);
}

/**
 * Finds all lines that intersect a line extending straight right from a point and that fulfill a criteria.
 * @param {{x: Number, y: Number}} point The point to get lines to the right of.
 * @param {{currX: Number, currY: Number, selectX: Number, selectY: Number}[]} region An ordered list of points that define the selection shape, starting and ending with the same point to represent a closed shape.
 * @returns {{count: Number, winding: Number}} The number of lines to the right of the point that intersect a horizontal line and fulfill the specified criteria, and the winding number of the lines.
 */
function getRightCount(point, region) {
    let output = 0, winding = 0;

    for(let first = 0; first < region.length - 1; first++) {
        if((region[first].selectY >= point.y && region[first + 1].selectY <= point.y) || (region[first + 1].selectY >= point.y && region[first].selectY <= point.y)) {
            // line intersects horizontal line, need to check that it is to the right of the point
            let slope, xOffset, xDist;

            if(region[first].selectY === region[first + 1].selectY) { // Horizontal line
                continue;
            }

            if(region[first].selectX === region[first + 1].selectX) { // Vertical line
                xOffset = 0;
            } else {
                slope = (region[first + 1].selectY - region[first].selectY) / (region[first + 1].selectX - region[first].selectX);
                xOffset = (point.y - region[first].selectY) / slope;
            }

            xDist = xOffset + (region[first].selectX - point.x);
            if(xDist > 0) {
                output++;

                if(region[first].selectY >= region[first + 1].selectY) {
                    winding++;
                } else {
                    winding--;
                }
            }
        }
    }

    return {
        count: output,
        winding: winding,
    };
}