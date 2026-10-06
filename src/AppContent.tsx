import React, { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useStudio } from './state/studioState';
import { CanvasContainer } from './three/CanvasContainer';
import { Preloader } from './dom/Preloader';
import { Navigation } from './dom/Navigation';
import { Scene01Arrival } from './dom/Scene01Arrival';
import { Scene02Studio } from './dom/Scene02Studio';
import { Scene03Visualizer } from './dom/Scene03Visualizer';
import { Scene04Language } from './dom/Scene04Language';
import { Scene05Finale } from './dom/Scene05Finale';
import './styles/app.css';

gsap.registerPlugin(ScrollTrigger);

export const AppContent: React.FC = () => {
  const {
    setScrollProgress,
    setActiveScene,
    setPointer,
    toast,
    togglePlayPause,
  } = useStudio();

  // 1. Lenis Smooth Virtual Scrolling synchronized with GSAP
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -7 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.1,
    });

    (window as any).lenis = lenis;

    lenis.on('scroll', () => {
      ScrollTrigger.update();
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    // 2. ScrollTrigger tracking 500vh scroll corridor
    const corridor = document.getElementById('scroll-corridor');
    if (corridor) {
      ScrollTrigger.create({
        trigger: corridor,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.25,
        onUpdate: (self) => {
          const p = self.progress;
          setScrollProgress(p);

          // Active scene detection
          if (p < 0.20) {
            setActiveScene(1);
          } else if (p < 0.48) {
            setActiveScene(2);
          } else if (p < 0.70) {
            setActiveScene(3);
          } else if (p < 0.88) {
            setActiveScene(4);
          } else {
            setActiveScene(5);
          }
        },
      });
    }

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [setScrollProgress, setActiveScene]);

  // 3. Pointer Parallax Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
      setPointer({ x: normalizedX, y: normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [setPointer]);

  // 4. Global Keyboard Shortcuts (Space to play/pause when not in input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const tag = (document.activeElement?.tagName || '').toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          togglePlayPause();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlayPause]);

  return (
    <div className="aura-app">
      {/* 1. Cinematic Non-Blocking Bootloader */}
      <Preloader />

      {/* 2. Single Persistent 3D WebGL Canvas */}
      <CanvasContainer />

      {/* 3. 500vh Virtual Scroll Depth Corridor */}
      <div className="scroll-corridor" id="scroll-corridor" />

      {/* 4. Spatial DOM Overlays Viewport */}
      <div className="hud-viewport">
        <Navigation />

        <Scene01Arrival />
        <Scene02Studio />
        <Scene03Visualizer />
        <Scene04Language />
        <Scene05Finale />
      </div>

      {/* 5. Toast Feedback Container */}
      {toast && (
        <div className="toast-container">
          <div className={`toast-pill ${toast.type}`}>
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};
