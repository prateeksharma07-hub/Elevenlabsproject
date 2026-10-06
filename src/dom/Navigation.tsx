import React, { useState } from 'react';
import { useStudio } from '../state/studioState';
import { getActiveApiKey, saveApiKey } from '../services/elevenlabs';
import { Key, Volume2 } from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeScene, scrollToScene, isPlaying, showToast } = useStudio();
  const [showKeyModal, setShowKeyModal] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>(getActiveApiKey() || '');

  const handleSaveKey = () => {
    saveApiKey(keyInput);
    setShowKeyModal(false);
    showToast('API Key saved securely in localStorage!', 'success');
  };

  const navItems = [
    { num: 1, label: 'Arrival' },
    { num: 2, label: 'Studio' },
    { num: 3, label: 'Visualizer' },
    { num: 4, label: 'Portal' },
    { num: 5, label: 'Finale' },
  ];

  return (
    <>
      <header className="hud-topbar">
        {/* Brand Badge */}
        <div className="brand-badge" onClick={() => scrollToScene(1)}>
          <span className="brand-title">AURA</span>
          <span className="brand-sub">Neural Acoustics</span>
          {isPlaying && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-cyan)' }}>
              <Volume2 size={14} />
              <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }}>STREAMING</span>
            </div>
          )}
        </div>

        {/* Minimal Navigation Compass */}
        <nav className="nav-compass">
          {navItems.map((item) => (
            <button
              key={item.num}
              type="button"
              className={`nav-compass-btn ${activeScene === item.num ? 'active' : ''}`}
              onClick={() => scrollToScene(item.num)}
            >
              <span>0{item.num}</span>
              <span className="btn-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Action Tray */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            type="button"
            className="api-key-btn"
            onClick={() => setShowKeyModal(true)}
            title="Configure ElevenLabs API Key"
          >
            <Key size={13} color="var(--accent-cyan)" />
            <span>API Key</span>
          </button>
        </div>
      </header>

      {/* API Key Modal */}
      {showKeyModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(16px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px',
          }}
          onClick={() => setShowKeyModal(false)}
        >
          <div
            className="glass-console"
            style={{ maxWidth: '480px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Key size={20} color="var(--accent-cyan)" />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '18px' }}>ElevenLabs API Key</h3>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '18px', lineHeight: '1.5' }}>
              Stored securely in your local browser storage (`localStorage`). You can also configure it in <code>.env.local</code> as <code>VITE_ELEVENLABS_API_KEY</code>.
            </p>
            <input
              type="password"
              className="glass-textarea"
              style={{ height: '48px', marginBottom: '18px', padding: '12px' }}
              placeholder="xi-api-key..."
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                type="button"
                className="chip-btn"
                onClick={() => setShowKeyModal(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="chip-btn"
                style={{ background: 'var(--accent-cyan)', color: '#000', fontWeight: 'bold' }}
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
