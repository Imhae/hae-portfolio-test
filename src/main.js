import './style.css';
import { initReveal } from './lib/reveal.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const navToggle = document.getElementById('nav-toggle');
const navLinks = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

initReveal(prefersReducedMotion);

// Nav active link (scrollspy)
const navAnchors = Array.from(navLinks.querySelectorAll('a[href^="#"]'));
const spySections = navAnchors
  .map((a) => document.querySelector(a.getAttribute('href')))
  .filter(Boolean);

if (spySections.length && 'IntersectionObserver' in window) {
  const setActive = (id) => {
    navAnchors.forEach((a) => {
      a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
    });
  };

  const spyObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting);
      if (visible.length > 0) {
        const topMost = visible.reduce((a, b) =>
          a.boundingClientRect.top < b.boundingClientRect.top ? a : b
        );
        setActive(topMost.target.id);
      }
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );

  spySections.forEach((section) => spyObserver.observe(section));
}
