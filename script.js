document.addEventListener("DOMContentLoaded", () => {
  const OUTPUT_DIV = document.querySelector(".output");
  const DOT = document.querySelector(".custom-scrollbar .dot");
  const scrollbarHeight =
    document.querySelector(".custom-scrollbar").clientHeight - DOT.clientHeight;
  const segmentHeight = scrollbarHeight / 3; // Dividing into 4 segments, 3 gaps
  let isDragging = false;
  let startY = 0;
  let startTop = 0;

  const logDotPosition = (position) => {
    OUTPUT_DIV.textContent = `Dot position: ${position.toFixed(
      2
    )} / ${scrollbarHeight.toFixed(2)}`;
    console.log(
      `Dot position: ${position.toFixed(2)} / ${scrollbarHeight.toFixed(2)}`
    );
  };

  const onStopDrag = () => {
    isDragging = false;
    document.removeEventListener("mousemove", onDrag);
    document.removeEventListener("mouseup", onStopDrag);

    // Smooth transition to the nearest segment endpoint
    const segmentStart =
      Math.floor(DOT.offsetTop / segmentHeight) * segmentHeight;
    const segmentEnd = segmentStart + segmentHeight;
    let finalPosition;

    if (DOT.offsetTop < segmentStart + segmentHeight / 2) {
      finalPosition = segmentStart;
    } else {
      finalPosition = segmentEnd;
    }

    // Adding smooth transition
    DOT.style.transition = "top 0.3s ease-out";
    DOT.style.top = `${finalPosition}px`;
    logDotPosition(finalPosition);

    // Remove the transition after it's done to ensure instant movement during dragging
    setTimeout(() => {
      DOT.style.transition = "";
    }, 300);
  };

  DOT.addEventListener("mousedown", (e) => {
    isDragging = true;
    startY = e.clientY;
    startTop = DOT.offsetTop;
    document.addEventListener("mousemove", onDrag);
    document.addEventListener("mouseup", onStopDrag);
  });

  // UTILS
  function onDrag(e) {
    if (isDragging) {
      const delta = e.clientY - startY;
      let newPosition = startTop + delta;

      // Restrict movement within the scrollbar
      if (newPosition < 0) newPosition = 0;
      if (newPosition > scrollbarHeight) newPosition = scrollbarHeight;

      DOT.style.top = `${newPosition}px`;
      logDotPosition(newPosition);
    }
  }
});
