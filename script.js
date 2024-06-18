document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const dot = document.querySelector('.custom-scrollbar .dot');
    const totalSections = sections.length;
    const sectionHeight = window.innerHeight;
    let currentSection = 0;
    let isDragging = false;
    let startY = 0;
    let startTop = 0;
    let preventScroll = false;

    const setScrollPosition = (position) => {
        console.log(`Setting scroll position: ${position}`);
        window.scrollTo({
            top: position,
            behavior: 'smooth'
        });
        logScrollValue(position);
    };

    const updateDotPosition = (index) => {
        const step = (document.querySelector('.custom-scrollbar').clientHeight - dot.clientHeight) / (totalSections - 1);
        dot.style.top = `${index * step}px`;
    };

    const scrollToSection = (index) => {
        if (index >= 0 && index < totalSections) {
            currentSection = index;
            const position = index * sectionHeight;
            setScrollPosition(position);
            updateDotPosition(index);
        }
    };

    dot.addEventListener('mousedown', (e) => {
        isDragging = true;
        preventScroll = true;
        startY = e.clientY;
        startTop = dot.offsetTop;
        document.addEventListener('mousemove', onDrag);
        document.addEventListener('mouseup', onStopDrag);
    });

    const onDrag = (e) => {
        if (isDragging) {
            const step = (document.querySelector('.custom-scrollbar').clientHeight - dot.clientHeight) / (totalSections - 1);
            const delta = e.clientY - startY;
            const newPosition = startTop + delta;

            if (newPosition >= 0 && newPosition <= step * (totalSections - 1)) {
                dot.style.top = `${newPosition}px`;

                const newSection = Math.round(newPosition / step);
                if (newSection !== currentSection) {
                    currentSection = newSection;
                    setScrollPosition(newSection * sectionHeight);
                }
            }
        }
    };

    const onStopDrag = () => {
        isDragging = false;
        preventScroll = false;
        const step = (document.querySelector('.custom-scrollbar').clientHeight - dot.clientHeight) / (totalSections - 1);
        const newPosition = dot.offsetTop;
        const newSection = Math.round(newPosition / step);
        scrollToSection(newSection);
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onStopDrag);
    };

    // Debounce function to limit the rate at which a function can fire
    const debounce = (func, wait) => {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), wait);
        };
    };

    window.addEventListener('scroll', debounce(() => {
        if (!preventScroll) {
            const currentPosition = window.scrollY;
            const newSection = Math.round(currentPosition / sectionHeight);
            if (newSection !== currentSection) {
                currentSection = newSection;
                updateDotPosition(newSection);
                logScrollValue(currentPosition);
            }
        }
    }, 200));

    // Handle wheel events
    window.addEventListener('wheel', (e) => {
        if (!preventScroll) {
            e.preventDefault();
            if (e.deltaY < 0 && currentSection > 0) {
                scrollToSection(currentSection - 1);
            } else if (e.deltaY > 0 && currentSection < totalSections - 1) {
                scrollToSection(currentSection + 1);
            }
        }
    }, { passive: false });

    // Log scroll value
    const logScrollValue = (value) => {
        console.log(`Scroll position: ${value}`);
    };

    // Initial set
    scrollToSection(0);
});
