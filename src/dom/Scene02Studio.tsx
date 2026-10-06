import React, { useState } from 'react';
import { useStudio } from '../state/studioState';
import { VOICES, MODELS } from '../services/elevenlabs';
import { Play, Square, Sliders, Sparkles } from 'lucide-react';

export const Scene02Studio: React.FC = () => {
  const {
    text,
    setText,
    voiceId,
    setVoiceId,
    modelId,
    setModelId,
    stability,
    setStability,
    similarity,
    setSimilarity,
    style,
    setStyle,
    isGenerating,
    loadDemoScript,
    isPlaying,
    stopAudio,
    handleGenerate,
    scrollProgress,
  } = useStudio();

  const [showSliders, setShowSliders] = useState<boolean>(true);

  // Opacity window around Scene 02 focal plane
  let opacity = 0;
  if (scrollProgress >= 0.22 && scrollProgress <= 0.48) {
    opacity = 1;
  } else if (scrollProgress > 0.14 && scrollProgress < 0.22) {
    opacity = (scrollProgress - 0.14) / 0.08;
  } else if (scrollProgress > 0.48 && scrollProgress < 0.56) {
    opacity = 1 - (scrollProgress - 0.48) / 0.08;
  }

  const pointerEvents = opacity > 0.3 ? 'auto' : 'none';
  const selectedVoice = VOICES.find((v) => v.id === voiceId);
  const selectedModel = MODELS.find((m) => m.id === modelId);

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div
      className="scene-overlay-stage"
      style={{
        opacity,
        pointerEvents,
        transition: 'opacity 0.1s linear',
      }}
    >
      <div className="glass-console">
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
              01
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Voice Synthesis & Studio Console
            </span>
          </div>

          <button
            type="button"
            className="chip-btn"
            style={{ padding: '4px 10px', fontSize: '11px' }}
            onClick={() => setShowSliders(!showSliders)}
          >
            <Sliders size={12} />
            <span>{showSliders ? 'Hide Acoustics' : 'Fine-Tune'}</span>
          </button>
        </div>

        {/* 1. Voice & Model Selectors */}
        <div className="control-grid-2">
          {/* Voice */}
          <div>
            <div className="field-label">
              <span>Voice Persona</span>
              <span className="field-tag">{selectedVoice?.tag}</span>
            </div>
            <div className="select-wrap">
              <select
                className="glass-select"
                value={voiceId}
                onChange={(e) => setVoiceId(e.target.value)}
              >
                {VOICES.map((v) => (
                  <option key={v.id} value={v.id} style={{ background: '#090e17', color: '#fff' }}>
                    {v.name} — {v.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Model */}
          <div>
            <div className="field-label">
              <span>Model Engine</span>
              <span className="field-tag" style={{ color: 'var(--accent-indigo)', borderColor: 'rgba(99, 102, 241, 0.3)', background: 'rgba(99, 102, 241, 0.1)' }}>
                {selectedModel?.badge}
              </span>
            </div>
            <div className="select-wrap">
              <select
                className="glass-select"
                value={modelId}
                onChange={(e) => setModelId(e.target.value)}
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id} style={{ background: '#090e17', color: '#fff' }}>
                    {m.name} — {m.desc}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Demo Script Chips */}
        <div className="chips-tray">
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginRight: '4px' }}>
            Presets:
          </span>
          <button type="button" className="chip-btn" onClick={() => loadDemoScript('trailer')}>
            <Sparkles size={12} color="var(--accent-cyan)" />
            Movie Trailer
          </button>
          <button type="button" className="chip-btn" onClick={() => loadDemoScript('ai')}>
            <Sparkles size={12} color="var(--accent-indigo)" />
            Sentient AI
          </button>
          <button type="button" className="chip-btn" onClick={() => loadDemoScript('keynote')}>
            <Sparkles size={12} color="var(--accent-amber)" />
            Tech Keynote
          </button>
          <button type="button" className="chip-btn" onClick={() => loadDemoScript('asmr')}>
            <Sparkles size={12} color="var(--accent-emerald)" />
            Meditation ASMR
          </button>
        </div>

        {/* 3. Text Prompt */}
        <div className="textarea-wrap">
          <textarea
            className="glass-textarea"
            placeholder="Type or paste text to synthesize with ElevenLabs..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          <div className="textarea-footer">
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
            <span style={{ color: 'var(--text-secondary)' }}>Ctrl + Enter to Generate</span>
          </div>
        </div>

        {/* 4. Acoustic Fine-Tuning Drawer */}
        {showSliders && (
          <div className="sliders-drawer">
            <div className="slider-unit">
              <div className="slider-unit-header">
                <span>Stability</span>
                <span style={{ color: 'var(--accent-cyan)' }}>{stability.toFixed(2)}</span>
              </div>
              <input
                type="range"
                className="slider-input"
                min="0"
                max="1"
                step="0.05"
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
              />
            </div>

            <div className="slider-unit">
              <div className="slider-unit-header">
                <span>Similarity Boost</span>
                <span style={{ color: 'var(--accent-indigo)' }}>{similarity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                className="slider-input"
                min="0"
                max="1"
                step="0.05"
                value={similarity}
                onChange={(e) => setSimilarity(parseFloat(e.target.value))}
              />
            </div>

            <div className="slider-unit">
              <div className="slider-unit-header">
                <span>Style Exaggeration</span>
                <span style={{ color: 'var(--accent-pink)' }}>{style.toFixed(2)}</span>
              </div>
              <input
                type="range"
                className="slider-input"
                min="0"
                max="1"
                step="0.05"
                value={style}
                onChange={(e) => setStyle(parseFloat(e.target.value))}
              />
            </div>
          </div>
        )}

        {/* 5. Action Buttons */}
        <div className="generate-action-bar">
          <button
            type="button"
            className="generate-btn"
            disabled={isGenerating}
            onClick={handleGenerate}
          >
            {isGenerating ? (
              <>
                <span style={{ width: '16px', height: '16px', border: '2px solid rgba(0,0,0,0.3)', borderTopColor: '#000', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
                <span>Synthesizing Neural Voice...</span>
              </>
            ) : (
              <>
                <Play size={18} fill="#000" />
                <span>Generate &amp; Play</span>
              </>
            )}
          </button>

          {isPlaying && (
            <button
              type="button"
              className="stop-playback-btn"
              onClick={stopAudio}
            >
              <Square size={14} fill="currentColor" />
              <span>Stop</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
