# AURA — Immersive Technical Architecture
**Single-Canvas WebGL + React + Three.js + GSAP Hybrid System**
*Author: DeepMind Antigravity Design System & Architecture*

---

## 1. High-Level Architectural Diagram

```
+-----------------------------------------------------------------------------------+
|                                  AURA APP ROOT                                    |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                            GLOBAL STATE / CONTEXT                           |  |
|  |  * ElevenLabs Service (API key, voiceId, modelId, acoustic settings)        |  |
|  |  * Audio Engine (AudioContext, AnalyserNode, FFT byte array, isPlaying)     |  |
|  |  * Translation Engine (29+ languages, source/target text, auto-sync)       |  |
|  |  * Scroll / Camera Progress (lenis scroll, gsap timeline progress)          |  |
|  +-----------------------------------------------------------------------------+  |
|                                                                                   |
|  +-------------------------------------+  +------------------------------------+  |
|  |       PERSISTENT WEBGL CANVAS       |  |          DOM OVERLAY HUD           |  |
|  |       (React Three Fiber / R3F)     |  |         (Responsive HTML)          |  |
|  |                                     |  |                                    |  |
|  |  [Perspective Camera]               |  |  [Minimal Top Bar / Telemetry]     |  |
|  |    ^ controlled by GSAP Timeline    |  |  [Preloader / Boot Sequence]       |  |
|  |                                     |  |                                    |  |
|  |  [Scene Environment & Lighting]     |  |  [Scene 01: Hero Headline]         |  |
|  |  * Directional key + rim + ambient  |  |  [Scene 02: Studio Glass Console]  |  |
|  |                                     |  |     * Voice & Model dropdowns      |  |
|  |  [AURA Core Quantum Orb]            |  |     * Textarea prompt              |  |
|  |  * Dielectric glass outer shell     |  |     * Acoustic fine-tuning sliders |  |
|  |  * Noise plasma inner core (GLSL)   |  |     * Tactile Generate Button      |  |
|  |                                     |  |  [Scene 03: Audio Player Arena]    |  |
|  |  [Audio-Reactive World Objects]     |  |     * Timeline scrubber, Play/Stop |  |
|  |  * Parametric Waveform Ribbon       |  |     * MP3 download, status badge   |  |
|  |  * Radial FFT Frequency Rings       |  |  [Scene 04: Language Portal HUD]   |  |
|  |                                     |  |     * 29-lang selector, translate  |  |
|  |  [Dynamic Particle Mist]            |  |     * "Send to Studio" trigger     |  |
|  |  * 2,500 instanced particles        |  |  [Scene 05: Finale Wordmark & CTA] |  |
|  |  * Audio turbulence displacement    |  |                                    |  |
|  |                                     |  |  [Float Navigation Dots / Compass] |  |
|  |  [Language Portal Rings]            |  |                                    |  |
|  |  * Spatial glyph rings (3D text)    |  |                                    |  |
|  +-------------------------------------+  +------------------------------------+  |
+-----------------------------------------------------------------------------------+
```

---

## 2. Directory Structure Blueprint

```
Elevenlabproject/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx                      # Vite React entry point
│   ├── App.tsx                       # Root orchestrator (Canvas + DOM overlays)
│   ├── three/                        # 3D Graphics Subsystem (R3F)
│   │   ├── CanvasContainer.tsx       # Persistent Canvas, DPR limits, Performance monitoring
│   │   ├── CameraRig.tsx             # Cinematic camera controlled by ScrollTrigger
│   │   ├── SceneWorld.tsx            # Lighting, fog, ambient environment
│   │   ├── AuraCore.tsx              # Central refractive glass orb + plasma shader
│   │   ├── ParticleField.tsx         # Instanced particle system with audio curl noise
│   │   ├── WaveformRibbon.tsx        # Extruded 3D ribbon responding to FFT analyser
│   │   ├── LanguageRing.tsx          # 3D spatial language glyphs in orbital formation
│   │   └── shaders/
│   │       ├── plasma.vert.glsl      # Vertex displacement driven by frequency bands
│   │       └── plasma.frag.glsl      # Chromatic iridescent plasma fragment shader
│   ├── dom/                          # HTML Overlays & Interactive Interfaces
│   │   ├── Navigation.tsx            # Floating spatial compass & scene jump triggers
│   │   ├── Preloader.tsx             # Cinematic boot sequence with safe timeout
│   │   ├── Scene01Arrival.tsx        # Spatial typography & introductory copy
│   │   ├── Scene02Studio.tsx         # Voice Studio Console (Text, Voice, Sliders, Gen)
│   │   ├── Scene03Visualizer.tsx     # Player Dock, Audio Scrubber, Download, Telemetry
│   │   ├── Scene04Language.tsx       # Language Portal selector & "Send to Studio"
│   │   └── Scene05Finale.tsx         # Final wordmark & return CTA
│   ├── services/                     # Business Logic (No visual dependencies)
│   │   ├── elevenlabs.ts             # Direct ElevenLabs TTS synthesis & error handling
│   │   ├── translation.ts            # Multi-language translation API client
│   │   └── audioContext.ts           # Web Audio API singleton, AnalyserNode manager
│   ├── hooks/                        # Custom React Hooks
│   │   ├── useAudioAnalyser.ts       # Subscribes to real-time FFT frequency bands
│   │   ├── useScrollCinematics.ts    # Binds Lenis + GSAP ScrollTrigger to camera
│   │   └── useKeyboardShortcuts.ts   # Ctrl+Enter to generate, Space to play/pause
│   ├── state/
│   │   └── useStudioStore.ts         # Lightweight unified state (Zustand or React Context)
│   └── styles/
│       ├── tokens.css                # CSS variables, typography, glassmorphism
│       └── app.css                   # Layout, HUD overlays, responsiveness
└── docs/                             # Engineering & Design Specifications
```

---

## 3. WebGL Canvas Lifecycle & Synchronization

1. **Single Canvas Exclusivity**:
   - Exactly ONE WebGL canvas mounted at the root (`z-index: 1`), covering `100vw x 100vh` fixed.
   - The scroll container (`z-index: 2`, `pointer-events: none`) has `height: 500vh`.
   - Interactive DOM cards use `pointer-events: auto` to allow direct, uninhibited interaction with inputs, buttons, and selects.

2. **Lenis & ScrollTrigger Union**:
   - Lenis drives smooth virtual scroll.
   - Lenis `scroll` events trigger `ScrollTrigger.update()`.
   - GSAP's `ticker` drives both Lenis `raf` and Three.js frame render loops in strict synchronization, eliminating any phase jitter or frame tearing.

3. **Audio-Driven WebGL Loop**:
   - In `useFrame((state, delta))`, the real Web Audio `AnalyserNode.getByteFrequencyData` samples the live stream.
   - Four normalized scalar uniforms are updated per frame:
     - `uTime += delta`
     - `uBass` (Average of bins 0–8)
     - `uMid` (Average of bins 9–32)
     - `uTreble` (Average of bins 33–64)
     - `uEnergy` (Overall RMS audio power)
   - When audio is paused/idle, uniforms decay softly to 0 via exponential lerp, leaving calm, breathing ambient motion without expensive calculations.
