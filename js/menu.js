import { undo, redo } from "./history.js";

export default function initialize(graphData) {
    document.querySelector("#undo-btn").onclick = () => undo(graphData);
    document.querySelector("#redo-btn").onclick = () => redo(graphData);

    document.addEventListener("keyup", ev => {
        if(ev.ctrlKey) {
            if(ev.key === "z") {
                undo(graphData);
            } else if(ev.key === "y") {
                redo(graphData);
            }
        }
    });
};