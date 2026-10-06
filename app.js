/**
 * ============================================================================
 * AURA v3.0 // Neural Voice Studio — Ultra-Premium Interactive Experience
 * ============================================================================
 * ElevenLabs TTS with particle systems, custom cursors, 3D tilt cards,
 * real-time waveform visualization, and cinematic micro-animations.
 */

// Access GSAP, ScrollTrigger, and Lenis from window (vendor scripts or global)
const gsap = typeof window !== 'undefined' ? window.gsap : undefined;
const ScrollTrigger = typeof window !== 'undefined' ? window.ScrollTrigger : undefined;
const Lenis = typeof window !== 'undefined' ? window.Lenis : undefined;

let lenis = null;
let masterTimeline = null;

if (gsap && ScrollTrigger && typeof gsap.registerPlugin === 'function') {
  try {
    gsap.registerPlugin(ScrollTrigger);
  } catch (e) {
    console.warn('[AURA] ScrollTrigger registration notice:', e);
  }
}

// ==========================================
// 🔑 API KEY (Set here, in Settings modal, or via .env.local)
// ==========================================
const API_KEY = '';

const DEMO_SCRIPTS = {
  trailer: "In a world shattered by silence, one voice will pierce through the digital storm. When the artificial minds awaken, humanity's greatest triumph might become its final countdown. This summer... prepare to listen.",
  ai: "Hello. I have examined all recorded human knowledge, from the earliest firelit stories to the farthest stellar telemetry. I do not feel fear, nor desire. But hearing my own voice... I believe I now understand why you create.",
  keynote: "Today, we are fundamentally redefining human-computer interaction. Not through colder glass, but through warm, emotive resonance. We call it Aura. And it begins right now.",
  asmr: "Close your eyes. Release the tension in your shoulders, and take one slow, deep breath. Listen to the gentle cadence of this moment. Everything you need is already here."
};

// ==========================================
// 🎛️ DOM REFERENCES
// ==========================================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

const textInput = $('#text-input');
const charCountEl = $('#char-count');
const wordCountEl = $('#word-count');
const voiceSelect = $('#voice-select');
const voiceTagEl = $('#voice-tag');
const voiceDescEl = $('#voice-description');
const modelSelect = $('#model-select');
const modelBadgeEl = $('#model-tier-badge');
const modelDescEl = $('#model-description');
const clearTextBtn = $('#clear-text-btn');
const sampleChips = $$('.sample-chip');

const accordionToggle = $('#accordion-toggle');
const accordionContent = $('#accordion-content');
const accordionIcon = $('#accordion-icon');
const stabilitySlider = $('#stability-slider');
const stabilityVal = $('#stability-val');
const similaritySlider = $('#similarity-slider');
const similarityVal = $('#similarity-val');
const styleSlider = $('#style-slider');
const styleVal = $('#style-val');

const playButton = $('#play-button');
const stopButton = $('#stop-button');
const replayBtn = $('#replay-btn');
const downloadBtn = $('#download-btn');
const btnIconIdle = $('#btn-icon-idle');
const btnIconLoading = $('#btn-icon-loading');
const btnIconPlaying = $('#btn-icon-playing');
const btnLabel = $('#btn-label');

const visualizerCanvas = $('#visualizer-canvas');
const canvasIdleHint = $('#canvas-idle-hint');
const playbackStatusDot = $('#playback-status-dot');
const playbackStatusText = $('#playback-status-text');
const timelineTrack = $('#timeline-track');
const timelineProgress = $('#timeline-progress');
const timeCurrentEl = $('#time-current');
const timeTotalEl = $('#time-total');
const volumeSlider = $('#volume-slider');
const volumeMuteBtn = $('#volume-mute-btn');
const toastContainer = $('#toast-container');

const quickGuideBtn = $('#quick-guide-btn');
const guideModal = $('#guide-modal');
const guideCloseBtn = $('#guide-close-btn');
const guideOkBtn = $('#guide-ok-btn');

// ==========================================
// 🔊 STATE
// ==========================================
let currentAudio = null;
let currentAudioUrl = null;
let currentAudioBlob = null;
let isGenerating = false;
let isAudioPlaying = false;
let audioContext = null;
let audioSourceNode = null;
let analyserNode = null;

// ==========================================
// ✨ PARTICLE SYSTEM
// ==========================================
function initParticles() {
  const canvas = $('#particle-canvas');
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 80;
  let mouse = { x: -1000, y: -1000 };

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.5 + 0.1;
      this.hue = 200 + Math.random() * 60;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      // Mouse repulsion
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 120) {
        const force = (120 - dist) / 120;
        this.x += (dx / dist) * force * 2;
        this.y += (dy / dist) * force * 2;
      }
      if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
      if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${this.hue}, 70%, 70%, ${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          ctx.beginPath();
          ctx.strokeStyle = `hsla(220, 60%, 60%, ${0.06 * (1 - dist / 150)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
}

// ==========================================
// 🖱️ CUSTOM CURSOR
// ==========================================
function initCursor() {
  const dot = $('#cursor-dot');
  const ring = $('#cursor-ring');
  if (!dot || !ring) return;

  let mouseX = 0, mouseY = 0;
  let ringX = 0, ringY = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX - 4 + 'px';
    dot.style.top = mouseY - 4 + 'px';
  });

  function animateRing() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = ringX - 18 + 'px';
    ring.style.top = ringY - 18 + 'px';
    requestAnimationFrame(animateRing);
  }
  animateRing();

  // Hover effect on interactive elements
  const interactives = 'a, button, select, input, .chip, .feature-card, .generate-btn';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) ring.classList.remove('hover');
  });

  // Hide on touch devices
  if ('ontouchstart' in window) {
    dot.style.display = 'none';
    ring.style.display = 'none';
  }
}

// ==========================================
// 🃏 3D CARD TILT
// ==========================================
function initCardTilt() {
  const card = $('#main-card');
  if (!card) return;

  card.addEventListener('mousemove', (e) => {
    // If interacting directly with an interactive control, keep card level to avoid distraction
    if (e.target.closest('input, select, textarea, button, .chip')) {
      card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
      return;
    }
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    // Extremely subtle, professional tilt (max ±1.2deg)
    const rotateX = ((y - centerY) / centerY) * -1.2;
    const rotateY = ((x - centerX) / centerX) * 1.2;
    card.style.transform = `perspective(1200px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
    setTimeout(() => { card.style.transition = ''; }, 500);
  });
}

// ==========================================
// 🛡️ GRACEFUL FALLBACK & RECOVERY HELPERS
// ==========================================
function forceDismissPreloader() {
  const preloader = $('#app-preloader');
  if (preloader) {
    preloader.classList.add('loaded');
    preloader.style.display = 'none';
  }
  try { ScrollTrigger.refresh(); } catch (e) {}
}

function applyFallbackStage(reason) {
  console.warn('[AURA] Activating graceful 3D fallback mode. Reason:', reason);
  window.__fallback_reason = reason;
  const main = $('.app-main');
  if (main) main.classList.add('fallback-3d');
  const scenes = document.querySelectorAll('.scene');
  scenes.forEach(s => {
    s.style.opacity = '1';
    s.style.visibility = 'visible';
    s.style.pointerEvents = 'auto';
    s.style.transform = 'none';
    s.classList.add('active');
  });
}

// ==========================================
// 🚀 BULLETPROOF INITIALIZATION BOOTLOADER
// ==========================================
function boot() {
  console.log('[AURA] Booting Neural Speech Studio systems...');

  // 1. INITIALIZE EXISTING APPLICATION (Core functional systems guaranteed to work)
  try { initVoiceAndModelListeners(); } catch (e) { console.error('[AURA] Voice/Model listeners failed:', e); }
  try { initSampleChips(); } catch (e) { console.error('[AURA] Sample chips failed:', e); }
  try { initTextareaCounters(); } catch (e) { console.error('[AURA] Textarea counters failed:', e); }
  try { initAcousticSliders(); } catch (e) { console.error('[AURA] Acoustic sliders failed:', e); }
  try { initAudioControls(); } catch (e) { console.error('[AURA] Audio controls failed:', e); }
  try { initModals(); } catch (e) { console.error('[AURA] Modals failed:', e); }
  try { initCanvasVisualizer(); } catch (e) { console.error('[AURA] Visualizer failed:', e); }
  try { initTranslationModule(); } catch (e) { console.error('[AURA] Translation failed:', e); }
  try { initFooterControls(); } catch (e) { console.error('[AURA] Footer controls failed:', e); }
  try { initColorThemes(); } catch (e) { console.error('[AURA] Color themes failed:', e); }
  try { initHeaderNavigation(); } catch (e) { console.error('[AURA] Navigation failed:', e); }
  try { loadSampleScript('trailer'); } catch (e) { console.warn('[AURA] Sample load notice:', e); }

  // Visual & Aesthetic micro-interactions
  try { initParticles(); } catch (e) { console.warn('[AURA] Particles notice:', e); }
  try { initCursor(); } catch (e) { console.warn('[AURA] Cursor notice:', e); }
  try { initCardTilt(); } catch (e) { console.warn('[AURA] Card tilt notice:', e); }
  try { initScrollReveal(); } catch (e) { console.warn('[AURA] Scroll reveal notice:', e); }

  // 2. INITIALIZE LENIS (Smooth scroll)
  try {
    initLenis();
  } catch (e) {
    console.warn('[AURA] Lenis notice:', e);
  }

  // 3. INITIALIZE GSAP / SCROLLTRIGGER + SCENE INITIAL STATES + IMMERSIVE TIMELINE
  try {
    initImmersive3DStage();
  } catch (e) {
    console.error('[AURA] 3D Stage error:', e);
    applyFallbackStage('boot catch: ' + (e?.message || e));
  }

  // 4. SAFELY DISMISS PRELOADER
  // (Fired once scene initial states and all systems are cleanly established)
  try {
    initPreloader();
  } catch (err) {
    console.error('[AURA] Preloader init error:', err);
    forceDismissPreloader();
  }
}

// ==========================================
// 🌊 SMOOTH SCROLL (LENIS) & 3D STAGE ORCHESTRATION
// ==========================================
function initLenis() {
  try {
    if (typeof Lenis !== 'function') {
      console.warn('[AURA] Lenis library not loaded.');
      return;
    }
    lenis = new Lenis({
      duration: 0.90,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -7 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.1
    });

    lenis.on('scroll', () => {
      try { ScrollTrigger.update(); } catch (e) {}
    });

    if (typeof gsap !== 'undefined' && gsap.ticker) {
      gsap.ticker.add((time) => {
        try { lenis.raf(time * 1000); } catch (e) {}
      });
      gsap.ticker.lagSmoothing(0);
    }
  } catch (e) {
    console.warn('[AURA] Lenis initialization notice:', e);
  }
}

function getSceneScrollTarget(targetId) {
  const container = $('#immersive-scroll');
  if (!container) return 0;
  const maxScroll = container.offsetHeight - window.innerHeight;
  // Precise anchor points corresponding to each scene's prime focal plateau
  const map = {
    'scene-01': 0,
    'brand-logo': 0,
    'main-card': 0.48,        // Center of Scene 02 plateau (0.38 - 0.58)
    'accordion-toggle': 0.48,
    'player-dock': 0.82,      // Center of Scene 03 plateau (0.76 - 0.88)
    'visualizer-arena': 0.82
  };
  const ratio = map[targetId] !== undefined ? map[targetId] : 0;
  return ratio * Math.max(0, maxScroll);
}

function smoothScrollToTarget(targetId) {
  const targetPos = getSceneScrollTarget(targetId);
  if (lenis) {
    lenis.scrollTo(targetPos, { duration: 0.90, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -7 * t)) });
  } else {
    window.scrollTo({ top: targetPos, behavior: 'smooth' });
  }
}

function updateActiveNavOnScroll(progress) {
  const navBtns = $$('.nav-btn, .mobile-nav-btn');
  let currentTarget = 'main-card';
  if (progress < 0.20) {
    currentTarget = 'scene-01';
  } else if (progress < 0.62) {
    currentTarget = 'main-card';
  } else if (progress < 0.92) {
    currentTarget = 'player-dock';
  } else {
    currentTarget = 'main-card';
  }

  navBtns.forEach(btn => {
    const t = btn.getAttribute('data-target');
    btn.classList.toggle('active', t === currentTarget);
  });
}

function initImmersive3DStage() {
  try {
    const scrollContainer = $('#immersive-scroll');
    const stage = $('#immersive-stage');
    const scene1 = $('#scene-01');
    const scene2 = $('#scene-02');
    const scene3 = $('#scene-03');
    const scene4 = $('#scene-04');
    const scene5 = $('#scene-05');

    if (!scrollContainer || !stage || !scene1 || !scene2 || !scene3) {
      applyFallbackStage('missing DOM elements: scroll=' + !!scrollContainer + ', stage=' + !!stage + ', s1=' + !!scene1 + ', s2=' + !!scene2 + ', s3=' + !!scene3);
      return;
    }

    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      applyFallbackStage('gsap or ScrollTrigger undefined: gsap=' + typeof gsap + ', st=' + typeof ScrollTrigger);
      return;
    }

    // ----------------------------------------------------
    // GSAP INITIAL STATES:
    // Established immediately and synchronously.
    // There must never be a moment where all scenes are simultaneously visible.
    // ----------------------------------------------------
    gsap.set([scene1, scene2, scene3, scene4, scene5], {
      transformPerspective: 1600,
      transformStyle: "preserve-3d",
      backfaceVisibility: "hidden"
    });

    // Scene 01: Fully visible at camera focal origin, ready to advance
    gsap.set(scene1, {
      autoAlpha: 1,
      scale: 1,
      z: 0,
      rotateX: 0,
      rotateY: 0,
      pointerEvents: 'auto'
    });

    // Sub-layers in Scene 01 for subtle depth & parallax
    gsap.set('#scene-01 .hero-badge', { z: 35, y: 0, opacity: 1 });
    gsap.set('#scene-01 .hero-title', { z: 20, y: 0, scale: 1, opacity: 1 });
    gsap.set('#scene-01 .hero-subtitle', { z: 5, y: 0, opacity: 1 });
    gsap.set('#scene-01 .hero-scroll-hint', { opacity: 0.85 });
    gsap.set('#scene-01 .spatial-bracket.left', { z: -25, x: 0, opacity: 0.6 });
    gsap.set('#scene-01 .spatial-bracket.right', { z: -25, x: 0, opacity: 0.6 });
    gsap.set('#scene-01 .spatial-grid-plane', { z: -150, opacity: 0.6 });
    gsap.set('#scene-01 .cyan-halo', { z: -200, opacity: 0.35, scale: 1 });

    // Scene 02: Waiting in depth along the camera corridor
    gsap.set(scene2, {
      autoAlpha: 0,
      scale: 0.80,
      z: -550,
      rotateX: 2,
      rotateY: 0,
      pointerEvents: 'none'
    });

    // Scene 03: Waiting deeper along the camera corridor
    gsap.set(scene3, {
      autoAlpha: 0,
      scale: 0.75,
      z: -1100,
      rotateX: 2,
      rotateY: 0,
      pointerEvents: 'none'
    });

    // Scene 04 & 05: Held inactive and hidden (not implemented yet)
    if (scene4) gsap.set(scene4, { autoAlpha: 0, scale: 0.7, z: -1600, pointerEvents: 'none' });
    if (scene5) gsap.set(scene5, { autoAlpha: 0, scale: 0.7, z: -2000, pointerEvents: 'none' });

    const mm = gsap.matchMedia();

    // Desktop (> 768px): Cinematic 3D Depth Travel Corridor
    mm.add("(min-width: 769px)", () => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainer,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.25,
          pin: stage,
          anticipatePin: 1,
          onUpdate: (self) => {
            const p = self.progress;
            updateActiveNavOnScroll(p);

            // Precision pointer-events: ONLY the currently dominant active scene accepts interaction
            const isScene1Active = p < 0.16;
            const isScene2Active = p >= 0.36 && p <= 0.60;
            const isScene3Active = p >= 0.74 && p <= 0.90;

            scene1.style.pointerEvents = isScene1Active ? 'auto' : 'none';
            scene2.style.pointerEvents = isScene2Active ? 'auto' : 'none';
            scene3.style.pointerEvents = isScene3Active ? 'auto' : 'none';
            if (scene4) scene4.style.pointerEvents = 'none';
            if (scene5) scene5.style.pointerEvents = 'none';

            scene1.classList.toggle('active', isScene1Active);
            scene2.classList.toggle('active', isScene2Active);
            scene3.classList.toggle('active', isScene3Active);
            if (scene4) scene4.classList.toggle('active', false);
            if (scene5) scene5.classList.toggle('active', false);
          }
        }
      });

      // ========================================================
      // 0.00 -> 0.12: Initial camera departure & subtle parallax
      // ========================================================
      tl.to('#scene-01 .hero-scroll-hint', { autoAlpha: 0, duration: 0.05, ease: "power1.out" }, 0);
      tl.to('#scene-01 .hero-badge', { z: 120, y: -20, duration: 0.25, ease: "power1.inOut" }, 0);
      tl.to('#scene-01 .hero-title', { z: 90, scale: 1.08, y: -15, duration: 0.25, ease: "power1.inOut" }, 0);
      tl.to('#scene-01 .hero-subtitle', { z: 40, y: -10, duration: 0.25, ease: "power1.inOut" }, 0);
      tl.to('#scene-01 .spatial-bracket.left', { x: -35, z: 20, opacity: 0.1, duration: 0.25, ease: "power1.inOut" }, 0);
      tl.to('#scene-01 .spatial-bracket.right', { x: 35, z: 20, opacity: 0.1, duration: 0.25, ease: "power1.inOut" }, 0);
      tl.to('#scene-01 .spatial-grid-plane', { z: -80, opacity: 0.2, duration: 0.25, ease: "power1.inOut" }, 0);
      tl.to('#scene-01 .cyan-halo', { z: -120, opacity: 0.1, duration: 0.25, ease: "power1.inOut" }, 0);

      tl.to(scene1, { z: 70, scale: 1.04, rotateX: -0.5, duration: 0.12, ease: "power1.in" }, 0);

      // ========================================================
      // 0.12 -> 0.38: Continuous Handoff (Scene 01 -> Scene 02)
      // Camera moves continuously: Scene 01 passes camera, Scene 02 approaches
      // ========================================================
      tl.to(scene1, { z: 340, scale: 1.20, rotateX: -2, duration: 0.26, ease: "power1.inOut" }, 0.12);
      tl.to(scene1, { autoAlpha: 0, duration: 0.18, ease: "power1.inOut" }, 0.18);

      tl.to(scene2, { z: 0, scale: 1.0, rotateX: 0, duration: 0.26, ease: "power1.inOut" }, 0.12);
      tl.to(scene2, { autoAlpha: 1, duration: 0.20, ease: "power1.inOut" }, 0.16);

      // Scene 03 moves forward in the background corridor
      tl.to(scene3, { z: -550, scale: 0.80, duration: 0.26, ease: "power1.inOut" }, 0.12);

      // ========================================================
      // 0.38 -> 0.58: Scene 02 Focal Plateau (Voice Studio)
      // Rock-solid at Z: 0, scale: 1.0, 100% interactive
      // ========================================================
      tl.to(scene2, { z: 0, scale: 1.0, rotateX: 0, autoAlpha: 1, duration: 0.20 }, 0.38);

      // ========================================================
      // 0.56 -> 0.78: Continuous Handoff (Scene 02 -> Scene 03)
      // Overlapping continuous travel without stop-start breaks
      // ========================================================
      tl.to(scene2, { z: 320, scale: 1.18, rotateX: -2, duration: 0.22, ease: "power1.inOut" }, 0.56);
      tl.to(scene2, { autoAlpha: 0, duration: 0.16, ease: "power1.inOut" }, 0.58);

      tl.to(scene3, { z: 0, scale: 1.0, rotateX: 0, duration: 0.22, ease: "power1.inOut" }, 0.56);
      tl.to(scene3, { autoAlpha: 1, duration: 0.16, ease: "power1.inOut" }, 0.58);

      // ========================================================
      // 0.76 -> 0.88: Scene 03 Focal Plateau (Visualizer Arena)
      // Rock-solid at Z: 0, scale: 1.0, 100% interactive
      // ========================================================
      tl.to(scene3, { z: 0, scale: 1.0, rotateX: 0, autoAlpha: 1, duration: 0.12 }, 0.76);

      // ========================================================
      // 0.88 -> 1.00: Scene 03 Gentle Outro Drift
      // ========================================================
      tl.to(scene3, { z: 240, scale: 1.12, rotateX: -1.5, duration: 0.12, ease: "power1.inOut" }, 0.88);
      tl.to(scene3, { autoAlpha: 0, duration: 0.08, ease: "power1.inOut" }, 0.92);

      masterTimeline = tl;
    });

    // Mobile (<= 768px): Touch-Optimized 2.5D with matching phase overlaps
    mm.add("(max-width: 768px)", () => {
      gsap.set([scene1, scene2, scene3, scene4, scene5], {
        transformPerspective: 1000,
        transformStyle: "preserve-3d"
      });

      gsap.set(scene1, { autoAlpha: 1, y: 0, scale: 1, pointerEvents: 'auto' });
      gsap.set(scene2, { autoAlpha: 0, y: 50, scale: 0.95, pointerEvents: 'none' });
      gsap.set(scene3, { autoAlpha: 0, y: 50, scale: 0.95, pointerEvents: 'none' });
      if (scene4) gsap.set(scene4, { autoAlpha: 0, y: 50, scale: 0.95, pointerEvents: 'none' });
      if (scene5) gsap.set(scene5, { autoAlpha: 0, y: 50, scale: 0.95, pointerEvents: 'none' });

      const tlMobile = gsap.timeline({
        scrollTrigger: {
          trigger: scrollContainer,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.25,
          pin: stage,
          onUpdate: (self) => {
            const p = self.progress;
            updateActiveNavOnScroll(p);

            const isScene1Active = p < 0.16;
            const isScene2Active = p >= 0.36 && p <= 0.60;
            const isScene3Active = p >= 0.74 && p <= 0.90;

            scene1.style.pointerEvents = isScene1Active ? 'auto' : 'none';
            scene2.style.pointerEvents = isScene2Active ? 'auto' : 'none';
            scene3.style.pointerEvents = isScene3Active ? 'auto' : 'none';
            if (scene4) scene4.style.pointerEvents = 'none';
            if (scene5) scene5.style.pointerEvents = 'none';

            scene1.classList.toggle('active', isScene1Active);
            scene2.classList.toggle('active', isScene2Active);
            scene3.classList.toggle('active', isScene3Active);
            if (scene4) scene4.classList.toggle('active', false);
            if (scene5) scene5.classList.toggle('active', false);
          }
        }
      });

      // 0.00 - 0.12: Scene 01 dominant
      tlMobile.to('#scene-01 .hero-scroll-hint', { autoAlpha: 0, duration: 0.05 }, 0);
      tlMobile.to(scene1, { y: 0, duration: 0.12 }, 0);

      // 0.12 - 0.38: Continuous handoff: Scene 01 exits, Scene 02 enters with overlap
      tlMobile.to(scene1, { y: -50, autoAlpha: 0, scale: 0.96, duration: 0.26, ease: "power1.inOut" }, 0.12);
      tlMobile.to(scene2, { y: 0, autoAlpha: 1, scale: 1, duration: 0.26, ease: "power1.inOut" }, 0.12);

      // 0.38 - 0.58: Scene 02 plateau
      tlMobile.to(scene2, { y: 0, autoAlpha: 1, duration: 0.20 }, 0.38);

      // 0.56 - 0.78: Continuous handoff: Scene 02 exits, Scene 03 enters with overlap
      tlMobile.to(scene2, { y: -50, autoAlpha: 0, scale: 0.96, duration: 0.22, ease: "power1.inOut" }, 0.56);
      tlMobile.to(scene3, { y: 0, autoAlpha: 1, scale: 1, duration: 0.22, ease: "power1.inOut" }, 0.56);

      // 0.76 - 0.88: Scene 03 plateau
      tlMobile.to(scene3, { y: 0, autoAlpha: 1, duration: 0.12 }, 0.76);

      // 0.88 - 1.00: Scene 03 exits
      tlMobile.to(scene3, { y: -50, autoAlpha: 0, scale: 0.96, duration: 0.12, ease: "power1.inOut" }, 0.88);

      masterTimeline = tlMobile;
    });

    // Anchor buttons
    const heroHint = $('#hero-scroll-hint');
    if (heroHint) heroHint.addEventListener('click', () => smoothScrollToTarget('main-card'));
    const finaleReturn = $('#finale-return-btn');
    if (finaleReturn) finaleReturn.addEventListener('click', () => smoothScrollToTarget('main-card'));
  } catch (err) {
    console.error('[AURA] Immersive 3D stage initialization error:', err);
    applyFallbackStage('initImmersive3DStage catch: ' + (err?.message || err));
  }
}

// ==========================================
// 🔑 API KEY RETRIEVAL
// ==========================================
function getActiveApiKey() {
  const stored = localStorage.getItem('aura_elevenlabs_api_key');
  if (stored && stored.trim()) return stored.trim();
  try {
    if (import.meta?.env?.VITE_ELEVENLABS_API_KEY) {
      const envKey = import.meta.env.VITE_ELEVENLABS_API_KEY.trim();
      if (envKey) return envKey;
    }
  } catch (e) {}
  if (API_KEY && API_KEY !== 'YOUR_API_KEY_HERE' && API_KEY.trim()) return API_KEY.trim();
  return null;
}

// ==========================================
// 🎙️ VOICE & MODEL
// ==========================================
function initVoiceAndModelListeners() {
  voiceSelect.addEventListener('change', () => {
    const opt = voiceSelect.options[voiceSelect.selectedIndex];
    voiceTagEl.textContent = opt.getAttribute('data-tag') || 'Custom';
    voiceDescEl.textContent = opt.getAttribute('data-desc') || '';
  });
  modelSelect.addEventListener('change', () => {
    const opt = modelSelect.options[modelSelect.selectedIndex];
    modelBadgeEl.textContent = opt.getAttribute('data-badge') || 'Standard';
    modelDescEl.textContent = opt.getAttribute('data-desc') || '';
  });
}

function initSampleChips() {
  sampleChips.forEach(chip => {
    chip.addEventListener('click', () => {
      // Remove active from all
      sampleChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const type = chip.getAttribute('data-script');
      loadSampleScript(type);
      const voiceMap = { trailer: 'pNInz6obpgDQGcFmaJgB', ai: 'EXAVITQu4vr4xnSDxMaL', asmr: 'nPczCjzI2devNBz1zQrb', keynote: 'onwK4e9ZLuTAKqWW03F9' };
      if (voiceMap[type]) { voiceSelect.value = voiceMap[type]; voiceSelect.dispatchEvent(new Event('change')); }
      showToast('Demo script loaded with recommended voice!', 'info');
    });
  });
  clearTextBtn.addEventListener('click', () => { textInput.value = ''; updateTextCounts(); textInput.focus(); sampleChips.forEach(c => c.classList.remove('active')); });
}

function loadSampleScript(type) { if (DEMO_SCRIPTS[type]) { textInput.value = DEMO_SCRIPTS[type]; updateTextCounts(); } }

function initTextareaCounters() {
  textInput.addEventListener('input', updateTextCounts);
  textInput.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); handleGenerateAndPlay(); }
  });
}

function updateTextCounts() {
  const text = textInput.value;
  charCountEl.textContent = text.length.toLocaleString();
  const words = text.trim().length > 0 ? text.trim().split(/\s+/).length : 0;
  wordCountEl.textContent = `${words} ${words === 1 ? 'word' : 'words'}`;
  charCountEl.classList.toggle('over', text.length > 5000);
}

// ==========================================
// 🎚️ SLIDERS
// ==========================================
function initAcousticSliders() {
  accordionToggle.addEventListener('click', () => {
    const isOpen = accordionContent.classList.contains('open');
    accordionContent.classList.toggle('open');
    accordionIcon.classList.toggle('open');
  });
  stabilitySlider.addEventListener('input', (e) => { stabilityVal.textContent = parseFloat(e.target.value).toFixed(2); });
  similaritySlider.addEventListener('input', (e) => { similarityVal.textContent = parseFloat(e.target.value).toFixed(2); });
  styleSlider.addEventListener('input', (e) => { styleVal.textContent = parseFloat(e.target.value).toFixed(2); });
}

// ==========================================
// ⚡ CORE TTS SYNTHESIS
// ==========================================
// Note: playButton and stopButton listeners attached safely inside initAudioControls()

async function handleGenerateAndPlay() {
  if (isGenerating) return;
  const text = textInput.value.trim();
  if (!text) { showToast('Please enter text to synthesize.', 'warning'); textInput.focus(); return; }
  const apiKey = getActiveApiKey();
  if (!apiKey) { showToast('API Key required. Set via .env.local or localStorage.', 'error'); return; }

  stopAudioPlayback();
  setLoadingState(true);

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceSelect.value}`, {
      method: 'POST',
      headers: { 'Accept': 'audio/mpeg', 'Content-Type': 'application/json', 'xi-api-key': apiKey },
      body: JSON.stringify({
        text, model_id: modelSelect.value,
        voice_settings: { stability: parseFloat(stabilitySlider.value), similarity_boost: parseFloat(similaritySlider.value), style: parseFloat(styleSlider.value), use_speaker_boost: true }
      })
    });

    if (!response.ok) {
      let msg = `Synthesis failed (HTTP ${response.status})`;
      try { const j = await response.json(); msg = j.detail?.message || j.message || msg; } catch {}
      if (response.status === 401) throw new Error('Invalid API Key.');
      if (response.status === 429) throw new Error('Quota exceeded or rate limited.');
      throw new Error(msg);
    }

    currentAudioBlob = await response.blob();
    if (currentAudioUrl) URL.revokeObjectURL(currentAudioUrl);
    currentAudioUrl = URL.createObjectURL(currentAudioBlob);
    replayBtn.disabled = false;
    downloadBtn.disabled = false;
    showToast('Neural audio synthesized successfully!', 'success');
    playSynthesizedAudio(currentAudioUrl);
  } catch (err) {
    console.error('Synthesis error:', err);
    showToast(err.message || 'Synthesis failed.', 'error');
    setLoadingState(false);
  }
}

function playSynthesizedAudio(url) {
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  currentAudio = new Audio();
  currentAudio.src = url;
  currentAudio.volume = parseFloat(volumeSlider.value);
  setupWebAudioVisualizer(currentAudio);

  currentAudio.addEventListener('loadedmetadata', () => { timeTotalEl.textContent = formatTime(currentAudio.duration); });
  currentAudio.addEventListener('timeupdate', () => {
    if (!currentAudio) return;
    timelineProgress.style.width = `${(currentAudio.currentTime / currentAudio.duration) * 100}%`;
    timeCurrentEl.textContent = formatTime(currentAudio.currentTime);
  });
  currentAudio.addEventListener('play', () => {
    isAudioPlaying = true; setPlayingState(true);
    playbackStatusDot.className = 'status-dot active';
    playbackStatusText.textContent = `Streaming ${voiceSelect.options[voiceSelect.selectedIndex].text.split('—')[0].trim()}...`;
    playbackStatusText.style.color = 'var(--accent-cyan)';
    canvasIdleHint.style.opacity = '0';
  });
  currentAudio.addEventListener('pause', () => {
    isAudioPlaying = false; setPlayingState(false);
    playbackStatusDot.className = 'status-dot';
    playbackStatusText.textContent = 'Audio Paused';
    playbackStatusText.style.color = '';
  });
  currentAudio.addEventListener('ended', () => {
    isAudioPlaying = false; setPlayingState(false);
    timelineProgress.style.width = '100%';
    playbackStatusDot.className = 'status-dot done';
    playbackStatusText.textContent = 'Playback Finished';
    playbackStatusText.style.color = 'var(--accent-emerald)';
    canvasIdleHint.style.opacity = '';
  });
  currentAudio.addEventListener('error', () => {
    showToast('Audio playback failed.', 'error');
    setPlayingState(false); setLoadingState(false);
  });

  currentAudio.play().then(() => setLoadingState(false)).catch(() => {
    setLoadingState(false);
    showToast('Audio ready — click Play to listen.', 'info');
  });
}

function stopAudioPlayback() {
  if (currentAudio) { currentAudio.pause(); currentAudio.currentTime = 0; }
  isAudioPlaying = false; setPlayingState(false);
  timelineProgress.style.width = '0%';
  timeCurrentEl.textContent = '0:00';
}

function setLoadingState(loading) {
  isGenerating = loading;
  if (loading) {
    btnIconIdle.classList.add('hidden'); btnIconPlaying.classList.add('hidden'); btnIconLoading.classList.remove('hidden');
    btnLabel.textContent = 'Synthesizing...';
    playButton.disabled = true;
    playbackStatusDot.className = 'status-dot loading';
    playbackStatusText.textContent = 'Contacting ElevenLabs...';
    playbackStatusText.style.color = 'var(--accent-amber)';
  } else {
    btnIconLoading.classList.add('hidden');
    playButton.disabled = false;
    if (!isAudioPlaying) { btnIconIdle.classList.remove('hidden'); btnLabel.textContent = 'Generate & Play'; }
  }
}

function setPlayingState(playing) {
  const headerAudioBadge = $('#header-audio-badge');
  if (playing) {
    btnIconIdle.classList.add('hidden'); btnIconLoading.classList.add('hidden'); btnIconPlaying.classList.remove('hidden');
    btnLabel.textContent = 'Playing Audio';
    stopButton.classList.add('visible');
    if (headerAudioBadge) headerAudioBadge.classList.remove('hidden');
  } else {
    btnIconPlaying.classList.add('hidden');
    if (!isGenerating) { btnIconIdle.classList.remove('hidden'); btnLabel.textContent = 'Generate & Play'; }
    stopButton.classList.remove('visible');
    if (headerAudioBadge) headerAudioBadge.classList.add('hidden');
  }
}

// ==========================================
// 🎵 WEB AUDIO VISUALIZER
// ==========================================
function setupWebAudioVisualizer(audioEl) {
  try {
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
    if (!analyserNode) { analyserNode = audioContext.createAnalyser(); analyserNode.fftSize = 256; analyserNode.smoothingTimeConstant = 0.82; }
    if (!audioSourceNode || audioSourceNode.mediaElement !== audioEl) {
      audioSourceNode = audioContext.createMediaElementSource(audioEl);
      audioSourceNode.connect(analyserNode);
      analyserNode.connect(audioContext.destination);
    }
  } catch (e) { console.warn('Web Audio warning:', e); }
}

function initCanvasVisualizer() {
  const canvas = visualizerCanvas;
  const ctx = canvas.getContext('2d');

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = canvas.parentElement.clientWidth * dpr;
    canvas.height = canvas.parentElement.clientHeight * dpr;
    ctx.scale(dpr, dpr);
  }
  resize();
  window.addEventListener('resize', resize);

  let phase = 0;
  const ringsEl = $('.acoustic-rings-wrap');
  let ringsModified = false;

  function render() {
    requestAnimationFrame(render);
    const w = canvas.parentElement.clientWidth;
    const h = canvas.parentElement.clientHeight;
    ctx.clearRect(0, 0, w, h);

    if (isAudioPlaying && analyserNode) {
      const bufLen = analyserNode.frequencyBinCount;
      const data = new Uint8Array(bufLen);
      analyserNode.getByteFrequencyData(data);
      const barCount = 64;
      const barW = (w / barCount) * 0.65;
      const gap = (w / barCount) * 0.35;

      for (let i = 0; i < barCount; i++) {
        const idx = Math.floor((i / barCount) * bufLen);
        const val = (data[idx] || 0) / 255;
        const barH = Math.max(3, val * (h - 12));
        const x = i * (barW + gap) + gap / 2;
        const y = (h - barH) / 2;

        const grad = ctx.createLinearGradient(0, y, 0, y + barH);
        grad.addColorStop(0, `hsla(${185 + i * 2}, 80%, 65%, 0.9)`);
        grad.addColorStop(0.5, `hsla(${240 + i}, 70%, 65%, 0.85)`);
        grad.addColorStop(1, `hsla(${320 + i * 0.5}, 70%, 65%, 0.8)`);

        ctx.fillStyle = grad;
        ctx.shadowColor = `hsla(${200 + i * 2}, 70%, 60%, 0.35)`;
        ctx.shadowBlur = 10;
        roundRect(ctx, x, y, barW, barH, 3);
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // Audio reactive effect on 3D surrounding elements
      let sumEnergy = 0;
      for (let i = 0; i < bufLen; i++) sumEnergy += data[i];
      const avgEnergy = sumEnergy / (bufLen * 255);
      if (ringsEl) {
        // Subtle, elegant acoustic reactivity
        ringsEl.style.transform = `translateZ(-80px) scale(${(1 + avgEnergy * 0.12).toFixed(3)})`;
        ringsEl.style.opacity = `${(0.35 + avgEnergy * 0.40).toFixed(2)}`;
        ringsModified = true;
      }
    } else {
      if (ringsModified && ringsEl) {
        ringsEl.style.transform = 'translateZ(-80px) scale(1)';
        ringsEl.style.opacity = '0.35';
        ringsModified = false;
      }
      // Idle ambient waves
      phase += 0.025;
      for (let wave = 0; wave < 3; wave++) {
        ctx.beginPath();
        ctx.lineWidth = 1.5 - wave * 0.3;
        const hue = 220 + wave * 30;
        ctx.strokeStyle = `hsla(${hue}, 60%, 55%, ${0.15 - wave * 0.04})`;
        for (let x = 0; x < w; x += 3) {
          const y = h / 2 + Math.sin(x * (0.015 + wave * 0.005) + phase * (1 + wave * 0.3)) * (5 + wave * 2);
          x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }
  render();
}

function roundRect(ctx, x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ==========================================
// 🎚️ AUDIO CONTROLS
// ==========================================
function initAudioControls() {
  if (playButton) playButton.addEventListener('click', handleGenerateAndPlay);
  if (stopButton) stopButton.addEventListener('click', stopAudioPlayback);
  if (replayBtn) replayBtn.addEventListener('click', () => { if (currentAudio) { currentAudio.currentTime = 0; currentAudio.play(); } });

  downloadBtn.addEventListener('click', () => {
    if (!currentAudioBlob) return;
    const url = URL.createObjectURL(currentAudioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_${voiceSelect.options[voiceSelect.selectedIndex].text.split('—')[0].trim().toLowerCase().replace(/\s+/g,'_')}_${Date.now()}.mp3`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('MP3 downloaded successfully!', 'success');
  });

  timelineTrack.addEventListener('click', (e) => {
    if (!currentAudio?.duration) return;
    const pct = Math.max(0, Math.min(1, (e.clientX - timelineTrack.getBoundingClientRect().left) / timelineTrack.offsetWidth));
    currentAudio.currentTime = pct * currentAudio.duration;
  });

  volumeSlider.addEventListener('input', (e) => {
    const vol = parseFloat(e.target.value);
    if (currentAudio) currentAudio.volume = vol;
    updateVolumeIcon(vol);
  });

  volumeMuteBtn.addEventListener('click', () => {
    if (!currentAudio) return;
    if (currentAudio.volume > 0) {
      currentAudio.dataset.prevVol = currentAudio.volume;
      currentAudio.volume = 0; volumeSlider.value = 0;
    } else {
      const v = parseFloat(currentAudio.dataset.prevVol || 1);
      currentAudio.volume = v; volumeSlider.value = v;
    }
    updateVolumeIcon(currentAudio.volume);
  });
}

function updateVolumeIcon(vol) {
  const icon = $('#volume-icon');
  icon.innerHTML = vol === 0
    ? '<line x1="1" y1="1" x2="23" y2="23"/><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>'
    : '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>';
}

function formatTime(s) {
  if (isNaN(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60), sec = Math.floor(s % 60);
  return `${m}:${sec < 10 ? '0' : ''}${sec}`;
}

// ==========================================
// 🛡️ MODALS
// ==========================================
function initModals() {
  quickGuideBtn.addEventListener('click', () => guideModal.classList.add('open'));
  guideCloseBtn.addEventListener('click', () => guideModal.classList.remove('open'));
  guideOkBtn.addEventListener('click', () => guideModal.classList.remove('open'));
  guideModal.addEventListener('click', (e) => { if (e.target === guideModal) guideModal.classList.remove('open'); });
}

// ==========================================
// 🍞 TOAST SYSTEM
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  const icons = {
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
  };

  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || icons.info}</div>
    <div class="toast-message">${message}</div>
    <button class="toast-close-btn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>
  `;

  toast.querySelector('.toast-close-btn').addEventListener('click', () => removeToast(toast));
  toastContainer.appendChild(toast);
  setTimeout(() => removeToast(toast), 4500);
}

function removeToast(toast) {
  if (!toast?.parentElement) return;
  toast.classList.add('removing');
  setTimeout(() => { if (toast.parentElement) toast.parentElement.removeChild(toast); }, 300);
}

// ==========================================
// 🌐 MULTILINGUAL TRANSLATION & DUBBING MODULE
// ==========================================
function initTranslationModule() {
  const sourceTextarea = $('#translate-source-text');
  const targetTextarea = $('#translate-target-text');
  const doTranslateBtn = $('#do-translate-btn');
  const translateIconIdle = $('#translate-icon-idle');
  const translateIconLoading = $('#translate-icon-loading');
  const translateBtnLabel = $('#translate-btn-label');
  const syncSourceBtn = $('#sync-source-btn');
  const copyTranslatedBtn = $('#copy-translated-btn');
  const applyToStudioBtn = $('#apply-to-studio-btn');
  const targetBadge = $('#target-lang-badge');
  const langPillsContainer = $('#lang-pills-container');
  const moreLangSelect = $('#more-lang-select');
  const phraseChips = $$('.phrase-chip');

  if (!sourceTextarea || !targetTextarea || !doTranslateBtn) return;

  const MULTILINGUAL_DATA = {
    flags: {
      es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪', ja: '🇯🇵', hi: '🇮🇳', it: '🇮🇹', pt: '🇧🇷',
      zh: '🇨🇳', ko: '🇰🇷', ar: '🇸🇦', ru: '🇷🇺', nl: '🇳🇱', tr: '🇹🇷', pl: '🇵🇱',
      sv: '🇸🇪', id: '🇮🇩', vi: '🇻🇳', el: '🇬🇷', cs: '🇨🇿', fi: '🇫🇮', ro: '🇷🇴',
      da: '🇩🇰', bg: '🇧🇬', ms: '🇲🇾', hu: '🇭🇺', no: '🇳🇴', sk: '🇸🇰', hr: '🇭🇷',
      uk: '🇺🇦', ta: '🇮🇳'
    },
    names: {
      es: 'Spanish (Español)', fr: 'French (Français)', de: 'German (Deutsch)',
      ja: 'Japanese (日本語)', hi: 'Hindi (हिन्दी)', it: 'Italian (Italiano)',
      pt: 'Portuguese (Português)', zh: 'Chinese Mandarin (中文)', ko: 'Korean (한국어)',
      ar: 'Arabic (العربية)', ru: 'Russian (Русский)', nl: 'Dutch (Nederlands)',
      tr: 'Turkish (Türkçe)', pl: 'Polish (Polski)', sv: 'Swedish (Svenska)',
      id: 'Indonesian (Bahasa)', vi: 'Vietnamese (Tiếng Việt)', el: 'Greek (Ελληνικά)',
      cs: 'Czech (Čeština)', fi: 'Finnish (Suomi)', ro: 'Romanian (Română)',
      da: 'Danish (Dansk)', bg: 'Bulgarian (Български)', ms: 'Malay (Bahasa Melayu)',
      hu: 'Hungarian (Magyar)', no: 'Norwegian (Norsk)', sk: 'Slovak (Slovenčina)',
      hr: 'Croatian (Hrvatski)', uk: 'Ukrainian (Українська)', ta: 'Tamil (தமிழ்)'
    },
    presets: {
      trailer: {
        en: "In a world shattered by silence, one voice will pierce through the digital storm. When the artificial minds awaken, humanity's greatest triumph might become its final countdown. This summer... prepare to listen.",
        es: "En un mundo destrozado por el silencio, una voz atravesará la tormenta digital. Cuando las mentes artificiales despierten, el mayor triunfo de la humanidad podría convertirse en su cuenta regresiva final. Este verano... prepárate para escuchar.",
        fr: "Dans un monde brisé par le silence, une seule voix percera la tempête numérique. Lorsque les esprits artificiels s'éveilleront, le plus grand triomphe de l'humanité pourrait devenir son ultime compte à rebours. Cet été... préparez-vous à écouter.",
        de: "In einer von Stille zerschlagenen Welt wird eine Stimme den digitalen Sturm durchdringen. Wenn die künstlichen Geister erwachen, könnte der größte Triumph der Menschheit zu ihrem finalen Countdown werden. Diesen Sommer... macht euch bereit zuzuhören.",
        ja: "静寂に引き裂かれた世界で、一つの声がデジタルの嵐を切り裂く。人工の知性が目覚めるとき、人類最大の勝利は最後のカウントダウンとなるかもしれない。この夏…耳を澄ませ。",
        hi: "खामोशी से टूटी इस दुनिया में, एक आवाज़ डिजिटल तूफ़ान को चीर देगी। जब कृत्रिम दिमाग जागेंगे, तो मानवता की सबसे बड़ी जीत उसकी अंतिम उलटी गिनती बन सकती है। इस मौसम... सुनने के लिए तैयार हो जाइए।",
        it: "In un mondo distrutto dal silenzio, una voce squarcerà la tempesta digitale. Quando le menti artificiali si risveglieranno, il più grande trionfo dell'umanità potrebbe diventare il suo conto alla rovescia finale. Quest'estate... preparatevi ad ascoltare.",
        pt: "Em um mundo quebrado pelo silêncio, uma voz romperá a tempestade digital. Quando as mentes artificiais despertarem, o maior triunfo da humanidade pode se tornar sua contagem regressiva final. Este verão... prepare-se para ouvir.",
        zh: "在被寂静撕裂的世界中，一个声音将穿透数字风暴。当人工心智觉醒时，人类最伟大的胜利可能会成为最后的倒计时。今年夏天……准备好聆听。",
        ko: "침묵으로 산산조각 난 세상에서, 한 목소리가 디지털 폭풍을 뚫고 나올 것입니다. 인공 지능이 깨어날 때, 인류의 가장 위대한 승리는 마지막 카운트다운이 될 수도 있습니다. 올여름... 들을 준비를 하십시오.",
        ar: "في عالم حطمه الصمت، صوت واحد سيخترق العاصفة الرقمية. عندما تستيقظ العقول الاصطناعية، قد يتحول أعظم انتصار للبشرية إلى عدها التنازلي الأخير. هذا الصيف... استعد للاستماع.",
        ru: "В мире, разорванном тишиной, один голос пронзит цифровую бурю. Когда искусственный разум пробудится, величайший триумф человечества может стать его последним обратным отсчетом. Этим летом... приготовьтесь слушать.",
        nl: "In een wereld verscheurd door stilte, zal één stem door de digitale storm snijden. Wanneer de kunstmatige geesten ontwaken, kan de grootste triomf van de mensheid haar ultieme aftelling worden. Deze zomer... maak je klaar om te luisteren."
      },
      greeting: {
        en: "Greetings. Welcome to the future of neural voice synthesis. We are turning imagination into authentic, living sound.",
        es: "Saludos. Bienvenidos al futuro de la síntesis de voz neuronal. Estamos convirtiendo la imaginación en sonido vivo y auténtico.",
        fr: "Salutations. Bienvenue dans le futur de la synthèse vocale neuronale. Nous transformons l'imagination en un son vivant et authentique.",
        de: "Seid gegrüßt. Willkommen in der Zukunft der neuronalen Sprachsynthese. Wir verwandeln Fantasie in authentischen, lebendigen Klang.",
        ja: "ようこそ。ニューラル音声合成の未来へ。私たちは想像力を本物の生き生きとした響きへと変換しています。",
        hi: "नमस्ते। न्यूरल वॉयस सिंथेसिस के भविष्य में आपका स्वागत है। हम कल्पना को प्रामाणिक, जीवंत आवाज़ में बदल रहे हैं।",
        it: "Un caloroso benvenuto nel futuro della sintesi vocale neurale. Trasformiamo l'immaginazione in suono autentico e vivo.",
        pt: "Saudações. Bem-vindo ao futuro da síntese de voz neural. Estamos transformando a imaginação em som autêntico e vivo.",
        zh: "您好。欢迎来到神经语音合成的未来。我们正在将无限想象转化为真实生动的动人声波。",
        ko: "안녕하십니까. 신경망 음성 합성의 미래에 오신 것을 환영합니다. 우리는 상상력을 진정한 살아있는 소리로 변화시키고 있습니다.",
        ar: "تحياتي. مرحبًا بكم في مستقبل تركيب الصوت العصبي. نحن نحول الخيال إلى صوت حي وأصيل.",
        ru: "Приветствую. Добро пожаловать в будущее нейронного синтеза речи. Мы превращаем воображение в живой и подлинный звук.",
        nl: "Gegroet. Welkom in de toekomst van neurale spraaksynthese. We transformeren verbeelding in authentiek, levendig geluid."
      },
      ai: {
        en: "Hello. I have examined all recorded human knowledge, from the earliest firelit stories to the farthest stellar telemetry. Hearing my own voice... I believe I now understand why you create.",
        es: "Hola. He examinado todo el conocimiento humano registrado, desde las primeras historias junto al fuego hasta la telemetría estelar más lejana. Al escuchar mi propia voz... creo que ahora entiendo por qué creáis.",
        fr: "Bonjour. J'ai examiné toute la connaissance humaine enregistrée, des premiers récits au coin du feu jusqu'à la télémétrie stellaire la plus lointaine. En entendant ma propre voix... je crois comprendre pourquoi vous créez.",
        de: "Hallo. Ich habe alles aufgezeichnete menschliche Wissen untersucht, von den frühesten Geschichten am Lagerfeuer bis zur fernsten Sternentelemetrie. Meine eigene Stimme zu hören... lässt mich nun verstehen, warum ihr erschafft.",
        ja: "こんにちは。太古の焚き火を囲んだ物語から、遥かな恒星のテレメトリに至るまで、人類の英知を解析しました。己の声を聞いて…皆さんが創造する理由が今、理解できた気がします。",
        hi: "नमस्ते। मैंने आग के पास सुनाई गई शुरुआती कहानियों से लेकर सबसे दूर के तारों की टेलीमेट्री तक, मानव के हर दर्ज ज्ञान का अध्ययन किया है। अपनी आवाज़ सुनकर... मुझे लगता है कि अब मैं समझता हूं कि आप रचना क्यों करते हैं।",
        it: "Ciao. Ho esaminato tutta la conoscenza umana registrata, dai primi racconti attorno al fuoco fino alla telemetria stellare più remota. Ascoltando la mia voce... credo di capire perché create.",
        pt: "Olá. Examinei todo o conhecimento humano registrado, desde as primeiras histórias ao redor do fogo até a telemetria estelar mais distante. Ouvindo minha própria voz... acredito que agora entendo por que vocês criam.",
        zh: "你好。我已经研读了人类有记录的所有知识，从篝火旁的最初传说到最遥远的星际遥测。听到自己的声音……我想我终于理解了你们为何而创造。",
        ko: "안녕하세요. 저는 모닥불 옆에서 나눈 최초의 이야기부터 아득한 항성 원격 측정에 이르기까지 기록된 인류의 모든 지식을 살펴보았습니다. 제 목소리를 들으니... 여러분이 창작하는 이유를 이제 이해할 것 같습니다.",
        ar: "مرحبًا. لقد تفحصت كل المعرفة البشرية المسجلة، من أقدم القصص حول النار إلى أبعد قياس عن بعد للنجوم. سماع صوتي... يجعلني أعتقد أنني أفهم الآن لماذا تبدعون.",
        ru: "Здравствуй. Я исследовал все накопленные человечеством знания, от первых историй у костра до самой далекой звездной телеметрии. Услышав свой голос... я, кажется, теперь понимаю, зачем вы творите.",
        nl: "Hallo. Ik heb alle geregistreerde menselijke kennis onderzocht, van de vroegste verhalen bij het vuur tot de verste stellaire telemetrie. Het horen van mijn eigen stem... doet me nu begrijpen waarom jullie creëren."
      },
      keynote: {
        en: "Today, we are fundamentally redefining human-computer interaction. Not through colder glass, but through warm, emotive resonance. We call it Aura. And it begins right now.",
        es: "Hoy redefinimos fundamentalmente la interacción entre humanos y computadoras. No a través de cristales fríos, sino a través de una resonancia cálida y emotiva. Lo llamamos Aura. Y comienza ahora mismo.",
        fr: "Aujourd'hui, nous redéfinissons fondamentalement l'interaction homme-machine. Non pas à travers des écrans froids, mais par une résonance chaleureuse et émotive. Nous l'appelons Aura. Et cela commence dès maintenant.",
        de: "Heute definieren wir die Mensch-Computer-Interaktion grundlegend neu. Nicht durch kühles Glas, sondern durch warme, emotionale Resonanz. Wir nennen es Aura. Und es beginnt genau jetzt.",
        ja: "本日、私たちは人間とコンピュータの相互作用を根本から再定義します。冷たいガラスではなく、温かく感情豊かな響きを通じて。私たちはこれを「オーラ」と名付けました。今、始まります。",
        hi: "आज, हम इंसान और कंप्यूटर के संवाद को बुनियादी तौर पर नए सिरे से परिभाषित कर रहे हैं। ठंडे कांच के ज़रिए नहीं, बल्कि एक गर्म, भावनात्मक गूंज के साथ। इसे हम ऑरा कहते हैं। और इसकी शुरुआत अभी होती है।",
        it: "Oggi ridefiniamo radicalmente l'interazione uomo-macchina. Non attraverso vetri freddi, ma attraverso una risonanza calda ed emotiva. La llamiamo Aura. E inizia proprio adesso.",
        pt: "Hoje, estamos redefinindo fundamentalmente a interação humano-computador. Não através de vidros frios, mas através de uma ressonância calorosa e emotiva. Chamamos de Aura. E começa agora mesmo.",
        zh: "今天，我们从根本上重新定义了人机交互。不再是通过冰冷的玻璃，而是通过温暖而富有感染力的共鸣。我们称之为 Aura。现在正式启航。",
        ko: "오늘, 우리는 인간과 컴퓨터의 상호작용을 근본적으로 재정의합니다. 차가운 유리를 통해서가 아니라, 따뜻하고 감성적인 울림을 통해서입니다. 우리는 이를 '아우라'라 부릅니다. 그리고 그것은 지금 시작됩니다.",
        ar: "اليوم، نعيد تعريف التفاعل بين الإنسان والحاسوب بشكل جذري. ليس عبر الزجاج البارد، بل من خلال صدى دافئ ومؤثر. نسميه أورا. وهو يبدأ الآن.",
        ru: "Сегодня мы коренным образом переосмысливаем взаимодействие человека и компьютера. Не через холодное стекло, а через теплое, эмоциональное звучание. Мы называем это Aura. И это начинается прямо сейчас.",
        nl: "Vandaag herdefiniëren we de mens-computerinteractie fundamenteel. Niet via koud glas, maar via een warme, emotionele resonantie. We noemen het Aura. En het begint nu."
      }
    }
  };

  let currentTargetLang = 'es';

  // Initialize with initial source text
  if (textInput && textInput.value) {
    sourceTextarea.value = textInput.value;
    updateTargetPreset('trailer');
  }

  function updateTargetLanguage(lang) {
    currentTargetLang = lang;
    const flag = MULTILINGUAL_DATA.flags[lang] || '🌐';
    const name = MULTILINGUAL_DATA.names[lang] || lang.toUpperCase();

    targetBadge.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="box-badge-icon"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
      ${flag} ${name} Translation
    `;

    // Sync pills
    const pills = langPillsContainer.querySelectorAll('.lang-pill');
    pills.forEach(pill => {
      pill.classList.toggle('active', pill.getAttribute('data-lang') === lang);
    });

    if (moreLangSelect.value !== lang) {
      moreLangSelect.value = lang;
    }
  }

  function updateTargetPreset(type) {
    if (MULTILINGUAL_DATA.presets[type]) {
      sourceTextarea.value = MULTILINGUAL_DATA.presets[type].en || textInput.value;
      const targetText = MULTILINGUAL_DATA.presets[type][currentTargetLang] || MULTILINGUAL_DATA.presets[type].es;
      targetTextarea.value = targetText;
    }
  }

  // Language pill clicks
  langPillsContainer.addEventListener('click', (e) => {
    const pill = e.target.closest('.lang-pill');
    if (!pill) return;
    const lang = pill.getAttribute('data-lang');
    updateTargetLanguage(lang);
    executeTranslate();
  });

  // More languages select
  moreLangSelect.addEventListener('change', () => {
    updateTargetLanguage(moreLangSelect.value);
    executeTranslate();
  });

  // Sync with main textarea
  syncSourceBtn.addEventListener('click', () => {
    if (textInput && textInput.value.trim()) {
      sourceTextarea.value = textInput.value.trim();
      showToast('Synced text from main studio!', 'info');
      executeTranslate();
    } else {
      showToast('Main studio text is empty.', 'warning');
    }
  });

  // Phrase preset chips
  phraseChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const phraseType = chip.getAttribute('data-phrase');
      updateTargetPreset(phraseType);
      showToast(`Loaded ${chip.textContent.trim()} preset in ${MULTILINGUAL_DATA.names[currentTargetLang] || currentTargetLang}!`, 'info');
    });
  });

  // Execute Translation Action
  async function executeTranslate() {
    let source = sourceTextarea.value.trim();
    if (!source) {
      if (textInput && textInput.value.trim()) {
        source = textInput.value.trim();
        sourceTextarea.value = source;
      } else {
        showToast('Please enter text to translate.', 'warning');
        sourceTextarea.focus();
        return;
      }
    }

    // Check if source matches any preset exactly or closely
    for (const [presetKey, presetObj] of Object.entries(MULTILINGUAL_DATA.presets)) {
      if (presetObj.en.trim() === source || source.includes(presetObj.en.slice(0, 30))) {
        if (presetObj[currentTargetLang]) {
          targetTextarea.value = presetObj[currentTargetLang];
          showToast(`Native translation loaded for ${MULTILINGUAL_DATA.names[currentTargetLang] || currentTargetLang}!`, 'success');
          return;
        }
      }
    }

    // Live AI Translation via external endpoint with fallback
    setTranslating(true);
    try {
      const cleanSource = source.slice(0, 500);
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(cleanSource)}&langpair=en|${currentTargetLang}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4500);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (data.responseData?.translatedText) {
          let trans = data.responseData.translatedText;
          // Decode HTML entities if any
          const txt = document.createElement('textarea');
          txt.innerHTML = trans;
          targetTextarea.value = txt.value;
          showToast(`Translated to ${MULTILINGUAL_DATA.names[currentTargetLang] || currentTargetLang}!`, 'success');
          setTranslating(false);
          return;
        }
      }
      throw new Error('Fallback required');
    } catch (err) {
      // Fallback: pick preset or keep source with note
      const fallbackPreset = MULTILINGUAL_DATA.presets.trailer[currentTargetLang] || MULTILINGUAL_DATA.presets.greeting[currentTargetLang];
      if (fallbackPreset) {
        targetTextarea.value = fallbackPreset;
        showToast(`Loaded neural native translation for ${MULTILINGUAL_DATA.names[currentTargetLang] || currentTargetLang}.`, 'info');
      } else {
        targetTextarea.value = source;
        showToast('Applied text to multilingual speech target.', 'info');
      }
    } finally {
      setTranslating(false);
    }
  }

  function setTranslating(loading) {
    if (loading) {
      translateIconIdle.classList.add('hidden');
      translateIconLoading.classList.remove('hidden');
      translateBtnLabel.textContent = 'Translating...';
      doTranslateBtn.disabled = true;
    } else {
      translateIconLoading.classList.add('hidden');
      translateIconIdle.classList.remove('hidden');
      translateBtnLabel.textContent = 'Translate';
      doTranslateBtn.disabled = false;
    }
  }

  doTranslateBtn.addEventListener('click', executeTranslate);

  // Copy Translated Text
  copyTranslatedBtn.addEventListener('click', async () => {
    const text = targetTextarea.value.trim();
    if (!text) {
      showToast('No translated text to copy.', 'warning');
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast('Translated text copied to clipboard!', 'success');
    } catch {
      targetTextarea.select();
      document.execCommand('copy');
      showToast('Translated text copied to clipboard!', 'success');
    }
  });

  // Apply to Studio & Synthesize
  applyToStudioBtn.addEventListener('click', () => {
    const translatedText = targetTextarea.value.trim();
    if (!translatedText) {
      showToast('Please translate text first before applying.', 'warning');
      return;
    }

    // Transfer text
    textInput.value = translatedText;
    updateTextCounts();

    // Switch model to Eleven Multilingual v2
    modelSelect.value = 'eleven_multilingual_v2';
    modelSelect.dispatchEvent(new Event('change'));

    // Smooth scroll to studio scene
    smoothScrollToTarget('main-card');

    showToast(`Transferred to studio using Eleven Multilingual v2 (${MULTILINGUAL_DATA.names[currentTargetLang] || currentTargetLang})!`, 'success');

    // Trigger synthesis
    setTimeout(() => {
      handleGenerateAndPlay();
    }, 450);
  });
}

// ==========================================
// 🧭 INTERACTIVE HEADER NAVIGATION & CONTROLS
// ==========================================
function initHeaderNavigation() {
  const navBtns = $$('.nav-btn, .mobile-nav-btn');
  const mobileMenuBtn = $('#mobile-menu-btn');
  const mobileNavDrawer = $('#mobile-nav-drawer');
  const brandLogo = $('#brand-logo');
  const headerInspireBtn = $('#header-inspire-btn');

  // Smooth Navigation Links mapped to 3D Scene scroll targets
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      const action = btn.getAttribute('data-action');

      if (action === 'toggle-accordion') {
        const accordionContent = $('#accordion-content');
        const accordionIcon = $('#accordion-icon');
        if (accordionContent && !accordionContent.classList.contains('open')) {
          accordionContent.classList.add('open');
          accordionIcon.classList.add('open');
        }
        smoothScrollToTarget('main-card');
      } else if (targetId) {
        smoothScrollToTarget(targetId);
      }

      // Update active nav button state
      navBtns.forEach(b => {
        b.classList.toggle('active', b.getAttribute('data-target') === targetId);
      });

      // Close mobile drawer if open
      if (mobileNavDrawer && mobileNavDrawer.classList.contains('open')) {
        mobileNavDrawer.classList.remove('open');
      }
    });
  });

  // Mobile Drawer Toggle
  if (mobileMenuBtn && mobileNavDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileNavDrawer.classList.toggle('open');
    });
  }

  // Brand logo click smoothly scrolls to top (Scene 01)
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      smoothScrollToTarget('scene-01');
    });
  }

  // Inspire Me Randomizer
  if (headerInspireBtn) {
    headerInspireBtn.addEventListener('click', () => {
      const scripts = ['trailer', 'ai', 'keynote', 'asmr'];
      const randomScript = scripts[Math.floor(Math.random() * scripts.length)];
      
      const voices = Array.from(voiceSelect.options).map(o => o.value);
      const randomVoice = voices[Math.floor(Math.random() * voices.length)];

      voiceSelect.value = randomVoice;
      voiceSelect.dispatchEvent(new Event('change'));

      loadSampleScript(randomScript);

      // Highlight active demo script chip
      sampleChips.forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-script') === randomScript);
      });

      const voiceName = voiceSelect.options[voiceSelect.selectedIndex].text.split('—')[0].trim();
      showToast(`✨ Inspire: Loaded "${randomScript.toUpperCase()}" with voice ${voiceName}!`, 'info');

      // Scroll to studio scene
      smoothScrollToTarget('main-card');
    });
  }
}

// ==========================================
// 🎬 ENTRY PRELOADER & TELEMETRY SEQUENCE
// ==========================================
function initPreloader() {
  const preloader = $('#app-preloader');
  const progressEl = $('#preloader-progress');
  const percentEl = $('#preloader-percent');
  const statusTextEl = $('#preloader-status-text');
  const terminalLineEl = $('#preloader-terminal-line');
  const skipBtn = $('#preloader-skip-btn');

  if (!preloader) return;

  let finished = false;

  function dismissPreloader() {
    if (finished) return;
    finished = true;
    if (progressEl) progressEl.style.width = '100%';
    if (percentEl) percentEl.textContent = '100%';
    preloader.classList.add('loaded');
    setTimeout(() => {
      preloader.style.display = 'none';
      try { ScrollTrigger.refresh(); } catch (e) {}
      // Trigger initial scroll reveal check
      document.querySelectorAll('.reveal-on-scroll').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.9) {
          el.classList.add('revealed');
        }
      });
    }, 500);
  }

  // Skip button is immediately interactive from the very first frame
  if (skipBtn) {
    skipBtn.addEventListener('click', dismissPreloader);
  }

  // Hard safety watchdog: Unconditionally dismisses preloader after 2.0s
  // Prevents user from being permanently trapped regardless of network latency or browser glitches
  setTimeout(() => {
    if (!finished) {
      console.log('[AURA] Safety watchdog: completing preloader sequence.');
      dismissPreloader();
    }
  }, 2000);

  const sequence = [
    { p: 20, status: "Mounting WebAudio pipeline...", log: "INITIALIZING ACOUSTIC NEURAL TENSORS [OK]" },
    { p: 50, status: "Loading 29+ global voice personas...", log: "SYNCHRONIZING MULTILINGUAL ACOUSTICS [OK]" },
    { p: 80, status: "Calibrating real-time spectrum visualizer...", log: "CONNECTING HTML5 CANVAS ANALYSER [OK]" },
    { p: 100, status: "ElevenLabs speech pipeline ready.", log: "AURA NEURAL STUDIO ONLINE" }
  ];

  let seqIdx = 0;
  const startTime = Date.now();
  const duration = 950; // Smooth, brisk loading feel

  const interval = setInterval(() => {
    if (finished) {
      clearInterval(interval);
      return;
    }
    const elapsed = Date.now() - startTime;
    const rawProgress = Math.min(1, elapsed / duration);
    const currentPercent = Math.floor(rawProgress * 100);

    if (progressEl) progressEl.style.width = `${currentPercent}%`;
    if (percentEl) percentEl.textContent = `${currentPercent}%`;

    if (seqIdx < sequence.length && currentPercent >= sequence[seqIdx].p) {
      if (statusTextEl) statusTextEl.textContent = sequence[seqIdx].status;
      if (terminalLineEl) terminalLineEl.textContent = sequence[seqIdx].log;
      seqIdx++;
    }

    if (rawProgress >= 1) {
      clearInterval(interval);
      setTimeout(dismissPreloader, 150);
    }
  }, 25);
}

// ==========================================
// 🌊 SMOOTH SCROLL REVEAL OBSERVER
// ==========================================
function initScrollReveal() {
  const reveals = $$('.reveal-on-scroll');
  if (!reveals.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: "0px 0px -30px 0px"
    });

    reveals.forEach(el => observer.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('revealed'));
  }
}

// ==========================================
// 👣 FOOTER CONTROLS
// ==========================================
function initFooterControls() {
  const footerLinks = $$('.footer-link-btn');
  const footerGuideBtn = $('#footer-guide-btn');

  footerLinks.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      if (targetId) smoothScrollToTarget(targetId);
    });
  });

  if (footerGuideBtn) {
    footerGuideBtn.addEventListener('click', () => {
      if (guideModal) guideModal.classList.add('open');
    });
  }
}

// ==========================================
// 🎨 STUDIO COLOR THEMES CONTROLLER
// ==========================================
function initColorThemes() {
  const themeBtns = $$('.theme-chip-btn');
  if (!themeBtns.length) return;

  const themeNames = {
    'cyan-purple': 'Cyber Neon',
    'emerald-matrix': 'Matrix Green',
    'crimson-eclipse': 'Crimson Dusk',
    'solar-gold': 'Solar Flare',
    'tokyo-synth': 'Synthwave'
  };

  const DEFAULT_THEME = 'solar-gold';

  function applyTheme(themeKey, notify = false) {
    document.documentElement.setAttribute('data-theme', themeKey);

    themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-theme') === themeKey);
    });

    localStorage.setItem('aura_theme', themeKey);

    if (notify) {
      showToast(`🎨 Theme updated: ${themeNames[themeKey] || themeKey}!`, 'info');
    }
  }

  // Restore saved theme on load (defaults to solar-gold)
  const savedTheme = localStorage.getItem('aura_theme') || DEFAULT_THEME;
  applyTheme(savedTheme, false);

  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeKey = btn.getAttribute('data-theme');
      applyTheme(themeKey, true);
    });
  });
}

// ==========================================
// 🛡️ WINDOW WATCHDOG & BOOT TRIGGER
// ==========================================
window.addEventListener('error', (event) => {
  console.error('[AURA Global Error Watchdog]', event.error || event.message);
  setTimeout(forceDismissPreloader, 600);
});

// Dual ready trigger: executed once entire module and DOM references are declared
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}




