/**
 * Resume Page - Scroll-Driven Animation System
 * Modern, vertically-staged resume experience with scramble reveal animations
 * Performance-optimized using Intersection Observer and requestAnimationFrame
 */

// Configuration
const CONFIG = {
  scrambleChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()',
  scrambleDuration: 500, // ms - faster animation
  fadeInDelay: 0, // ms after scramble starts - start immediately
  fadeInDuration: 600, // ms - smoother, longer fade
  intersectionThreshold: 0.15, // Trigger even earlier for smoother experience on mobile
  scrollThrottle: 16, // ~60fps
  isMobile: window.innerWidth < 768
};

// Section configuration
const SECTIONS = [
  { id: 'Overview', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'Education', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'WorkExperience', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'LeadershipExperience', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'LeadershipExperience2', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'Projects1', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'Projects2', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'Volunteering1', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'Volunteering2', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'Skills', element: null, heading: null, subheading: null, body: null, animated: false }
];

// State
let scrollTimeout = null;
let lastScrollTime = 0;
let intersectionObserver = null;
let sectionIndexDots = [];
let rafId = null;

/**
 * Initialize page - called on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Detect mobile
  CONFIG.isMobile = window.innerWidth < 768;
  
  // Initialize section references
  initializeSections();
  
  // Initialize section index dots (after sections are initialized so we can get headings)
  initializeSectionIndex();
  
  // Set up scroll-driven animations
  initScrollAnimations();
  
  // Set initial styles for performance
  setInitialStyles();
  
  // Handle window resize
  window.addEventListener('resize', handleResize);
  
  // Initialize background video
  initBackgroundVideo();
});

/**
 * Initialize background video
 */
function initBackgroundVideo() {
  const video = document.querySelector('.background-video');
  if (!video) return;
  
  // Ensure video plays smoothly
  video.addEventListener('loadeddata', () => {
    video.play().catch(e => {
      console.log('Video autoplay prevented:', e);
    });
  });
  
  // Handle video loading errors gracefully
  video.addEventListener('error', () => {
    console.warn('Background video failed to load');
    // Fallback to black background (already set in CSS)
  });
}

/**
 * Initialize all section element references
 */
function initializeSections() {
  SECTIONS.forEach(section => {
    try {
      section.element = document.getElementById(`sec${section.id}`);
      section.heading = document.getElementById(`h${section.id}`);
      section.subheading = document.getElementById(`sub${section.id}`);
      section.body = document.getElementById(`body${section.id}`);
      
      // Store original text for scramble animation
      if (section.heading) {
        section.headingText = section.heading.textContent.trim();
      }
      if (section.subheading) {
        section.subheadingText = section.subheading.textContent.trim();
      }
    } catch (e) {
      console.warn(`Section ${section.id} elements not found:`, e);
    }
  });
}

/**
 * Section name mapping for tooltips
 */
const SECTION_NAMES = {
  'Overview': 'OVERVIEW',
  'Education': 'EDUCATION',
  'WorkExperience': 'WORK EXPERIENCE',
  'LeadershipExperience': 'TECHNICAL EXPERIENCE',
  'LeadershipExperience2': '',
  'Projects1': 'PROJECTS',
  'Projects2': '',
  'Volunteering1': 'VOLUNTEERING',
  'Volunteering2': '',
  'Skills': 'SKILLS'
};

/**
 * Initialize section index (progress indicator) dots
 */
function initializeSectionIndex() {
  const sectionIndex = document.getElementById('sectionIndex');
  if (!sectionIndex) return;
  
  SECTIONS.forEach((section, index) => {
    const dot = document.getElementById(`dot${section.id}`);
    if (dot) {
      // Get section heading text for tooltip
      let tooltipText = SECTION_NAMES[section.id] || '';
      // If no predefined name, try to get from heading element
      if (!tooltipText) {
        // Try to get heading text (might not be available yet if scramble hasn't run)
        const headingElement = document.getElementById(`h${section.id}`);
        if (headingElement) {
          tooltipText = headingElement.textContent.trim();
          // Clean up any scrambled text by getting original if available
          if (section.headingText) {
            tooltipText = section.headingText;
          }
        }
      }
      
      // Set tooltip attribute
      if (tooltipText) {
        dot.setAttribute('data-tooltip', tooltipText);
      }
      
      sectionIndexDots.push({ element: dot, index, sectionId: section.id });
      // Set initial opacity
      dot.style.opacity = '0.3';
      
      // Add click handler to scroll to section
      dot.addEventListener('click', () => {
        if (section.element) {
          section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  });
  
  // Update active dot on scroll
  if (sectionIndexDots.length > 0) {
    updateSectionIndex(0);
  }
}

/**
 * Set initial styles for GPU-accelerated animations
 */
function setInitialStyles() {
  SECTIONS.forEach(section => {
    if (section.body) {
      // Initially hide body content
      section.body.style.opacity = '0';
      section.body.style.transform = 'translateY(20px)';
    }
    if (section.heading) {
      section.heading.style.opacity = '0';
    }
    if (section.subheading) {
      section.subheading.style.opacity = '0';
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
  
  // Create Intersection Observer with more sensitive trigger
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
    rootMargin: '0px 0px -50% 0px', // Trigger when section is 50% visible
    threshold: [0.3, 0.5, 0.7] // Multiple thresholds for better detection
  });
  
  // Observe all sections
  SECTIONS.forEach(section => {
    if (section.element) {
      intersectionObserver.observe(section.element);
    }
  });
  
  // Set up throttled scroll listener for section index
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveSection();
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });

  // Add wheel event for smooth section snapping (optional enhancement)
  let isScrolling = false;
  window.addEventListener('wheel', (e) => {
    if (isScrolling) return;
    
    // Only enhance scroll snapping, don't hijack
    const delta = e.deltaY;
    if (Math.abs(delta) > 50) { // Significant scroll
      const currentSection = getCurrentSection();
      if (currentSection) {
        const nextSection = delta > 0 
          ? getNextSection(currentSection)
          : getPreviousSection(currentSection);
        
        if (nextSection && nextSection.element) {
          isScrolling = true;
          nextSection.element.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          setTimeout(() => { isScrolling = false; }, 800);
        }
      }
    }
  }, { passive: true });
}

/**
 * Fallback for browsers without Intersection Observer
 */
function initScrollFallback() {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    
    SECTIONS.forEach(section => {
      if (section.element && !section.animated) {
        const rect = section.element.getBoundingClientRect();
        const elementTop = rect.top + scrollY;
        const viewportBottom = scrollY + viewportHeight;
        
        // Trigger when section enters viewport
        if (elementTop < viewportBottom * 0.8) {
          section.animated = true;
          animateSection(section);
        }
      }
    });
    
    updateActiveSection();
  }, { passive: true });
}

/**
 * Animate a section when it enters viewport
 */
function animateSection(section) {
  // Animate heading with scramble reveal
  if (section.heading && section.headingText) {
    // Start body content fade-in halfway through scramble animation for snappier feel
    const bodyDelay = CONFIG.scrambleDuration * 0.4; // Start at 40% of scramble duration
    
    scrambleReveal(section.heading, section.headingText, {
      duration: CONFIG.isMobile ? CONFIG.scrambleDuration * 0.7 : CONFIG.scrambleDuration,
      onComplete: () => {
        // Animate subheading
        if (section.subheading && section.subheadingText) {
          fadeInContent(section.subheading, 50);
        }
      }
    });
    
    // Start body content animation earlier (during scramble)
    if (section.body) {
      fadeInContent(section.body, bodyDelay);
    }
    // Start subheading earlier too if it exists
    if (section.subheading && section.subheadingText) {
      fadeInContent(section.subheading, bodyDelay);
    }
  } else {
    // If no heading, just fade in content immediately
    if (section.subheading) {
      fadeInContent(section.subheading, 0);
    }
    if (section.body) {
      fadeInContent(section.body, 0);
    }
  }
}

/**
 * Scramble reveal animation - jumbles characters then resolves to final text
 * @param {HTMLElement} element - Element to animate
 * @param {string} finalText - Final text to reveal
 * @param {object} options - Animation options
 */
function scrambleReveal(element, finalText, options = {}) {
  const duration = options.duration || CONFIG.scrambleDuration;
  const onComplete = options.onComplete || (() => {});
  
  if (!element || !finalText) return;
  
  // Disable scramble on mobile for very long text (performance)
  if (CONFIG.isMobile && finalText.length > 50) {
    element.textContent = finalText;
    element.style.opacity = '1';
    element.classList.add('animated');
    onComplete();
    return;
  }
  
  const startTime = Date.now();
  const chars = finalText.split('');
  const scrambleChars = CONFIG.scrambleChars.split('');
  
  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Smoother easing function (ease-in-out for more flowy feel)
    const eased = progress < 0.5
      ? 2 * progress * progress
      : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    
    // Generate scrambled text with wave effect
    const scrambled = chars.map((char, index) => {
      // Skip spaces and punctuation
      if (char === ' ' || char === '\n' || !/[a-zA-Z0-9]/.test(char)) {
        return char;
      }
      
      // Wave effect: characters reveal in a flowing wave pattern
      const waveOffset = Math.sin((index / chars.length) * Math.PI * 2) * 0.1;
      const revealProgress = eased + waveOffset;
      const revealIndex = Math.floor(revealProgress * chars.length);
      
      // Add some randomness for more dynamic feel
      const randomFactor = Math.random() * 0.15;
      const adjustedReveal = Math.floor((revealProgress + randomFactor) * chars.length);
      
      if (index < adjustedReveal || (index === adjustedReveal && progress > 0.85)) {
        return char; // Revealed character
      } else {
        // Scrambled character - more frequent updates for flowy feel
        return scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      }
    }).join('');
    
    // Smoother opacity transition
    const opacityProgress = Math.min(eased * 1.2, 1);
    element.textContent = scrambled;
    element.style.opacity = Math.min(0.2 + opacityProgress * 0.8, 1);
    
    if (progress < 1) {
      rafId = requestAnimationFrame(animate);
    } else {
      // Ensure final text is set
      element.textContent = finalText;
      element.style.opacity = '1';
      element.classList.add('animated');
      onComplete();
    }
  }
  
  // Start animation
  rafId = requestAnimationFrame(animate);
}

/**
 * Fade in content with subtle slide-up
 * @param {HTMLElement} element - Element to fade in
 * @param {number} delay - Delay in milliseconds
 */
function fadeInContent(element, delay = 0) {
  if (!element) return;
  
  // Start with initial state
  element.style.opacity = '0';
  element.style.transform = 'translateY(20px)';
  element.style.transition = 'none';
  
  // Force reflow
  element.offsetHeight;
  
  setTimeout(() => {
    element.style.transition = `opacity ${CONFIG.fadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1), transform ${CONFIG.fadeInDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    element.classList.add('visible');
  }, delay);
}

/**
 * Get current section based on scroll position
 */
function getCurrentSection() {
  const scrollY = window.scrollY || window.pageYOffset;
  const viewportHeight = window.innerHeight;
  const viewportCenter = scrollY + viewportHeight / 2;
  
  let currentSection = null;
  let minDistance = Infinity;
  
  SECTIONS.forEach((section) => {
    if (section.element) {
      try {
        const rect = section.element.getBoundingClientRect();
        const sectionTop = rect.top + scrollY;
        const sectionCenter = sectionTop + rect.height / 2;
        const distance = Math.abs(viewportCenter - sectionCenter);
        
        if (distance < minDistance) {
          minDistance = distance;
          currentSection = section;
        }
      } catch (e) {
        // Element not available
      }
    }
  });
  
  return currentSection;
}

/**
 * Get next section
 */
function getNextSection(currentSection) {
  const currentIndex = SECTIONS.findIndex(s => s.id === currentSection.id);
  return currentIndex < SECTIONS.length - 1 ? SECTIONS[currentIndex + 1] : null;
}

/**
 * Get previous section
 */
function getPreviousSection(currentSection) {
  const currentIndex = SECTIONS.findIndex(s => s.id === currentSection.id);
  return currentIndex > 0 ? SECTIONS[currentIndex - 1] : null;
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
  const activeSection = SECTIONS[activeIndex];
  if (!activeSection) return;
  
  sectionIndexDots.forEach((dot) => {
    if (dot.element) {
      // Match by sectionId instead of index to handle sections without dots
      if (dot.sectionId === activeSection.id) {
        dot.element.classList.add('active');
        dot.element.style.opacity = '1';
      } else {
        dot.element.classList.remove('active');
        dot.element.style.opacity = '0.3';
      }
    }
  });
}

/**
 * Handle window resize for responsive adjustments
 */
let resizeTimeout = null;
function handleResize() {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    CONFIG.isMobile = window.innerWidth < 768;
    // Reset animations if needed (optional)
  }, 250);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
  }
  if (intersectionObserver) {
    intersectionObserver.disconnect();
  }
});

