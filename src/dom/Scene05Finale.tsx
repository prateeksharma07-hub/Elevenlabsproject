import React from 'react';
import { useStudio } from '../state/studioState';
import { RotateCcw } from 'lucide-react';

export const Scene05Finale: React.FC = () => {
  const { scrollProgress, scrollToScene } = useStudio();

  // Opacity window around Scene 05
  let opacity = 0;
  if (scrollProgress >= 0.88) {
    opacity = Math.min(1, (scrollProgress - 0.88) / 0.08);
  }

  const pointerEvents = opacity > 0.3 ? 'auto' : 'none';

  return (
    <div
      className="scene-overlay-stage"
      style={{
        opacity,
        pointerEvents,
        transition: 'opacity 0.1s linear',
      }}
    >
      <div className="hero-stage" style={{ maxWidth: '780px' }}>
        <p style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--accent-cyan)', marginBottom: '16px' }}>
          Words are only the beginning.
        </p>

        <h2 className="hero-headline" style={{ fontSize: 'clamp(52px, 8vw, 92px)', marginBottom: '18px' }}>
          AURA
        </h2>

        <p className="hero-subtitle" style={{ marginBottom: '36px' }}>
          Turn written words into cinematic human voices. Experience emotional depth, lifelike intonation, and physical sound in a living 3D world.
        </p>

        <button
          type="button"
          className="generate-btn"
          style={{ display: 'inline-flex', padding: '14px 32px', margin: '0 auto' }}
          onClick={() => scrollToScene(2)}
        >
          <RotateCcw size={16} />
          <span>Return to Voice Studio</span>
        </button>
      </div>
    </div>
  );
};
