import React, { useState } from 'react';
import { useStudio } from '../state/studioState';
import { LANGUAGES } from '../services/translation';
import { Globe, ArrowRight, ArrowLeftRight, Send, Copy, Check } from 'lucide-react';

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
    showToast,
  } = useStudio();

  const [copied, setCopied] = useState(false);

  const swapLanguages = () => {
    const tempLang = transSourceLang;
    setTransSourceLang(transTargetLang);
    setTransTargetLang(tempLang);

    if (transTarget) {
      setTransSource(transTarget);
    }
  };

  const copyToClipboard = () => {
    if (!transTarget) return;
    navigator.clipboard.writeText(transTarget);
    setCopied(true);
    showToast('Copied translated text to clipboard!', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="translation-card-container">
      {/* 1. Header */}
      <div className="translation-header">
        <div className="translation-title-group">
          <div className="section-kicker">
            <Globe size={12} />
            <span>04 // MULTILINGUAL PORTAL</span>
          </div>
          <h2 className="translation-title">GLOBAL TRANSLATION</h2>
        </div>

        <div className="translation-badge">
          <span>29+ Supported Languages</span>
        </div>
      </div>

      <p className="translation-subtext">
        Translate any script instantly and transfer the translation straight to the ElevenLabs Studio for seamless multilingual narration.
      </p>

      {/* 2. Language Selector Bar */}
      <div className="language-selector-bar">
        {/* Source Language */}
        <div className="lang-field-group">
          <label htmlFor="source-lang-select" className="lang-field-label">Source Language</label>
          <div className="select-container">
            <select
              id="source-lang-select"
              className="studio-select"
              value={transSourceLang}
              onChange={(e) => setTransSourceLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Swap Button */}
        <button
          type="button"
          className="swap-lang-btn"
          onClick={swapLanguages}
          title="Swap source and target languages"
        >
          <ArrowLeftRight size={14} />
        </button>

        {/* Target Language */}
        <div className="lang-field-group">
          <label htmlFor="target-lang-select" className="lang-field-label">Target Language</label>
          <div className="select-container">
            <select
              id="target-lang-select"
              className="studio-select"
              value={transTargetLang}
              onChange={(e) => setTransTargetLang(e.target.value)}
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.flag} {l.name} ({l.native})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Translation Dual Panes */}
      <div className="translation-panes-grid">
        {/* Source Pane */}
        <div className="trans-pane">
          <div className="pane-header">
            <span>Original Script</span>
            <span className="pane-count">{transSource.length} chars</span>
          </div>
          <textarea
            className="trans-textarea"
            placeholder="Enter or paste text to translate..."
            value={transSource}
            onChange={(e) => setTransSource(e.target.value)}
            rows={5}
          />
        </div>

        {/* Target Pane */}
        <div className="trans-pane target-pane">
          <div className="pane-header">
            <span>Translated Output</span>
            {transTarget && (
              <button
                type="button"
                className="copy-btn"
                onClick={copyToClipboard}
                title="Copy translated text"
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            )}
          </div>
          <textarea
            className="trans-textarea target-textarea"
            placeholder="Translated speech will materialize here..."
            value={transTarget}
            readOnly
            rows={5}
          />
        </div>
      </div>

      {/* 4. Action Buttons Bar */}
      <div className="translation-actions-bar">
        <button
          type="button"
          className="translate-btn"
          disabled={isTranslating || !transSource.trim()}
          onClick={handleTranslate}
        >
          {isTranslating ? (
            <>
              <span className="spinner-loader" />
              <span>Translating...</span>
            </>
          ) : (
            <>
              <Globe size={14} />
              <span>Translate Text</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="send-to-studio-btn"
          disabled={!transTarget && !transSource.trim()}
          onClick={sendToStudio}
        >
          <span>Send to Studio &amp; Narrate</span>
          <Send size={14} />
        </button>
      </div>
    </div>
  );
};
