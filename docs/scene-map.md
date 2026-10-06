# AURA — Scene Map & Cinematic Camera Journey
**Scroll-Driven Camera Path & Narrative Progression**
*Author: DeepMind Antigravity Design System & Architecture*

---

## 1. Complete Journey Overview

Total Scroll Distance: `500vh` ($p \in [0.0, 1.0]$)

```
[0.00] ─── (0.15) ──────── [0.35] ─── (0.50) ──────── [0.65] ─── (0.75) ──────── [0.85] ─── (0.92) ──────── [1.00]
Scene 01               Scene 02                    Scene 03                   Scene 04                    Scene 05
THE VOID               VOICE STUDIO                AUDIO WORLD                LANGUAGE PORTAL             FINALE REVEAL
Arrival & Core         Words to Sound              Acoustic Arena             29+ Langs In Space          Pullback & CTA
```

---

## 2. Detailed Scene-by-Scene Breakdown

### Scene 01: The Void / Arrival ($p = 0.00 \to 0.18$)
- **Narrative**: The user enters an infinite, silent digital cosmos. In the center floats the **AURA Core**—a suspended, refractive glass artifact containing dormant neural light.
- **Camera Coordinates**:
  - Position: $[0, 0, 7.5]$
  - Target: $[0, 0, 0]$
  - FOV: $45^\circ$
- **3D World State**:
  - Core rotating slowly ($0.15\text{ rad/s}$).
  - Ambient particle mist drifting in dark space.
  - Directional rim light highlights the glass silhouette.
- **DOM Overlay**:
  - Hero spatial typography: **AURA** in large editorial display.
  - Subtitle: *"Give words a voice."*
  - Floating scroll mouse prompt: *"Scroll to enter neural acoustic space."*
- **Transition ($0.12 \to 0.22$)**:
  - Camera accelerates smoothly forward ($Z: 7.5 \to 4.2$).
  - Hero typography gently glides past camera lens and dissolves into the void.

---

### Scene 02: Words Become Sound ($p = 0.22 \to 0.45$)
- **Narrative**: The user reaches the **Voice Studio Console**. Words entered into the console physically prepare to enter the AURA Core.
- **Camera Coordinates**:
  - Position: $[0, 0.4, 4.2]$
  - Target: $[0, 0, 0]$
  - FOV: $42^\circ$ (tightens slightly for focus)
- **3D World State**:
  - AURA Core floats directly behind the studio console, softly humming.
  - Particles begin organizing into geometric vector lines toward the Core.
- **DOM Overlay**:
  - Translucent Obsidian Studio Console:
    - Voice Persona Selector (10 voices with descriptive badges).
    - AI Model Engine Selector (Multilingual v2, Turbo v2.5, Flash).
    - Quick demo script chips (Movie Trailer, Sentient AI, Tech Keynote, ASMR).
    - Speech text input with character and word counters.
    - Acoustic Fine-Tuning Drawer (Stability, Similarity Boost, Style Exaggeration).
    - Tactile **Generate & Play** button.
- **Interactive State**:
  - When the user clicks *Generate & Play*:
    - The AURA Core pulses with energetic light.
    - Particles streak into the core's center.
    - Console glows cyan as neural synthesis contacts ElevenLabs API.

---

### Scene 03: Audio Becomes a World ($p = 0.45 \to 0.68$)
- **Narrative**: Sound waves burst into the physical environment. As ElevenLabs audio streams, the 3D world deforms and vibrates to the live frequencies of the voice.
- **Camera Coordinates**:
  - Position: $[1.8, 1.2, 5.0]$ (Cinematic three-quarters perspective)
  - Target: $[0, 0, 0]$
  - FOV: $48^\circ$
- **3D World State**:
  - **Parametric 3D Waveform Ribbon**: Extrudes across 3D space, rippling dynamically with real-time vocal harmonics.
  - **Radial Frequency Rings**: Expand and pulse with vocal energy.
  - **AURA Core Plasma**: Displaces vigorously with bass frequencies and emits chromatic dispersion.
  - **Audio-Reactive Particle Field**: Turbulently orbits the core in sync with vocal cadence.
- **DOM Overlay**:
  - Floating Glass Audio Player Arena:
    - Real-time vocal track name and persona indicator.
    - Interactive timeline scrubber with timestamp counters.
    - Volume control and Play/Pause/Replay triggers.
    - MP3 Download Button with neural stamp.

---

### Scene 04: Language Portal ($p = 0.68 \to 0.88$)
- **Narrative**: Voice transcends human borders. The AURA Core transforms into a polyglot language portal, allowing immediate cross-lingual translation into 29+ world languages.
- **Camera Coordinates**:
  - Position: $[-1.5, 0.5, 4.5]$ (Swings to an alternative spatial vantage point)
  - Target: $[0, 0, 0]$
  - FOV: $44^\circ$
- **3D World State**:
  - 3D Language Glyphs and orbital rings encircle the Core (Latin, Devanagari, Kanji, Cyrillic, Arabic).
  - Lighting transitions to atmospheric violet/indigo hue.
- **DOM Overlay**:
  - Language Portal Glass Console:
    - Source language and target language selectors (29+ languages).
    - Live translation workspace.
    - **"Send to Studio"** primary action button: automatically injects translated text into the Studio prompt, sets model to `eleven_multilingual_v2`, and smoothly flies the camera back to Scene 02.

---

### Scene 05: The Final Reveal ($p = 0.88 \to 1.00$)
- **Narrative**: The camera pulls dramatically backward into deep space. The complete constellation of voice—the Core, the orbital rings, the particle nebulae—is revealed as a unified monument to human speech.
- **Camera Coordinates**:
  - Position: $[0, 0, 11.5]$ (Deep wide-angle composition)
  - Target: $[0, 0, 0]$
  - FOV: $52^\circ$
- **3D World State**:
  - The entire 3D world is visible in harmonized equilibrium.
  - Soft ambient breathing rotation.
- **DOM Overlay**:
  - Epilogue copy:
    > *"Words are only the beginning."*
  - Monolithic AURA wordmark.
  - Narrative statement:
    > *"Turn written words into cinematic human voices."*
  - CTA Button: **"Return to Voice Studio"** (smoothly glides camera to Scene 02).
