document.addEventListener("DOMContentLoaded", () => {
    function adjustWidth() {
        const appContainer = document.querySelector('.app-container');
        const header = document.querySelector('.header');
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        let computedWidth = (16 / 9) * viewportHeight;

        // Check if the computed width exceeds the viewport width
        if (computedWidth > viewportWidth) {
            // If it does, use the viewport width and adjust the height to maintain a 1:1 ratio
            computedWidth = viewportWidth;
        }

        appContainer.style.width = `${computedWidth}px`;
        header.style.width = `${computedWidth}px`;
    }

    window.addEventListener('resize', adjustWidth);
    window.addEventListener('load', adjustWidth);

    // Initial adjustment when the DOM content is loaded
    adjustWidth();
});
