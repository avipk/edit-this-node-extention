chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "edit-node",
        title: "Edit this node",
        contexts: ["all"]
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "edit-node") {
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: enableEditMode
        });
    }
});

function enableEditMode() {
    document.addEventListener("click", (event) => {
        if (window.editingNode) {
            window.editingNode.contentEditable = "false";
            window.editingNode = null;
        }
    }, { capture: true });

    document.addEventListener("contextmenu", (event) => {
        if (window.editingNode) {
            event.preventDefault();
        }
    });

    const targetNode = document.elementFromPoint(window.lastRightClickX, window.lastRightClickY);
    if (targetNode && targetNode.nodeType === Node.TEXT_NODE) {
        const editableNode = targetNode.parentNode;
        window.editingNode = editableNode;
        editableNode.contentEditable = "true";
        editableNode.classList.add("editing");
        editableNode.focus();

        const range = document.createRange();
        range.selectNodeContents(editableNode);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        editableNode.addEventListener("blur", () => {
            editableNode.contentEditable = "false";
            editableNode.classList.remove("editing");
            window.editingNode = null;
        });
    }
}
