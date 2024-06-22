document.addEventListener("DOMContentLoaded", () => {
    const currentPage = getPageKeyFromClass();
    if (!currentPage) {
        console.error('Unknown page configuration.');
        return;
    }
    const config = pageConfigurations[currentPage];

    const SECTIONS = document.querySelectorAll("section");
    const SVG_CONTAINERS = document.querySelectorAll(".section-svg-container");
    const SCROLLBAR = document.querySelector(".custom-scrollbar");
    const DOM_DOT = document.querySelector(".custom-scrollbar .dot");
    const APP_CONTAINER = document.querySelector('.app-container');
    const SCROLLBAR_HEIGHT = SCROLLBAR.clientHeight - DOM_DOT.clientHeight;
    const SEGMENT_HEIGHT = SCROLLBAR_HEIGHT / (config.sections - 1);
    const TRANSITION_DURATION = 300; // Transition duration in milliseconds

    let isDragging = false;
    let startY = 0;
    let startTop = 0;
    let animationFrameId = null;

    function setEventListeners() {
        window.addEventListener('resize', adjustWidth);
        window.addEventListener('load', adjustWidth);
        window.addEventListener('scroll', handleScroll);
        window.addEventListener('resize', positionSVGs);
        DOM_DOT.addEventListener("mousedown", startDrag);
    }

    function positionSVGs() {
        config.svgConfig.forEach(cfg => {
            const svg = SVG_CONTAINERS[cfg.index];
            const sectionHeight = SECTIONS[cfg.index].clientHeight;
            const svgHeight = sectionHeight / 2;

            svg.style.width = cfg.width;
            svg.style.height = `${svgHeight}px`;

            svg.style.position = 'absolute';
            if (cfg.top) svg.style.top = cfg.top;
            if (cfg.bottom) svg.style.bottom = cfg.bottom;
            if (cfg.right) svg.style.right = cfg.right;
            if (cfg.left) svg.style.left = cfg.left;

            svg.style.transform = 'translateX(0) rotate(0)';
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
        const cfg = config.svgConfig[index];
        const currentSVG = SVG_CONTAINERS[index];
        const nextSVG = SVG_CONTAINERS[index + 1];

        const rotationAngle = 20;
        const maxOffset = 1000;
        const additionalOffset = parseFloat(currentSVG.style.width) * 0.12;

        switch (cfg.movement) {
            case 'rightRotate':
                moveSVGRightRotate(currentSVG, nextSVG, progress, maxOffset, rotationAngle, additionalOffset);
                break;
            case 'leftRotate':
                moveSVGLeftRotate(currentSVG, nextSVG, progress, maxOffset, rotationAngle, additionalOffset);
                break;
            case 'upward':
                moveSVGUpward(currentSVG, nextSVG, progress, maxOffset);
                break;
            case 'right':
                moveSVGRight(currentSVG, nextSVG, progress, maxOffset);
                break;
            case 'left':
                moveSVGLeft(currentSVG, nextSVG, progress, maxOffset);
                break;
        }
    }

    function moveSVGRightRotate(currentSVG, nextSVG, progress, maxOffset, rotationAngle, additionalOffset) {
        const currentOffset = maxOffset * progress + additionalOffset;
        const currentRotation = rotationAngle * progress;
        currentSVG.style.transform = `translateX(${currentOffset}px) rotate(${currentRotation}deg)`;

        if (nextSVG) {
            const nextOffset = maxOffset * (1 - progress) + additionalOffset;
            const nextRotation = rotationAngle * (1 - progress);
            nextSVG.style.transform = `translateX(${nextOffset}px) rotate(${nextRotation}deg)`;
        }
    }

    function moveSVGLeftRotate(currentSVG, nextSVG, progress, maxOffset, rotationAngle, additionalOffset) {
        const currentOffset = maxOffset * progress + additionalOffset;
        const currentRotation = -rotationAngle * progress;
        currentSVG.style.transform = `translateX(-${currentOffset}px) rotate(${currentRotation}deg)`;

        if (nextSVG) {
            const nextOffset = maxOffset * (1 - progress) + additionalOffset;
            const nextRotation = -rotationAngle * (1 - progress);
            nextSVG.style.transform = `translateX(-${nextOffset}px) rotate(${nextRotation}deg)`;
        }
    }

    function moveSVGUpward(currentSVG, nextSVG, progress, maxOffset) {
        const currentOffset = maxOffset * progress;
        currentSVG.style.transform = `translateY(-${currentOffset}px)`;

        if (nextSVG) {
            const nextOffset = maxOffset * (1 - progress);
            nextSVG.style.transform = `translateY(-${nextOffset}px)`;
        }
    }

    function moveSVGRight(currentSVG, nextSVG, progress, maxOffset) {
        const currentOffset = maxOffset * progress;
        currentSVG.style.transform = `translateX(${currentOffset}px)`;

        if (nextSVG) {
            const nextOffset = maxOffset * (1 - progress);
            nextSVG.style.transform = `translateX(${nextOffset}px)`;
        }
    }

    function moveSVGLeft(currentSVG, nextSVG, progress, maxOffset) {
        const currentOffset = maxOffset * progress;
        currentSVG.style.transform = `translateX(-${currentOffset}px)`;

        if (nextSVG) {
            const nextOffset = maxOffset * (1 - progress);
            nextSVG.style.transform = `translateX(-${nextOffset}px)`;
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

            const scrollPosition = (currentPosition / SCROLLBAR_HEIGHT) * (config.sections - 1) * window.innerHeight;
            window.scrollTo({ top: scrollPosition });

            if (progress < 1) {
                animationFrameId = requestAnimationFrame(animationStep);
            } else {
                document.body.style.overflow = 'hidden';
                animationFrameId = null;
            }
        }

        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
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

            newPosition = Math.max(0, Math.min(newPosition, SCROLLBAR_HEIGHT));

            DOM_DOT.style.top = `${newPosition}px`;
            logDotPosition(newPosition);

            const scrollPosition = (newPosition / SCROLLBAR_HEIGHT) * (config.sections - 1) * window.innerHeight;
            window.scrollTo({ top: scrollPosition });
        }
    }

    function updateDotPosition() {
        if (animationFrameId) {
            return;
        }

        const scrollPosition = window.scrollY;
        const dotPosition = (scrollPosition / ((config.sections - 1) * window.innerHeight)) * SCROLLBAR_HEIGHT;
        DOM_DOT.style.top = `${dotPosition}px`;
        logDotPosition(dotPosition);
    }

    function adjustWidth() {
        const appContainer = document.querySelector('.app-container');
        const header = document.querySelector('.header');
        const scrollBar = document.querySelector('.custom-scrollbar');
        const viewportHeight = window.innerHeight;
        const viewportWidth = window.innerWidth;
        let computedWidth = (16 / 9) * viewportHeight;

        if (computedWidth > viewportWidth) {
            computedWidth = viewportWidth;
        }

        const marginRight = (viewportWidth - computedWidth) / 2;

        appContainer.style.width = `${computedWidth}px`;
        header.style.width = `${computedWidth}px`;
        scrollBar.style.marginRight = `calc(${marginRight}px + 1rem)`;
    }

    function startDrag(e) {
        isDragging = true;
        document.body.style.overflow = 'auto';
        startY = e.clientY;
        startTop = DOM_DOT.offsetTop;
        document.addEventListener("mousemove", onDrag);
        document.addEventListener("mouseup", onStopDrag);
    }

    function resetScrollPosition() {
        window.scrollTo(0, 0);
        DOM_DOT.style.top = '0px';
    }

    function getPageKeyFromClass() {
        const bodyClassList = document.body.classList;
        if (bodyClassList.contains('homepage')) return 'home';
        if (bodyClassList.contains('cosa-facciamo')) return 'whatWeDo';
        return null;
    }

    function initialSetup() {
        adjustWidth();
        resetScrollPosition();
        positionSVGs();
        handleScroll();
        setEventListeners();
    }

    initialSetup();
    document.body.style.overflow = 'hidden';
});
