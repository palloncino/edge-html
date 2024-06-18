document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('.section');
    const dots = document.querySelectorAll('.custom-scrollbar .dot');
    const totalSections = sections.length;
    let currentSection = 0;
    let isDragging = false;

    const setScrollPosition = (position) => {
        console.log(`Setting scroll position: ${position}`);
        window.scrollTo({
            top: position,
            behavior: 'smooth'
        });
    };

    const updateActiveDot = (index) => {
        console.log(`Updating active dot: ${index}`);
        dots.forEach((dot, i) => {
            if (i === index) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    };

    const scrollToSection = (index) => {
        if (index >= 0 && index < totalSections) {
            console.log(`Scrolling to section: ${index}`);
            currentSection = index;
            const position = index * window.innerHeight;
            setScrollPosition(position);
            updateActiveDot(index);
        }
    };

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            console.log(`Dot clicked: ${index}`);
            scrollToSection(index);
        });

        dot.addEventListener('mousedown', () => {
            console.log(`Dot mousedown: ${index}`);
            isDragging = true;
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', onStopDrag);
        });

        const onDrag = (e) => {
            if (isDragging) {
                const totalHeight = window.innerHeight;
                const newPosition = e.clientY;
                const newSection = Math.floor((newPosition - dots[0].getBoundingClientRect().top) / (totalHeight / totalSections));

                if (newSection !== currentSection && newSection >= 0 && newSection < totalSections) {
                    console.log(`Dragging to section: ${newSection}`);
                    scrollToSection(newSection);
                }
            }
        };

        const onStopDrag = () => {
            console.log('Stopping drag');
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', onStopDrag);
        };
    });

    // Prevent natural scrolling
    window.addEventListener('wheel', (e) => {
        e.preventDefault();
        if (e.deltaY < 0 && currentSection > 0) {
            console.log('Wheel scroll up');
            scrollToSection(currentSection - 1);
        } else if (e.deltaY > 0 && currentSection < totalSections - 1) {
            console.log('Wheel scroll down');
            scrollToSection(currentSection + 1);
        }
    }, { passive: false });

    // Initial set
    scrollToSection(0);
});
