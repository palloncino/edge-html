document.addEventListener('DOMContentLoaded', () => {
    const dot = document.querySelector('.custom-scrollbar .dot');
    const scrollbarHeight = document.querySelector('.custom-scrollbar').clientHeight - dot.clientHeight;
    const segmentHeight = scrollbarHeight / 3; // Dividing into 4 segments, 3 gaps
    let isDragging = false;
    let startY = 0;
    let startTop = 0;

    const logDotPosition = (position) => {
        console.log(`Dot position: ${position.toFixed(2)} / ${scrollbarHeight.toFixed(2)}`);
    };

    const onDrag = (e) => {
        if (isDragging) {
            const delta = e.clientY - startY;
            let newPosition = startTop + delta;

            // Restrict movement within the scrollbar
            if (newPosition < 0) newPosition = 0;
            if (newPosition > scrollbarHeight) newPosition = scrollbarHeight;

            dot.style.top = `${newPosition}px`;
            logDotPosition(newPosition);
        }
    };

    const onStopDrag = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onStopDrag);

        // Snap to the nearest segment
        const segmentStart = Math.floor(dot.offsetTop / segmentHeight) * segmentHeight;
        const segmentEnd = segmentStart + segmentHeight;
        let finalPosition;

        if (dot.offsetTop < segmentStart + segmentHeight / 2) {
            finalPosition = segmentStart;
        } else {
            finalPosition = segmentEnd;
        }

        dot.style.top = `${finalPosition}px`;
        logDotPosition(finalPosition);
    };

    dot.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startTop = dot.offsetTop;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onStopDrag);
    });
});
