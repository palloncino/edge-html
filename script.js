document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const pin = document.querySelector('.custom-scrollbar .pin');
    const totalSections = sections.length;
    let currentSection = 0;
    let isDragging = false;

    const state = {
        scrollPosition: 0
    };

    const setScrollPosition = (position) => {
        console.log(`Setting scroll position: ${position}`);
        state.scrollPosition = position;
        window.scrollTo({
            top: position,
            behavior: 'smooth'
        });
        updatePinPosition(position);
    };

    const updatePinPosition = (position) => {
        const totalHeight = window.innerHeight * (totalSections - 1);
        const percentage = (position / totalHeight) * 100;
        console.log(`Updating pin position: ${percentage}%`);
        pin.style.top = `${percentage}%`;
    };

    const onScrollUp = () => {
        console.log('Scrolling up');
        if (currentSection > 0) {
            currentSection -= 1;
            console.log(`Current section after scrolling up: ${currentSection}`);
            setScrollPosition(currentSection * window.innerHeight);
        }
    };

    const onScrollDown = () => {
        console.log('Scrolling down');
        if (currentSection < totalSections - 1) {
            currentSection += 1;
            console.log(`Current section after scrolling down: ${currentSection}`);
            setScrollPosition(currentSection * window.innerHeight);
        }
    };

    pin.addEventListener('mousedown', (e) => {
        console.log('Pin mousedown');
        isDragging = true;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onStopDrag);
    });

    const onDrag = (e) => {
        if (isDragging) {
            const totalHeight = window.innerHeight * totalSections;
            const newPosition = Math.min(Math.max(e.clientY, 0), totalHeight - window.innerHeight);
            const newSection = Math.floor(newPosition / window.innerHeight);

            console.log(`Dragging pin to position: ${newPosition}, section: ${newSection}`);

            if (newSection !== currentSection) {
                currentSection = newSection;
                setScrollPosition(currentSection * window.innerHeight);
            }
        }
    };

    const onStopDrag = () => {
        console.log('Stopping drag');
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onStopDrag);
    };

    pin.addEventListener('click', () => {
        console.log('Pin click');
        if (currentSection > 0) {
            onScrollUp();
        }
    });

    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0) {
            onScrollUp();
        } else {
            onScrollDown();
        }
    }, { passive: false });

    // Initial set
    setScrollPosition(0);
});
