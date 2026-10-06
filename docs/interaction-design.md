# AURA — Interaction Design & Tactile Physics
**Interaction Model, Micro-Animations, and Spatial Feedback**
*Author: DeepMind Antigravity Design System & Architecture*

---

## 1. Interaction Principles

1. **Physical Tangibility**: Every UI surface feels like crafted dielectric glass or brushed obsidian metal. Buttons have weight, spring, and tactile return.
2. **Harmonious Parallax**: Mouse movements create subtle, organic camera parallax (max $\pm 0.2$ in $X, Y$) that gives continuous spatial feedback without inducing motion fatigue.
3. **Audio-Haptic Continuity**: Real-time audio drives visual deformation in the 3D world; interactive controls acknowledge generation states with coordinated light pulses.
4. **Non-Blocking Reliability**: Interactive controls (inputs, selects, sliders, buttons) are standard HTML DOM elements with full keyboard accessibility, focus rings, and zero input lag.

---

## 2. Interaction Matrix

| Interaction | Trigger | Visual & Spatial Response | Audio Response |
| :--- | :--- | :--- | :--- |
| **Pointer Motion** | User moves mouse across viewport | Camera gently tilts and pans ($\Delta X \pm 0.15, \Delta Y \pm 0.1$). AURA Core surface reflections shift dynamically. | None |
| **Scroll Travel** | Wheel / Trackpad / Touch swipe | Lenis interpolates smooth virtual position; GSAP drives Three.js Camera along cinematic spline path; DOM overlays fade in/out at focal planes. | Ambient spatial presence |
| **Hover on 3D Core** | Pointer enters central core region | Core emissive intensity rises from $1.0 \to 1.8$; rotation rate subtly accelerates; particle field draws slightly inward. | Subtle micro-hum (optional) |
| **Demo Script Chip Click** | User selects "Movie Trailer", "Sentient AI", etc. | Text instantly fills textarea; recommended voice persona auto-selects with subtle cyan highlight pulse on voice dropdown. | System click |
| **Click "Generate & Play"** | User triggers TTS synthesis | Button state shifts to "Synthesizing..."; Core pulses with energetic plasma rings; particles streak into core; HTTP request dispatched to ElevenLabs API. | Audio begins streaming via Web Audio API upon return |
| **Live Audio Playback** | Audio streaming in progress | AnalyserNode drives `uBass`, `uMid`, `uTreble` in real time; 3D Waveform Ribbon ripples; Core geometry pulses; timeline progress bar advances. | Neural synthesized speech |
| **Language Selection** | User picks target language in Portal | Portal ambient lighting shifts to designated language hue; 3D language rings rotate to bring corresponding glyph forward. | Translation preview |
| **Click "Send to Studio"** | User sends translated copy to studio | Translated text copied into textarea; Model auto-switched to `eleven_multilingual_v2`; Camera smoothly glides back to Scene 02. | Mode confirmation |

---

## 3. Keyboard Shortcuts & Accessibility

- **`Ctrl + Enter` (or `Cmd + Enter`)**: Instantly trigger *Generate & Play* from anywhere within the studio.
- **`Spacebar`**: Toggle Play / Pause on active audio track (when not focusing text input).
- **`Tab` / `Shift + Tab`**: Sequential logical focus navigation through all DOM controls with high-contrast accessibility focus rings.
- **`prefers-reduced-motion`**:
  - Automatically dampens camera translation to gentle cross-fades.
  - Halts particle curl noise and excessive 3D rotations.
  - Preserves 100% of audio generation, playback, translation, and UI features.
