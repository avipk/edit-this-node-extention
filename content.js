console.info(':::::::::: context menu file');
document.addEventListener("contextmenu", (event) => {
    console.info(':::::::::: context menu');
    window.lastRightClickX = event.clientX;
    window.lastRightClickY = event.clientY;
});
