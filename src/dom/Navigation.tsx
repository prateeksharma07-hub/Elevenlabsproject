import React, { useState } from 'react';
import { useStudio } from '../state/studioState';
import { getActiveApiKey, saveApiKey } from '../services/elevenlabs';
import { Key, Volume2, Sparkles, X } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeScene, scrollToScene, isPlaying, showToast } = useStudio();
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>(getActiveApiKey() || '');

  const handleSaveKey = () => {
    saveApiKey(keyInput);
    setShowKeyModal(false);
    showToast('API Key saved securely!', 'success');
  };

  const navItems = [
    { num: 1, label: 'INTRO', id: 'intro' },
    { num: 2, label: 'STUDIO', id: 'studio' },
    { num: 3, label: 'AUDIO', id: 'visualizer' },
    { num: 4, label: 'TRANSLATE', id: 'translation' },
    { num: 5, label: 'END', id: 'ending' },
  ];

  return (
    <>
      <header className="aura-navbar">
        {/* Brand */}
        <div className="nav-brand" onClick={() => scrollToScene(1)}>
          <span className="nav-brand-title">AURA</span>
          <span className="nav-brand-badge">VOICE</span>
        </div>

        {/* Minimal Floating Nav Pills */}
        <nav className="nav-pill-group">
          {navItems.map((item) => (
            <button
              key={item.num}
              type="button"
              className={`nav-pill-btn ${activeScene === item.num ? 'active' : ''}`}
              onClick={() => scrollToScene(item.num)}
            >
              <span className="pill-index">0{item.num}</span>
              <span className="pill-text">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Controls */}
        <div className="nav-controls">
          {isPlaying && (
            <div className="nav-streaming-indicator">
              <Volume2 size={13} className="stream-icon" />
              <span>LIVE</span>
            </div>
          )}

          <button
            type="button"
            className="nav-key-btn"
            onClick={() => setShowKeyModal(true)}
            title="Configure ElevenLabs API Key"
          >
            <Key size={13} />
            <span>API Key</span>
          </button>
        </div>
      </header>

      {/* API Key Modal */}
      {showKeyModal && (
        <div
          className="modal-backdrop"
          onClick={() => setShowKeyModal(false)}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-group">
                <Key size={18} className="modal-icon" />
                <h3>ElevenLabs API Configuration</h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setShowKeyModal(false)}
              >
                <X size={16} />
              </button>
            </div>

            <p className="modal-desc">
              Your ElevenLabs API key is stored safely in your browser’s local storage.
              It is never sent to any third party and is used exclusively to synthesize your narration.
            </p>

            <div className="modal-input-wrap">
              <input
                type="password"
                className="modal-input"
                placeholder="xi-api-key..."
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                autoFocus
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="modal-btn-cancel"
                onClick={() => setShowKeyModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-btn-save"
                onClick={handleSaveKey}
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
