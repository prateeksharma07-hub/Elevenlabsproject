import React, { useState } from 'react';
import { useStudio } from '../state/studioState';
import { VOICES, MODELS } from '../services/elevenlabs';
import { Play, Pause, Square, Sliders, Sparkles, Download, Volume2, RotateCcw } from 'lucide-react';

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
    audioUrl,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    togglePlayPause,
    stopAudio,
    seekAudio,
    downloadAudio,
    handleGenerate,
  } = useStudio();

  const [showAcousticDrawer, setShowAcousticDrawer] = useState<boolean>(true);

  const selectedVoice = VOICES.find((v) => v.id === voiceId) || VOICES[0];
  const selectedModel = MODELS.find((m) => m.id === modelId) || MODELS[0];

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  // Determine current engine status label
  const getEngineStatus = () => {
    if (isGenerating) {
      return { label: 'SYNTHESIZING NEURAL AUDIO...', state: 'generating' };
    }
    if (isPlaying) {
      return { label: 'PLAYING ACOUSTIC STREAM', state: 'playing' };
    }
    if (audioUrl) {
      return { label: 'AUDIO GENERATED — READY', state: 'ready' };
    }
    return { label: 'SYSTEM READY', state: 'idle' };
  };

  const status = getEngineStatus();

  const resetAcoustics = () => {
    setStability(0.50);
    setSimilarity(0.75);
    setStyle(0.00);
  };

  return (
    <div className="studio-card-container">
      {/* 1. Header Bar */}
      <div className="studio-header">
        <div className="studio-title-group">
          <h2 className="studio-title">AURA STUDIO</h2>
          <div className={`studio-status-pill ${status.state}`}>
            <span className="status-dot" />
            <span className="status-text">{status.label}</span>
          </div>
        </div>

        {/* Quick Demo Presets */}
        <div className="studio-presets">
          <span className="presets-label">Presets:</span>
          <button
            type="button"
            className="preset-pill"
            onClick={() => loadDemoScript('trailer')}
          >
            <Sparkles size={11} />
            <span>Movie Trailer</span>
          </button>
          <button
            type="button"
            className="preset-pill"
            onClick={() => loadDemoScript('ai')}
          >
            <Sparkles size={11} />
            <span>Sentient AI</span>
          </button>
          <button
            type="button"
            className="preset-pill"
            onClick={() => loadDemoScript('keynote')}
          >
            <Sparkles size={11} />
            <span>Keynote</span>
          </button>
          <button
            type="button"
            className="preset-pill"
            onClick={() => loadDemoScript('asmr')}
          >
            <Sparkles size={11} />
            <span>ASMR</span>
          </button>
        </div>
      </div>

      {/* 2. Main Narration Textarea */}
      <div className="studio-input-block">
        <div className="input-block-header">
          <span className="block-label">Narration Script</span>
          <span className="shortcut-hint">Ctrl + Enter to synthesize</span>
        </div>

        <textarea
          className="studio-textarea"
          placeholder="Type or paste the words you want AURA to bring to life..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleGenerate();
            }
          }}
          rows={5}
        />

        <div className="input-block-footer">
          <span className="count-stat">{wordCount} words</span>
          <span className="count-stat">{charCount} characters</span>
        </div>
      </div>

      {/* 3. Voice & Model Configuration */}
      <div className="studio-controls-grid">
        {/* Voice Persona */}
        <div className="control-card">
          <div className="control-header">
            <label htmlFor="voice-select" className="control-label">Voice Persona</label>
            <span className="control-badge">{selectedVoice.tag}</span>
          </div>
          <div className="select-container">
            <select
              id="voice-select"
              className="studio-select"
              value={voiceId}
              onChange={(e) => setVoiceId(e.target.value)}
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} — {v.desc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Model Engine */}
        <div className="control-card">
          <div className="control-header">
            <label htmlFor="model-select" className="control-label">Model Engine</label>
            <span className="control-badge accent">{selectedModel.badge}</span>
          </div>
          <div className="select-container">
            <select
              id="model-select"
              className="studio-select"
              value={modelId}
              onChange={(e) => setModelId(e.target.value)}
            >
              {MODELS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} — {m.desc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Acoustic Settings Accordion */}
      <div className="acoustic-panel">
        <div className="acoustic-header">
          <button
            type="button"
            className="acoustic-toggle"
            onClick={() => setShowAcousticDrawer(!showAcousticDrawer)}
          >
            <Sliders size={13} />
            <span>Acoustic Fine-Tuning</span>
            <span className="drawer-indicator">{showAcousticDrawer ? '▾' : '▸'}</span>
          </button>

          {showAcousticDrawer && (
            <button
              type="button"
              className="acoustic-reset-btn"
              onClick={resetAcoustics}
              title="Reset sliders to defaults"
            >
              <RotateCcw size={11} />
              <span>Defaults</span>
            </button>
          )}
        </div>

        {showAcousticDrawer && (
          <div className="acoustic-sliders-grid">
            {/* Stability */}
            <div className="slider-item">
              <div className="slider-label-row">
                <span>Stability</span>
                <span className="slider-value">{stability.toFixed(2)}</span>
              </div>
              <input
                type="range"
                className="acoustic-range-input"
                min="0"
                max="1"
                step="0.05"
                value={stability}
                onChange={(e) => setStability(parseFloat(e.target.value))}
              />
              <span className="slider-sub">Higher = consistent / Lower = expressive</span>
            </div>

            {/* Similarity */}
            <div className="slider-item">
              <div className="slider-label-row">
                <span>Similarity Boost</span>
                <span className="slider-value">{similarity.toFixed(2)}</span>
              </div>
              <input
                type="range"
                className="acoustic-range-input"
                min="0"
                max="1"
                step="0.05"
                value={similarity}
                onChange={(e) => setSimilarity(parseFloat(e.target.value))}
              />
              <span className="slider-sub">Closeness to original training voice</span>
            </div>

            {/* Style */}
            <div className="slider-item">
              <div className="slider-label-row">
                <span>Style Exaggeration</span>
                <span className="slider-value">{style.toFixed(2)}</span>
              </div>
              <input
                type="range"
                className="acoustic-range-input"
                min="0"
                max="1"
                step="0.05"
                value={style}
                onChange={(e) => setStyle(parseFloat(e.target.value))}
              />
              <span className="slider-sub">Amplifies dramatic emotional inflection</span>
            </div>
          </div>
        )}
      </div>

      {/* 5. Primary Action (Generate Voice) */}
      <div className="studio-actions-bar">
        <button
          type="button"
          className="generate-primary-btn"
          disabled={isGenerating}
          onClick={handleGenerate}
        >
          {isGenerating ? (
            <>
              <span className="spinner-loader" />
              <span>Synthesizing Voice...</span>
            </>
          ) : (
            <>
              <Play size={16} fill="currentColor" />
              <span>Generate Voice</span>
            </>
          )}
        </button>

        {isPlaying && (
          <button
            type="button"
            className="stop-secondary-btn"
            onClick={stopAudio}
          >
            <Square size={13} fill="currentColor" />
            <span>Stop Playback</span>
          </button>
        )}
      </div>

      {/* 6. Clean 2D Audio Player */}
      <div className={`studio-player-container ${audioUrl ? 'has-audio' : 'idle'}`}>
        <div className="player-meta-row">
          <div className="player-info">
            <span className="player-track-name">
              {audioUrl ? `${selectedVoice.name} — ${selectedModel.name}` : 'No Audio Generated Yet'}
            </span>
            <span className="player-time-badge">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          <div className="player-meta-actions">
            <button
              type="button"
              className="player-download-btn"
              disabled={!audioUrl}
              onClick={downloadAudio}
              title="Download Generated Audio (MP3)"
            >
              <Download size={13} />
              <span>Download MP3</span>
            </button>
          </div>
        </div>

        {/* Timeline Bar */}
        <div
          className="player-timeline"
          onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPercent = ((e.clientX - rect.left) / rect.width) * 100;
            seekAudio(clickPercent);
          }}
        >
          <div
            className="player-timeline-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Player Transport Controls */}
        <div className="player-controls-row">
          <div className="player-playback-buttons">
            <button
              type="button"
              className="playback-play-btn"
              disabled={!audioUrl}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              className="playback-stop-btn"
              disabled={!audioUrl}
              onClick={stopAudio}
            >
              <Square size={12} fill="currentColor" />
              <span>Reset</span>
            </button>
          </div>

          {/* Volume Control */}
          <div className="player-volume-control">
            <Volume2 size={14} className="volume-icon" />
            <input
              type="range"
              className="volume-slider"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
