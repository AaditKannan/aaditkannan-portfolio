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
 * Merge split sections on mobile
 */
function mergeSplitSectionsOnMobile() {
  if (window.innerWidth >= 768) return; // Only on mobile
  
  // Merge LeadershipExperience2 into LeadershipExperience
  const leadership2 = document.getElementById('bodyLeadershipExperience2');
  const leadership1 = document.getElementById('bodyLeadershipExperience');
  if (leadership2 && leadership1) {
    const entries = leadership2.querySelectorAll('.entry');
    entries.forEach(entry => {
      leadership1.appendChild(entry.cloneNode(true));
    });
  }
  
  // Merge Projects2 into Projects1
  const projects2 = document.getElementById('bodyProjects2');
  const projects1 = document.getElementById('bodyProjects1');
  if (projects2 && projects1) {
    const entries = projects2.querySelectorAll('.entry');
    entries.forEach(entry => {
      projects1.appendChild(entry.cloneNode(true));
    });
  }
  
  // Merge Volunteering2 into Volunteering1
  const volunteering2 = document.getElementById('bodyVolunteering2');
  const volunteering1 = document.getElementById('bodyVolunteering1');
  if (volunteering2 && volunteering1) {
    const entries = volunteering2.querySelectorAll('.entry');
    entries.forEach(entry => {
      volunteering1.appendChild(entry.cloneNode(true));
    });
  }
}

/**
 * Mobile scroll helper
 */
function initMobileScrollHelper() {
  if (window.innerWidth >= 768) return; // Only on mobile
  
  const helper = document.getElementById('mobileScrollHelper');
  if (!helper) return;
  
  let lastScrollTop = 0;
  let scrollTimeout = null;
  
  function updateHelper() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Show helper if not at bottom and user hasn't scrolled recently
    if (scrollTop + windowHeight < documentHeight - 100) {
      if (scrollTop > lastScrollTop) {
        // Scrolling down - hide helper
        helper.classList.remove('visible');
      } else if (scrollTop < lastScrollTop - 50) {
        // Scrolling up significantly - show helper
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          helper.classList.add('visible');
        }, 1000);
      }
    } else {
      // Near bottom - hide helper
      helper.classList.remove('visible');
    }
    
    lastScrollTop = scrollTop;
  }
  
  // Show helper initially after 2 seconds
  setTimeout(() => {
    if (window.pageYOffset < 100) {
      helper.classList.add('visible');
    }
  }, 2000);
  
  // Update on scroll
  window.addEventListener('scroll', updateHelper, { passive: true });
  
  // Click to scroll down
  helper.addEventListener('click', () => {
    window.scrollBy({
      top: window.innerHeight * 0.8,
      behavior: 'smooth'
    });
  });
}

/**
 * Mobile section navigation arrow
 */
function initMobileSectionNav() {
  if (window.innerWidth >= 768) return; // Only on mobile
  
  const navArrow = document.getElementById('mobileSectionNav');
  if (!navArrow) return;
  
  const sections = document.querySelectorAll('.section');
  let currentSectionIndex = 0;
  
  function updateNavArrow() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    
    // Find current section
    let newIndex = 0;
    sections.forEach((section, index) => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= windowHeight * 0.3) {
        newIndex = index;
      }
    });
    
    currentSectionIndex = newIndex;
    
    // Show arrow if not at last section
    if (currentSectionIndex < sections.length - 1) {
      navArrow.classList.add('visible');
    } else {
      navArrow.classList.remove('visible');
    }
  }
  
  // Update on scroll
  window.addEventListener('scroll', updateNavArrow, { passive: true });
  
  // Initial check
  updateNavArrow();
  
  // Click to scroll to next section
  navArrow.addEventListener('click', () => {
    if (currentSectionIndex < sections.length - 1) {
      const nextSection = sections[currentSectionIndex + 1];
      const nextSectionTop = nextSection.getBoundingClientRect().top + window.pageYOffset - 100; // Account for nav
      window.scrollTo({
        top: nextSectionTop,
        behavior: 'smooth'
      });
    }
  });
}

/**
 * Initialize page - called on DOM load
 */
document.addEventListener('DOMContentLoaded', () => {
  // Detect mobile
  CONFIG.isMobile = window.innerWidth < 768;
  
  // Merge split sections on mobile (do this first before initializing sections)
  mergeSplitSectionsOnMobile();
  
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
  
  // Initialize mobile scroll helper
  initMobileScrollHelper();
  
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
      // Don't set opacity for subheadings - they'll use scramble animation
      // Just ensure they start visible (scramble will handle the animation)
      section.subheading.style.opacity = '1';
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
    rootMargin: CONFIG.isMobile ? '0px 0px -20% 0px' : '0px 0px -50% 0px', // Trigger earlier on mobile (80% visible)
    threshold: CONFIG.isMobile ? [0.1, 0.2, 0.3] : [0.3, 0.5, 0.7] // Lower thresholds on mobile for earlier trigger
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
  // Prevent duplicate animations - check if already animated
  if (section.animated && section.heading && section.heading.classList.contains('animated')) {
    return; // Already animated, skip
  }
  
  // Mark as animated immediately to prevent duplicate calls
  section.animated = true;
  
  // Animate heading with scramble reveal
  if (section.heading && section.headingText) {
    // Mark heading as animating
    section.heading.classList.add('animating');
    
    // Start body content fade-in halfway through scramble animation for snappier feel
    const bodyDelay = CONFIG.scrambleDuration * 0.4; // Start at 40% of scramble duration
    
    scrambleReveal(section.heading, section.headingText, {
      duration: CONFIG.isMobile ? CONFIG.scrambleDuration * 0.7 : CONFIG.scrambleDuration,
      onComplete: () => {
        section.heading.classList.remove('animating');
        section.heading.classList.add('animated');
      }
    });
    
    // Start body content animation earlier (during scramble)
    if (section.body) {
      fadeInContent(section.body, bodyDelay);
    }
    // Animate subheading with scramble reveal instead of fade (prevents duplicates)
    if (section.subheading && section.subheadingText) {
      // Use scramble animation for subheadings to prevent duplicate fade issues
      scrambleReveal(section.subheading, section.subheadingText, {
        duration: CONFIG.isMobile ? CONFIG.scrambleDuration * 0.5 : CONFIG.scrambleDuration * 0.6,
        delay: bodyDelay
      });
    }
  } else {
    // If no heading, just fade in content immediately
    if (section.subheading && section.subheadingText) {
      // Use scramble for subheadings even when no heading
      scrambleReveal(section.subheading, section.subheadingText, {
        duration: CONFIG.isMobile ? CONFIG.scrambleDuration * 0.5 : CONFIG.scrambleDuration * 0.6
      });
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
  const delay = options.delay || 0;
  const onComplete = options.onComplete || (() => {});
  
  if (!element || !finalText) return;
  
  // Prevent duplicate scramble animations
  if (element.dataset.scrambling === 'true') {
    return; // Already scrambling
  }
  element.dataset.scrambling = 'true';
  
  // Disable scramble on mobile for very long text (performance)
  if (CONFIG.isMobile && finalText.length > 50) {
    element.textContent = finalText;
    element.style.opacity = '1';
    element.classList.add('animated');
    element.dataset.scrambling = 'false';
    onComplete();
    return;
  }
  
  // Store original text if not already stored
  if (!element.dataset.originalText) {
    element.dataset.originalText = finalText;
  }
  
  const chars = finalText.split('');
  const scrambleChars = CONFIG.scrambleChars.split('');
  
  function animate() {
    const startTime = Date.now();
    function animateFrame() {
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
        rafId = requestAnimationFrame(animateFrame);
      } else {
        // Ensure final text is set
        element.textContent = finalText;
        element.style.opacity = '1';
        element.classList.add('animated');
        element.dataset.scrambling = 'false'; // Clear flag when done
        onComplete();
      }
    }
    rafId = requestAnimationFrame(animateFrame);
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
  
  // Prevent duplicate animations - check multiple conditions
  if (element.classList.contains('visible')) {
    return; // Already visible
  }
  
  // Check if already animating (more robust check)
  if (element.dataset.animating === 'true') {
    return; // Already animating
  }
  
  // Check if opacity is already 1 or transitioning
  const computedOpacity = window.getComputedStyle(element).opacity;
  if (computedOpacity === '1' || element.style.transition !== 'none' && element.style.transition !== '') {
    // If it's already visible or has a transition, don't animate again
    if (computedOpacity === '1') {
      element.classList.add('visible');
      return;
    }
  }
  
  // Mark as animating immediately to prevent duplicate calls
  element.dataset.animating = 'true';
  
  // Start with initial state
  const transformY = CONFIG.isMobile ? '10px' : '20px';
  element.style.opacity = '0';
  element.style.transform = `translateY(${transformY})`;
  element.style.transition = 'none';
  
  // Force reflow
  element.offsetHeight;
  
  // Use longer, smoother fade on mobile
  const duration = CONFIG.isMobile ? 800 : CONFIG.fadeInDuration;
  const easing = CONFIG.isMobile ? 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'cubic-bezier(0.4, 0, 0.2, 1)';
  
  setTimeout(() => {
    // Double-check we're still supposed to animate (in case element was removed/modified)
    if (!element || element.dataset.animating !== 'true') {
      return;
    }
    
    element.style.transition = `opacity ${duration}ms ${easing}, transform ${duration}ms ${easing}`;
    element.style.opacity = '1';
    element.style.transform = 'translateY(0)';
    element.classList.add('visible');
    
    // Clear animating flag after animation completes
    setTimeout(() => {
      if (element) {
        element.dataset.animating = 'false';
      }
    }, duration);
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

