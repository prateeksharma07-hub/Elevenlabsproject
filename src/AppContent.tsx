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

  // 1. Lenis Smooth Virtual Scrolling synchronized with 3D Canvas
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -7 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.95,
      touchMultiplier: 1.1,
    });

    (window as any).lenis = lenis;

    const sections = ['intro', 'studio', 'visualizer', 'translation', 'ending'];

    lenis.on('scroll', ({ progress }: any) => {
      ScrollTrigger.update();
      setScrollProgress(progress);

      // Robust active scene detection based on section elements in viewport
      const windowHeight = window.innerHeight;
      for (let i = 0; i < sections.length; i++) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= windowHeight * 0.5 && rect.bottom >= windowHeight * 0.25) {
            setActiveScene(i + 1);
            break;
          }
        }
      }
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      delete (window as any).lenis;
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [setScrollProgress, setActiveScene]);

  // 2. Pointer Parallax Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const normalizedX = (e.clientX / window.innerWidth) * 2 - 1;
      const normalizedY = (e.clientY / window.innerHeight) * 2 - 1;
      setPointer({ x: normalizedX, y: normalizedY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [setPointer]);

  // 3. Global Keyboard Shortcuts (Space to play/pause when not in inputs)
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
      {/* 1. Cinematic Non-Blocking 3D Bootloader (3.5s - 4.5s) */}
      <Preloader />

      {/* 2. Single Persistent 3D WebGL Canvas (Atmosphere, Core, Waveform) */}
      <CanvasContainer />

      {/* 3. Floating Minimal Navigation */}
      <Navigation />

      {/* 4. Real Vertical Page Flow (3D = Story, 2D = Product) */}
      <main className="aura-main-content">
        <section id="intro" className="page-section section-intro">
          <Scene01Arrival />
        </section>

        <section id="studio" className="page-section section-studio">
          <Scene02Studio />
        </section>

        <section id="visualizer" className="page-section section-visualizer">
          <Scene03Visualizer />
        </section>

        <section id="translation" className="page-section section-translation">
          <Scene04Language />
        </section>

        <section id="ending" className="page-section section-ending">
          <Scene05Finale />
        </section>
      </main>

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

export default AppContent;
