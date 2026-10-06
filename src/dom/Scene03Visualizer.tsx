import React, { useEffect, useState } from 'react';
import { useStudio } from '../state/studioState';
import { VOICES } from '../services/elevenlabs';
import { Play, Pause, Square, Download, Volume2, Activity, Radio } from 'lucide-react';

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
    audioUrl,
    getFrequencyData,
  } = useStudio();

  const [meterLevels, setMeterLevels] = useState({ bass: 0, mid: 0, treble: 0, energy: 0 });

  const selectedVoice = VOICES.find((v) => v.id === voiceId) || VOICES[0];

  // Poll real-time frequency data for DOM frequency bars when playing
  useEffect(() => {
    let animId: number;
    const updateMeters = () => {
      const data = getFrequencyData();
      setMeterLevels({
        bass: Math.round(data.bass * 100),
        mid: Math.round(data.mid * 100),
        treble: Math.round(data.treble * 100),
        energy: Math.round(data.energy * 100),
      });
      animId = requestAnimationFrame(updateMeters);
    };
    animId = requestAnimationFrame(updateMeters);
    return () => cancelAnimationFrame(animId);
  }, [getFrequencyData]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remaining = Math.floor(secs % 60);
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="visualizer-card-container">
      {/* 1. Header */}
      <div className="visualizer-header">
        <div className="visualizer-title-group">
          <div className="section-kicker">
            <Activity size={12} />
            <span>03 // ACOUSTIC RESONANCE</span>
          </div>
          <h2 className="visualizer-title">AUDIO VISUALIZER</h2>
        </div>

        <div className="visualizer-badge">
          <Radio size={12} className={isPlaying ? 'icon-streaming' : ''} />
          <span>{isPlaying ? 'ACTIVE FREQUENCY ANALYSIS' : 'ANALYSER STANDBY'}</span>
        </div>
      </div>

      <p className="visualizer-subtext">
        Real-time 128-bin Fast Fourier Transform (FFT) analysis driven by the Web Audio API. 
        Watch the 3D acoustic waveform in the canvas react to the physical frequencies of the synthesized voice.
      </p>

      {/* 2. Real-Time Frequency Telemetry Meters */}
      <div className="frequency-telemetry-grid">
        <div className="frequency-band-card">
          <div className="band-header">
            <span>BASS // SUB-250Hz</span>
            <span className="band-val">{meterLevels.bass}%</span>
          </div>
          <div className="meter-track">
            <div className="meter-fill bass" style={{ width: `${meterLevels.bass}%` }} />
          </div>
        </div>

        <div className="frequency-band-card">
          <div className="band-header">
            <span>MID // VOCAL FORMANT</span>
            <span className="band-val">{meterLevels.mid}%</span>
          </div>
          <div className="meter-track">
            <div className="meter-fill mid" style={{ width: `${meterLevels.mid}%` }} />
          </div>
        </div>

        <div className="frequency-band-card">
          <div className="band-header">
            <span>TREBLE // HARMONICS</span>
            <span className="band-val">{meterLevels.treble}%</span>
          </div>
          <div className="meter-track">
            <div className="meter-fill treble" style={{ width: `${meterLevels.treble}%` }} />
          </div>
        </div>

        <div className="frequency-band-card">
          <div className="band-header">
            <span>PEAK ENERGY // RMS</span>
            <span className="band-val">{meterLevels.energy}%</span>
          </div>
          <div className="meter-track">
            <div className="meter-fill energy" style={{ width: `${meterLevels.energy}%` }} />
          </div>
        </div>
      </div>

      {/* 3. Stream Controller Dock */}
      <div className="visualizer-dock">
        <div className="dock-track-info">
          <span className="dock-voice-name">{selectedVoice.name}</span>
          <span className="dock-voice-desc">{selectedVoice.desc}</span>
        </div>

        {/* Timeline Scrubber */}
        <div
          className="dock-timeline"
          onClick={(e) => {
            if (!duration) return;
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPercent = ((e.clientX - rect.left) / rect.width) * 100;
            seekAudio(clickPercent);
          }}
        >
          <div className="dock-timeline-fill" style={{ width: `${progressPercent}%` }} />
        </div>

        <div className="dock-controls-row">
          <div className="dock-time-display">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration)}</span>
          </div>

          <div className="dock-playback-btns">
            <button
              type="button"
              className="dock-btn-primary"
              disabled={!audioUrl}
              onClick={togglePlayPause}
            >
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
              <span>{isPlaying ? 'Pause' : 'Play'}</span>
            </button>

            <button
              type="button"
              className="dock-btn-secondary"
              disabled={!audioUrl}
              onClick={stopAudio}
            >
              <Square size={12} />
              <span>Stop</span>
            </button>

            <button
              type="button"
              className="dock-btn-secondary"
              disabled={!audioUrl}
              onClick={downloadAudio}
            >
              <Download size={12} />
              <span>Download MP3</span>
            </button>
          </div>

          <div className="dock-volume">
            <Volume2 size={13} />
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
