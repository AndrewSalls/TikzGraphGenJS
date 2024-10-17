import { tool_onMouseDown, tool_onMouseMove, tool_onMouseUp } from "./tools/tool.js";
import initializeMenubar from "./menubar.js";
import initializeToolbar from "./toolbar.js";
import { GraphSession, MOUSE_CLICK_TYPE, MOUSE_EXIT_BOUND_DIRECTION, MouseInteraction } from "./graph-session.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("render");
    let graphData = new GraphSession(canvas.getContext("2d"));
    let onPage = true;

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

        let withinCanvas = 0;
        if(ev.pageX < canvas.offsetLeft) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.LEFT;
        }
        if(ev.pageY < canvas.offsetTop) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.TOP;
        }
        if(ev.pageX > canvas.offsetLeft + canvas.offsetWidth) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.RIGHT;
        }
        if(ev.pageX > canvas.offsetTop + canvas.offsetHeight) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.BOTTOM;
        }
        if(!onPage) {
            withinCanvas |= MOUSE_EXIT_BOUND_DIRECTION.WINDOW;
        }

        return new MouseInteraction(ev.pageX - canvas.offsetLeft, ev.pageY - canvas.offsetTop, clickOptions, withinCanvas);
    }

    canvas.addEventListener("mousedown", ev => tool_onMouseDown(convertMouse(ev), graphData));
    // Can continue to control tool outside of canvas if tool allows it
    document.body.addEventListener("mouseup", ev => tool_onMouseUp(convertMouse(ev), graphData));
    document.body.addEventListener("mousemove", ev => tool_onMouseMove(convertMouse(ev), graphData));
    // Disable right click on canvas
    canvas.addEventListener("contextmenu", ev => ev.preventDefault());
    // Let tools decide what to do if mouse leaves canvas; call onMove to ensure tool knows that the mouse left the window
    document.addEventListener("mouseleave", ev => {
        onPage = false;
        tool_onMouseMove(convertMouse(ev), graphData);
    });
    document.addEventListener("mouseenter", ev => {
        onPage = true;
        tool_onMouseMove(convertMouse(ev), graphData);
    });

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