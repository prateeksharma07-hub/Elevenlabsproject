import React from 'react';
import { useStudio } from '../state/studioState';
import { ArrowUp, Sparkles } from 'lucide-react';

export const Scene05Finale: React.FC = () => {
  const { scrollToScene } = useStudio();

  return (
    <div className="ending-container">
      <div className="ending-kicker">
        <span>Words are only the beginning.</span>
      </div>

      <h2 className="ending-title">
        AURA
      </h2>

      <p className="ending-tagline">
        Turn written words into cinematic human voices.
      </p>

      <div className="ending-cta-row">
        <button
          type="button"
          className="ending-cta-btn"
          onClick={() => scrollToScene(2)}
        >
          <Sparkles size={15} />
          <span>Create a Voice</span>
          <ArrowUp size={14} />
        </button>
      </div>

      <div className="ending-micro-footer">
        <span>AURA © Powered by ElevenLabs Neural Acoustics</span>
        <span className="dot-sep">·</span>
        <span>Real-Time Web Audio Engine</span>
      </div>
    </div>
  );
};
