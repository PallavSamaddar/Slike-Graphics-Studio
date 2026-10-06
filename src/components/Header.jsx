import { useState } from 'react';
import { playerUrl } from '../utils.js';

export default function Header({ st, onSave, saved, onBack, kind = 'ticker', dirty = false, onReset }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = playerUrl(st, kind);
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      window.prompt('Copy this URL:', url);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpen = () => {
    window.open(playerUrl(st, kind), '_blank', 'noopener');
  };

  return (
    <header className="header">
      <div className="header-brand">
        {onBack && (
          <button className="btn btn-ghost" onClick={onBack} style={{ padding: '0 9px' }} title="Back to templates">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        )}
        <div className="header-logomark">
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="3" width="16" height="11" rx="1.5" strokeWidth="1.4" />
            <path d="M2 11.5h16" strokeWidth="1.4" />
            <path d="M8 17h4M10 14.5v2.5" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
        <div>
          <div className="header-title">{kind === 'ticker' ? 'Ticker' : kind === 'jacket' ? 'Jacket' : 'Widget'}</div>
        </div>
      </div>
      <div className="header-actions">
        <button className="btn btn-ghost" onClick={handleCopy} title={`Copy the standalone ${kind} URL`}>
          {copied ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
          )}
          {copied ? 'Copied!' : 'Copy URL'}
        </button>
        <button className="btn btn-ghost" onClick={handleOpen} title={`Open the standalone ${kind} in a new tab`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
          Open URL
        </button>
        {dirty && onReset && (
          <button className="btn btn-ghost" onClick={onReset} title="Discard unsaved changes and go back to the last saved version">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 102.13-9.36L1 10" /></svg>
            Reset
          </button>
        )}
        <button className="btn btn-primary" id="btnSave" onClick={onSave} style={saved ? { background: '#15803D' } : undefined}>
          {saved ? (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width="13" height="13"><polyline points="20 6 9 17 4 12" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" /><polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" /></svg>
          )}
          {saved ? 'Saved!' : (kind === 'ticker' ? 'Save Ticker' : kind === 'jacket' ? 'Save Jacket' : 'Save Widget')}
        </button>
      </div>
    </header>
  );
}
