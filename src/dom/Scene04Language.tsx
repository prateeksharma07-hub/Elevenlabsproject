import React from 'react';
import { useStudio } from '../state/studioState';
import { LANGUAGES } from '../services/translation';
import { Globe, ArrowRight, Send } from 'lucide-react';

export const Scene04Language: React.FC = () => {
  const {
    transSource,
    setTransSource,
    transTarget,
    transSourceLang,
    setTransSourceLang,
    transTargetLang,
    setTransTargetLang,
    isTranslating,
    handleTranslate,
    sendToStudio,
    scrollProgress,
  } = useStudio();

  // Opacity window around Scene 04
  let opacity = 0;
  if (scrollProgress >= 0.70 && scrollProgress <= 0.88) {
    opacity = 1;
  } else if (scrollProgress > 0.64 && scrollProgress < 0.70) {
    opacity = (scrollProgress - 0.64) / 0.06;
  } else if (scrollProgress > 0.88 && scrollProgress < 0.94) {
    opacity = 1 - (scrollProgress - 0.88) / 0.06;
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
      <div className="glass-console">
        {/* Section Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--accent-pink)', background: 'rgba(236, 72, 153, 0.1)', padding: '3px 8px', borderRadius: '4px' }}>
              03
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
              Language Portal &amp; Multilingual Dubbing
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-pink)', fontSize: '12px', fontFamily: 'var(--font-mono)' }}>
            <Globe size={14} />
            <span>29+ WORLD LANGUAGES</span>
          </div>
        </div>

        {/* Language Selection Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{ flex: 1 }}>
            <div className="field-label">Source Language</div>
            <select
              className="glass-select"
              value={transSourceLang}
              onChange={(e) => setTransSourceLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: '#090e17', color: '#fff' }}>
                  {l.flag} {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: '20px', color: 'var(--text-muted)' }}>
            <ArrowRight size={18} />
          </div>

          <div style={{ flex: 1 }}>
            <div className="field-label">Target Language</div>
            <select
              className="glass-select"
              value={transTargetLang}
              onChange={(e) => setTransTargetLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} style={{ background: '#090e17', color: '#fff' }}>
                  {l.flag} {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Text translation inputs */}
        <div className="control-grid-2" style={{ marginBottom: '16px' }}>
          <div>
            <div className="field-label">Original Text</div>
            <textarea
              className="glass-textarea"
              style={{ height: '95px' }}
              value={transSource}
              onChange={(e) => setTransSource(e.target.value)}
              placeholder="Enter text to translate..."
            />
          </div>

          <div>
            <div className="field-label">Translated Voice Copy</div>
            <textarea
              className="glass-textarea"
              style={{ height: '95px', color: 'var(--accent-cyan)' }}
              value={transTarget}
              readOnly
              placeholder="Translated speech will materialize here..."
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            type="button"
            className="chip-btn"
            style={{ padding: '10px 18px' }}
            disabled={isTranslating}
            onClick={handleTranslate}
          >
            <Globe size={14} />
            <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
          </button>

          <button
            type="button"
            className="generate-btn"
            style={{ padding: '10px 22px', fontSize: '13px' }}
            onClick={sendToStudio}
          >
            <Send size={14} />
            <span>Send to Studio &amp; Narrate</span>
          </button>
        </div>
      </div>
    </div>
  );
};
