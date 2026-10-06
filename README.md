# 🎙️ AURA // ElevenLabs Next-Gen Neural Voice Studio

A state-of-the-art, award-winning Text-to-Speech web application integrating the **ElevenLabs API** with real-time waveform visualizers, glassmorphism aesthetics, dynamic voice models, and presentation-ready demo scripts.

Built with **HTML5, Vanilla CSS, Tailwind CSS CDN, and Modern Vanilla JavaScript** — zero bundlers or build steps required. Runs out of the box with the VS Code **Live Server** extension.

---

## ⚡ Quick Start

### 1. Launch with npm (Recommended)
Run in your terminal:
```bash
npm run dev
```
*(Or `npm start`)* — this automatically fires up the ultra-fast Vite dev server and opens your browser.

### 2. Launch with VS Code Live Server
1. Ensure you have the **"Live Server"** extension installed (`ritwickdey.liveserver`).
2. Right-click [`index.html`](file:///c:/Users/jarvi/OneDrive/Desktop/New%20folder/Elevenlabproject/index.html) and select **"Open with Live Server"** (or click *Go Live* in the bottom status bar).
3. The application will launch in your browser at `http://127.0.0.1:5500/index.html`.

---

## 🔑 ElevenLabs API Key Integration

The ElevenLabs API key is pre-integrated into the application for seamless plug-and-play operation:
- **Direct Engine Integration**: Embedded in [`app.js`](file:///c:/Users/jarvi/OneDrive/Desktop/New%20folder/Elevenlabproject/app.js) and backed by [`.env.local`](file:///c:/Users/jarvi/OneDrive/Desktop/New%20folder/Elevenlabproject/.env.local).
- **Clean UI**: No API key sections, modals, or inputs are exposed in the frontend interface, keeping the UI minimal and focused on creation.

---

## ✨ Key Features & Architecture

- **UI / UX Glassmorphic Design**:
  - Futuristic Dark Mode with deep purple, electric cyan, and indigo accents.
  - Floating ambient animated aurora mesh orbs with cybernetic grid overlay.
  - Glowing active border focus on the text area and primary action button.
- **Studio Ambient Color Themes (New)**:
  - 5 interactive neon palettes selectable directly in the footer: **Cyber Neon** (Cyan/Violet), **Matrix Green** (Emerald/Teal), **Crimson Dusk** (Rose/Ruby), **Solar Flare** (Gold/Amber), and **Synthwave** (Magenta/Purple).
  - Instant dynamic chromatic recalibration of glowing borders, canvas visualizers, ambient lighting, and buttons with persistent storage (`localStorage`).
- **Futuristic Entry Loading Screen & Section Transitions (New)**:
  - Cybernetic preloader splash screen with telemetry boot sequence, progress meter, and acoustic calibration readout.
  - Smooth scroll-reveal transitions (`IntersectionObserver`) with flowing light beams and cascading energy connector lines (`01 // STUDIO`, `02 // POLYGLOT TRANSLATION`, `03 // ARCHITECTURE`).
  - Professional glassmorphic footer with live pipeline status, quick section jumps, and keyboard shortcut tips.
- **Dynamic Web Audio API Visualizer**:
  - Live HTML5 Canvas connected to `AudioContext` and `AnalyserNode`.
  - Frequency bars dynamically dance in real-time to the synthesized audio playback.
  - Ambient glowing resting wave animation when idle.
- **ElevenLabs Neural Polyglot & Speech Translation (New)**:
  - Dedicated interactive translation div with instant cross-lingual translation across 29+ languages.
  - Native presets for Spanish, French, German, Japanese, Hindi, Italian, Portuguese, Chinese, Korean, Arabic, Russian, and Dutch.
  - One-click **"Send to Studio & Synthesize"** automatically configures `eleven_multilingual_v2` and triggers native acoustic speech generation.
- **Popular ElevenLabs Voices Included**:
  - **Rachel** (`21m00Tcm4TlvDq8ikWAM`): Calm, expressive & conversational
  - **Adam** (`pNInz6obpgDQGcFmaJgB`): Deep, warm cinematic narrator
  - **Clyde** (`2EiwWnXFnvU5JabPnv8n`): Gritty, dramatic veteran
  - **Drew** (`29vD33N1CtxCmqQRPOHJ`): Energetic broadcaster
  - **Bella** (`EXAVITQu4vr4xnSDxMaL`): Narrative audiobook storyteller
  - **Nicole** (`piTKgcLEGmPE4e6mEKli`): Soft, soothing ASMR whisper
  - **Antoni** (`ErXwobaYiN019PkySvjV`): Commercial & authoritative
  - **Freya** (`jsCqWAovK2LkecY7zXl4`): Vibrant & enthusiastic
- **Model Selection**:
  - `eleven_multilingual_v2` (Highest fidelity, 29 languages)
  - `eleven_turbo_v2_5` (Ultra-low latency)
  - `eleven_turbo_v2` (High-speed conversational)
  - `eleven_monolingual_v1` (Classic English standard)
  - `eleven_flash_v2_5` (Sub-100ms real-time)
- **Acoustic Pro Sliders**:
  - Stability, Clarity & Similarity Boost, and Style Exaggeration.
- **Demo-Ready Script Presets**:
  - 🎬 *Blockbuster Movie Trailer* (pairs with Adam)
  - 🤖 *Sentient AI Awakening* (pairs with Rachel)
  - 🚀 *Tech Product Keynote* (pairs with Antoni)
  - 🌿 *Relaxing Deep Meditation* (pairs with Nicole)
- **Audio Controls**:
  - Play / Stop toggle
  - Interactive clickable timeline scrubber
  - Time indicator (`0:00 / 0:00`)
  - Volume slider with mute button
  - Replay button
  - **One-click MP3 Audio Download**
- **Graceful Error Handling**:
  - Floating toast notifications for missing API keys, empty text, quota limits (429), and invalid credentials (401).
- **Keyboard Shortcut**:
  - Press `Ctrl + Enter` (or `Cmd + Enter`) anywhere in the textarea to instantly generate and play.

---

## 🏆 Presentation Demo Tips

1. **Select the "🎬 Blockbuster Movie Trailer" Preset**:
   - It will automatically set the voice to **Adam** and populate high-drama text.
2. **Hit "Generate & Play Voice"**:
   - The button transitions into a sleek loading spinner and communicates with ElevenLabs.
3. **Show off the Waveform Visualizer**:
   - When Adam's deep voice plays, point out the neon equalizer bars dancing on the canvas.
4. **Click "Download MP3"**:
   - Demonstrates production-readiness for content creators, game devs, and podcasters.
