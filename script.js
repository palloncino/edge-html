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

    // Function to position SVGs halfway on the bottom line of each section and set their width
    function positionSVGs() {
        const appContainerWidth = APP_CONTAINER.clientWidth;
        const svgWidth = appContainerWidth * 0.75;

        SECTIONS.forEach((section, index) => {
            const svg = SVG_CONTAINERS[index];
            const sectionHeight = section.clientHeight;
            const svgHeight = sectionHeight / 2; // Make the SVG height half of the section height

            // Set the width and height of the SVG container
            svg.style.width = `${svgWidth}px`;
            svg.style.height = `${svgHeight}px`;

            // Calculate position: halfway hidden at the bottom of the section
            const initialTop = sectionHeight - (svgHeight / 2);
            svg.style.top = `${initialTop}px`;
            svg.style.right = '0'; // Ensure the SVG is aligned to the right
            svg.style.position = 'absolute'; // Ensure the position is absolute
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

        // Move the current SVG out to the right
        const currentOffset = maxOffset * progress;
        const currentRotation = rotationAngle * progress;
        currentSVG.style.transform = `translateX(${currentOffset}px) rotate(${currentRotation}deg)`;

        // Move the next SVG in from the right
        if (nextSVG) {
            const nextOffset = maxOffset * (1 - progress);
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

    // **EVENT LISTENERS**
    document.body.style.overflow = 'hidden'; // Apply overflow: hidden on page load

    DOM_DOT.addEventListener("mousedown", (e) => {
        isDragging = true;
        document.body.style.overflow = 'auto'; // Allow natural scrolling during dragging
        startY = e.clientY;
        startTop = DOM_DOT.offsetTop;
        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", onStopDrag);
    });

    window.addEventListener("scroll", handleScroll);
    window.addEventListener('resize', positionSVGs); // Recalculate positions on resize

    // Initial call to position SVGs and dot correctly
    positionSVGs();
    handleScroll();
});
