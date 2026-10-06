import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface CinematicLoaderProps {
  onComplete: () => void;
}

export const CinematicLoader: React.FC<CinematicLoaderProps> = ({ onComplete }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const typoRef = useRef<HTMLDivElement>(null);
  const [isExiting, setIsExiting] = useState(false);
  const hasFinishedRef = useRef(false);

  const completeLoading = () => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    try {
      sessionStorage.setItem('aura_loader_seen', 'true');
    } catch (e) {}

    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  useEffect(() => {
    // Quick skip if already seen this session
    let isQuick = false;
    try {
      if (sessionStorage.getItem('aura_loader_seen') === 'true') {
        isQuick = true;
      }
    } catch (e) {}

    // Failsafe watchdog timer (guaranteed max 1.5s under any condition)
    const watchdog = setTimeout(() => {
      completeLoading();
    }, isQuick ? 300 : 1500);

    // Global key listener to skip immediately on any key
    const handleKey = () => completeLoading();
    window.addEventListener('keydown', handleKey);

    // Three.js Scene Setup
    const container = mountRef.current;
    if (!container) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    let scene: THREE.Scene | null = new THREE.Scene();
    scene.background = new THREE.Color(0x020408);
    scene.fog = new THREE.FogExp2(0x020408, 0.04);

    let camera: THREE.PerspectiveCamera | null = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 6.2);

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      container.appendChild(renderer.domElement);
    } catch (e) {
      console.warn('[AURA] WebGL fallback triggered in loader', e);
      completeLoading();
      return () => {
        clearTimeout(watchdog);
        window.removeEventListener('keydown', handleKey);
      };
    }

    // 1. Central Point Light
    const corePointLight = new THREE.PointLight(0x38bdf8, 0.8, 15, 2);
    corePointLight.position.set(0, 0, 0);
    scene.add(corePointLight);

    const ambientLight = new THREE.AmbientLight(0x0a101d, 0.6);
    scene.add(ambientLight);

    // 2. Subtle 3D Particle Field
    const particleCount = 1800;
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      const radius = 1.0 + Math.random() * 8.0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.035,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // 3. AURA Core Group
    const coreGroup = new THREE.Group();
    coreGroup.scale.set(0.01, 0.01, 0.01);
    scene.add(coreGroup);

    // Outer Shell
    const glassGeometry = new THREE.SphereGeometry(1.0, 32, 32);
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.15,
      metalness: 0.8,
      transparent: true,
      opacity: 0.7,
      wireframe: false,
    });
    const glassSphere = new THREE.Mesh(glassGeometry, glassMaterial);
    coreGroup.add(glassSphere);

    // Inner Radiant Energy Core
    const innerGeometry = new THREE.IcosahedronGeometry(0.68, 2);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0x051329,
      emissive: 0x38bdf8,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8,
    });
    const innerOrb = new THREE.Mesh(innerGeometry, innerMaterial);
    coreGroup.add(innerOrb);

    // Orbital Rings
    const ring1Geom = new THREE.TorusGeometry(1.4, 0.014, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.8,
    });
    const ring1 = new THREE.Mesh(ring1Geom, ring1Mat);
    ring1.rotation.x = Math.PI * 0.35;
    coreGroup.add(ring1);

    const ring2Geom = new THREE.TorusGeometry(1.68, 0.01, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({
      color: 0x818cf8,
      transparent: true,
      opacity: 0.7,
    });
    const ring2 = new THREE.Mesh(ring2Geom, ring2Mat);
    ring2.rotation.x = -Math.PI * 0.28;
    ring2.rotation.y = Math.PI * 0.2;
    coreGroup.add(ring2);

    // Animation Loop
    let animId: number;
    const startTime = performance.now();
    const duration = isQuick ? 0.3 : 1.2; // Fast punchy 1.2s entrance

    const handleResize = () => {
      if (!camera || !renderer) return;
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    const renderLoop = (time: number) => {
      animId = requestAnimationFrame(renderLoop);
      if (!scene || !camera || !renderer) return;

      const elapsed = (time - startTime) / 1000;
      const progress = Math.min(1, elapsed / duration);

      // Fast expansion
      const scaleVal = THREE.MathUtils.lerp(0.01, 1.0, Math.min(1, progress * 2.5));
      coreGroup.scale.set(scaleVal, scaleVal, scaleVal);

      // Camera zooms smoothly toward core
      if (progress > 0.4) {
        const camEase = (progress - 0.4) / 0.6;
        camera.position.z = THREE.MathUtils.lerp(6.2, 1.8, camEase * camEase);
      }

      // Show typography at 40% progress
      if (progress >= 0.4 && typoRef.current) {
        typoRef.current.classList.add('visible');
      }

      // Optical flash at finish
      if (progress >= 0.85 && veilRef.current) {
        const flashP = (progress - 0.85) / 0.15;
        veilRef.current.style.opacity = `${Math.sin(flashP * Math.PI) * 0.8}`;
      }

      // Finish at 100% progress
      if (progress >= 1.0) {
        if (veilRef.current) veilRef.current.style.opacity = '0';
        completeLoading();
      }

      // Continuous rotation
      coreGroup.rotation.y += 0.02;
      ring1.rotation.z += 0.025;
      ring2.rotation.z -= 0.02;
      particles.rotation.y += 0.003;

      try {
        renderer.render(scene, camera);
      } catch (err) {
        completeLoading();
      }
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      clearTimeout(watchdog);
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);

      if (renderer && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      particleGeometry.dispose();
      particleMaterial.dispose();
      glassGeometry.dispose();
      glassMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      ring1Geom.dispose();
      ring1Mat.dispose();
      ring2Geom.dispose();
      ring2Mat.dispose();
      if (renderer) renderer.dispose();
      scene = null;
      camera = null;
      renderer = null;
    };
  }, []);

  return (
    <div
      className={`cinematic-loader-layer ${isExiting ? 'fade-out' : ''}`}
      onClick={completeLoading}
      onTouchStart={completeLoading}
      style={{ cursor: 'pointer' }}
      title="Click anywhere to enter"
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="loader-canvas-mount" />

      {/* Optical Core Light Veil / Flash Transition */}
      <div
        ref={veilRef}
        className="loader-optical-veil"
        style={{
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Typography Emerges */}
      <div ref={typoRef} className="loader-typography">
        <h1 className="loader-title">AURA</h1>
        <div className="loader-subline">
          <span className="subline-dot" />
          <span>INITIALIZING VOICE ENGINE</span>
        </div>
      </div>

      {/* Immediate Skip / Enter Button */}
      <button
        type="button"
        className="loader-skip-btn"
        onClick={(e) => {
          e.stopPropagation();
          completeLoading();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(56, 189, 248, 0.15)',
          border: '1.5px solid rgba(56, 189, 248, 0.4)',
          color: '#ffffff',
          boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)',
        }}
      >
        <span>ENTER STUDIO</span>
        <span>&rarr;</span>
      </button>
    </div>
  );
};
