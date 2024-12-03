chrome.runtime.onInstalled.addListener(() => {
    // Creates a context menu-item
    chrome.contextMenus.create({
        id: "edit-node",
        title: "Edit this node",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    // If user clicked the "Edit this node" menu-item
    if (info.menuItemId === "edit-node") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: enableEditMode
        });
    }
});

function clearEditableNode() {
    const state = window.__editThisNodeState;
    clearEditableNode();
}

function enableEditMode() {
    // When clicking out-side the element, removes the contenteditable.
    const state = window.__editThisNodeState;

    document.addEventListener("click", (event) => {
        const editableNode = event.target.closest('[contentEditable]');
        // If click occured inside the editable node. cancel operation
        if (editableNode) {
            event.preventDefault();
        }
        // If click occured outside the editable node, asume  cancel operation
        else if (state.node) {
            event.preventDefault();
            state.node.removeAttribute('contentEditable');
            state.node = null;
        }
    }, { capture: true });

    // disable the context-menu when edit is on ?
    document.addEventListener("contextmenu", (event) => {
        if (state.node) {
            event.preventDefault();
        }
    });

    const targetNode = document.elementFromPoint(state.lastRightClickX, state.lastRightClickY);
    if (targetNode) {
        const editableNode = targetNode.closest(':not(:empty)');
        state.node = editableNode;
        editableNode.setAttribute('contentEditable', true);
        editableNode.focus();

        const range = document.createRange();
        range.selectNodeContents(editableNode);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        editableNode.addEventListener("blur", clearEditableNode);
    }
}
