import { tool_onMouseDown, tool_onMouseMove, tool_onMouseUp } from "./tools/tool.js";
import initializeMenubar from "./menubar.js";
import initializeToolbar from "./toolbar.js";
import { GraphSession } from "./graph-session.js";
import { MouseInteraction } from "./mouse-interaction.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("render");
    let graphData = new GraphSession(canvas.getContext("2d"));
    let onPage = true;
    let onMenubar = 0;

    canvas.addEventListener("mousedown", ev => tool_onMouseDown(MouseInteraction.convertMouse(ev, canvas, graphData.viewport, onPage, onMenubar), graphData));
    // Can continue to control tool outside of canvas if tool allows it
    document.body.addEventListener("mouseup", ev => tool_onMouseUp(MouseInteraction.convertMouse(ev, canvas, graphData.viewport, onPage, onMenubar), graphData));
    document.body.addEventListener("mousemove", ev => tool_onMouseMove(MouseInteraction.convertMouse(ev, canvas, graphData.viewport, onPage, onMenubar), graphData));
    // Disable right click on canvas
    canvas.addEventListener("contextmenu", ev => ev.preventDefault());
    // Let tools decide what to do if mouse leaves canvas; call onMove to ensure tool knows that the mouse left the window
    document.addEventListener("mouseleave", ev => {
        onPage = false;
        tool_onMouseMove(MouseInteraction.convertMouse(ev, canvas, graphData.viewport, onPage, onMenubar), graphData);
    });
    document.addEventListener("mouseenter", ev => {
        onPage = true;
        tool_onMouseMove(MouseInteraction.convertMouse(ev, canvas, graphData.viewport, onPage, onMenubar), graphData);
    });
    for(const dropdown of document.getElementsByName("dropdown")) {
        dropdown.addEventListener("mouseleave", ev => onMenubar--);
        dropdown.addEventListener("mouseenter", ev => onMenubar++);
    }

    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const onResize = new ResizeObserver(entries => {
        canvas.width = entries[0].contentBoxSize[0].inlineSize;
        canvas.height = entries[0].contentBoxSize[0].blockSize;
    });
    onResize.observe(canvas);


    setInterval(() => graphData.drawGraph(), 1000 / 30); // Refreshes 30 times per second
    initializeMenubar(graphData);
    initializeToolbar(graphData);
});