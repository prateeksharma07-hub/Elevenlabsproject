# AURA — Performance Optimization & Hardware Scaling Plan
**Target: 60 FPS on Standard Student Laptops & Mobile Devices**
*Author: DeepMind Antigravity Design System & Architecture*

---

## 1. Hardware Performance Tiers

| Tier | Target Devices | Render Strategy | Particle Count | Post-Processing | Max DPR |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Tier 1 (High)** | Modern Desktop / M-Series Mac | Full PBR Transmission + Custom Shaders | 3,000 instanced | Selective Bloom & Vignette | $1.5$ |
| **Tier 2 (Mid / Student)** | Typical Laptop / Integrated GPU | Simplified Glass + GLSL Plasma Shader | 1,200 instanced | Lightweight Bloom | $1.25$ |
| **Tier 3 (Mobile / Low)** | Smartphones / Weak Mobile GPUs | Optimized Matte-Glass + Vertex Shaders | 500 instanced | None (Pure WebGL) | $1.0$ |

---

## 2. Core Rendering Optimizations

1. **Instanced Mesh Particle System (`THREE.InstancedMesh`)**:
   - Instead of 3,000 separate mesh instances and draw calls, ONE single `InstancedMesh` with a single draw call renders the entire particle field.
   - Matrices and colors updated in a compact `Float32Array` or vertex shader attributes.

2. **Strict Device Pixel Ratio (DPR) Clamping**:
   - Default high-res displays request DPR 2.0 or 3.0, quadrupling the pixel fragment shader workload ($4\times - 9\times$).
   - AURA strictly clamps DPR: `dpr={Math.min(window.devicePixelRatio, 1.5)}`.
   - On mobile devices, capped at `1.0`.

3. **Geometry & Material Sharing**:
   - Reusable `IcosahedronGeometry`, `PlaneGeometry`, and `CylinderGeometry` shared across components.
   - Zero redundant allocations during scroll transitions.

4. **Web Audio Analyser Throttling**:
   - The `AnalyserNode.getByteFrequencyData` runs inside the existing RAF loop.
   - Frequency band calculations (bass, mid, treble) use efficient pointer arithmetic over a fixed 256-byte buffer, requiring less than $0.05\text{ ms}$ of CPU time per frame.

5. **Lenis & ScrollTrigger Single Ticker Union**:
   - Exactly ONE ticker driving Lenis and GSAP ScrollTrigger updates, eliminating duplicate scroll listeners or micro-stutters.

6. **Reduced Motion & Thermal Guard**:
   - Automatically detects `window.matchMedia('(prefers-reduced-motion: reduce)')`.
   - If frame rate drops below 30 FPS for more than 3 consecutive seconds, dynamically downscales particle count and disables bloom pass automatically.
