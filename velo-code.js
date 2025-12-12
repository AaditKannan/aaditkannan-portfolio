/**
 * ResumeV2 Page - Scroll-Driven Animation System
 * Modern, vertically-staged resume experience with scramble reveal animations
 * Performance-optimized using Intersection Observer and requestAnimationFrame
 */

import wixWindow from 'wix-window';
import { animation } from 'wix-animations';

// Configuration
const CONFIG = {
    scrambleChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()',
    scrambleDuration: 1500, // ms
    fadeInDelay: 300, // ms after scramble starts
    fadeInDuration: 800, // ms
    intersectionThreshold: 0.2, // Trigger when 20% visible
    scrollThrottle: 16, // ~60fps
    isMobile: false
};

// Section configuration
const SECTIONS = [
    { id: 'Overview', element: null, heading: null, subheading: null, body: null, animated: false },
    { id: 'Education', element: null, heading: null, subheading: null, body: null, animated: false },
    { id: 'Experience', element: null, heading: null, subheading: null, body: null, animated: false },
    { id: 'Projects', element: null, heading: null, subheading: null, body: null, animated: false },
    { id: 'Volunteering', element: null, heading: null, subheading: null, body: null, animated: false },
    { id: 'Skills', element: null, heading: null, subheading: null, body: null, animated: false },
    { id: 'CTA', element: null, heading: null, subheading: null, body: null, animated: false }
];

// State
let scrollTimeout = null;
let lastScrollTime = 0;
let intersectionObserver = null;
let sectionIndexDots = [];

/**
 * Initialize page - called on page load
 */
$w.onReady(function () {
    // Detect mobile
    CONFIG.isMobile = wixWindow.formFactor === 'Mobile';
    
    // Initialize section references
    initializeSections();
    
    // Initialize section index dots
    initializeSectionIndex();
    
    // Set up scroll-driven animations
    initScrollAnimations();
    
    // Set initial styles for performance
    setInitialStyles();
});

/**
 * Initialize all section element references
 */
function initializeSections() {
    SECTIONS.forEach(section => {
        try {
            section.element = $w(`#sec${section.id}`);
            section.heading = $w(`#h${section.id}`);
            section.subheading = $w(`#sub${section.id}`);
            section.body = $w(`#body${section.id}`);
            
            // Store original text for scramble animation
            if (section.heading) {
                section.headingText = section.heading.text;
            }
            if (section.subheading) {
                section.subheadingText = section.subheading.text;
            }
        } catch (e) {
            console.warn(`Section ${section.id} elements not found:`, e);
        }
    });
}

/**
 * Initialize section index (progress indicator) dots
 */
function initializeSectionIndex() {
    try {
        const sectionIndex = $w('#sectionIndex');
        if (!sectionIndex) return;
        
        SECTIONS.forEach((section, index) => {
            try {
                const dot = $w(`#dot${section.id}`);
                if (dot) {
                    sectionIndexDots.push({ element: dot, index });
                    // Set initial opacity
                    dot.opacity = 0.3;
                }
            } catch (e) {
                // Dot not found, skip
            }
        });
        
        // Update active dot on scroll
        if (sectionIndexDots.length > 0) {
            updateSectionIndex(0);
        }
    } catch (e) {
        console.warn('Section index not found:', e);
    }
}

/**
 * Set initial styles for GPU-accelerated animations
 */
function setInitialStyles() {
    SECTIONS.forEach(section => {
        if (section.body) {
            // Initially hide body content
            section.body.opacity = 0;
            // Use transform for GPU acceleration
            section.body.style.transform = 'translateY(20px)';
        }
    });
}

/**
 * Initialize scroll-driven animations using Intersection Observer
 */
function initScrollAnimations() {
    // Check if Intersection Observer is available
    if (typeof IntersectionObserver === 'undefined') {
        // Fallback for older browsers
        initScrollFallback();
        return;
    }
    
    // Create Intersection Observer
    intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const sectionId = entry.target.id.replace('sec', '');
                const section = SECTIONS.find(s => s.id === sectionId);
                
                if (section && !section.animated) {
                    section.animated = true;
                    animateSection(section);
                }
            }
        });
    }, {
        root: null,
        rootMargin: '0px 0px -20% 0px', // Trigger when 20% from bottom
        threshold: CONFIG.intersectionThreshold
    });
    
    // Observe all sections
    SECTIONS.forEach(section => {
        if (section.element) {
            intersectionObserver.observe(section.element);
        }
    });
    
    // Set up throttled scroll listener for section index
    $w.onScroll(() => {
        const now = Date.now();
        if (now - lastScrollTime >= CONFIG.scrollThrottle) {
            lastScrollTime = now;
            updateActiveSection();
        }
    });
}

/**
 * Fallback for browsers without Intersection Observer
 */
function initScrollFallback() {
    $w.onScroll(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const viewportHeight = window.innerHeight;
        
        SECTIONS.forEach(section => {
            if (section.element && !section.animated) {
                const rect = section.element.getBoundingClientRect();
                const elementTop = rect.top + scrollY;
                const elementBottom = elementTop + rect.height;
                const viewportBottom = scrollY + viewportHeight;
                
                // Trigger when section enters viewport
                if (elementTop < viewportBottom * 0.8) {
                    section.animated = true;
                    animateSection(section);
                }
            }
        });
        
        updateActiveSection();
    });
}

/**
 * Animate a section when it enters viewport
 */
function animateSection(section) {
    // Animate heading with scramble reveal
    if (section.heading && section.headingText) {
        scrambleReveal(section.heading, section.headingText, {
            duration: CONFIG.isMobile ? CONFIG.scrambleDuration * 0.7 : CONFIG.scrambleDuration,
            onComplete: () => {
                // Animate subheading
                if (section.subheading && section.subheadingText) {
                    fadeInContent(section.subheading, 200);
                }
                // Animate body content
                if (section.body) {
                    fadeInContent(section.body, CONFIG.fadeInDelay);
                }
            }
        });
    } else {
        // If no heading, just fade in content
        if (section.subheading) {
            fadeInContent(section.subheading, 0);
        }
        if (section.body) {
            fadeInContent(section.body, CONFIG.fadeInDelay);
        }
    }
}

/**
 * Scramble reveal animation - jumbles characters then resolves to final text
 * @param {WixElement} element - Text element to animate
 * @param {string} finalText - Final text to reveal
 * @param {object} options - Animation options
 */
function scrambleReveal(element, finalText, options = {}) {
    const duration = options.duration || CONFIG.scrambleDuration;
    const onComplete = options.onComplete || (() => {});
    
    if (!element || !finalText) return;
    
    const startTime = Date.now();
    const chars = finalText.split('');
    const scrambleChars = CONFIG.scrambleChars.split('');
    
    // Disable scramble on mobile for long text (performance)
    if (CONFIG.isMobile && finalText.length > 30) {
        element.text = finalText;
        onComplete();
        return;
    }
    
    function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-out)
        const eased = 1 - Math.pow(1 - progress, 3);
        
        // Generate scrambled text
        const scrambled = chars.map((char, index) => {
            // Skip spaces and punctuation
            if (char === ' ' || char === '\n' || !/[a-zA-Z0-9]/.test(char)) {
                return char;
            }
            
            // Gradually reveal correct characters from left to right
            const revealIndex = Math.floor(eased * chars.length);
            if (index < revealIndex) {
                return char; // Revealed character
            } else if (index === revealIndex && progress > 0.9) {
                return char; // Final character
            } else {
                // Scrambled character
                return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
            }
        }).join('');
        
        element.text = scrambled;
        
        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            // Ensure final text is set
            element.text = finalText;
            onComplete();
        }
    }
    
    // Start animation
    requestAnimationFrame(animate);
}

/**
 * Fade in content with subtle slide-up
 * @param {WixElement} element - Element to fade in
 * @param {number} delay - Delay in milliseconds
 */
function fadeInContent(element, delay = 0) {
    if (!element) return;
    
    setTimeout(() => {
        // Use Wix animations API for smooth transitions
        animation.fadeIn(element, {
            duration: CONFIG.fadeInDuration,
            direction: 'Up',
            distance: 20
        }).then(() => {
            // Ensure final state
            element.opacity = 1;
            if (element.style) {
                element.style.transform = 'translateY(0)';
            }
        }).catch(() => {
            // Fallback if animation API fails
            element.opacity = 1;
            if (element.style) {
                element.style.transform = 'translateY(0)';
            }
        });
    }, delay);
}

/**
 * Update active section in section index
 */
function updateActiveSection() {
    if (sectionIndexDots.length === 0) return;
    
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const viewportCenter = scrollY + viewportHeight / 2;
    
    let activeIndex = 0;
    let minDistance = Infinity;
    
    SECTIONS.forEach((section, index) => {
        if (section.element) {
            try {
                const rect = section.element.getBoundingClientRect();
                const sectionTop = rect.top + scrollY;
                const sectionCenter = sectionTop + rect.height / 2;
                const distance = Math.abs(viewportCenter - sectionCenter);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    activeIndex = index;
                }
            } catch (e) {
                // Element not available
            }
        }
    });
    
    updateSectionIndex(activeIndex);
}

/**
 * Update section index dots to highlight active section
 * @param {number} activeIndex - Index of active section
 */
function updateSectionIndex(activeIndex) {
    sectionIndexDots.forEach((dot, index) => {
        if (dot.element) {
            // Smooth transition
            if (index === activeIndex) {
                dot.element.opacity = 1;
                // Optional: scale up active dot
                if (dot.element.style) {
                    dot.element.style.transform = 'scale(1.2)';
                }
            } else {
                dot.element.opacity = 0.3;
                if (dot.element.style) {
                    dot.element.style.transform = 'scale(1)';
                }
            }
        }
    });
}

/**
 * Handle window resize for responsive adjustments
 */
let resizeTimeout = null;
$w.onViewportChange(() => {
    // Debounce resize
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        CONFIG.isMobile = wixWindow.formFactor === 'Mobile';
        // Reset animations if needed (optional)
    }, 250);
});

