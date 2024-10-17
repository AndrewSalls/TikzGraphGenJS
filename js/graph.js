import { tool_onMouseDown, tool_onMouseMove, tool_onMouseUp } from "./tools/tool.js";
import initializeMenubar from "./menubar.js";
import initializeToolbar from "./toolbar.js";
import { GraphSession, MOUSE_CLICK_TYPE, MouseInteraction } from "./graph-session.js";

/**
 * Converts a generic mouse event into a specifically formatted MouseInteraction.
 * @param {MouseEvent} ev The original mouse event.
 * @returns {MouseInteraction} The corresponding MouseInteraction.
 */
function convertMouse(ev) {
    let clickOptions = 0;
    clickOptions += ev.buttons;
    clickOptions += ev.shiftKey ? MOUSE_CLICK_TYPE.SHIFT_HELD : 0;
    clickOptions += ev.altKey ? MOUSE_CLICK_TYPE.ALT_HELD : 0;
    clickOptions += ev.ctrlKey ? MOUSE_CLICK_TYPE.CTRL_HELD : 0;

    return new MouseInteraction(ev.pageX - ev.currentTarget.offsetLeft, ev.pageY - ev.currentTarget.offsetTop, clickOptions);
}

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("render");
    
    let graphData = new GraphSession(canvas.getContext("2d"));

    canvas.addEventListener("mousedown", ev => tool_onMouseDown(convertMouse(ev), graphData));
    canvas.addEventListener("mouseup", ev => tool_onMouseUp(convertMouse(ev), graphData));
    canvas.addEventListener("mousemove", ev => tool_onMouseMove(convertMouse(ev), graphData));
    // Disable right click on canvas
    canvas.addEventListener("contextmenu", ev => ev.preventDefault());
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