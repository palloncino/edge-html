document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const dot = document.querySelector('.custom-scrollbar .dot');
    const totalSections = sections.length;
    const sectionHeight = window.innerHeight;
    let currentSection = 0;
    let isDragging = false;
    let startY = 0;
    let startTop = 0;

    const setScrollPosition = (position) => {
        window.scrollTo({
            top: position,
            behavior: 'smooth'
        });
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
            const newSection = Math.round(newPosition / step);

            if (newSection !== currentSection && newSection >= 0 && newSection < totalSections) {
                scrollToSection(newSection);
            }
        }
    };

    const onStopDrag = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', onStopDrag);
    };

    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0 && currentSection > 0) {
            scrollToSection(currentSection - 1);
        } else if (e.deltaY > 0 && currentSection < totalSections - 1) {
            scrollToSection(currentSection + 1);
        }
    }, { passive: false });

    // Initial set
    scrollToSection(0);
});
