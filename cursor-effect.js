/**
 * Custom Cursor Effect
 * Creates a smooth trailing cursor effect
 */

(function() {
  // Create cursor element
  const cursor = document.createElement('div');
  cursor.className = 'custom-cursor';
  document.body.appendChild(cursor);
  
  // Create trail elements
  const trailCount = 8;
  const trailElements = [];
  for (let i = 0; i < trailCount; i++) {
    const trail = document.createElement('div');
    trail.className = 'cursor-trail';
    trail.style.opacity = (trailCount - i) / trailCount * 0.5;
    document.body.appendChild(trail);
    trailElements.push(trail);
  }
  
  let mouseX = 0;
  let mouseY = 0;
  let cursorX = 0;
  let cursorY = 0;
  let trailPositions = Array(trailCount).fill({ x: 0, y: 0 });
  
  // Update mouse position
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });
  
  // Smooth animation loop
  function animate() {
    // Smooth cursor movement (easing)
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    
    // Update cursor position
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    // Update trail positions (each follows the previous)
    trailPositions[0] = { x: cursorX, y: cursorY };
    for (let i = 1; i < trailCount; i++) {
      trailPositions[i].x += (trailPositions[i - 1].x - trailPositions[i].x) * 0.3;
      trailPositions[i].y += (trailPositions[i - 1].y - trailPositions[i].y) * 0.3;
    }
    
    // Apply trail positions
    trailElements.forEach((trail, i) => {
      trail.style.left = trailPositions[i].x + 'px';
      trail.style.top = trailPositions[i].y + 'px';
    });
    
    requestAnimationFrame(animate);
  }
  
  // Hide default cursor on interactive elements
  const interactiveElements = document.querySelectorAll('a, button, input, textarea, select');
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('cursor-hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('cursor-hover');
    });
  });
  
  // Start animation
  animate();
  
  // Hide on mobile/touch devices
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    cursor.style.display = 'none';
    trailElements.forEach(trail => trail.style.display = 'none');
  }
})();

