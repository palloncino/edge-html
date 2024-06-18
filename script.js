document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const dot = document.querySelector('.custom-scrollbar .dot');
    const totalSections = sections.length;
    const sectionHeight = window.innerHeight;
    const scrollHeight = document.body.scrollHeight - window.innerHeight;
    const scrollbarHeight = document.querySelector('.custom-scrollbar').clientHeight - dot.clientHeight;
    let isDragging = false;
    let startY = 0;
    let startTop = 0;

    const debounce = (func, wait) => {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    };

    const setScrollPosition = (position) => {
        window.scrollTo({
            top: position,
            behavior: 'smooth'
        });
        logScrollValue(position);
    };

    const updateDotPosition = (scrollY) => {
        const positionRatio = scrollY / scrollHeight;
        const dotPosition = positionRatio * scrollbarHeight;
        dot.style.top = `${dotPosition}px`;
    };

    const scrollToSection = (index) => {
        if (index >= 0 && index < totalSections) {
            const position = index * sectionHeight;
            setScrollPosition(position);
            updateDotPosition(position);
        }
    };

    dot.addEventListener('mousedown', (e) => {
        isDragging = true;
        startY = e.clientY;
        startTop = dot.offsetTop;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onStopDrag);
    });

    const onDrag = (e) => {
        if (isDragging) {
            const delta = e.clientY - startY;
            let newPosition = startTop + delta;

            if (newPosition < 0) newPosition = 0;
            if (newPosition > scrollbarHeight) newPosition = scrollbarHeight;

            const positionRatio = newPosition / scrollbarHeight;
            const scrollY = positionRatio * scrollHeight;
            dot.style.top = `${newPosition}px`;
            window.scrollTo({
                top: scrollY,
                behavior: 'auto'
            });
            logScrollValue(scrollY);
        }
    };

    const onStopDrag = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onStopDrag);

        // Snap to the nearest section
        const positionRatio = dot.offsetTop / scrollbarHeight;
        const scrollY = positionRatio * scrollHeight;
        const newSection = Math.round(scrollY / sectionHeight);
        scrollToSection(newSection);
    };

    window.addEventListener('scroll', debounce(() => {
        if (!isDragging) {
            const currentPosition = window.scrollY;
            updateDotPosition(currentPosition);
        }
    }, 200));

    const logScrollValue = (value) => {
        console.log(`Scroll position: ${value}`);
    };

    // Initial set
    scrollToSection(0);
});
