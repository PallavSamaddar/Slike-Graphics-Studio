import { useState } from 'react';
import VideoNameModal from './VideoNameModal.jsx';
import ScrollRow from './ScrollRow.jsx';
import { TPLS } from '../data/templates.js';
import newsBackgroundVideo from '../assets/news-background.mp4';
import redeBgVideo from '../assets/rede-bg.mp4';
import redBackgroundVideo from '../assets/red-background.mp4';

const VIDEO_PRESETS = [
  { id: 'video-news', label: 'News Background', src: newsBackgroundVideo },
  { id: 'video-rede', label: 'Rede BG', src: redeBgVideo },
  { id: 'video-red', label: 'Red Background', src: redBackgroundVideo },
];

// Left-panel form for the Jacket: logo/brand text, a scrolling headline,
// time/weather, a main-video upload (or stock preset pick), and an
// optional left/right vertical image panel. No content-source machinery
// like the widget — a jacket is a live-feed overlay, not a card with a
// data source.
export default function JacketEditor({ st, setSt }) {
  const setField = (k, v) => setSt((s) => ({ ...s, [k]: v }));
  const setShow = (k, v) => setSt((s) => ({ ...s, [k]: v }));

  const [pendingMainVideo, setPendingMainVideo] = useState(null); // { url, fileName }

  const handleMainVideoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPendingMainVideo({ url, fileName: file.name.replace(/\.[^.]+$/, '') });
    e.target.value = '';
  };
  const confirmMainVideo = (name) => {
    setSt((s) => ({ ...s, mainVideoUrl: pendingMainVideo.url, mainVideoName: name, mainVideoPreset: null }));
    setPendingMainVideo(null);
  };
  const pickPreset = (v) => setSt((s) => ({ ...s, mainVideoUrl: v.src, mainVideoName: v.label, mainVideoPreset: v.id }));

  const handleLogoImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField('logoImage', reader.result);
    reader.readAsDataURL(file);
    setField('logoImageName', file.name.replace(/\.[^.]+$/, ''));
    e.target.value = '';
  };

  const handleSideImageUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setField('sideImage', reader.result);
    reader.readAsDataURL(file);
    setField('sideImageName', file.name.replace(/\.[^.]+$/, ''));
    e.target.value = '';
  };

  return (
    <div className="sec">
      <div className="sec-hd"><span className="sec-title">Content</span></div>

      <div className="form-row form-row-2" style={{ marginBottom: 16 }}>
        <div className="form-g">
          <label className="form-lbl">Logo Text</label>
          <input
            type="text"
            className="form-inp"
            placeholder="e.g. TOI"
            value={st.logoText}
            onChange={(e) => setField('logoText', e.target.value)}
          />
        </div>
        <div className="form-g">
          <label className="form-lbl">Tag Text</label>
          <input
            type="text"
            className="form-inp"
            placeholder="e.g. GLOBAL"
            value={st.tagText}
            onChange={(e) => setField('tagText', e.target.value)}
          />
        </div>
      </div>

      <div className="form-g" style={{ marginBottom: 16 }}>
        <label className="form-lbl">Logo Subtext</label>
        <input
          type="text"
          className="form-inp"
          placeholder="e.g. News That Moves, Nonstop."
          value={st.logoSubtext}
          onChange={(e) => setField('logoSubtext', e.target.value)}
        />
      </div>

      <div className="form-g" style={{ marginBottom: 16 }}>
        <label className="form-lbl">
          Headline <span className="req-mark">*</span>
        </label>
        <textarea
          className="form-inp"
          style={{ minHeight: 70, resize: 'vertical' }}
          placeholder="Enter a scrolling headline"
          value={st.headline}
          onChange={(e) => setField('headline', e.target.value)}
        />
      </div>

      <div className="form-g" style={{ marginBottom: 16 }}>
        <label className="form-lbl">Ticker Style</label>
        <ScrollRow hideNav className="jacket-ticker-style-row">
          <button
            type="button"
            className={'jacket-ticker-swatch' + (!st.tickerTemplate ? ' active' : '')}
            onClick={() => setField('tickerTemplate', null)}
            title="Plain text (no ticker bar)"
          >
            <span className="mini-ticker" style={{ background: '#2E3440' }}>
              <span className="mini-text" style={{ color: '#fff' }}>Plain text</span>
            </span>
            <span className="texture-swatch-label">Plain</span>
          </button>
          {TPLS.map((t) => {
            const m = t.mini;
            return (
              <button
                key={t.id}
                type="button"
                className={'jacket-ticker-swatch' + (st.tickerTemplate === t.id ? ' active' : '')}
                onClick={() => setField('tickerTemplate', t.id)}
                title={t.name}
              >
                <span className="mini-ticker" style={{ background: m.bg, borderTop: m.border || 'none' }}>
                  {m.bb && (
                    <span className={'mini-badge' + (t.style.badgeShape === 'wedge' ? ' mini-badge-wedge' : '')} style={{ background: m.bb, color: m.bt }}>
                      {t.badge.type === 'LIVE' && <span className="mini-dot" style={{ background: 'rgba(255,255,255,0.8)' }} />}
                      {m.badge}
                    </span>
                  )}
                  <span className="mini-text" style={{ color: m.tc }}>Breaking news</span>
                </span>
                <span className="texture-swatch-label">{t.name}</span>
              </button>
            );
          })}
        </ScrollRow>
      </div>

      <div className="form-g" style={{ marginBottom: 16 }}>
        <label className="form-lbl">Weather</label>
        <input
          type="text"
          className="form-inp"
          placeholder="e.g. 28°C, Clear sky"
          value={st.weather}
          onChange={(e) => setField('weather', e.target.value)}
        />
      </div>

      <div className="form-row form-row-4eq" style={{ marginBottom: 20 }}>
        <label className="widget-toggle-field">
          <input type="checkbox" checked={!!st.showLogo} onChange={(e) => setShow('showLogo', e.target.checked)} />
          Show logo
        </label>
        <label className="widget-toggle-field">
          <input type="checkbox" checked={!!st.showHeadline} onChange={(e) => setShow('showHeadline', e.target.checked)} />
          Show headline
        </label>
        <label className="widget-toggle-field">
          <input type="checkbox" checked={!!st.showTime} onChange={(e) => setShow('showTime', e.target.checked)} />
          Show time
        </label>
        <label className="widget-toggle-field">
          <input type="checkbox" checked={!!st.showWeather} onChange={(e) => setShow('showWeather', e.target.checked)} />
          Show weather
        </label>
      </div>

      <div className="sec-hd"><span className="sec-title">Main Video</span></div>

      <div className="form-g" style={{ marginBottom: 16 }}>
        <label className="form-lbl">Upload or choose a preset</label>
        <ScrollRow hideNav>
          {st.mainVideoUrl && !st.mainVideoPreset ? (
            <div className="badge-img-thumb-wrap">
              <video className="badge-img-thumb" src={st.mainVideoUrl} muted />
              <span className="badge-img-name">{st.mainVideoName || 'Untitled video'}</span>
              <button type="button" className="badge-img-remove" onClick={() => { setField('mainVideoUrl', null); setField('mainVideoName', ''); }} title="Remove video">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </div>
          ) : (
            <label className="texture-swatch texture-swatch-upload texture-swatch-upload-empty" title="Upload video">
              <span className="texture-swatch-preview">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </span>
              <span className="texture-swatch-label">Upload</span>
              <input type="file" accept="video/*" hidden onChange={handleMainVideoUpload} />
            </label>
          )}
          {VIDEO_PRESETS.map((v) => (
            <button
              key={v.id}
              type="button"
              className={'texture-swatch' + (st.mainVideoPreset === v.id ? ' active' : '')}
              onClick={() => pickPreset(v)}
              title={v.label}
            >
              <span className="texture-swatch-preview texture-swatch-preview-video">
                <video className="texture-swatch-video-thumb" src={v.src + '#t=0.5'} muted preload="metadata" />
              </span>
              <span className="texture-swatch-label">{v.label}</span>
            </button>
          ))}
        </ScrollRow>
      </div>

      <div className="sec-hd"><span className="sec-title">Side Image Panel</span></div>

      <div className="form-row image-pos-row" style={{ marginBottom: 16 }}>
        <div className="form-g">
          <label className="form-lbl">Image</label>
          <div className="badge-img-row">
            {st.sideImage ? (
              <div className="badge-img-thumb-wrap">
                <img className="badge-img-thumb" src={st.sideImage} alt="" />
                <span className="badge-img-name">{st.sideImageName || 'Untitled image'}</span>
                <button type="button" className="badge-img-remove" onClick={() => { setField('sideImage', null); setField('sideImageName', ''); }} title="Remove image">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ) : (
              <label className="badge-img-upload">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                Upload
                <input type="file" accept="image/*" hidden onChange={handleSideImageUpload} />
              </label>
            )}
          </div>
        </div>
        <div className="form-g">
          <label className="form-lbl">Position</label>
          <div className="src-tog" style={{ opacity: st.sideImage ? 1 : 0.45, pointerEvents: st.sideImage ? 'auto' : 'none' }}>
            <button type="button" className={'src-opt' + (st.imagePanelPos === 'left' ? ' active' : '')} onClick={() => setField('imagePanelPos', 'left')}>Left</button>
            <button type="button" className={'src-opt' + (st.imagePanelPos === 'right' ? ' active' : '')} onClick={() => setField('imagePanelPos', 'right')}>Right</button>
            <button type="button" className={'src-opt' + (st.imagePanelPos === 'top' ? ' active' : '')} onClick={() => setField('imagePanelPos', 'top')}>Top</button>
          </div>
        </div>
      </div>

      <div className="sec-hd"><span className="sec-title">Logo Image</span></div>

      <div className="form-row image-pos-row" style={{ marginBottom: 16 }}>
        <div className="form-g">
          <label className="form-lbl">Image</label>
          <div className="badge-img-row">
            {st.logoImage ? (
              <div className="badge-img-thumb-wrap">
                <img className="badge-img-thumb" src={st.logoImage} alt="" />
                <span className="badge-img-name">{st.logoImageName || 'Untitled image'}</span>
                <button type="button" className="badge-img-remove" onClick={() => { setField('logoImage', null); setField('logoImageName', ''); }} title="Remove image">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            ) : (
              <label className="badge-img-upload">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                Upload
                <input type="file" accept="image/*" hidden onChange={handleLogoImageUpload} />
              </label>
            )}
          </div>
        </div>
        <div className="form-g">
          <label className="form-lbl">Position</label>
          <div className="logo-pos-grid">
            <button type="button" className={'src-opt' + (st.logoPos === 'top-left' ? ' active' : '')} onClick={() => setField('logoPos', 'top-left')}>Top Left</button>
            <button type="button" className={'src-opt' + (st.logoPos === 'top-right' ? ' active' : '')} onClick={() => setField('logoPos', 'top-right')}>Top Right</button>
            <button type="button" className={'src-opt' + (st.logoPos === 'bottom-left' ? ' active' : '')} onClick={() => setField('logoPos', 'bottom-left')}>Bottom Left</button>
            <button type="button" className={'src-opt' + (st.logoPos === 'bottom-right' ? ' active' : '')} onClick={() => setField('logoPos', 'bottom-right')}>Bottom Right</button>
          </div>
        </div>
      </div>

      {pendingMainVideo && (
        <VideoNameModal
          src={pendingMainVideo.url}
          fileName={pendingMainVideo.fileName}
          onCancel={() => setPendingMainVideo(null)}
          onConfirm={confirmMainVideo}
        />
      )}
    </div>
  );
}
