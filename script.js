// **GLOBAL SETTINGS**
const SCROLLBAR = document.querySelector(".custom-scrollbar");
const DOM_OUTPUT_DIV = document.querySelector(".output");
const DOM_DOT = document.querySelector(".custom-scrollbar .dot");
const SECTIONS = document.querySelectorAll("section");
const SCROLLBAR_HEIGHT = SCROLLBAR.clientHeight - DOM_DOT.clientHeight;
const SEGMENT_HEIGHT = SCROLLBAR_HEIGHT / (SECTIONS.length - 1);
const TRANSITION_DURATION = 300; // Transition duration in milliseconds

let isDragging = false;
let startY = 0;
let startTop = 0;

// **UTILITY FUNCTIONS**
function logDotPosition(position) {
  DOM_OUTPUT_DIV.textContent = `${position.toFixed(
    2
  )} / ${SCROLLBAR_HEIGHT.toFixed(2)}`;
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

    if (progress < 1) {
      requestAnimationFrame(animationStep);
    }
  }

  requestAnimationFrame(animationStep);
}

function scrollToSection(index) {
  const targetTop = index * window.innerHeight;
  window.scrollTo({ top: targetTop, behavior: 'smooth' });
}

function onStopDrag() {
  isDragging = false;
  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", onStopDrag);

  const nearestSegment = Math.round(DOM_DOT.offsetTop / SEGMENT_HEIGHT);
  const finalPosition = nearestSegment * SEGMENT_HEIGHT;
  animateTransition(DOM_DOT.offsetTop, finalPosition, TRANSITION_DURATION);
  scrollToSection(nearestSegment);
}

function onDrag(e) {
  if (isDragging) {
    const delta = e.clientY - startY;
    let newPosition = startTop + delta;

    // **Restrict movement within the scrollbar**
    newPosition = Math.max(0, Math.min(newPosition, SCROLLBAR_HEIGHT));

    DOM_DOT.style.top = `${newPosition}px`;
    logDotPosition(newPosition);
  }
}

// **EVENT LISTENERS**
document.addEventListener("DOMContentLoaded", () => {
  // Prevent natural scrolling
  window.addEventListener('scroll', (e) => {
    e.preventDefault();
    window.scrollTo(0, 0);
  });

  DOM_DOT.addEventListener("mousedown", (e) => {
    isDragging = true;
    startY = e.clientY;
    startTop = DOM_DOT.offsetTop;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", onStopDrag);
  });
});
