/**
 * Home page scramble animations
 */

document.addEventListener('DOMContentLoaded', () => {
  const subtitle = document.querySelector('.home-subtitle');
  const viewResumeBtn = document.querySelector('.view-resume-btn');
  
  // Change subtitle text on mobile BEFORE scrambling - split into two lines
  if (window.innerWidth < 768 && subtitle) {
    subtitle.innerHTML = 'MECHE @ UC BERKELEY<br>LIFTING, TRAVELING';
    // Store the HTML version for scrambling
    const finalHTML = subtitle.innerHTML;
    // Reset to scrambled state first
    subtitle.innerHTML = '';
    scrambleRevealHTML(subtitle, finalHTML, { duration: 800 });
  } else if (subtitle) {
    // Desktop: use regular text scrambling
    const finalText = subtitle.textContent.trim();
    subtitle.textContent = '';
    scrambleReveal(subtitle, finalText, { duration: 800 });
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

function scrambleRevealHTML(element, finalHTML, options = {}) {
  const duration = options.duration || 600;
  const delay = options.delay || 0;
  const scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  
  // Extract text parts and HTML tags
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = finalHTML;
  const textParts = [];
  const processNode = (node) => {
    if (node.nodeType === 3) { // Text node
      textParts.push({ type: 'text', content: node.textContent });
    } else if (node.nodeType === 1) { // Element node
      textParts.push({ type: 'tag', tag: node.tagName, content: node.outerHTML });
      Array.from(node.childNodes).forEach(processNode);
    }
  };
  Array.from(tempDiv.childNodes).forEach(processNode);
  
  // For simplicity, just scramble the text parts and preserve HTML structure
  const textContent = tempDiv.textContent || tempDiv.innerText || '';
  const chars = textContent.split('');
  const scrambleCharsArray = scrambleChars.split('');
  
  setTimeout(() => {
    const startTime = Date.now();
    
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
      
      // Reconstruct HTML with scrambled text
      let htmlResult = finalHTML;
      let textIndex = 0;
      htmlResult = htmlResult.replace(/>([^<]+)</g, (match, text) => {
        const textLength = text.length;
        const scrambledText = scrambled.substring(textIndex, textIndex + textLength);
        textIndex += textLength;
        return '>' + scrambledText + '<';
      });
      
      element.innerHTML = htmlResult;
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        element.innerHTML = finalHTML;
      }
    }
    
    requestAnimationFrame(animate);
  }, delay);
}
