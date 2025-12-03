// ======================
// Configuration
// ======================

// Base path for assets - handles GitHub Pages subdirectory deployment
const BASE_PATH = './';

const slides = [
    {
        text: "Watching the sunset",
        desc: "The promise that endings can be beautiful too.",
        img: `${BASE_PATH}assets/images/sunset.png`
    },
    {
        text: "Coffee on a rainy afternoon",
        desc: "The warmth in your hands while the world washes itself clean.",
        img: `${BASE_PATH}assets/images/coffee.png`
    },
    {
        text: "Praising God",
        desc: "Finding peace in something greater than ourselves.",
        img: "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?q=80&w=2000&auto=format&fit=crop"
    },
    {
        text: "Giving back to parents",
        desc: "The joy of honoring those who gave you life.",
        img: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=2000&auto=format&fit=crop"
    },
    {
        text: "The smell of old books",
        desc: "Stories waiting to be read, adventures waiting to be had.",
        img: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2000&auto=format&fit=crop"
    },
    {
        text: "A genuine laugh",
        desc: "The kind that makes your stomach hurt and your soul light.",
        img: "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=2000&auto=format&fit=crop"
    },
    {
        text: "The future you haven't met yet",
        desc: "There are friends you haven't made and songs you haven't heard.",
        img: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2000&auto=format&fit=crop"
    }
];

const displayTime = 5000; // Time per slide in ms

// ======================
// State Variables
// ======================
let currentIndex = 0;
let slideInterval;

// ======================
// DOM Elements
// ======================
const landing = document.getElementById('landing');
const startBtn = document.getElementById('start-btn');
const slideshow = document.getElementById('slideshow');
const imgEl = document.getElementById('slide-img');
const titleEl = document.getElementById('slide-title');
const descEl = document.getElementById('slide-desc');
const progressBar = document.getElementById('progress-bar');
const textContainer = document.getElementById('text-container');
const endScreen = document.getElementById('end-screen');
const rotateHint = document.getElementById('rotate-hint');
const rotateDismiss = document.getElementById('rotate-dismiss');
const audioEl = document.getElementById('bg-music');
const audioBtn = document.getElementById('audio-btn');

// ======================
// Utility Functions
// ======================

/**
 * Build srcset from an Unsplash URL by varying the width parameter
 * @param {string} url - The Unsplash image URL
 * @returns {Object|null} - Object with srcset, fallback, and sizes properties
 */
function buildUnsplashSrcSet(url) {
    try {
        const widths = [400, 800, 1200, 2000];
        const srcEntries = widths.map(w => {
            const u = new URL(url);
            u.searchParams.set('w', w);
            return `${u.toString()} ${w}w`;
        });
        const fallback = new URL(url);
        fallback.searchParams.set('w', 1200);
        return { 
            srcset: srcEntries.join(', '), 
            fallback: fallback.toString(), 
            sizes: '(max-width: 640px) 100vw, 1200px' 
        };
    } catch (e) {
        console.log('buildUnsplashSrcSet failed:', e);
        return null;
    }
}

/**
 * Preload first slide image for faster rendering on mobile
 */
(function preloadFirst() {
    try {
        const first = slides[0];
        const preloadImg = new Image();
        if (first.img && first.img.includes('images.unsplash.com')) {
            const src = buildUnsplashSrcSet(first.img);
            preloadImg.src = src ? src.fallback : first.img;
        } else {
            preloadImg.src = first.img;
        }
    } catch (e) {
        console.log('Preload failed:', e);
    }
})();

// ======================
// Core Functions
// ======================

/**
 * Start the journey - begins audio playback and slideshow
 */
function startJourney() {
    const startAt = 5; // seconds to skip into the track
    audioEl.volume = 0.5;
    audioEl.muted = false;

    function startAudioFrom(seconds) {
        try {
            if (audioEl.duration && !isNaN(audioEl.duration)) {
                audioEl.currentTime = Math.min(seconds, audioEl.duration);
            } else {
                audioEl.currentTime = seconds;
            }
        } catch (err) {
            console.log('Could not set currentTime immediately:', err);
        }

        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
                audioBtn.textContent = "Sound Off";
            }).catch(error => {
                console.log("Audio play failed (check connection or browser policy):", error);
                audioBtn.textContent = "Sound On";
            });
        }
    }

    if (audioEl.readyState >= 1) {
        startAudioFrom(startAt);
    } else {
        audioEl.addEventListener('loadedmetadata', function onMeta() {
            audioEl.removeEventListener('loadedmetadata', onMeta);
            startAudioFrom(startAt);
        }, { once: true });
    }

    landing.style.opacity = '0';
    landing.style.pointerEvents = 'none';
    
    slideshow.classList.remove('pointer-events-none', 'opacity-0');
    audioBtn.classList.remove('opacity-0');
    
    if (rotateHint) {
        rotateHint.classList.remove('show');
        try { sessionStorage.setItem('rotateDismissed', '1'); } catch(e) {}
    }
    
    setTimeout(() => {
        landing.style.display = 'none';
        loadSlide(0);
    }, 1000);
}

/**
 * Toggle audio playback
 */
function toggleAudio() {
    if (audioEl.paused) {
        audioEl.play();
        audioEl.muted = false;
        audioBtn.textContent = "Sound Off";
    } else if (audioEl.muted) {
        audioEl.muted = false;
        audioBtn.textContent = "Sound Off";
    } else {
        audioEl.pause();
        audioBtn.textContent = "Sound On";
    }
}

/**
 * Load a specific slide
 * @param {number} index - The slide index to load
 */
function loadSlide(index) {
    if (index >= slides.length) {
        finishSlideshow();
        return;
    }

    const slide = slides[index];
    currentIndex = index;

    // Reset State (Fade Text Out)
    textContainer.style.opacity = '0';
    textContainer.style.transform = 'translateY(20px)';
    imgEl.style.opacity = '0.4';
    
    progressBar.classList.remove('progress-animate');
    void progressBar.offsetWidth; // Trigger reflow

    setTimeout(() => {
        // Change Content
        imgEl.onerror = null;
        
        if (slide.img && slide.img.includes('images.unsplash.com')) {
            const set = buildUnsplashSrcSet(slide.img);
            if (set) {
                imgEl.srcset = set.srcset;
                imgEl.sizes = set.sizes;
                imgEl.src = set.fallback;
            } else {
                imgEl.src = slide.img;
                imgEl.removeAttribute('srcset');
                imgEl.removeAttribute('sizes');
            }
        } else if (slide.img) {
            imgEl.src = slide.img;
            imgEl.removeAttribute('srcset');
            imgEl.removeAttribute('sizes');
            
            imgEl.onerror = () => {
                console.warn('Image failed to load:', slide.img);
                if (!slide.img.includes('sunset.png')) {
                    imgEl.src = `${BASE_PATH}assets/images/sunset.png`;
                }
            };
        }
        
        titleEl.textContent = slide.text;
        descEl.textContent = slide.desc;
        
        imgEl.style.transition = 'none';
        imgEl.style.transform = 'scale(1.0)';
        
        setTimeout(() => {
            // Fade In
            textContainer.style.opacity = '1';
            if (window.innerWidth >= 640) textContainer.style.pointerEvents = 'auto';
            textContainer.style.transform = 'translateY(0)';
            
            // Start Image Zoom
            const scaleFactor = (window.innerWidth < 768) ? 1.03 : 1.1;
            imgEl.style.transition = `transform ${displayTime + 1000}ms linear`;
            imgEl.style.transform = `scale(${scaleFactor})`;
            imgEl.style.opacity = '0.6';

            // Start Progress Bar
            progressBar.style.animationDuration = `${displayTime}ms`;
            progressBar.classList.add('progress-animate');

            // Schedule next slide
            slideInterval = setTimeout(() => {
                loadSlide(index + 1);
            }, displayTime);

        }, 100);
    }, 800);
}

/**
 * Finish the slideshow and show end screen
 */
function finishSlideshow() {
    slideshow.style.opacity = '0';
    setTimeout(() => {
        slideshow.style.display = 'none';
        endScreen.classList.remove('hidden');
    }, 1000);
}

/**
 * Restart the slideshow from the beginning
 */
function restartSlideshow() {
    clearTimeout(slideInterval);
    endScreen.classList.add('hidden');
    slideshow.style.display = 'block';
    
    requestAnimationFrame(() => {
        slideshow.style.opacity = '1';
        loadSlide(0);
    });
}

// ======================
// Rotate Overlay Logic
// ======================

/**
 * Check if rotate hint should be shown
 * @returns {boolean} - Whether to show the rotate hint
 */
function shouldShowRotateHint() {
    try {
        const dismissed = sessionStorage.getItem('rotateDismissed') === '1';
        const w = window.innerWidth || document.documentElement.clientWidth || screen.width;
        const h = window.innerHeight || document.documentElement.clientHeight || screen.height;
        const isPortrait = h > w;
        const isSmall = w <= 900;
        const forced = new URLSearchParams(window.location.search).get('showRotate') === '1';
        const should = (isPortrait && isSmall && !dismissed) || forced;
        console.debug('rotateHint check:', { w, h, isPortrait, isSmall, dismissed, forced, should });
        return should;
    } catch (e) {
        const w = window.innerWidth || document.documentElement.clientWidth || screen.width;
        const h = window.innerHeight || document.documentElement.clientHeight || screen.height;
        const isPortrait = h > w;
        const isSmall = w <= 900;
        const forced = new URLSearchParams(window.location.search).get('showRotate') === '1';
        const should = isPortrait && isSmall || forced;
        console.debug('rotateHint fallback check:', { w, h, isPortrait, isSmall, forced, should, err: e });
        return should;
    }
}

/**
 * Check and update rotate hint visibility
 */
function checkRotateHint() {
    if (!rotateHint) return;
    if (shouldShowRotateHint()) rotateHint.classList.add('show');
    else rotateHint.classList.remove('show');
}

/**
 * Developer utility to reset rotate hint dismissal
 */
window.__resetRotateHint = function() {
    try { sessionStorage.removeItem('rotateDismissed'); } catch(e) {}
    checkRotateHint();
    console.debug('rotateHint dismissal cleared');
}

// ======================
// Event Listeners
// ======================

// Start button click and keyboard support
if (startBtn) {
    startBtn.addEventListener('click', startJourney);
    startBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            startJourney();
        }
    });
}

// Rotate hint dismissal
if (rotateDismiss) {
    rotateDismiss.addEventListener('click', () => {
        try { sessionStorage.setItem('rotateDismissed', '1'); } catch(e) {}
        if (rotateHint) rotateHint.classList.remove('show');
    });
}

// Keyboard navigation for slideshow
document.addEventListener('keydown', (e) => {
    // Only handle keys when slideshow is visible
    if (slideshow.classList.contains('opacity-0')) return;
    
    switch(e.key) {
        case 'ArrowRight':
        case ' ':
            e.preventDefault();
            clearTimeout(slideInterval);
            loadSlide(currentIndex + 1);
            break;
        case 'ArrowLeft':
            e.preventDefault();
            clearTimeout(slideInterval);
            if (currentIndex > 0) loadSlide(currentIndex - 1);
            break;
        case 'm':
        case 'M':
            toggleAudio();
            break;
        case 'Escape':
            if (!endScreen.classList.contains('hidden')) {
                location.reload();
            }
            break;
    }
});

// Window events for rotate hint
window.addEventListener('resize', checkRotateHint);
window.addEventListener('orientationchange', checkRotateHint);
document.addEventListener('DOMContentLoaded', checkRotateHint);
window.addEventListener('load', checkRotateHint);

// Initial check
try { checkRotateHint(); } catch (e) { console.log('checkRotateHint initial run failed:', e); }
