import React from 'react';
import { useStudio } from '../state/studioState';

export const Scene01Arrival: React.FC = () => {
  const { scrollProgress, scrollToScene } = useStudio();

  // Opacity calculation for smooth cinematic dissolution
  let opacity = 1;
  if (scrollProgress > 0.12) {
    opacity = Math.max(0, 1 - (scrollProgress - 0.12) / 0.10);
  }

  const pointerEvents = opacity > 0.1 ? 'auto' : 'none';

  return (
    <div
      className="scene-overlay-stage"
      style={{
        opacity,
        pointerEvents,
        transform: `translateY(${-scrollProgress * 60}px)`,
        transition: 'opacity 0.1s linear',
      }}
    >
      <div className="hero-stage">
        <div className="hero-tag">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-cyan)' }} />
          Zero-Latency Neural Speech Synthesis
        </div>

        <h1 className="hero-headline">
          Turn Written Words into<br />
          <span className="gradient">Cinematic Human Voices</span>
        </h1>

        <p className="hero-subtitle">
          Powered by ElevenLabs state-of-the-art acoustic AI. Experience emotional depth, lifelike intonation, and physical sound in a 3D living world.
        </p>

        <div className="scroll-prompt" onClick={() => scrollToScene(2)}>
          <div className="mouse-indicator">
            <div className="mouse-dot" />
          </div>
          <span>Scroll to enter 3D Neural Studio</span>
        </div>
      </div>
    </div>
  );
};
