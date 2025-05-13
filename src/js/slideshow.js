document.addEventListener('DOMContentLoaded', initializeSlideshow);

// State variables
let slideIndex = 1;
let slideshowInterval;
let autoplayPauseTimeout;
const autoplayDelay = 5000;
const pauseDelay = 10000; // 10 seconds pause after manual interaction

// Animation styles
const animationStyle = {
    in: 'slide-fade-in',
    out: 'slide-fade-out',
    thumbnailBounce: 'scaleUp 0.4s ease-out'
};

// Initialization
function initializeSlideshow() {
    generateThumbnails();
    generateDotIndicators();
    showSlide(slideIndex);
    setupThumbnailListeners();
    setupKeyboardNavigation();
    createAccessibilityAnnouncer();
    startAutoplay();
}

// Content generation

function generateThumbnails() {
    const slides = document.querySelectorAll('.slide');
    const slideSelector = document.querySelector('.slide-selector');
    
    if (!slideSelector) return;
    
    slideSelector.innerHTML = '';
    
    slides.forEach((slide, index) => {
        const thumbnail = document.createElement('div');
        thumbnail.className = 'slide-minimized';
        thumbnail.tabIndex = 0;
        thumbnail.setAttribute('aria-label', `Thumbnail ${index + 1}`);
        
        if (index === 0) {
            thumbnail.classList.add('active');
        }
        
        const originalImg = slide.querySelector('img');
        if (originalImg) {
            const thumbnailImg = document.createElement('img');
            thumbnailImg.src = originalImg.src;
            thumbnailImg.alt = '';
            thumbnail.appendChild(thumbnailImg);
        }

        thumbnail.addEventListener('click', () => {
            const clickIndex = index + 1;
            if (slideIndex !== clickIndex) {
                pauseAutoplay();
            }
            showSlide(clickIndex);
        });
        
        slideSelector.appendChild(thumbnail);
    });
}

function generateDotIndicators() {
    const slides = document.querySelectorAll('.slide');
    const slideshowPages = document.querySelector('.slideshow-pages');
    
    if (!slideshowPages) return;
    
    const dots = slideshowPages.querySelectorAll('.dot');
    
    if (dots.length === slides.length) return;
    
    dots.forEach(dot => dot.remove());
    
    const prevArrow = slideshowPages.querySelector('a:first-child');
    const nextArrow = slideshowPages.querySelector('a:last-child');
    if (!prevArrow || !nextArrow) return;
    
    if (prevArrow && nextArrow) {
        for (let i = 0; i < slides.length; i++) {
            const dot = document.createElement('span');
            dot.className = 'dot';
            if (i === 0) dot.classList.add('active');
            
            dot.onclick = () => {
                if (slideIndex !== i + 1) {
                    pauseAutoplay();
                }
                showSlide(i + 1);
            };
            
            dot.tabIndex = 0;
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            
            dot.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (slideIndex !== i + 1) {
                        pauseAutoplay();
                    }
                    showSlide(i + 1);
                    e.preventDefault();
                }
            });
            
            slideshowPages.insertBefore(dot, nextArrow);
        }
    }
}

// Navigation

function plusSlides(n) {
    if (n !== 0) {
        pauseAutoplay();
    }
    showSlide(slideIndex += n);
}

function showSlide(n) {
    console.log(`Showing slide ${n}`);
    
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const thumbnails = document.querySelectorAll('.slide-minimized');
    
    if (!slides.length) return;
    slideIndex = n;
    
    if (slideIndex > slides.length) slideIndex = 1;
    if (slideIndex < 1) slideIndex = slides.length;
    
    hideAllSlides(slides);
    resetActiveIndicators(dots, thumbnails);
    activateCurrentSlide(slideIndex - 1, slides, dots, thumbnails);
    announceSlideChange(slideIndex);
}

// DOM manipulation

function removeAnimationClasses(element) {
    element.classList.remove(animationStyle.in);
    element.classList.remove(animationStyle.out);
}

function hideAllSlides(slides) {
    Array.from(slides).forEach(slide => {
        slide.style.display = "none";
        removeAnimationClasses(slide);
    });
}

function resetActiveIndicators(dots, thumbnails) {
    Array.from(dots).forEach(dot => {
        dot.classList.remove('active');
    });
    
    Array.from(thumbnails).forEach(thumbnail => {
        thumbnail.classList.remove('active');
    });
}

function activateCurrentSlide(index, slides, dots, thumbnails) {
    if (slides.length <= 0) return;
    
    const currentSlide = slides[index];
    
    currentSlide.style.display = "block";
    currentSlide.classList.add(animationStyle.in);
    
    if (dots.length > 0) {
        dots[index].classList.add('active');
    }
      if (thumbnails.length > 0) {
        thumbnails[index].classList.add('active');
        
        thumbnails[index].style.animation = 'none';
        setTimeout(() => {
            thumbnails[index].style.animation = animationStyle.thumbnailBounce;
        }, 10);
    }
}

// Event handlers

function setupThumbnailListeners() {
    const thumbnails = document.querySelectorAll('.slide-minimized');
    
    thumbnails.forEach((thumbnail, index) => {
        thumbnail.addEventListener('click', () => {
            if (slideIndex !== index + 1) {
                pauseAutoplay();
            }
            showSlide(index + 1);
        });
        
        thumbnail.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                if (slideIndex !== index + 1) {
                    pauseAutoplay();
                }
                showSlide(index + 1);
                e.preventDefault();
            }
        });
    });
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', handleKeyboardNavigation);
}

function handleKeyboardNavigation(e) {
    const slideshow = document.querySelector('.slideshow');
    
    if (!slideshow || !slideshow.contains(document.activeElement)) return;
    
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
    if (document.getElementById('slideshow-live-region')) return;
    
    const newLiveRegion = document.createElement('div');
    newLiveRegion.id = 'slideshow-live-region';
    newLiveRegion.className = 'visually-hidden';
    newLiveRegion.setAttribute('aria-live', 'polite');
    document.body.appendChild(newLiveRegion);
}

function announceSlideChange(index) {
    const liveRegion = document.getElementById('slideshow-live-region');
    if (!liveRegion) return;
    
    const totalSlides = document.querySelectorAll('.slide').length;
    liveRegion.textContent = `Showing slide ${index} of ${totalSlides}`;
}

// Simple autoplay functionality

function startAutoplay() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
    }
    
    slideshowInterval = setInterval(() => {
        plusSlides(1);
    }, autoplayDelay);
}

function pauseAutoplay() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    
    if (autoplayPauseTimeout) {
        clearTimeout(autoplayPauseTimeout);
    }
    
    autoplayPauseTimeout = setTimeout(() => {
        startAutoplay();
    }, pauseDelay);
}
