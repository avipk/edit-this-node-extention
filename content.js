const editThisNodeState = {
    lastRightClickX: -1,
    lastRightClickY: -1,
    node: null,
    originalContent: null
};

window.__editThisNodeState = editThisNodeState;

document.addEventListener("contextmenu", (event) => {
    editThisNodeState.lastRightClickX = event.clientX;
    editThisNodeState.lastRightClickY = event.clientY;
});
