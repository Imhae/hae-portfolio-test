import './hong-da.css';
import { animate, scroll, stagger, inView } from 'motion';
import { initReveal } from './lib/reveal.js';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

initReveal(prefersReducedMotion);

// --- Scroll progress bar -------------------------------------------------
const progressBar = document.getElementById('scroll-progress-bar');
if (progressBar) {
  scroll((progress) => {
    progressBar.style.width = `${progress * 100}%`;
  });
}

// --- Hero: fade + translate-up with stagger ------------------------------
const heroItems = document.querySelectorAll('.cs-hero__content > *');
const heroVisual = document.querySelector('.cs-hero__visual');

if (prefersReducedMotion) {
  heroItems.forEach((el) => (el.style.opacity = 1));
  if (heroVisual) heroVisual.style.opacity = 1;
} else {
  animate(
    heroItems,
    { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
    { duration: 0.8, delay: stagger(0.12), ease: [0.16, 1, 0.3, 1] }
  );
  if (heroVisual) {
    animate(
      heroVisual,
      { opacity: [0, 1], transform: ['translateY(40px)', 'translateY(0px)'] },
      { duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }
    );
  }
}

// --- Hero parallax on the device mockup ----------------------------------
const parallaxTarget = document.querySelector('[data-parallax] .cs-device--browser');
if (parallaxTarget && !prefersReducedMotion) {
  scroll(animate(parallaxTarget, { transform: ['translateY(0px)', 'translateY(-48px)'] }), {
    target: document.querySelector('.cs-hero'),
    offset: ['start start', 'end start'],
  });
}

// --- Timeline fill synced to scroll through the Design Process section --
const timelineFill = document.getElementById('timeline-fill');
const timelineSection = document.querySelector('.cs-timeline');

if (timelineFill && timelineSection) {
  if (prefersReducedMotion) {
    timelineFill.style.width = '100%';
  } else {
    scroll(animate(timelineFill, { width: ['0%', '100%'] }), {
      target: timelineSection,
      offset: ['start 0.85', 'end 0.6'],
    });
  }
}

// --- Counters (stat cards + metrics) -------------------------------------
const counters = document.querySelectorAll('[data-counter]');

counters.forEach((el) => {
  const target = parseFloat(el.dataset.counter);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';

  if (prefersReducedMotion) {
    el.textContent = `${prefix}${target}${suffix}`;
    return;
  }

  let counted = false;
  inView(el, () => {
    if (counted) return;
    counted = true;
    animate(0, target, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        el.textContent = `${prefix}${Math.round(latest * 10) / 10}${suffix}`;
      },
    });
  });
});

// --- Wireframe annotations -------------------------------------------------
const tooltip = document.getElementById('cs-tooltip');
const annotations = document.querySelectorAll('.cs-annotation');
let activeAnnotation = null;

function hideTooltip() {
  if (!tooltip) return;
  tooltip.classList.remove('is-visible');
  activeAnnotation = null;
}

function showTooltip(button) {
  if (!tooltip) return;
  const rect = button.getBoundingClientRect();
  tooltip.textContent = button.dataset.note || '';
  tooltip.classList.add('is-visible');

  const top = rect.bottom + 10;
  let left = rect.left + rect.width / 2 - tooltip.offsetWidth / 2;
  left = Math.max(12, Math.min(left, window.innerWidth - tooltip.offsetWidth - 12));

  tooltip.style.top = `${top}px`;
  tooltip.style.left = `${left}px`;
}

annotations.forEach((button) => {
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    if (activeAnnotation === button) {
      hideTooltip();
      return;
    }
    activeAnnotation = button;
    showTooltip(button);
  });
});

document.addEventListener('click', hideTooltip);
document.addEventListener('scroll', hideTooltip, { passive: true });
