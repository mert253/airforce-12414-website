const art = document.querySelector('.hero-art');
const tilt = document.querySelector('.mascot-tilt');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
let animationFrame = 0;
let pointerX = 0;
let pointerY = 0;

function resetTilt() {
  cancelAnimationFrame(animationFrame);
  animationFrame = 0;
  tilt?.style.removeProperty('transform');
}

function updateTilt() {
  animationFrame = 0;
  if (!tilt || reducedMotion.matches || !finePointer.matches || document.hidden) return;
  // A light lean, a few degrees at the edges; reduced-motion and touch users get none.
  tilt.style.transform = `perspective(1400px) translate3d(${pointerX * 3}px, ${pointerY * 2}px, 0) rotateX(${-pointerY * 3}deg) rotateY(${pointerX * 4}deg)`;
}

art?.addEventListener('pointermove', event => {
  if (!tilt || reducedMotion.matches || !finePointer.matches || event.pointerType === 'touch') return;
  const bounds = art.getBoundingClientRect();
  if (!bounds.width || !bounds.height) return;
  pointerX = Math.max(-0.5, Math.min(0.5, (event.clientX - bounds.left) / bounds.width - 0.5));
  pointerY = Math.max(-0.5, Math.min(0.5, (event.clientY - bounds.top) / bounds.height - 0.5));
  if (!animationFrame) animationFrame = requestAnimationFrame(updateTilt);
}, { passive: true });

art?.addEventListener('pointerleave', resetTilt);
art?.addEventListener('pointercancel', resetTilt);
window.addEventListener('blur', resetTilt);
window.addEventListener('pagehide', resetTilt);
document.addEventListener('visibilitychange', () => { if (document.hidden) resetTilt(); });
reducedMotion.addEventListener('change', resetTilt);
finePointer.addEventListener('change', resetTilt);
