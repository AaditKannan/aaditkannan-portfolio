/**
 * Connect page scramble animations
 */

document.addEventListener('DOMContentLoaded', () => {
  const heading = document.getElementById('connectHeading');
  const subheading = document.getElementById('connectSubheading');
  const contactInfo = document.getElementById('contactInfo');
  
  if (heading) {
    const originalText = heading.textContent.trim();
    scrambleReveal(heading, originalText, { duration: 600 });
  }
  
  if (subheading) {
    const originalText = subheading.textContent.trim();
    scrambleReveal(subheading, originalText, { duration: 600, delay: 200 });
  }

  // Fade in contact info after subheading
  if (contactInfo) {
    setTimeout(() => {
      contactInfo.classList.add('visible');
    }, 600);
  }

  // Fade in calendar description after contact info
  const calendarDescription = document.getElementById('calendarDescription');
  if (calendarDescription) {
    setTimeout(() => {
      calendarDescription.classList.add('visible');
    }, 900);
  }
});

function scrambleReveal(element, finalText, options = {}) {
  const duration = options.duration || 600;
  const delay = options.delay || 0;
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  
  setTimeout(() => {
    const startTime = Date.now();
    const chars = finalText.split('');
    const scrambleCharsArray = scrambleChars.split('');
    
    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic

      const scrambled = chars.map((char, index) => {
        if (char === ' ' || char === '\n' || !/[a-zA-Z0-9]/.test(char)) {
          return char;
        }
        
        const revealIndex = Math.floor(eased * chars.length);
        if (index < revealIndex) {
          return char;
        } else if (index === revealIndex && progress > 0.9) {
          return char;
        } else {
          return scrambleCharsArray[Math.floor(Math.random() * scrambleCharsArray.length)];
        }
      }).join('');
      
      element.textContent = scrambled;
      element.style.opacity = '1';
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = finalText;
        element.style.opacity = '1';
      }
    }
    
    requestAnimationFrame(animate);
  }, delay);
}

