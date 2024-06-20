// **GLOBAL SETTINGS**
const SCROLLBAR = document.querySelector(".custom-scrollbar");
const DOM_DOT = document.querySelector(".custom-scrollbar .dot");
const SECTIONS = document.querySelectorAll("section");
const SCROLLBAR_HEIGHT = SCROLLBAR.clientHeight - DOM_DOT.clientHeight;
const SEGMENT_HEIGHT = SCROLLBAR_HEIGHT / (SECTIONS.length - 1);
const TRANSITION_DURATION = 300; // Transition duration in milliseconds

let isDragging = false;
let startY = 0;
let startTop = 0;
let animationFrameId = null;

// **UTILITY FUNCTIONS**
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
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.overflow = 'hidden'; // Apply overflow: hidden on page load

    DOM_DOT.addEventListener("mousedown", (e) => {
        isDragging = true;
        document.body.style.overflow = 'auto'; // Allow natural scrolling during dragging
        startY = e.clientY;
        startTop = DOM_DOT.offsetTop;
        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", onStopDrag);
    });

    window.addEventListener("scroll", updateDotPosition);
});
