import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router';

// Swap later: elements that fade in as you scroll.
// A selector that matches nothing is harmless; it just won't animate.
const REVEAL_SELECTORS = [
  // Home
  '.header-hero > *',
  '.projects-top',
  '.project-card',
  // Projects list + articles
  '.projects-intro',
  '.featured',
  '.morework',
  '.article-header',
  '.article-image',
  '.article-section',
  '.article-repo',
  // About
  '.about-eyebrow',
  '.about-title',
  '.about-side',
  '.about-bio',
  '.about-now',
  // Work
  '.work-intro',
  '.work-item',
  '.work-split > .work-section',
  '.work-tool-group',
  // Resume
  '.resume-header',
  '.resume-preview',
  // Contact
  '.contact-eyebrow',
  '.contact-title',
  '.contact-info',
  '.contact-form',
].join(', ');

const DURATION = 600; // ms
const STAGGER = 90; // ms between siblings, like cards in a row
const MAX_STAGGER_STEPS = 4;

export default function useScrollReveal() {
  const { pathname } = useLocation();

  // Runs before the browser paints, so nothing flickers visible then hides
  useLayoutEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) return;

    const elements = Array.from(document.querySelectorAll(REVEAL_SELECTORS));
    const siblingCount = new Map();

    // Hide each element and give siblings a small staggered delay
    elements.forEach((element) => {
      const parent = element.parentElement;
      const index = siblingCount.get(parent) ?? 0;
      siblingCount.set(parent, index + 1);

      element.dataset.revealDelay = String(Math.min(index, MAX_STAGGER_STEPS) * STAGGER);
      element.classList.add('reveal-pending');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const element = entry.target;
          observer.unobserve(element);
          element.classList.remove('reveal-pending');

          element.animate(
            [
              { opacity: 0, transform: 'translateY(16px)' },
              { opacity: 1, transform: 'none' },
            ],
            {
              duration: DURATION,
              delay: Number(element.dataset.revealDelay),
              easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)',
              fill: 'backwards',
            },
          );
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );

    elements.forEach((element) => observer.observe(element));

    // On page change: stop watching and un-hide anything left over
    return () => {
      observer.disconnect();
      elements.forEach((element) => element.classList.remove('reveal-pending'));
    };
  }, [pathname]);
}