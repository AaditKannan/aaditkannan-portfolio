/**
 * Home page scramble animations
 */

document.addEventListener('DOMContentLoaded', () => {
  const subtitle = document.querySelector('.home-subtitle');
  const viewResumeBtn = document.querySelector('.view-resume-btn');
  
  // Change subtitle text on mobile
  if (window.innerWidth < 768 && subtitle) {
    subtitle.textContent = 'MECHE @ UC BERKELEY, LIFTING, TRAVELING';
  }
  
  if (subtitle) {
    const originalText = subtitle.textContent.trim();
    scrambleReveal(subtitle, originalText, { duration: 800 });
  }
  
  if (viewResumeBtn) {
    const originalText = viewResumeBtn.textContent.trim();
    scrambleReveal(viewResumeBtn, originalText, { duration: 800, delay: 200 });
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
      const eased = 1 - Math.pow(1 - progress, 3);
      
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
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = finalText;
      }
    }
    
    requestAnimationFrame(animate);
  }, delay);
}

