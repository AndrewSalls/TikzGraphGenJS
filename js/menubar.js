import { GraphSession } from "./graph-session.js";
import { clearGraph, zoomToCenter, zoomToMouse } from "./tools/tool.js";
import { undo, redo } from "./history/history.js";
import { registerKey } from "./shortcut.js";
import { FIXED_ZOOM_LEVELS } from "./graph-viewport.js";
import { eraseSelected } from "./tools/eraser-tool.js";
import { MouseInteraction } from "./mouse-interaction.js";

/**
 * Initializes the buttons in the menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
export default function initializeMenubar(graphData) {
    initializeGeneralKeybinds();
    initializeFileMenu(graphData);
    initializeEditMenu(graphData);
    initializeViewMenu(graphData);
    initializeOtherMenu(graphData);
};

let isShiftHeld = false;
let isAltHeld = false;
/**
 * Initializes key listeners for alt and shift, which modify what shortcuts work and are available to the menus.
 */
function initializeGeneralKeybinds() {
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
}

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
    const lasso = document.querySelector("#lasso-btn");
    document.querySelector("#lasso-menu-btn").onclick = () => select.click();

    registerKey(() => undo(graphData), "z");
    registerKey(() => redo(graphData), "y");
    registerKey(() => deleteSelected(graphData), "Delete", false);
    registerKey(() => deleteSelected(graphData), "Backspace", false);
}

/**
 * Initializes the buttons in the view sub-menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
function initializeViewMenu(graphData) {
    document.querySelector("#toggle-grid-btn").onclick = ev => {
        graphData.drawingGrid = !graphData.drawingGrid;
        ev.target.textContent = (graphData.drawingGrid ? "Hide" : "Show") + " Grid";
    };

    const layout = document.querySelector("#wrapper");
    const toggleCommands = document.querySelector("#toggle-menubar-btn");
    toggleCommands.onclick = ev => ev.target.textContent = (layout.classList.toggle("shrink-menubar") ? "Show" : "Hide") + " Menubar";
    document.querySelector("#uncollapse-command-menu").onclick = () => toggleCommands.click();

    const toggleTools = document.querySelector("#toggle-toolbar-btn");
    toggleTools.onclick = ev => ev.target.textContent = (layout.classList.toggle("shrink-toolbar") ? "Show" : "Hide") + " Toolbar";
    document.querySelector("#uncollapse-tool-menu").onclick = () => toggleTools.click();

    const canvas = document.querySelector("#render");
    const slider = document.querySelector("#zoom-slider");
    const zoomDisplay = document.querySelector("#zoom-display");
    let oldPos = slider.value;

    const updateZoomDisplay = (newValue) => {
        if(newValue >= 1) {
            zoomDisplay.textContent = `(${(100 * newValue).toFixed(0)}%)`;
        } else {
            zoomDisplay.textContent = `(${parseFloat((100 * newValue).toFixed(2))}%)`;
        }

        // Adjust fixed zoom levels to be close to actual level
        const closest = FIXED_ZOOM_LEVELS.reduce((prev, curr) => Math.abs(curr - newValue) < Math.abs(prev - newValue) ? curr : prev);
        slider.value = FIXED_ZOOM_LEVELS.indexOf(closest);
        oldPos = slider.value;
    };

    document.querySelector("#zoom-in-btn").onclick = () => updateZoomDisplay(zoomToCenter(graphData, canvas.width, canvas.height, true, false));
    document.querySelector("#zoom-out-btn").onclick = () => updateZoomDisplay(zoomToCenter(graphData, canvas.width, canvas.height, false, false));

    slider.setAttribute("min", 0);
    slider.setAttribute("max", FIXED_ZOOM_LEVELS.length - 1);
    slider.value = FIXED_ZOOM_LEVELS.indexOf(1); // Assumes that a default zoom level is 100% / 1, which should always be true
    slider.addEventListener("input", () => {
        let newPos = slider.value;
        let zoomAmount = null;
        while(oldPos > newPos) {
            zoomAmount = zoomToCenter(graphData, canvas.width, canvas.height, false, true);
            oldPos--;
        }
        while(oldPos < newPos) {
            zoomAmount = zoomToCenter(graphData, canvas.width, canvas.height, true, true);
            oldPos++;
        }

        if(zoomAmount !== null) {
            updateZoomDisplay(zoomAmount);
        }
    });

    registerKey(() => updateZoomDisplay(zoomToCenter(graphData, canvas.width, canvas.height, true, false)), "=", false, false, true);
    registerKey(() => updateZoomDisplay(zoomToCenter(graphData, canvas.width, canvas.height, true, true)), "+", false, true, true);
    registerKey(() => updateZoomDisplay(zoomToCenter(graphData, canvas.width, canvas.height, false, false)), "-", false, false, true);
    registerKey(() => updateZoomDisplay(zoomToCenter(graphData, canvas.width, canvas.height, false, true)), "_", false, true, true);

    canvas.addEventListener("wheel", ev => {
        if(isShiftHeld) {
            // deltaY < 0 implies that scroll direction is upwards
            const newScale = zoomToMouse(MouseInteraction.convertMouse(ev, canvas, graphData.viewport, true, false), graphData, canvas.width, canvas.height, ev.deltaY < 0, isAltHeld);
            updateZoomDisplay(newScale);
        }
    });
}

/**
 * Initializes the buttons in the other sub-menubar.
 * @param {GraphSession} graphData The graph state, so that it can be provided to functions called by using the menubar.
 */
function initializeOtherMenu(graphData) {
    document.querySelector("#about-btn").onclick = () => window.open("../about.html", "_blank");
    const graphInfoOverlay = document.querySelector("#graph-info-overlay");

    const vertexCounter = document.querySelector("#vertex-count");
    const edgeCounter = document.querySelector("#edge-count");
    const edgeCapCounter = document.querySelector("#edge-cap-count");
    const labelCounter = document.querySelector("#label-count");

    document.querySelector("#graph-info-btn").onclick = () => {
        document.body.classList.add("supress-menu");
        graphInfoOverlay.classList.remove("invisible");
        vertexCounter.textContent = graphData.vertices.length;
        edgeCounter.textContent = graphData.edges.length;
        edgeCapCounter.textContent = 0; // TODO: Update when adding edge caps
        labelCounter.textContent = 0; // TODO: Update when adding labels
    };
    document.querySelector("#close-info-box").onclick = () => {
        document.body.classList.remove("supress-menu");
        graphInfoOverlay.classList.add("invisible");
    };

    document.querySelector("#grid-snap-btn").onclick = ev => {
        graphData.snapGrid = !graphData.snapGrid;
        ev.target.textContent = (graphData.snapGrid ? "Disable" : "Enable") + " Grid Snap";
    };
    document.querySelector("#angle-snap-btn").onclick = ev => {
        graphData.snapAngle = !graphData.snapAngle;
        ev.target.textContent = (graphData.snapAngle ? "Disable" : "Enable") + " Angle Snap";
    };
    document.querySelector("#distance-snap-btn").onclick = ev => {
        graphData.snapDistance = !graphData.snapDistance;
        ev.target.textContent = (graphData.snapDistance ? "Disable" : "Enable") + " Distance Snap";
    };
}