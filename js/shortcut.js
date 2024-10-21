const register = {}
let lockCount = 0;

document.addEventListener("keyup", ev => {
    if(lockCount === 0) {     
        const res = register[keysToString(ev.key, ev.ctrlKey, ev.shiftKey, ev.altKey)];

        if(res) {
            res();
        }
    }
});

/**
 * Lock the key listener, preventing the use of shortcuts. Intended mainly for textboxes overriding CTRL shortcuts. Should only be called in tandem with a later {@link unlockInput} call.
 */
export function lockInput() {
    lockCount++;
}

/**
 * Unlock the key listener, potentially allowing the use of shortcuts. Should only be called in tandem with an earlier {@link lockInput} call.
 */
export function unlockInput() {
    lockCount--;

    if(lockCount < 0) {
        lockCount = 0;
    }
}

/**
 * Registers a function to a specified combination of key inputs.
 * @param {()} func The function to call when the provided keys are pressed.
 * @param {String} keyName The name of the key as in {@link KeyboardEvent.key}
 * @param {Boolean} ctrlHeld Whether the CTRL key is being held.
 * @param {Boolean} shiftHeld Whether the SHIFT key is being held.
 * @param {Boolean} altHeld  Whether the ALT key is being held.
 * @returns {Boolean} Whether the key was already in use.
 */
export function registerKey(func, keyName, ctrlHeld = true, shiftHeld = false, altHeld = false) {
    const stringRep = keysToString(keyName, ctrlHeld, shiftHeld, altHeld);
    const exists = stringRep in register;

    register[stringRep] = func;
    return exists;
}

/**
 * Removes a key press shortcut.
 * @param {String} keyName The name of the key as in {@link KeyboardEvent.key}
 * @param {Boolean} ctrlHeld Whether the CTRL key is being held.
 * @param {Boolean} shiftHeld Whether the SHIFT key is being held.
 * @param {Boolean} altHeld  Whether the ALT key is being held.
 */
export function deregisterKey(keyName, ctrlHeld = true, shiftHeld = false, altHeld = false) {
    const stringRep = keysToString(keyName, ctrlHeld, shiftHeld, altHeld);
    if(stringRep in register) {
        delete register[stringRep];
    }
}

/**
 * Gets a string representation of the pressed keys.
 * @param {String} keyName The name of the key as in {@link KeyboardEvent.key}
 * @param {Boolean} ctrlHeld Whether the CTRL key is being held.
 * @param {Boolean} shiftHeld Whether the SHIFT key is being held.
 * @param {Boolean} altHeld  Whether the ALT key is being held.
 */
function keysToString(keyName, ctrlHeld, shiftHeld, altHeld) {
    let output = "";
    
    if(ctrlHeld) {
        output += "ctrl-";
    }
    if(shiftHeld) {
        output += "shift-";
    }
    if(altHeld) {
        output += "alt-";
    }

    return output + keyName;
}