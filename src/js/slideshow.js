// State variables
let slideIndex = 1;
let slideshowInterval;
let autoplayPauseTimeout;

// Constants
const AUTOPLAY_DELAY = 5000;
const PAUSE_DELAY_AFTER_INTERACTION = 10000;
const ANIMATION_STYLE = {
    in: 'slide-fade-in',
    out: 'slide-fade-out',
    thumbnailBounce: 'scaleUp 0.4s ease-out'
};

// Cached DOM elements
let slidesElements;
let dotsElements = [];
let thumbnailsElements = [];
let slideSelectorContainerElement;
let slideshowPagesContainerElement;
let liveRegionElement;
let slideshowContainerElement;


// Initialization
function initializeSlideshow() {
    cacheDOMElements();
    if (!slidesElements || slidesElements.length === 0) {
        console.warn('Slideshow: No slides found to initialize.');
        return;
    }

    generateThumbnailsAndListeners();
    generateDotIndicatorsAndListeners();
    
    dotsElements = slideshowPagesContainerElement ? Array.from(slideshowPagesContainerElement.querySelectorAll('.dot')) : [];
    thumbnailsElements = slideSelectorContainerElement ? Array.from(slideSelectorContainerElement.querySelectorAll('.slide-minimized')) : [];

    showSlide(slideIndex);
    setupKeyboardNavigation();
    createAccessibilityAnnouncer();
    startAutoplay();
}

function cacheDOMElements() {
    slideshowContainerElement = document.querySelector('.slideshow');
    if (!slideshowContainerElement) {
        console.error('Slideshow container (.slideshow) not found.');
        return;
    }
    slidesElements = slideshowContainerElement.querySelectorAll('.slides .slide');
    slideSelectorContainerElement = slideshowContainerElement.querySelector('.slide-selector');
    slideshowPagesContainerElement = slideshowContainerElement.querySelector('.slideshow-pages');
}

// Content generation and listener setup

function generateThumbnailsAndListeners() {
    if (!slideSelectorContainerElement || !slidesElements) return;
    
    slideSelectorContainerElement.innerHTML = '';
    
    slidesElements.forEach((slide, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'slide-minimized';
        thumbnail.tabIndex = 0;
        thumbnail.setAttribute('aria-label', `Thumbnail ${index + 1}`);
        
        if (index === slideIndex -1) {
            thumbnail.classList.add('active');
        }
        
        const originalImg = slide.querySelector('img');
        if (originalImg) {
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = originalImg.src;
            thumbnailImg.alt = '';
            thumbnail.appendChild(thumbnailImg);
        }

        const handleInteraction = () => {
            const targetSlideIndex = index + 1;
            if (slideIndex !== targetSlideIndex) {
                pauseAutoplay();
            }
            showSlide(targetSlideIndex);
        };

        thumbnail.addEventListener('click', handleInteraction);
        thumbnail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleInteraction();
                e.preventDefault();
            }
        });
        
        slideSelectorContainerElement.appendChild(thumbnail);
    });
}

function generateDotIndicatorsAndListeners() {
    if (!slideshowPagesContainerElement || !slidesElements) return;

    const existingDots = slideshowPagesContainerElement.querySelectorAll('.dot');
    existingDots.forEach(dot => dot.remove());
    
    const nextArrow = slideshowPagesContainerElement.querySelector('a[onclick*="plusSlides(1)"]');

    for (let i = 0; i < slidesElements.length; i++) {
        const dot = document.createElement('span');
        dot.className = 'dot';
        if (i === slideIndex -1 ) dot.classList.add('active');
        
        dot.tabIndex = 0;
        dot.setAttribute('aria-label', `Go to slide ${i + 1}`);

        const handleInteraction = () => {
            const targetSlideIndex = i + 1;
            if (slideIndex !== targetSlideIndex) {
                pauseAutoplay();
            }
            showSlide(targetSlideIndex);
        };

        dot.onclick = handleInteraction;
        dot.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                handleInteraction();
                e.preventDefault();
            }
        });
        
        if (nextArrow) {
            slideshowPagesContainerElement.insertBefore(dot, nextArrow);
        } else {
            slideshowPagesContainerElement.appendChild(dot);
        }
    }
}

// Navigation

function plusSlides(n) {
    if (n !== 0) { 
        pauseAutoplay();
    }
    showSlide(slideIndex + n);
}

function showSlide(n) {
    if (!slidesElements || slidesElements.length === 0) return;
    
    let newSlideIndex = n;
    if (newSlideIndex > slidesElements.length) newSlideIndex = 1;
    if (newSlideIndex < 1) newSlideIndex = slidesElements.length;
    slideIndex = newSlideIndex;

    hideAllSlides();
    resetActiveIndicators();
    activateCurrentSlide(slideIndex - 1);
    announceSlideChange(slideIndex);
}

// DOM manipulation helpers

function removeAnimationClasses(element) {
    element.classList.remove(ANIMATION_STYLE.in, ANIMATION_STYLE.out);
}

function hideAllSlides() {
    slidesElements.forEach(slide => {
        slide.style.display = "none";
        removeAnimationClasses(slide);
    });
}

function resetActiveIndicators() {
    dotsElements.forEach(dot => dot.classList.remove('active'));
    thumbnailsElements.forEach(thumbnail => thumbnail.classList.remove('active'));
}

function activateCurrentSlide(index) {
    if (index < 0 || index >= slidesElements.length) return;

    const currentSlide = slidesElements[index];
    currentSlide.style.display = "block";
    currentSlide.classList.add(ANIMATION_STYLE.in);
    
    if (dotsElements[index]) {
        dotsElements[index].classList.add('active');
    }
    if (thumbnailsElements[index]) {
        thumbnailsElements[index].classList.add('active');
        
        thumbnailsElements[index].style.animation = 'none'; 
        void thumbnailsElements[index].offsetHeight; 
        thumbnailsElements[index].style.animation = ANIMATION_STYLE.thumbnailBounce;
    }
}

// Event handlers (Keyboard Navigation)

function setupKeyboardNavigation() {
    if (slideshowContainerElement) {
        document.addEventListener('keydown', handleKeyboardNavigation);
    }
}

function handleKeyboardNavigation(e) {
    if (!slideshowContainerElement || !slideshowContainerElement.contains(document.activeElement)) return;
    
    if (e.key === 'ArrowLeft') {
        plusSlides(-1);
        e.preventDefault();
    } else if (e.key === 'ArrowRight') {
        plusSlides(1);
        e.preventDefault();
    }
}

// Accessibility

function createAccessibilityAnnouncer() {
    liveRegionElement = document.getElementById('slideshow-live-region');
    if (liveRegionElement) return;
    
    liveRegionElement = document.createElement('div');
    liveRegionElement.id = 'slideshow-live-region';
    liveRegionElement.className = 'visually-hidden';
    liveRegionElement.setAttribute('aria-live', 'polite');
    document.body.appendChild(liveRegionElement);
}

function announceSlideChange(currentIndex) {
    if (!liveRegionElement || !slidesElements) return;
    liveRegionElement.textContent = `Showing slide ${currentIndex} of ${slidesElements.length}`;
}

// Autoplay functionality

function startAutoplay() {
    clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
        plusSlides(1);
    }, AUTOPLAY_DELAY);
}

function pauseAutoplay() {
    clearInterval(slideshowInterval);
    slideshowInterval = null;
    
    clearTimeout(autoplayPauseTimeout);
    autoplayPauseTimeout = setTimeout(() => {
        startAutoplay();
    }, PAUSE_DELAY_AFTER_INTERACTION);
}

document.addEventListener('DOMContentLoaded', initializeSlideshow);