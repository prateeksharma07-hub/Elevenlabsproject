import React from 'react';
import { useStudio } from '../state/studioState';
import { ArrowDown, Sparkles, Volume2, Radio } from 'lucide-react';

export const Scene01Arrival: React.FC = () => {
  const { scrollToScene } = useStudio();

  return (
    <div className="intro-container">
      <div className="intro-badge">
        <Sparkles size={12} className="accent-icon" />
        <span>ElevenLabs Neural Speech Architecture</span>
      </div>

      <h1 className="intro-title">
        AURA
      </h1>

      <p className="intro-tagline">
        Give words a voice.
      </p>

      {/* Visual Story: WORDS → VOICE → EXPERIENCE */}
      <div className="story-flow-diagram">
        <div className="story-node">
          <div className="story-step-num">01</div>
          <div className="story-step-title">WORDS</div>
          <div className="story-step-desc">Written scripts, dialogue &amp; thoughts</div>
        </div>

        <div className="story-connector">
          <div className="connector-line" />
          <Radio size={14} className="connector-icon" />
        </div>

        <div className="story-node active">
          <div className="story-step-num">02</div>
          <div className="story-step-title">VOICE</div>
          <div className="story-step-desc">ElevenLabs deep neural acoustic models</div>
        </div>

        <div className="story-connector">
          <div className="connector-line" />
          <Volume2 size={14} className="connector-icon" />
        </div>

        <div className="story-node">
          <div className="story-step-num">03</div>
          <div className="story-step-title">EXPERIENCE</div>
          <div className="story-step-desc">Lifelike cadence, breath &amp; emotion</div>
        </div>
      </div>

      <div className="intro-actions">
        <button
          type="button"
          className="intro-cta-btn"
          onClick={() => scrollToScene(2)}
        >
          <span>Open Voice Studio</span>
          <ArrowDown size={15} />
        </button>
      </div>
    </div>
  );
};
