import { tool_onMouseDown, tool_onMouseMove, tool_onMouseUp } from "./tools/tool.js";
import initializeMenubar from "./menubar.js";
import initializeToolbar from "./toolbar.js";
import { GraphSession } from "./graph-session.js";
import { MOUSE_CLICK_TYPE, MOUSE_EXIT_BOUND_DIRECTION, MouseInteraction } from "./mouse-interaction.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("render");
    let graphData = new GraphSession(canvas.getContext("2d"));
    let onPage = true;
    let onMenubar = 0;

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

        // console.log(`SHIFTED X: ${(ev.pageX - canvas.offsetLeft) / graphData.viewport.scale + graphData.viewport.offsetX}`);
        // console.log(`SHIFTED Y: ${(ev.pageY - canvas.offsetTop) / graphData.viewport.scale + graphData.viewport.offsetY}`);
        return new MouseInteraction(
            ev.pageX - canvas.offsetLeft,
            ev.pageY - canvas.offsetTop,
            (ev.pageX - canvas.offsetLeft) / graphData.viewport.scale + graphData.viewport.offsetX,
            (ev.pageY - canvas.offsetTop) / graphData.viewport.scale + graphData.viewport.offsetY,
            clickOptions, withinCanvas);
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