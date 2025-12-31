/**
 * Mobile viewport height utilities for handling browser chrome and safe areas
 */

export function setViewportHeight() {
  // Calculate actual viewport height accounting for mobile browser chrome
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
  
  // Update viewport-height custom property for fallback
  document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);
}

export function initializeViewportHeight() {
  // Set initial viewport height
  setViewportHeight();
  
  // Update on resize (handles orientation changes and browser chrome changes)
  window.addEventListener('resize', setViewportHeight);
  
  // Update on orientation change (mobile specific)
  if ('orientation' in screen) {
    window.addEventListener('orientationchange', () => {
      // Small delay to account for browser UI adjustments
      setTimeout(setViewportHeight, 100);
    });
  }
  
  // Clean up function
  return () => {
    window.removeEventListener('resize', setViewportHeight);
    if ('orientation' in screen) {
      window.removeEventListener('orientationchange', setViewportHeight);
    }
  };
}

export function isMobileDevice(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

export function isIOSDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function hasNotch(): boolean {
  // Check for devices with notch/safe areas
  return CSS.supports('padding: max(0px)') && 
         (window.screen.height >= 812 || window.screen.width >= 812);
}