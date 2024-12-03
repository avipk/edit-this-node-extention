const editThisNodeState = {
    lastRightClickX: 0,
    lastRightClickY: 0,
    node: null
};

window.__editThisNodeState = editThisNodeState;

document.addEventListener("contextmenu", (event) => {
    editThisNodeState.lastRightClickX = event.clientX;
    editThisNodeState.lastRightClickY = event.clientY;
});
