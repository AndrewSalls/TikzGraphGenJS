import { clearData } from "./tools.js";

class Edit {
    constructor(type, targetData) {
        this.type = type;
        this.targetData = targetData;
    }
}

const history = [];
let editPos = -1;
let maxHistory = 500;

function makeEdit(edit) {
    //Cycle out old history
    if(history.length === maxHistory) {
        history.shift();
    }

    //Remove alternate history if undo was used
    for(let x = history.length - 1; x > editPos; x--) {
        history.pop();
    }

    //Add to history
    history.push(edit);
    editPos = editPos + 1;
}

function undo(graphData) {
    clearData(graphData);
    if(editPos >= 0) {
        handleEdit(graphData, history[editPos], true);
        editPos = editPos - 1;
    }
}

function redo(graphData) {
    clearData(graphData);
    if(editPos < history.length - 1) {
        editPos = editPos + 1;
        handleEdit(graphData, history[editPos], false);
    }
}

function handleEdit(graphData, edit, inverted = false) {
    switch(edit.type) {
        case "add":
            if(inverted) {
                removeEdit(graphData, edit.targetData);
            } else {
                addEdit(graphData, edit.targetData);
            }
            break;
        case "remove":
            if(inverted) {
                addEdit(graphData, edit.targetData);
            } else {
                removeEdit(graphData, edit.targetData);
            }
            break;
        case "mutation":
            if(inverted) {
                mutationEdit(graphData, edit.targetData.type, edit.targetData.id, edit.targetData.originalValues);
            } else {
                mutationEdit(graphData, edit.targetData.type, edit.targetData.id, edit.targetData.modifiedValues);
            }
            break;
        case "composite":
            if(inverted) {
                for(let x = edit.targetData.length - 1; x >= 0; x--) {
                    handleEdit(edit.targetData[x], inverted);
                }
            } else {
                for(const subEdit of edit.targetData) {
                    handleEdit(subEdit, inverted);
                }
            }
            break;
        default:
            console.error("Unexpected edit type: recieved " + edit.type);
    }
}

function addEdit(graphData, editData) {
    switch(editData.constructor.name) {
        case "Vertex":
            let x = 0;
            for(; x < graphData.vertices.length; x++) {
                if(graphData.vertices[x].id > editData.id) {
                    break;
                }
            }
            graphData.vertices.splice(x, 0, editData);
            break;
        case "Edge":
            let y = 0;
            for(; y < graphData.edges.length; y++) {
                if(graphData.edges[y].id > editData.id) {
                    break;
                }
            }
            graphData.edges.splice(y, 0, editData);
            break;
        default:
            console.error("Add edit not defined for type " + editData.constructor.name);
    }
}

function removeEdit(graphData, editData) {
    switch(editData.constructor.name) {
        case "Vertex":
            for(let x = graphData.vertices.length - 1; x >= 0; x--) {
                if(graphData.vertices[x].id === editData.id) {
                    graphData.vertices.splice(x, 1);
                }
            }
            break;
        case "Edge":
            for(let x = graphData.edges.length - 1; x >= 0; x--) {
                if(graphData.edges[x].id === editData.id) {
                    graphData.edges.splice(x, 1);
                }
            }
            break;
        default:
            console.error("Remove edit not defined for type " + editData.constructor.name);
    }
}

function mutationEdit(graphData, type, id, toModify) {
    // IMPORTANT: for simplicity & consistancy, objects should not gain or lose keys over their lifetime; 
    // otherwise this will not properly replace keys. Also, edits should not change object id
    switch(type) {
        case "Vertex":
            for(let x = graphData.vertices.length - 1; x >= 0; x--) {
                if(graphData.vertices[x].id === id) {
                    for(const key of Object.keys(toModify)) {
                        graphData.vertices[x][key] = toModify[key];
                    }
                }
            }
            break;
        case "Edge":
            for(let x = graphData.edges.length - 1; x >= 0; x--) {
                if(graphData.edges[x].id === id) {
                    for(const key of Object.keys(toModify)) {
                        graphData.edges[x][key] = toModify[key];
                    }
                }
            }
            break;
        default:
            console.error("Mutation edit not defined for type " + type);
    }
}

export { Edit, makeEdit, undo, redo };