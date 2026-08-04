import './swapifly.css';
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

// --- Hero: fade + translate-up with stagger -------------------------------
const heroItems = document.querySelectorAll('.swap-hero__content > *');
const heroVisual = document.querySelector('.swap-hero__visual');

if (prefersReducedMotion) {
  heroItems.forEach((el) => (el.style.opacity = 1));
  if (heroVisual) heroVisual.style.opacity = 1;
} else {
  animate(
    heroItems,
    { opacity: [0, 1], transform: ['translateY(24px)', 'translateY(0px)'] },
    { duration: 0.8, delay: stagger(0.1), ease: [0.16, 1, 0.3, 1] }
  );
  if (heroVisual) {
    animate(
      heroVisual,
      { opacity: [0, 1], transform: ['translateY(36px)', 'translateY(0px)'] },
      { duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }
    );
  }
}

// --- Gentle parallax: hero glows, hero visual, offer visual ---------------
if (!prefersReducedMotion) {
  const heroSection = document.querySelector('.swap-hero');
  if (heroSection) {
    document.querySelectorAll('.swap-hero__glow').forEach((glow, i) => {
      scroll(animate(glow, { transform: ['translateY(0px)', `translateY(${i % 2 === 0 ? '60px' : '-60px'})`] }), {
        target: heroSection,
        offset: ['start start', 'end start'],
      });
    });
  }

  document.querySelectorAll('[data-parallax]').forEach((el) => {
    const section = el.closest('section');
    scroll(animate(el, { transform: ['translateY(-24px)', 'translateY(24px)'] }), {
      target: section || el,
      offset: ['start end', 'end start'],
    });
  });

  document.querySelectorAll('[data-parallax-slow]').forEach((el) => {
    const section = el.closest('section');
    scroll(animate(el, { transform: ['translateY(-14px)', 'translateY(14px)'] }), {
      target: section || el,
      offset: ['start end', 'end start'],
    });
  });
}

// --- AI Activity log: staggered entrance when in view ----------------------
const aiLogItems = document.querySelectorAll('.swap-ai-log__list li');
if (aiLogItems.length) {
  if (prefersReducedMotion) {
    aiLogItems.forEach((el) => (el.style.opacity = 1));
  } else {
    aiLogItems.forEach((el) => (el.style.opacity = 0));
    inView(
      '.swap-ai-log',
      () => {
        animate(
          aiLogItems,
          { opacity: [0, 1], transform: ['translateX(-10px)', 'translateX(0px)'] },
          { duration: 0.55, delay: stagger(0.14), ease: [0.16, 1, 0.3, 1] }
        );
      },
      { amount: 0.4 }
    );
  }
}

// ---------------------------------------------------------------------------
// Product Ecosystem: transaction diagram entrance
//
// Nodes carry a `data-loop-step` index (0–6) that drives both the CSS
// transition-delay (via the --loop-step custom property) and the left-to-
// right reveal order: seller/buyer labels -> list/browse cards -> curved
// connectors -> core -> offer (+ its connector) -> negotiate (+ connector)
// -> close & rate (+ connector). Connector lines use a dashed stroke with a
// continuous CSS animation (conveyor-belt effect), independent of this
// entrance reveal.
// ---------------------------------------------------------------------------
const loopDiagram = document.getElementById('loop-diagram');

if (loopDiagram) {
  const loopNodes = loopDiagram.querySelectorAll('[data-loop-node]');
  loopNodes.forEach((el) => {
    el.style.setProperty('--loop-step', el.dataset.loopStep || '0');
  });

  if (prefersReducedMotion) {
    loopDiagram.classList.add('is-active');
  } else if ('IntersectionObserver' in window) {
    const loopObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            loopDiagram.classList.add('is-active');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    loopObserver.observe(loopDiagram);
  } else {
    loopDiagram.classList.add('is-active');
  }
}

// ---------------------------------------------------------------------------
// Interactive "AI-assisted listing flow" demo
//
// Recreated from Figma's "Interaction video / AI-assisted listing flow"
// motion data (node 333:287): a 16s looping timeline across 6 scenes.
// Scene boundaries below mirror the extracted keyframe percentages:
//   Scene 1  Upload empty        0%       -> 10.625% (0 - 1700ms)
//   Scene 2  Uploaded photos     10.625%  -> 19.375% (1700 - 3100ms)
//   Scene 3  AI analyzing        19.375%  -> 31.563% (3100 - 5050ms)
//   Scene 4  AI draft + review   31.563%  -> 65.313% (5050 - 10450ms)
//   Scene 5  Preview             65.313%  -> 81.875% (10450 - 13100ms)
//   Scene 6  Published           81.875%  -> 100%    (13100 - 16000ms)
// Implemented as a JS scene stepper (not raw CSS animation) so it can be
// paused outside the viewport, replayed on demand, and skipped for
// prefers-reduced-motion — all without an actual <video> element.
// ---------------------------------------------------------------------------
const demoRoot = document.getElementById('swap-demo-phone');

if (demoRoot) {
  const scenes = Array.from(demoRoot.querySelectorAll('.swap-scene'));
  const dots = Array.from(document.querySelectorAll('.swap-dot'));
  const replayBtn = document.getElementById('swap-demo-replay');
  const fallbackNote = document.getElementById('swap-demo-fallback-note');
  const demoContainer = document.querySelector('.swap-demo');

  const DURATIONS = [1700, 1400, 1950, 5400, 2650, 2900]; // ms, sums to 16000
  let currentIndex = 0;
  let timerId = null;
  let isPlaying = false;
  let inViewport = false;

  function setActiveScene(index) {
    currentIndex = index;
    scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === index));
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
  }

  function clearTimer() {
    if (timerId) {
      clearTimeout(timerId);
      timerId = null;
    }
  }

  function advance() {
    const nextIndex = (currentIndex + 1) % scenes.length;
    setActiveScene(nextIndex);
    timerId = setTimeout(advance, DURATIONS[nextIndex]);
  }

  function play(fromStart = false) {
    if (isPlaying && !fromStart) return;
    isPlaying = true;
    clearTimer();
    const startIndex = fromStart ? 0 : currentIndex;
    setActiveScene(startIndex);
    timerId = setTimeout(advance, DURATIONS[startIndex]);
  }

  function pause() {
    isPlaying = false;
    clearTimer();
  }

  function replay() {
    play(true);
  }

  // Static, accessible starting frame before any playback.
  setActiveScene(0);

  dots.forEach((dot, i) => {
    dot.addEventListener('click', () => {
      pause();
      setActiveScene(i);
    });
  });

  if (replayBtn) {
    replayBtn.addEventListener('click', replay);
  }

  if (prefersReducedMotion) {
    // Static fallback: show the most illustrative frame (AI draft review)
    // and let the visitor step through manually via dots / Replay.
    setActiveScene(3);
    if (fallbackNote) fallbackNote.hidden = false;
  } else if (demoContainer && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          inViewport = entry.isIntersecting;
          if (inViewport) {
            play();
          } else {
            pause();
          }
        });
      },
      { threshold: 0.45 }
    );
    observer.observe(demoContainer);
  } else {
    play(true);
  }
}

// --- Section background transitions: smooth on scroll (progressive) --------
// Backgrounds already cross-fade via CSS transition on `.swap-section`;
// no JS needed beyond triggering a reflow-safe class on first paint.
