/**
 * Resume Page - Scroll-Driven Animation System
 * Modern, vertically-staged resume experience with scramble reveal animations
 * Performance-optimized using Intersection Observer and requestAnimationFrame
 * Updated: Subheadings now use scramble animation to prevent duplicate animations
 * Repo is now public - triggering Vercel deployment
 */

// Configuration
const CONFIG = {
  scrambleChars: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()',
  scrambleDuration: 350, // ms - snappier animation
  fadeInDelay: 0, // ms after scramble starts - start immediately
  fadeInDuration: 400, // ms - faster fade for quick scrolling
  intersectionThreshold: 0.1, // Trigger very early
  scrollThrottle: 16, // ~60fps
  isMobile: window.innerWidth < 768
};

// Section configuration
const SECTIONS = [
  { id: 'Overview', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'LeadershipExperience', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'LeadershipExperience2', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'WorkExperience', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'Education', element: null, heading: null, subheading: null, body: null, animated: false },
  { id: 'Projects1', element: null, heading: null, subheading: null, body: null, animated: false },
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

// Track if merge has already been done to prevent duplicates
let sectionsMerged = false;

/**
 * Merge split sections on mobile
 */
function mergeSplitSectionsOnMobile() {
  if (window.innerWidth >= 768) return; // Only on mobile
  if (sectionsMerged) return; // Prevent duplicate merges
  
  // Merge LeadershipExperience2 into LeadershipExperience
  const leadership2 = document.getElementById('bodyLeadershipExperience2');
  const leadership1 = document.getElementById('bodyLeadershipExperience');
  const secLeadership2 = document.getElementById('secLeadershipExperience2');
  if (leadership2 && leadership1) {
    const entries = leadership2.querySelectorAll('.entry');
    entries.forEach(entry => {
      leadership1.appendChild(entry.cloneNode(true));
    });
    // Hide the second section after merging
    if (secLeadership2) {
      secLeadership2.style.display = 'none';
    }
  }
  
  // Merge Projects2 into Projects1
  const projects2 = document.getElementById('bodyProjects2');
  const projects1 = document.getElementById('bodyProjects1');
  const secProjects2 = document.getElementById('secProjects2');
  if (projects2 && projects1) {
    const entries = projects2.querySelectorAll('.entry');
    entries.forEach(entry => {
      projects1.appendChild(entry.cloneNode(true));
    });
    // Hide the second section after merging
    if (secProjects2) {
      secProjects2.style.display = 'none';
    }
  }
  
  // Merge Volunteering2 into Volunteering1
  const volunteering2 = document.getElementById('bodyVolunteering2');
  const volunteering1 = document.getElementById('bodyVolunteering1');
  const secVolunteering2 = document.getElementById('secVolunteering2');
  if (volunteering2 && volunteering1) {
    const entries = volunteering2.querySelectorAll('.entry');
    entries.forEach(entry => {
      volunteering1.appendChild(entry.cloneNode(true));
    });
    // Hide the second section after merging
    if (secVolunteering2) {
      secVolunteering2.style.display = 'none';
    }
  }
  
  sectionsMerged = true; // Mark as merged
}

/**
 * Mobile scroll helper
 * DISABLED: Scroll buttons removed per mobile redesign - manual scroll only
 */
function initMobileScrollHelper() {
  // Skip initialization - scroll helpers are hidden via CSS
  // Users will use natural finger scrolling instead
  return;
  
  function getCurrentSectionIndex() {
    const scrollY = window.scrollY || window.pageYOffset;
    const viewportHeight = window.innerHeight;
    const viewportCenter = scrollY + viewportHeight / 2;
    
    let currentIndex = 0;
    let minDistance = Infinity;
    
    SECTIONS.forEach((section, index) => {
      if (section.element) {
        try {
          // Skip hidden sections
          const computedStyle = window.getComputedStyle(section.element);
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
            return; // Skip this section
          }
          
          const rect = section.element.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) {
            return; // Skip if not visible
          }
          
          const sectionTop = rect.top + scrollY;
          const sectionCenter = sectionTop + rect.height / 2;
          const distance = Math.abs(viewportCenter - sectionCenter);
          
          if (distance < minDistance) {
            minDistance = distance;
            currentIndex = index;
          }
        } catch (e) {
          // Element not available
        }
      }
    });
    
    return currentIndex;
  }
  
  function getNextSection() {
    const currentIndex = getCurrentSectionIndex();
    
    // Find the next visible section (skip hidden split sections on mobile)
    // Start from currentIndex + 1 and keep looking until we find a visible section
    for (let i = currentIndex + 1; i < SECTIONS.length; i++) {
      const section = SECTIONS[i];
      if (section.element) {
        // Check if section is visible (not hidden by CSS)
        const computedStyle = window.getComputedStyle(section.element);
        const rect = section.element.getBoundingClientRect();
        
        // Skip if display is none, visibility is hidden, or has no dimensions
        if (computedStyle.display === 'none' || 
            computedStyle.visibility === 'hidden' ||
            rect.width === 0 || 
            rect.height === 0) {
          continue; // Skip this section and keep looking
        }
        
        // Found a visible section!
        return section.element;
      }
    }
    
    return null;
  }
  
  function updateHelper() {
    const scrollY = window.scrollY || window.pageYOffset;
    const nextSection = getNextSection();
    const currentIndex = getCurrentSectionIndex();
    const firstSection = SECTIONS[0] && SECTIONS[0].element;
    
    // Show down arrow if there's a next section
    if (nextSection) {
      helper.classList.add('visible');
    } else {
      helper.classList.remove('visible');
    }
    
    // Show up arrow if past first section
    if (upHelper && firstSection && currentIndex > 0 && scrollY > 100) {
      upHelper.classList.add('visible');
    } else if (upHelper) {
      upHelper.classList.remove('visible');
    }
  }
  
  // Make sure arrow is visible initially
  setTimeout(() => {
    updateHelper();
  }, 100);
  
  // Show helper immediately - force visibility
  helper.classList.add('visible');
  updateHelper();
  
  // Also update after DOM is fully ready
  setTimeout(() => {
    updateHelper();
  }, 500);
  
  // Update on scroll
  window.addEventListener('scroll', updateHelper, { passive: true });
  
  // Scroll function - scroll within current section first, then to next
  function scrollToNextSection() {
    const currentSection = getCurrentSection();
    const nextSection = getNextSection();
    
    if (currentSection && currentSection.element) {
      const currentRect = currentSection.element.getBoundingClientRect();
      const viewportBottom = window.innerHeight;
      const sectionBottom = currentRect.bottom;
      
      // If current section has more content below viewport, scroll down within it first
      if (sectionBottom > viewportBottom + 50) {
        // Scroll down by viewport height minus some padding
        window.scrollBy({
          top: window.innerHeight * 0.8,
          behavior: 'smooth'
        });
        return;
      }
    }
    
    // If current section is fully visible or no more content, go to next section
    if (nextSection) {
      const sectionId = nextSection.id.replace('sec', '');
      const section = SECTIONS.find(s => s.id === sectionId);
      const targetElement = section && section.heading ? section.heading : nextSection;
      
      const navBarHeight = 104;
      const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const scrollPosition = elementTop - navBarHeight - 20;
      
      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    }
  }

  // Click and touch handlers for mobile scroll down
  helper.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToNextSection();
  });
  
  // Also support touch events for better mobile compatibility
  helper.addEventListener('touchend', (e) => {
    e.preventDefault();
    e.stopPropagation();
    scrollToNextSection();
  });
  
  // Scroll up function
  function scrollToTop() {
    const firstSection = SECTIONS[0];
    if (firstSection && firstSection.element) {
      const navBarHeight = 104;
      const targetElement = firstSection.heading || firstSection.element;
      const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
      const scrollPosition = elementTop - navBarHeight - 20;
      
      window.scrollTo({
        top: Math.max(0, scrollPosition),
        behavior: 'smooth'
      });
    } else {
      // Fallback to top of page
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }
  
  // Click and touch handlers for mobile scroll up
  if (upHelper) {
    upHelper.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToTop();
    });
    
    upHelper.addEventListener('touchend', (e) => {
      e.preventDefault();
      e.stopPropagation();
      scrollToTop();
    });
  }
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
  'LeadershipExperience': 'TECHNICAL EXPERIENCE',
  'LeadershipExperience2': '',
  'WorkExperience': 'WORK EXPERIENCE',
  'Education': 'EDUCATION',
  'Projects1': 'PROJECTS',
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
    // MOBILE: Show everything immediately - no animations
    if (CONFIG.isMobile) {
      if (section.body) {
        section.body.style.opacity = '1';
        section.body.style.transform = 'translateY(0)';
        section.body.classList.add('visible');
      }
      if (section.heading && section.headingText) {
        section.heading.textContent = section.headingText;
        section.heading.style.opacity = '1';
        section.heading.classList.add('animated');
      }
      if (section.subheading && section.subheadingText) {
        section.subheading.textContent = section.subheadingText;
        section.subheading.style.opacity = '1';
        section.subheading.classList.add('visible');
      }
      return;
    }
    
    // DESKTOP: Set up for animations
    if (section.body) {
      // Initially hide body content
      section.body.style.opacity = '0';
      section.body.style.transform = 'translateY(20px)';
    }
    if (section.heading) {
      section.heading.style.opacity = '0';
    }
    if (section.subheading) {
      // For scramble animation, start with empty text instead of opacity 0
      // But preserve the text in subheadingText for scrambling
      section.subheading.textContent = '';
      section.subheading.style.opacity = '1'; // Keep visible for scramble effect
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
  // Use single threshold to prevent multiple triggers
  intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const sectionId = entry.target.id.replace('sec', '');
        const section = SECTIONS.find(s => s.id === sectionId);
        
        // Double-check to prevent race conditions
        if (section && !section.animated) {
          section.animated = true; // Set immediately to prevent duplicate calls
          // Use requestAnimationFrame to ensure this happens in next frame
          requestAnimationFrame(() => {
            animateSection(section);
          });
        }
      }
    });
  }, {
    root: null,
    rootMargin: CONFIG.isMobile ? '0px 0px 0% 0px' : '0px 0px -20% 0px', // Trigger as soon as section enters viewport
    threshold: CONFIG.isMobile ? 0.05 : 0.1 // Lower threshold for faster triggering
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

  // Add wheel event for smooth section snapping (desktop only)
  // Skip on mobile - use natural finger scrolling
  if (!CONFIG.isMobile) {
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
  
  // MOBILE: Skip scramble animations - just show content directly
  if (CONFIG.isMobile) {
    // Simply show heading text without animation
    if (section.heading && section.headingText) {
      section.heading.textContent = section.headingText;
      section.heading.style.opacity = '1';
      section.heading.classList.add('animated');
    }
    // Show subheading without animation
    if (section.subheading && section.subheadingText) {
      section.subheading.textContent = section.subheadingText;
      section.subheading.style.opacity = '1';
      section.subheading.classList.add('visible');
    }
    // Show body content without animation
    if (section.body) {
      section.body.style.opacity = '1';
      section.body.style.transform = 'translateY(0)';
      section.body.classList.add('visible');
    }
    return; // Skip desktop animations
  }
  
  // DESKTOP: Animate heading with scramble reveal
  if (section.heading && section.headingText) {
    // Mark heading as animating
    section.heading.classList.add('animating');
    
    // Start body content fade-in halfway through scramble animation for snappier feel
    const bodyDelay = CONFIG.scrambleDuration * 0.4; // Start at 40% of scramble duration
    
    scrambleReveal(section.heading, section.headingText, {
      duration: CONFIG.scrambleDuration,
      onComplete: () => {
        section.heading.classList.remove('animating');
        section.heading.classList.add('animated');
      }
    });
    
    // Start body content animation earlier (during scramble)
    if (section.body) {
      fadeInContent(section.body, bodyDelay);
    }
    // Animate subheading with scramble reveal (jumble animation)
    if (section.subheading && section.subheadingText) {
      // Mark subheading as animating to prevent duplicates
      if (section.subheading.dataset.animating !== 'true') {
        section.subheading.dataset.animating = 'true';
        scrambleReveal(section.subheading, section.subheadingText, {
          duration: CONFIG.scrambleDuration * 0.8,
          delay: bodyDelay,
          onComplete: () => {
            section.subheading.dataset.animating = 'false';
            section.subheading.classList.add('visible');
          }
        });
      }
    }
  } else {
    // If no heading, just animate content immediately
    if (section.subheading && section.subheadingText) {
      // Use scramble for subheading
      if (section.subheading.dataset.animating !== 'true') {
        section.subheading.dataset.animating = 'true';
        scrambleReveal(section.subheading, section.subheadingText, {
          duration: CONFIG.scrambleDuration * 0.8,
          onComplete: () => {
            section.subheading.dataset.animating = 'false';
            section.subheading.classList.add('visible');
          }
        });
      }
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
  
  // Use snappier fade for faster scrolling responsiveness
  const duration = CONFIG.isMobile ? 500 : CONFIG.fadeInDuration;
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
 * Get next section (skips sections without valid elements)
 */
function getNextSection(currentSection) {
  const currentIndex = SECTIONS.findIndex(s => s.id === currentSection.id);
  // Find next section with a valid, visible element
  for (let i = currentIndex + 1; i < SECTIONS.length; i++) {
    const section = SECTIONS[i];
    if (section.element) {
      const style = window.getComputedStyle(section.element);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        return section;
      }
    }
  }
  return null;
}

/**
 * Get previous section (skips sections without valid elements)
 */
function getPreviousSection(currentSection) {
  const currentIndex = SECTIONS.findIndex(s => s.id === currentSection.id);
  // Find previous section with a valid, visible element
  for (let i = currentIndex - 1; i >= 0; i--) {
    const section = SECTIONS[i];
    if (section.element) {
      const style = window.getComputedStyle(section.element);
      if (style.display !== 'none' && style.visibility !== 'hidden') {
        return section;
      }
    }
  }
  return null;
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

/**
 * Initialize scroll indicators between sections on mobile
 */
function initSectionScrollIndicators() {
  if (!CONFIG.isMobile) return;
  
  // Add scroll indicators between sections
  SECTIONS.forEach((section, index) => {
    if (index === 0 || !section.element) return; // Skip first section
    
    const indicator = document.createElement('div');
    indicator.className = 'section-scroll-indicator';
    indicator.innerHTML = '<div class="scroll-indicator-arrow"></div>';
    
    // Insert before section
    section.element.parentNode.insertBefore(indicator, section.element);
    
    // Make it clickable to scroll to section
    indicator.addEventListener('click', () => {
      section.element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    
    // Show/hide based on scroll position
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          indicator.classList.add('visible');
        } else {
          indicator.classList.remove('visible');
        }
      });
    }, { threshold: 0.1 });
    
    observer.observe(section.element);
  });
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

