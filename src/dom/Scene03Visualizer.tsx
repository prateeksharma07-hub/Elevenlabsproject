import React from 'react';
import { useStudio } from '../state/studioState';
import { VOICES } from '../services/elevenlabs';
import { Play, Pause, Square, Download, Volume2 } from 'lucide-react';

export const Scene03Visualizer: React.FC = () => {
  const {
    voiceId,
    isPlaying,
    currentTime,
    duration,
    volume,
    setVolume,
    togglePlayPause,
    stopAudio,
    seekAudio,
    downloadAudio,
    scrollProgress,
  } = useStudio();

  // Opacity window around Scene 03
  let opacity = 0;
  if (scrollProgress >= 0.50 && scrollProgress <= 0.70) {
    opacity = 1;
  } else if (scrollProgress > 0.44 && scrollProgress < 0.50) {
    opacity = (scrollProgress - 0.44) / 0.06;
  } else if (scrollProgress > 0.70 && scrollProgress < 0.76) {
    opacity = 1 - (scrollProgress - 0.70) / 0.06;
  }

  const pointerEvents = opacity > 0.3 ? 'auto' : 'none';
  const selectedVoice = VOICES.find((v) => v.id === voiceId);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="scene-overlay-stage"
      style={{
        opacity,
        pointerEvents,
        transition: 'opacity 0.1s linear',
      }}
    >
      <div className="glass-console player-dock-card">
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-cyan)', background: 'rgba(34, 211, 238, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
              02
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Real-Time Waveform &amp; Audio Arena
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isPlaying ? 'var(--accent-cyan)' : 'var(--text-muted)' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: isPlaying ? 'var(--accent-cyan)' : 'var(--text-muted)' }}>
              {isPlaying ? 'ACTIVE FREQUENCIES' : 'IDLE'}
            </span>
          </div>
        </div>

        {/* Current Track Persona */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: 'var(--radius-md)', marginBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>
              Voice Track: {selectedVoice?.name || 'Synthesized Voice'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {selectedVoice?.desc}
            </div>
          </div>
          <button
            type="button"
            className="chip-btn"
            style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
            onClick={downloadAudio}
            title="Download Generated Audio (MP3)"
          >
            <Download size={14} />
            <span>Download MP3</span>
          </button>
        </div>

        {/* Timeline Scrubber */}
        <div
          className="timeline-bar-wrap"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            seekAudio(clickPos * 100);
          }}
        >
          <div className="timeline-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="time-row">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {/* Player Controls Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              type="button"
              className="generate-btn"
              style={{ padding: '10px 22px', fontSize: '13px' }}
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <>
                  <Pause size={15} fill="#000" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play size={15} fill="#000" />
                  <span>Play</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="chip-btn"
              onClick={stopAudio}
            >
              <Square size={13} />
              <span>Stop</span>
            </button>
          </div>

          {/* Volume Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '160px' }}>
            <Volume2 size={16} color="var(--text-secondary)" />
            <input
              type="range"
              className="slider-input"
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
