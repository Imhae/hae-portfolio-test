import './swapifly.css';
import { animate, scroll, stagger, inView } from 'motion';
import { initReveal } from './lib/reveal.js';
import listingPhoto1 from './assets/images/swapifly/listing-photo-1.jpg';
import listingPhoto2 from './assets/images/swapifly/listing-photo-2.jpg';
import listingPhoto3 from './assets/images/swapifly/listing-photo-3.jpg';
import removePhotoBgIcon from './assets/icons/swapifly/remove-photo-bg.svg';
import removePhotoXIcon from './assets/icons/swapifly/remove-photo-x.svg';

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

  // Hero mockups: desktop drifts up slowly, mobile drifts up faster for depth.
  const desktopMock = document.querySelector('[data-parallax-desktop]');
  const mobileMock = document.querySelector('[data-parallax-mobile]');
  const isSmallScreen = window.matchMedia('(max-width: 640px)').matches;

  if (heroSection && desktopMock) {
    const distance = isSmallScreen ? 18 : 40;
    scroll(animate(desktopMock, { transform: ['translateY(0px)', `translateY(-${distance}px)`] }), {
      target: heroSection,
      offset: ['start start', 'end start'],
    });
  }

  if (heroSection && mobileMock) {
    const distance = isSmallScreen ? 32 : 70;
    scroll(animate(mobileMock, { transform: ['translateY(0px)', `translateY(-${distance}px)`] }), {
      target: heroSection,
      offset: ['start start', 'end start'],
    });
  }
}

// --- Offer/chat mockups: keep both phone frames the same size --------------
// Buyer and seller share the same header/listing/footer chrome but the
// seller thread has one extra block (the offer card), so its natural
// content height is taller. Rather than guess a fixed size that could clip
// at some width, measure both at their current (auto) height and set both
// to the taller one — always exact, never distorted, never cut off.
const chatPhones = document.querySelectorAll('.swap-chat-panel .swap-phone');
if (chatPhones.length === 2) {
  const syncChatPhoneHeights = () => {
    chatPhones.forEach((el) => (el.style.height = ''));
    const tallest = Math.max(...Array.from(chatPhones, (el) => el.getBoundingClientRect().height));
    chatPhones.forEach((el) => (el.style.height = `${tallest}px`));
  };

  syncChatPhoneHeights();
  window.addEventListener('resize', syncChatPhoneHeights);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncChatPhoneHeights);
  }
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
// Desktop/tablet (>768px): nodes carry a `data-loop-step` index (0–6) that
// drives both the CSS transition-delay (via the --loop-step custom property)
// and the left-to-right reveal order: seller/buyer labels -> list/browse
// cards -> curved connectors -> core -> offer (+ connector) -> negotiate
// (+ connector) -> close & rate (+ connector). All nodes cascade in together
// once the diagram enters the viewport. Connector lines use a dashed stroke
// with a continuous CSS animation (conveyor-belt effect), independent of
// this entrance reveal.
//
// Mobile (<=768px): the rebuilt vertical journey (.swap-loop__mobile) reveals
// top-to-bottom as the user scrolls instead — each `[data-loop-m-node]` is
// observed independently and gets `.is-in` only once it individually enters
// the viewport, so lower cards/connectors stay hidden until scrolled to
// rather than all animating in at once.
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

  const mobileLoopNodes = loopDiagram.querySelectorAll('[data-loop-m-node]');
  if (mobileLoopNodes.length) {
    if (prefersReducedMotion) {
      mobileLoopNodes.forEach((el) => el.classList.add('is-in'));
    } else if ('IntersectionObserver' in window) {
      const mobileLoopObserver = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-in');
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3, rootMargin: '0px 0px -10% 0px' }
      );
      mobileLoopNodes.forEach((el) => mobileLoopObserver.observe(el));
    } else {
      mobileLoopNodes.forEach((el) => el.classList.add('is-in'));
    }
  }
}

// ---------------------------------------------------------------------------
// Interactive "AI-assisted listing flow" demo
//
// A real click-driven state machine, not an auto-playing recreation of
// Figma's motion prototype: upload -> photos-added -> (AI analyzing, auto)
// -> draft -> preview -> published. Every state change other than the
// analysis step requires an actual click on a real, focusable button.
//
// Scenes are the 5 full-screen `.swap-scene` panels (upload, photos-added,
// draft, preview, published) toggled via `.is-active`, indexed by their
// position in the DOM. "Analyzing" is not a 6th scene — per Figma (node
// 333:607, "AI analyzing overlay") it's a dimmed backdrop + centered modal
// shown on top of the still-active photos-added screen, toggled separately
// via `.swap-analyzing-overlay.is-open`.
// ---------------------------------------------------------------------------
const demoRoot = document.getElementById('swap-demo-phone');

if (demoRoot) {
  const scenes = Array.from(demoRoot.querySelectorAll('.swap-scene'));
  const STATE = { UPLOAD: 0, PHOTOS_ADDED: 1, DRAFT: 2, PREVIEW: 3, PUBLISHED: 4 };

  const chooseFilesBtn = document.getElementById('swap-choose-files-btn');
  const uploadCard = document.getElementById('swap-upload-card');
  const photoRow = document.getElementById('swap-photo-row');
  const photoCountHint = document.getElementById('swap-photo-count-hint');
  const nextBtn2 = document.getElementById('swap-next-btn-2');
  const previewBtn = document.getElementById('swap-preview-btn');
  const editBtn = document.getElementById('swap-edit-btn');
  const publishBtn = document.getElementById('swap-publish-btn');
  const analyzingOverlay = document.getElementById('swap-analyzing-overlay');
  const progressFill = demoRoot.querySelector('.swap-progress__fill');
  const toast = document.getElementById('swap-published-toast');
  const tapIndicator = document.getElementById('swap-tap-indicator');
  const liveRegion = document.getElementById('swap-demo-live-region');
  const replayBtn = document.getElementById('swap-demo-replay');
  const floatRestartBtn = document.getElementById('swap-float-restart');
  const fallbackNote = document.getElementById('swap-demo-fallback-note');

  // This is a simulated portfolio demo, not a real upload: "Choose files"
  // never opens the OS file picker. It always resolves to these three
  // predefined product photos (Figma node 396:12906) after a brief fake
  // loading state.
  const PREDEFINED_PHOTOS = [
    { url: listingPhoto1, alt: 'Beats Solo 3 Wireless headphones, set as cover' },
    { url: listingPhoto2, alt: 'Beats Solo 3 Wireless headphones, front angle' },
    { url: listingPhoto3, alt: 'Beats Solo 3 Wireless headphones, side angle' },
  ];

  let uploadedPhotos = []; // { url, alt }
  let transitioning = false;
  let toastTimers = [];
  let tapTarget = null;

  function goToScene(index) {
    scenes.forEach((scene, i) => scene.classList.toggle('is-active', i === index));
  }

  function announce(message) {
    if (!liveRegion) return;
    liveRegion.textContent = '';
    window.requestAnimationFrame(() => {
      liveRegion.textContent = message;
    });
  }

  // --- Tap indicator: single reusable pulsing cue, repositioned over
  // whichever button the flow expects next; pointer-events:none throughout. ---
  function positionTapIndicator(el) {
    if (!tapIndicator) return;
    const phoneRect = demoRoot.getBoundingClientRect();
    const targetRect = el.getBoundingClientRect();
    tapIndicator.style.left = `${targetRect.left - phoneRect.left + targetRect.width / 2}px`;
    tapIndicator.style.top = `${targetRect.top - phoneRect.top + targetRect.height / 2}px`;
  }

  function showTapIndicator(el) {
    if (!tapIndicator || !el) return;
    tapTarget = el;
    positionTapIndicator(el);
    tapIndicator.hidden = false;
  }

  function hideTapIndicator() {
    tapTarget = null;
    if (tapIndicator) tapIndicator.hidden = true;
  }

  window.addEventListener('resize', () => {
    if (tapTarget) positionTapIndicator(tapTarget);
  });

  // --- Simulated photo grid (predefined images, not a real upload) ----------
  function renderUploadedPhotos() {
    if (!photoRow) return;
    photoRow.innerHTML = '';

    uploadedPhotos.forEach((item, i) => {
      const cell = document.createElement('div');
      cell.className = i === 0 ? 'swap-photo swap-photo--cover' : 'swap-photo';

      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.alt;
      cell.appendChild(img);

      if (i === 0) {
        const badge = document.createElement('span');
        badge.className = 'swap-photo__badge';
        badge.textContent = 'Cover';
        cell.appendChild(badge);
      }

      const removeBg = document.createElement('img');
      removeBg.src = removePhotoBgIcon;
      removeBg.alt = '';
      removeBg.width = 20;
      removeBg.height = 20;
      removeBg.className = 'swap-photo__remove-bg';
      cell.appendChild(removeBg);

      const removeX = document.createElement('img');
      removeX.src = removePhotoXIcon;
      removeX.alt = '';
      removeX.width = 10;
      removeX.height = 10;
      removeX.className = 'swap-photo__remove-x';
      cell.appendChild(removeX);

      photoRow.appendChild(cell);
    });

    if (photoCountHint) {
      const count = uploadedPhotos.length;
      photoCountHint.textContent = `${count} photo${count === 1 ? '' : 's'} added`;
    }
  }

  let uploadLoadingTimer = null;

  if (chooseFilesBtn && uploadCard) {
    chooseFilesBtn.addEventListener('click', () => {
      if (chooseFilesBtn.disabled) return; // already loading

      hideTapIndicator();
      chooseFilesBtn.disabled = true;
      uploadCard.classList.add('is-loading');

      const loadingMs = prefersReducedMotion ? 200 : 1000; // ~800-1200ms
      uploadLoadingTimer = setTimeout(() => {
        uploadLoadingTimer = null;
        uploadedPhotos = PREDEFINED_PHOTOS.slice();
        renderUploadedPhotos();

        uploadCard.classList.remove('is-loading');
        chooseFilesBtn.disabled = false; // reset in case the flow is replayed

        goToScene(STATE.PHOTOS_ADDED);
        if (nextBtn2) showTapIndicator(nextBtn2);
      }, loadingMs);
    });
  }

  // --- Next (photos-added -> AI analyzing -> draft) --------------------------
  function runAnalysis() {
    if (progressFill) {
      // Force the fill's animation to restart from 0 on every run (Replay).
      progressFill.style.animation = 'none';
      void progressFill.offsetWidth; // reflow
      progressFill.style.removeProperty('animation');
    }
    if (analyzingOverlay) {
      analyzingOverlay.classList.add('is-open');
      analyzingOverlay.setAttribute('aria-hidden', 'false');
    }

    const analysisMs = prefersReducedMotion ? 150 : 2000;
    setTimeout(() => {
      if (analyzingOverlay) {
        analyzingOverlay.classList.remove('is-open');
        analyzingOverlay.setAttribute('aria-hidden', 'true');
      }
      goToScene(STATE.DRAFT);
      announce('Your draft is ready. Review the fields below.');
      transitioning = false;

      const itemCount = demoRoot.querySelectorAll('.swap-scene[data-scene="4"] .swap-review-item').length;
      const staggerEndMs = prefersReducedMotion ? 0 : 40 + itemCount * 40 + 400;
      setTimeout(() => {
        if (previewBtn) showTapIndicator(previewBtn);
      }, staggerEndMs);
    }, analysisMs);
  }

  if (nextBtn2) {
    nextBtn2.addEventListener('click', () => {
      if (transitioning) return;
      transitioning = true;
      hideTapIndicator();
      runAnalysis();
    });
  }

  // --- Preview (draft -> preview) --------------------------------------------
  if (previewBtn) {
    previewBtn.addEventListener('click', () => {
      if (transitioning) return;
      hideTapIndicator();
      goToScene(STATE.PREVIEW);
      if (publishBtn) showTapIndicator(publishBtn);
    });
  }

  // --- Edit (preview -> draft, back to review) --------------------------------
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      if (transitioning) return;
      hideTapIndicator();
      goToScene(STATE.DRAFT);
      if (previewBtn) showTapIndicator(previewBtn);
    });
  }

  // --- Publish (preview -> published, success toast) --------------------------
  function showToast() {
    if (!toast) return;
    toastTimers.forEach((id) => clearTimeout(id));
    toastTimers = [];
    toast.classList.remove('is-leaving');
    toast.classList.add('is-visible');
    announce('Your listing is live! Buyers can now discover and contact you.');

    toastTimers.push(
      setTimeout(() => {
        toast.classList.add('is-leaving');
        toast.classList.remove('is-visible');
        toastTimers.push(setTimeout(() => toast.classList.remove('is-leaving'), 400));
      }, 3000)
    );
  }

  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      if (transitioning) return;
      transitioning = true; // held for the scene crossfade so a rapid double-click can't re-fire
      hideTapIndicator();
      goToScene(STATE.PUBLISHED);
      showToast();
      setTimeout(() => {
        transitioning = false;
      }, 500);
    });
  }

  // --- Replay: reset the flow back to the start -------------------------------
  function resetFlow() {
    uploadedPhotos = [];
    if (photoRow) photoRow.innerHTML = '';
    toastTimers.forEach((id) => clearTimeout(id));
    toastTimers = [];
    if (toast) toast.classList.remove('is-visible', 'is-leaving');
    if (analyzingOverlay) {
      analyzingOverlay.classList.remove('is-open');
      analyzingOverlay.setAttribute('aria-hidden', 'true');
    }
    if (uploadLoadingTimer) {
      clearTimeout(uploadLoadingTimer);
      uploadLoadingTimer = null;
    }
    if (uploadCard) uploadCard.classList.remove('is-loading');
    if (chooseFilesBtn) chooseFilesBtn.disabled = false;
    transitioning = false;
    goToScene(STATE.UPLOAD);
    if (chooseFilesBtn) showTapIndicator(chooseFilesBtn);
  }

  if (replayBtn) {
    replayBtn.addEventListener('click', resetFlow);
  }

  // Floating restart: same reset, but only shown while the demo phone is
  // actually on screen so it doesn't linger as clutter over the rest of
  // the case study.
  if (floatRestartBtn) {
    floatRestartBtn.addEventListener('click', resetFlow);
    inView(
      demoRoot,
      () => {
        floatRestartBtn.classList.add('is-visible');
        return () => floatRestartBtn.classList.remove('is-visible');
      },
      { amount: 0.15 }
    );
  }

  if (prefersReducedMotion && fallbackNote) {
    fallbackNote.hidden = false;
  }

  // Static, accessible starting frame — the flow only ever advances on a
  // real click (analysis excepted), so there's nothing to pause/resume
  // based on viewport visibility.
  goToScene(STATE.UPLOAD);
  if (chooseFilesBtn) showTapIndicator(chooseFilesBtn);
}

// ---------------------------------------------------------------------------
// Core Flow 01 timeline: staggered scroll-reveal
//
// Reveals the four numbered steps sequentially (01 -> 04) instead of all at
// once, triggering once when ~28% of the timeline is visible. Each step's
// marker + connector-into-it + icon tile + title + description animate
// together as one group — connectors are separate DOM siblings (they sit
// between two markers), so connector[i] is grouped with step[i + 1] rather
// than animated on its own.
// ---------------------------------------------------------------------------
const listingTimeline = document.querySelector('.swap-demo__timeline');

if (listingTimeline) {
  const steps = Array.from(listingTimeline.querySelectorAll('.swap-demo__step'));
  const connectors = Array.from(listingTimeline.querySelectorAll('.swap-demo__connector'));
  const groups = steps.map((step, i) => (i === 0 ? [step] : [connectors[i - 1], step]));

  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    groups.flat().forEach((el) => {
      el.style.opacity = 0;
    });

    const timelineObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          groups.forEach((group, i) => {
            animate(
              group,
              { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0px)'] },
              { duration: 0.55, delay: i * 0.19, ease: [0.16, 1, 0.3, 1] }
            );
          });
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.28 }
    );
    timelineObserver.observe(listingTimeline);
  }
}

// --- Section background transitions: smooth on scroll (progressive) --------
// Backgrounds already cross-fade via CSS transition on `.swap-section`;
// no JS needed beyond triggering a reflow-safe class on first paint.
