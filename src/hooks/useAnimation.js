import { useEffect, useRef, useCallback } from 'react';

/**
 * Custom hook for intersection observer based animations.
 * Adds 'animate' class to elements with data-animate attribute when they enter viewport.
 *
 * @param {Object} options - IntersectionObserver options
 * @param {number} options.threshold - Visibility threshold (0-1), default 0.1
 * @param {string} options.rootMargin - Root margin, default "0px 0px -50px 0px"
 * @param {boolean} options.triggerOnce - Only trigger animation once, default true
 * @returns {Object} - ref to attach to container, and reset function
 */
export function useAnimation(options = {}) {
  const containerRef = useRef(null);
  const observerRef = useRef(null);

  const {
    threshold = 0.1,
    rootMargin = '0px 0px -50px 0px',
    triggerOnce = true
  } = options;

  const initObserver = useCallback(() => {
    if (!containerRef.current) return;

    // Disconnect existing observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            if (triggerOnce) {
              observerRef.current?.unobserve(entry.target);
            }
          } else if (!triggerOnce) {
            entry.target.classList.remove('animate');
          }
        });
      },
      { threshold, rootMargin }
    );

    // Observe all elements with data-animate
    const elements = containerRef.current.querySelectorAll('[data-animate]');
    elements.forEach((el) => {
      observerRef.current.observe(el);
    });
  }, [threshold, rootMargin, triggerOnce]);

  // Initialize on mount and when dependencies change
  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(initObserver, 100);

    return () => {
      clearTimeout(timer);
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [initObserver]);

  // Reset function to re-observe elements (useful after content changes)
  const reset = useCallback(() => {
    if (containerRef.current) {
      const elements = containerRef.current.querySelectorAll('[data-animate]');
      elements.forEach((el) => {
        el.classList.remove('animate');
      });
    }
    initObserver();
  }, [initObserver]);

  return { ref: containerRef, reset };
}

/**
 * Hook for animating elements on page load (not scroll-based)
 * Useful for hero sections that should animate immediately
 *
 * @param {number} delay - Delay before starting animations in ms, default 100
 */
export function usePageLoadAnimation(delay = 100) {
  const containerRef = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (containerRef.current) {
        const elements = containerRef.current.querySelectorAll('[data-animate]');
        elements.forEach((el) => {
          el.classList.add('animate');
        });
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  return containerRef;
}

/**
 * Helper function to generate staggered animation props
 *
 * @param {number} index - Item index
 * @param {Object} options - Animation options
 * @returns {Object} - Props to spread on element
 */
export function getStaggerProps(index, options = {}) {
  const {
    animation = 'fade-up',
    duration = 'normal',
    baseDelay = 0,
    staggerDelay = 1,
    easing = 'ease-out'
  } = options;

  return {
    'data-animate': animation,
    'data-duration': duration,
    'data-delay': String(baseDelay + (index * staggerDelay)),
    'data-easing': easing
  };
}

/**
 * Predefined animation patterns for common use cases
 */
export const animationPatterns = {
  // For grid items - alternating directions
  grid: (index) => {
    const patterns = ['fade-up', 'fade-up', 'fade-up', 'fade-up'];
    const durations = ['normal', 'normal', 'light-slow', 'normal'];
    return {
      'data-animate': patterns[index % patterns.length],
      'data-duration': durations[index % durations.length],
      'data-delay': String(index % 8)
    };
  },

  // For list items - sequential fade
  list: (index) => ({
    'data-animate': 'fade-right',
    'data-duration': 'fast',
    'data-delay': String(Math.min(index, 10))
  }),

  // For cards - zoom effect
  cards: (index) => ({
    'data-animate': index % 2 === 0 ? 'fade-up' : 'zoom-in',
    'data-duration': 'normal',
    'data-delay': String(index % 6)
  }),

  // For stats/numbers
  stats: (index) => ({
    'data-animate': 'zoom-in',
    'data-duration': 'fast',
    'data-delay': String(index)
  }),

  // For navigation items
  nav: (index) => ({
    'data-animate': 'fade-down',
    'data-duration': 'fast',
    'data-delay': String(index)
  }),

  // For hero elements
  hero: (index) => ({
    'data-animate': 'slide-up',
    'data-duration': 'slow',
    'data-delay': String(index * 2)
  }),

  // For form elements
  form: (index) => ({
    'data-animate': 'fade-up',
    'data-duration': 'fast',
    'data-delay': String(index)
  }),

  // For table rows
  tableRow: (index) => ({
    'data-animate': 'fade-left',
    'data-duration': 'very-fast',
    'data-delay': String(Math.min(index, 8))
  })
};

export default useAnimation;
