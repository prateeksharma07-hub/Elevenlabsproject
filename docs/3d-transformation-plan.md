# AURA 3D Cinematic Transformation Plan

> **Architectural Specification & Transformation Blueprint**  
> **Project:** AURA // Neural Voice Studio (ElevenLabs AI)  
> **Target Experience:** Immersive 3D Scroll-Driven Interactive Stage  
> **Core Stack:** Vanilla HTML5, CSS3 3D Transforms, Vanilla JavaScript (ES Modules), GSAP 3 + ScrollTrigger, Lenis Smooth Scroll  

---

## 1. Executive Summary & Philosophy

The objective is to evolve the existing linear web page into a **unified 3D spatial world**. Rather than scrolling down standard static vertical sections, the user navigates through a **pinned 3D camera stage** where scrolling directly drives the spatial coordinates (depth $Z$, rotation $\theta_{X,Y,Z}$, translation $X,Y$, scale $S$, clipping, and opacity) of distinct scene layers.

**Zero Breakage Guarantee:**  
All 16 existing features—including ElevenLabs Text-to-Speech API integration, voice/model selectors, acoustic sliders, Web Audio API frequency analysis on `<canvas>`, audio timeline scrubbing, lossless MP3 export, polyglot translation, theme switching, particle system, and modals—will remain 100% operational.

---

## 2. Current Architecture vs. New Immersive Architecture

### 2.1 Current Architecture (Linear Flow)
* **DOM Structure:** Standard vertical layout with sequential blocks: `<header>` → `<main>` (`.hero`, `.section-tag-row`, `.main-card-wrapper`, `.section-divider`, `.translate-section-wrapper`, `.features-grid`, `.app-footer`).
* **Motion & Reveal:** Basic vertical offsets via `IntersectionObserver` observing `.reveal-on-scroll`, translating elements upward by $30\text{px}$ with opacity fade-in.
* **Scroll Mechanics:** Standard browser native scrolling (`scroll-behavior: smooth`).
* **3D Features:** Limited to isolated local mousemove tilt on `#main-card`.

```
[ Traditional Flow ]
+----------------------------+
| Header                     |
+----------------------------+
| Hero Section               |
+----------------------------+
| Studio Card (#main-card)   |
+----------------------------+
| Translation Card           |
+----------------------------+
| Feature Metrics Grid       |
+----------------------------+
| Footer                     |
+----------------------------+
```

### 2.2 New Immersive Architecture (Pinned 3D Stage)
* **DOM Structure:** Pinned outer viewport container (`.immersive-scroll`) housing a persistent 3D camera stage (`.immersive-stage` with `perspective: 1600px` and `transform-style: preserve-3d`).
* **Scroll Height:** The outer container provides virtual height (e.g., `500vh` to `600vh`), allowing precise scrub control via GSAP ScrollTrigger.
* **Depth Layering:** Each scene utilizes multi-plane depth slicing:
  * `.background-layer` (ambient glow, grid coordinate lines, slow parallax)
  * `.midground-layer` (spatial particles, architectural rings, badges)
  * `.content-layer` (interactive UI controls, cards, textareas, sliders)
  * `.foreground-layer` (floating audio accents, telemetry badges, fast parallax)

```
+-------------------------------------------------------------+
|  VIRTUAL SCROLL CONTAINER (.immersive-scroll, ~500vh-600vh) |
|                                                             |
|   +-----------------------------------------------------+   |
|   | FIXED VIEWPORT STAGE (.immersive-stage, 100vh pin)  |   |
|   | perspective: 1600px; transform-style: preserve-3d;  |   |
|   |                                                     |   |
|   |   [Scene 01: Hero Gateway]       (z: 0 -> +800px)   |   |
|   |   [Scene 02: Studio Neural Card] (z: -1200px -> 0)  |   |
|   |   [Scene 03: Visualizer Arena]   (z: scale 1.4x)    |   |
|   |   [Scene 04: Polyglot Dubbing]   (z: rotY 3D flip)  |   |
|   |   [Scene 05: Finale & Telemetry] (z: zoom into CTA) |   |
|   +-----------------------------------------------------+   |
+-------------------------------------------------------------+
```

---

## 3. Five-Scene Structure & Visual Storytelling

### Scene 01: The Gateway (Hero Introduction)
* **Content:** Existing AURA branding, live engine status pulse, hero headline ("Turn Written Words into Cinematic Human Voices"), subtitle, and prompt chips.
* **Initial State:** Floating at $Z = 0$, slightly tilted (`rotateX: 3deg`, `scale: 0.98`).
* **Scroll Transition:** As the user scrolls ($0\% \to 25\%$), the camera flies into the gateway. The headline splits into spatial layers; foreground badges accelerate outward, while background particles drift slowly. At the exit, Scene 01 tilts backward (`rotateX: -12deg`, `translateZ: 600px`, `opacity: 0`).

### Scene 02: The Acoustic Core (Voice Studio)
* **Content:** Existing `#main-card`, voice selector, model selector, demo script chips, speech textarea, acoustic accordion sliders, generate & stop buttons.
* **Initial State:** Approaches from deep camera space ($Z = -1200\text{px}$, `scale: 0.75`, `opacity: 0`, `rotateX: 10deg`).
* **Scroll Transition ($25\% \to 50\%$):** Smoothly docks into prime focus ($Z = 0$, `scale: 1`, `rotateX: 0deg`, `opacity: 1`).
* **Interactivity:** Full interactive functionality is preserved—pointer events are completely active, allowing typing, slider adjustments, voice selection, and speech triggering at any point.

### Scene 03: The Resonance Chamber (Audio Visualizer Arena)
* **Content:** Existing `#player-dock`, Web Audio API `<canvas id="visualizer-canvas">`, time scrub track, volume sliders, MP3 download action, replay button.
* **Scroll Transition ($50\% \to 65\%$):** The studio card subtly pitches back while the visualizer canvas expands forward in 3D space (`translateZ: 140px`, `scale: 1.08`).
* **Audio Interactivity:** When audio plays, frequency bins dynamically illuminate the chamber; surrounding 3D elements exhibit subtle reactive glow pulsing synced with the audio analyser.

### Scene 04: The Polyglot Matrix (29+ Languages Translation)
* **Content:** Existing `#translate-card`, language pills (`#lang-pills-container`), language select dropdown, source textarea, translate button, target textarea, "Send to Studio" button.
* **Scroll Transition ($65\% \to 85\%$):** Enters through a horizontal 3D orbital transition (`rotateY: -25deg → 0deg`, `translate3d(180px, 0, -400px) → (0, 0, 0)`). Layered masking and glass highlights reveal the matrix.
* **Functionality:** 1-click translation, preset switching, clipboard copy, and "Apply to Studio" work flawlessly.

### Scene 05: The Final Dimension (Architecture & Cinematic Finale)
* **Content:** Feature metrics grid (29+ languages, <150ms latency, real-time analyser, lossless MP3 export), studio ambient theme switcher chips, brand manifesto, and interactive quick-start tips.
* **Scroll Transition ($85\% \to 100\%$):** The matrix recedes into depth, and the four spatial telemetry cards form a floating 3D arc that settles into the final cinematic call-to-action:
  > **AURA.ai**  
  > *"Turn written words into cinematic human voices."*
* **Footer Persistence:** Studio theme switching remains instantly interactive, updating CSS custom properties live across the 3D world.

---

## 4. Master Scroll Timeline & GSAP Scrub Mapping

A single master timeline bound to `ScrollTrigger` orchestrates all transformations:

```javascript
const masterTL = gsap.timeline({
  scrollTrigger: {
    trigger: ".immersive-scroll",
    start: "top top",
    end: "bottom bottom",
    scrub: 1.2, // Smooth interpolation lag
    pin: ".immersive-stage"
  }
});
```

### Timeline Phasing Keyframes

| Scroll % | Scene 01 (Hero) | Scene 02 (Studio) | Scene 03 (Visualizer) | Scene 04 (Translate) | Scene 05 (Finale) |
|---|---|---|---|---|---|
| **0% – 20%** | Active ($Z: 0 \to +400\text{px}$) | Distant ($Z: -1200\text{px}$) | Inactive | Inactive | Inactive |
| **20% – 35%** | Exit Fly-through ($Z \to +900\text{px}$, Opacity $\to 0$) | Flying in ($Z: -600\text{px} \to 0$) | Standby | Inactive | Inactive |
| **35% – 55%** | Hidden | Fully Docked ($Z: 0$, Interactive) | Focused | Distant | Inactive |
| **55% – 70%** | Hidden | Recedes slightly ($Z: -200\text{px}$) | Elevated ($Z: +150\text{px}$) | Approaching | Inactive |
| **70% – 85%** | Hidden | Inactive | Inactive | Docked ($Z: 0$, RotY: $0^\circ$) | Standby |
| **85% – 100%** | Hidden | Inactive | Inactive | Recedes ($Z: -500\text{px}$) | Docked ($Z: 0$, Final CTA) |

---

## 5. Lenis Smooth Scroll Integration

Lenis provides momentum-based virtual scrolling, which eliminates choppy wheel delta updates on desktop browsers and ensures silky GSAP scrub response:

### Synchronization Pattern
```javascript
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.5
});

// Synchronize Lenis scroll position with GSAP ScrollTrigger
lenis.on('scroll', ScrollTrigger.update);

// Drive Lenis tick via GSAP ticker for frame-locked rendering
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Ensure ticker does not drop frames
gsap.ticker.lagSmoothing(0);
```

---

## 6. Preserving Existing ElevenLabs Functionality

To guarantee zero regression:
1. **DOM ID and Selector Continuity:**
   All IDs (`#text-input`, `#voice-select`, `#model-select`, `#stability-slider`, `#similarity-slider`, `#style-slider`, `#play-button`, `#stop-button`, `#replay-btn`, `#download-btn`, `#visualizer-canvas`, `#timeline-track`, `#translate-source-text`, `#translate-target-text`, `#do-translate-btn`, `#apply-to-studio-btn`) remain untouched.
2. **Audio Pipeline & Analyser Nodes:**
   The `AudioContext`, `MediaElementAudioSourceNode`, and `AnalyserNode` logic in `setupWebAudioVisualizer()` remain identical. Canvas resolution and DPI scaling adapt smoothly inside the 3D stage.
3. **Event Listeners Unbound from Window Scroll:**
   Existing scroll helpers (like `scrollIntoView` and smooth scrolling on nav clicks) will be updated to interface directly with `lenis.scrollTo(target)` or mapped scroll positions so clicking "Studio", "Translate", or "Visualizer" navigates to the exact scene percentage in 3D space.
4. **Pointer Events & Focus Management:**
   Inactive scenes will receive `pointer-events: none` and `visibility: hidden` (managed cleanly via GSAP autoAlpha) to prevent invisible background elements from intercepting mouse clicks or tab focus. When a scene is active, `pointer-events: auto` is restored immediately.

---

## 7. Responsive & Mobile Strategy

Complex 3D transforms with large `translateZ` and extreme rotations can cause clipping or disorienting perspectives on narrow screens. We use a **tri-tier adaptive strategy**:

1. **Desktop (> 1024px):**
   * Full 3D perspective ($1600\text{px}$).
   * Multi-axis rotations (`rotateX: \pm 12^\circ`, `rotateY: \pm 20^\circ`).
   * Deep Z-translations ($\pm 1200\text{px}$).
   * 4-layer parallax depth separation.
2. **Tablet (768px - 1024px):**
   * Moderate perspective ($1200\text{px}$).
   * Subtle rotations (`rotateX: \pm 5^\circ`, `rotateY: 0^\circ`).
   * Scaled Z-translations ($\pm 400\text{px}$).
3. **Mobile (< 768px):**
   * Flat 2.5D presentation to maximize legibility and ergonomics.
   * `rotateX` and `rotateY` clamped to $0^\circ$.
   * Transformations rely primarily on subtle scaling ($0.95 \leftrightarrow 1.0$), vertical translation ($Y$), and clean opacity transitions.
   * Virtual scroll container height reduced (e.g., `350vh`) to minimize scrolling fatigue.
   * Inputs, sliders, and audio controls remain comfortably sized and touch-friendly.

---

## 8. Performance & Optimization Architecture

* **GPU Layer Promotion:** Every animated 3D element uses `will-change: transform, opacity;` and `backface-visibility: hidden;` to ensure GPU hardware acceleration.
* **Composite Layer Cleanliness:** Only transform and opacity properties are animated by GSAP. No layout-triggering properties (`width`, `height`, `top`, `left`, `margin`) will be animated during scroll scrub.
* **Canvas Optimization:** Both `#particle-canvas` and `#visualizer-canvas` limit rendering passes to `requestAnimationFrame`. When an inactive scene is out of view, canvas calculations can idle or run at reduced frequency.
* **Memory Management:** Object URLs generated for synthesized audio blobs are systematically revoked on subsequent generations to prevent browser memory leaks.
