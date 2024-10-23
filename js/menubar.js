import { GraphSession } from "./graph-session.js";
import { clearGraph } from "./tools/tool.js";
import { undo, redo } from "./history/history.js";
import { registerKey } from "./shortcut.js";
import { FIXED_ZOOM_LEVELS } from "./graph-viewport.js";
import { eraseSelected } from "./tools/eraser-tool.js";

/**
 * Initializes the buttons in the menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
export default function initializeMenubar(graphData) {
    initializeFileMenu(graphData);
    initializeEditMenu(graphData);
    initializeViewMenu(graphData);
};

/**
 * Initializes the buttons in the file sub-menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
function initializeFileMenu(graphData) {
    document.querySelector("#new-graph-btn").onclick = () => clearGraph(graphData);
}

/**
 * Initializes the buttons in the edit sub-menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
function initializeEditMenu(graphData) {
    document.querySelector("#undo-btn").onclick = () => undo(graphData);
    document.querySelector("#redo-btn").onclick = () => redo(graphData);
    document.querySelector("#delete-btn").onclick = () => eraseSelected(graphData);

    const vertex = document.querySelector("#vertex-btn");
    document.querySelector("#vertex-menu-btn").onclick = () => vertex.click();
    const edge = document.querySelector("#edge-btn");
    document.querySelector("#edge-menu-btn").onclick = () => edge.click();
    const select = document.querySelector("#select-btn");
    document.querySelector("#select-menu-btn").onclick = () => select.click();
    const eraser = document.querySelector("#eraser-btn");
    document.querySelector("#eraser-menu-btn").onclick = () => eraser.click();
    const split = document.querySelector("#split-btn");
    document.querySelector("#split-menu-btn").onclick = () => split.click();
    const merge = document.querySelector("#merge-btn");
    document.querySelector("#merge-menu-btn").onclick = () => merge.click();

    registerKey(() => undo(graphData), "z");
    registerKey(() => redo(graphData), "y");
    registerKey(() => deleteSelected(graphData), "Delete", false);
    registerKey(() => deleteSelected(graphData), "Backspace", false);
}

let isShiftHeld = false;
let isAltHeld = false;
let mousePos = { x: 0, y: 0 };
/**
 * Initializes the buttons in the view sub-menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
function initializeViewMenu(graphData) {
    document.querySelector("#toggle-grid-btn").onclick = () => graphData.drawingGrid = !graphData.drawingGrid;

    const canvas = document.querySelector("#render");

    document.querySelector("#zoom-in-btn").onclick = () => {
        const oldScale = graphData.viewport.scale;
        const newScale = graphData.viewport.zoomIn();
        graphData.viewport.pan((canvas.width / oldScale - canvas.width / newScale) / 2, (canvas.height / oldScale - canvas.height / newScale) / 2);
        updateZoomDisplay();
    };
    document.querySelector("#zoom-out-btn").onclick = () => {
        const oldScale = graphData.viewport.scale;
        const newScale = graphData.viewport.zoomOut();
        graphData.viewport.pan((canvas.width / oldScale - canvas.width / newScale) / 2, (canvas.height / oldScale - canvas.height / newScale) / 2);
        updateZoomDisplay();
    };
    const slider = document.querySelector("#zoom-slider");
    const zoomDisplay = document.querySelector("#zoom-display");
    const updateZoomDisplay = () => {
        if(graphData.viewport.scale >= 1) {
            zoomDisplay.textContent = `(${(100 * graphData.viewport.scale).toFixed(0)}%)`;
        } else {
            zoomDisplay.textContent = `(${parseFloat((100 * graphData.viewport.scale).toFixed(2))}%)`;
        }

        // Adjust fixed zoom levels to be close to actual level
        const closest = FIXED_ZOOM_LEVELS.reduce((prev, curr) => Math.abs(curr - graphData.viewport.scale) < Math.abs(prev - graphData.viewport.scale) ? curr : prev);
        slider.value = FIXED_ZOOM_LEVELS.indexOf(closest);
    };

    slider.setAttribute("min", 0);
    slider.setAttribute("max", FIXED_ZOOM_LEVELS.length - 1);
    slider.value = FIXED_ZOOM_LEVELS.indexOf(1); // Assumes that a default zoom level is 100% / 1, which should always be true
    slider.addEventListener("input", () => {
        const oldScale = graphData.viewport.scale;
        const newScale = FIXED_ZOOM_LEVELS[parseInt(slider.value)];
        graphData.viewport.scale = newScale;
        graphData.viewport.pan((canvas.width / oldScale - canvas.width / newScale) / 2, (canvas.height / oldScale - canvas.height / newScale) / 2);
        updateZoomDisplay();
    });

    registerKey(() => {
        const oldScale = graphData.viewport.scale;
        const newScale = graphData.viewport.zoomIn();
        graphData.viewport.pan((canvas.width / oldScale - canvas.width / newScale) / 2, (canvas.height / oldScale - canvas.height / newScale) / 2);
        updateZoomDisplay();
    }, "=", false, false, true);
    registerKey(() => {
        const oldScale = graphData.viewport.scale;
        const newScale = graphData.viewport.zoomInFixed();
        graphData.viewport.pan((canvas.width / oldScale - canvas.width / newScale) / 2, (canvas.height / oldScale - canvas.height / newScale) / 2);
        updateZoomDisplay();
    }, "+", false, true, true);
    registerKey(() => {
        const oldScale = graphData.viewport.scale;
        const newScale = graphData.viewport.zoomOut();
        graphData.viewport.pan((canvas.width / oldScale - canvas.width / newScale) / 2, (canvas.height / oldScale - canvas.height / newScale) / 2);
        updateZoomDisplay();
    }, "-", false, false, true);
    registerKey(() => {
        const oldScale = graphData.viewport.scale;
        const newScale = graphData.viewport.zoomOutFixed();
        graphData.viewport.pan((canvas.width / oldScale - canvas.width / newScale) / 2, (canvas.height / oldScale - canvas.height / newScale) / 2);
        updateZoomDisplay();
    }, "_", false, true, true);

    // Zooming with mouse wheel
    document.addEventListener("keydown", ev => {
        if(ev.key === "Alt") {
            isAltHeld = true;
            ev.preventDefault();
        } else if(ev.key === "Shift") {
            isShiftHeld = true;
            ev.preventDefault();
        }
    });
    document.addEventListener("keyup", ev => {
        if(ev.key === "Alt") {
            isAltHeld = false;
            ev.preventDefault();
        } else if(ev.key === "Shift") {
            isShiftHeld = false;
            ev.preventDefault();
        }
    });
    canvas.addEventListener("mousemove", ev => {
        mousePos.x = ev.offsetX / graphData.viewport.scale + graphData.viewport.offsetX;
        mousePos.y = ev.offsetY / graphData.viewport.scale + graphData.viewport.offsetY;
        mousePos.absX = ev.offsetX;
        mousePos.absY = ev.offsetY;
    });

    canvas.addEventListener("wheel", ev => {
        if(isShiftHeld) {
            const oldScale = graphData.viewport.scale;
            let newScale = 0;

            if(ev.deltaY < 0) { // Scrolling "up"
                if(isAltHeld) {
                    newScale = graphData.viewport.zoomInFixed();
                } else {
                    newScale = graphData.viewport.zoomIn();
                }
            } else {
                if(isAltHeld) {
                    newScale = graphData.viewport.zoomOutFixed();
                } else {
                    newScale = graphData.viewport.zoomOut();
                }
            }

            graphData.viewport.pan((canvas.width / oldScale - canvas.width / newScale) * (mousePos.absX / canvas.width), (canvas.height / oldScale - canvas.height / newScale) * (mousePos.absY / canvas.height));
            updateZoomDisplay();
        }
    });
}