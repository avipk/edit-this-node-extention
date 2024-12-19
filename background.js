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

function enableEditMode() {
    const EMPTY_NODE_SELECTOR = ':is(span,div,a):is(:empty)';
    const NODE_WITH_TEXT_SELECTOR = ':not(:empty)';

    function disableEditMode() {
        const state = window.__editThisNodeState;
        enableEmptyNodes();
        state.node.removeAttribute('contentEditable');
        state.node.removeEventListener('blur', disableEditMode);
        state.node.removeEventListener('paste', handlePaste);
        state.node = null;
        state.originalContent = null;
        state.lastRightClickX = -1;
        state.lastRightClickY = -1;
        document.removeEventListener('keydown', handleKeyDown);
    }

    function disableEmptyNodes() {
        const state = window.__editThisNodeState;
        const emptyNodes = state.node.querySelectorAll(EMPTY_NODE_SELECTOR);
        emptyNodes.forEach(emptyNode => {
            emptyNode.setAttribute('data-display', emptyNode.style.display)
            emptyNode.style.display = 'none';
        });
    }

    function enableEmptyNodes() {
        const state = window.__editThisNodeState;
        const emptyNodes = state.node.querySelectorAll(EMPTY_NODE_SELECTOR);
        emptyNodes.forEach(emptyNode => {
            if (emptyNode.hasAttribute('data-display')) {
                emptyNode.style.display = emptyNode.style.display = emptyNode.getAttribute('data-display');
                emptyNode.removeAttribute('data-display');
            }
        });
    }

    function isEditMode() {
        return !!window?.__editThisNodeState?.node;

    }

    function handleKeyDown(event) {
        const keyCode = event.keyCode;

        switch (keyCode) {
            case 13: // enter
                event.preventDefault();
                disableEditMode();
                break;
            case 27: // escape
                const state = window.__editThisNodeState;
                state.node.innerHTML = state.originalContent;
                event.preventDefault();
                disableEditMode();
                break;
            default:
            // do nothing      
        }
    }

    function handlePaste(event) {
        console.info(':::::::::: paste handler');
        event.preventDefault();

        let paste = (event.clipboardData || window.clipboardData).getData("text");
        const selection = window.getSelection();
        selection.deleteFromDocument();
        selection.getRangeAt(0).insertNode(document.createTextNode(paste));
    }

    // When clicking out-side the element, removes the contenteditable.
    const state = window.__editThisNodeState;

    document.addEventListener("click", (event) => {
        const editableNode = event.target.closest('[contentEditable]');
        // If click occured inside the editable node. cancel operation
        if (editableNode) {
            event.preventDefault();            
        }
        // If click occured outside the editable node, asume  cancel operation
        else if (isEditMode()) {
            event.preventDefault();
            disableEditMode();
        }
    }, { capture: true });

    const hasLegalCordinates = state.lastRightClickX > 0 && state.lastRightClickY > 0;
    if (!hasLegalCordinates) {
        alert('Unable to get cordinates for the element');
    }

    const targetNode = hasLegalCordinates && document.elementFromPoint(state.lastRightClickX, state.lastRightClickY);
    if (targetNode) {
        const editableNode = targetNode.closest(NODE_WITH_TEXT_SELECTOR);
        state.node = editableNode;
        state.originalContent = state.node.innerHTML;

        editableNode.setAttribute('contentEditable', true);
        editableNode.focus();

        const range = document.createRange();
        range.selectNodeContents(editableNode);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        editableNode.addEventListener('paste', handlePaste);
        editableNode.addEventListener("blur", disableEditMode);
        disableEmptyNodes();
        document.addEventListener('keydown', handleKeyDown);
    }
}
