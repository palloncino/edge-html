document.addEventListener("DOMContentLoaded", () => {
    const SECTIONS = document.querySelectorAll("section");
    const SVG_CONTAINERS = document.querySelectorAll(".section-svg-container");
    const SCROLLBAR = document.querySelector(".custom-scrollbar");
    const DOM_DOT = document.querySelector(".custom-scrollbar .dot");
    const APP_CONTAINER = document.querySelector('.app-container');
    const SCROLLBAR_HEIGHT = SCROLLBAR.clientHeight - DOM_DOT.clientHeight;
    const SEGMENT_HEIGHT = SCROLLBAR_HEIGHT / (SECTIONS.length - 1);
    const TRANSITION_DURATION = 300; // Transition duration in milliseconds

    let isDragging = false;
    let startY = 0;
    let startTop = 0;
    let animationFrameId = null;

    const svgConfig = [
        { index: 0, bottom: '0', right: '-12%', width: '65%' }, // SVG 1
        { index: 1, bottom: '15%', right: '10%', width: '50%' },  // SVG 2
        { index: 2, bottom: '0', right: '-20%', width: '100%' }, // SVG 3
        { index: 3, bottom: '0', right: '10%', width: '50%' }  // SVG 4
    ];

    // Function to set event listeners
    function setEventListeners() {
        window.addEventListener('resize', adjustWidth);
        window.addEventListener('load', adjustWidth);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', positionSVGs);
        DOM_DOT.addEventListener("mousedown", startDrag);
    }

    // Function to position SVGs according to the configuration
    function positionSVGs() {
        svgConfig.forEach(config => {
            const svg = SVG_CONTAINERS[config.index];
            const sectionHeight = SECTIONS[config.index].clientHeight;
            const svgHeight = sectionHeight / 2; // Make the SVG height half of the section height

            // Set the width and height of the SVG container
            svg.style.width = config.width;
            svg.style.height = `${svgHeight}px`;

            // Apply custom positioning from configuration
            svg.style.position = 'absolute';
            if (config.top) svg.style.top = config.top;
            if (config.bottom) svg.style.bottom = config.bottom;
            if (config.right) svg.style.right = config.right;
            if (config.left) svg.style.left = config.left;

            // Reset SVG transform to initial state
            svg.style.transform = 'translateX(0) rotate(0)';
        });
    }

    function handleScroll() {
        const scrollPosition = window.scrollY;
        const sectionHeight = window.innerHeight;

        SECTIONS.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + sectionHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                const progress = (scrollPosition - sectionTop) / sectionHeight;
                updateSVGPosition(index, progress);
            }
        });

        updateDotPosition();
    }

    function updateSVGPosition(index, progress) {
        const currentSVG = SVG_CONTAINERS[index];
        const nextSVG = SVG_CONTAINERS[index + 1];

        const rotationAngle = 20; // Maximum rotation angle
        const maxOffset = 1000; // Maximum offset for the SVGs
        const additionalOffset = parseFloat(currentSVG.style.width) * 0.12; // Additional offset for 12% of its width

        // Move the current SVG out to the right
        const currentOffset = maxOffset * progress + additionalOffset;
        const currentRotation = rotationAngle * progress;
        currentSVG.style.transform = `translateX(${currentOffset}px) rotate(${currentRotation}deg)`;

        // Move the next SVG in from the right
        if (nextSVG) {
            const nextOffset = maxOffset * (1 - progress) + additionalOffset;
            const nextRotation = rotationAngle * (1 - progress);
            nextSVG.style.transform = `translateX(${nextOffset}px) rotate(${nextRotation}deg)`;
        }
    }

    function logDotPosition(position) {
        console.log(`Dot position: ${position.toFixed(2)} / ${SCROLLBAR_HEIGHT.toFixed(2)}`);
    }

    function easeOutQuad(t) {
        return t * (2 - t);
    }

    function animateTransition(start, end, duration) {
        let startTime = null;

        function animationStep(timestamp) {
            if (!startTime) startTime = timestamp;
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easedProgress = easeOutQuad(progress);
            const currentPosition = start + (end - start) * easedProgress;

            DOM_DOT.style.top = `${currentPosition}px`;
            logDotPosition(currentPosition);

            const scrollPosition = (currentPosition / SCROLLBAR_HEIGHT) * (SECTIONS.length - 1) * window.innerHeight;
            window.scrollTo({ top: scrollPosition });

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animationStep);
            } else {
                document.body.style.overflow = 'hidden'; // Reapply overflow: hidden
                animationFrameId = null; // Reset the animation frame id
            }
        }

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId); // Cancel any ongoing animation
        }

        animationFrameId = requestAnimationFrame(animationStep);
    }

    function onStopDrag() {
        console.log('onStopDrag');
        isDragging = false;
        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("mouseup", onStopDrag);

        const nearestSegment = Math.round(DOM_DOT.offsetTop / SEGMENT_HEIGHT);
        const finalPosition = nearestSegment * SEGMENT_HEIGHT;
        animateTransition(DOM_DOT.offsetTop, finalPosition, TRANSITION_DURATION);
    }

    function onDrag(e) {
        if (isDragging) {
            const delta = e.clientY - startY;
            let newPosition = startTop + delta;

            // **Restrict movement within the scrollbar**
            newPosition = Math.max(0, Math.min(newPosition, SCROLLBAR_HEIGHT));

            DOM_DOT.style.top = `${newPosition}px`;
            logDotPosition(newPosition);

            // Calculate the corresponding scroll position and scroll the page
            const scrollPosition = (newPosition / SCROLLBAR_HEIGHT) * (SECTIONS.length - 1) * window.innerHeight;
            window.scrollTo({ top: scrollPosition });
        }
    }

    function updateDotPosition() {
        if (animationFrameId) {
            return; // If an animation is ongoing, skip updating the position
        }

        const scrollPosition = window.scrollY;
        const dotPosition = (scrollPosition / ((SECTIONS.length - 1) * window.innerHeight)) * SCROLLBAR_HEIGHT;
        DOM_DOT.style.top = `${dotPosition}px`;
        logDotPosition(dotPosition);
    }

    function adjustWidth() {
        const appContainer = document.querySelector('.app-container');
        const header = document.querySelector('.header');
        const scrollBar = document.querySelector('.custom-scrollbar');
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        let computedWidth = (16 / 9) * viewportHeight;

        // Check if the computed width exceeds the viewport width
        if (computedWidth > viewportWidth) {
            // If it does, use the viewport width and adjust the height to maintain a 1:1 ratio
            computedWidth = viewportWidth;
        }

        const marginRight = (viewportWidth - computedWidth) / 2;

        appContainer.style.width = `${computedWidth}px`;
        header.style.width = `${computedWidth}px`;
        scrollBar.style.marginRight = `calc(${marginRight}px + 1rem)`; // Adjust scrollbar margin-right
    }

    function startDrag(e) {
        isDragging = true;
        document.body.style.overflow = 'auto'; // Allow natural scrolling during dragging
        startY = e.clientY;
        startTop = DOM_DOT.offsetTop;
        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", onStopDrag);
    }

    function resetScrollPosition() {
        window.scrollTo(0, 0);
        DOM_DOT.style.top = '0px';
        positionSVGs(); // Ensure SVGs are reset to their initial positions
    }

    // Initial setup
    adjustWidth();
    resetScrollPosition();
    handleScroll();
    setEventListeners();

    // Apply overflow: hidden on page load
    document.body.style.overflow = 'hidden';
});
