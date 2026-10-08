import { useState } from 'react';
import VideoNameModal from './VideoNameModal.jsx';
import ScrollRow from './ScrollRow.jsx';
import { TPLS } from '../data/templates.js';
import Select from '../ui/Select.jsx';
import { Field, Seg, Toggle } from '../ui/controls.jsx';
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
    <>
      <div className="fieldset">
        <div className="fieldset-title">Content</div>
        <div className="frow">
          <Field label="Logo text" path="logoText">
            <input type="text" placeholder="e.g. TOI" value={st.logoText} onChange={(e) => setField('logoText', e.target.value)} />
          </Field>
          <Field label="Tag text" path="tagText">
            <input type="text" placeholder="e.g. GLOBAL" value={st.tagText} onChange={(e) => setField('tagText', e.target.value)} />
          </Field>
        </div>
        <div className="frow">
          <Field label="Logo subtext" path="logoSubtext" grow>
            <input type="text" placeholder="e.g. News That Moves, Nonstop." value={st.logoSubtext} onChange={(e) => setField('logoSubtext', e.target.value)} />
          </Field>
        </div>
        <div className="frow">
          <Field label={<>Headline <span className="req-mark">*</span></>} grow path="headline">
            <textarea
              className="jk-headline"
              placeholder="Enter a scrolling headline"
              value={st.headline}
              onChange={(e) => setField('headline', e.target.value)}
            />
          </Field>
        </div>
        <div className="frow">
          <Field label="Ticker style" grow path="tickerTemplate">
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
          </Field>
        </div>
        <div className="frow">
          <Field label="Weather" path="weather">
            <input type="text" placeholder="e.g. 28°C, Clear sky" value={st.weather} onChange={(e) => setField('weather', e.target.value)} />
          </Field>
        </div>
        <div className="frow">
          <Field path="showLogo"><Toggle on={!!st.showLogo} onChange={(v) => setShow('showLogo', v)}>Show logo</Toggle></Field>
          <Field path="showHeadline"><Toggle on={!!st.showHeadline} onChange={(v) => setShow('showHeadline', v)}>Show headline</Toggle></Field>
          <Field path="showTime"><Toggle on={!!st.showTime} onChange={(v) => setShow('showTime', v)}>Show time</Toggle></Field>
          <Field path="showWeather"><Toggle on={!!st.showWeather} onChange={(v) => setShow('showWeather', v)}>Show weather</Toggle></Field>
        </div>
      </div>

      <div className="fieldset">
        <div className="fieldset-title">Main video</div>
        <Field label="Upload or choose a preset" grow path="mainVideoName">
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
        </Field>
      </div>

      <div className="fieldset">
        <div className="fieldset-title">Side image panel</div>
        <div className="frow">
          <Field label="Image" path="sideImageName">
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
          </Field>
          <Field label="Position" path="imagePanelPos">
            <Seg
              value={st.imagePanelPos}
              onChange={(v) => setField('imagePanelPos', v)}
              off={!st.sideImage}
              title="Upload an image first"
              ariaLabel="Position"
              options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'top', label: 'Top' }]}
            />
          </Field>
        </div>
      </div>

      <div className="fieldset">
        <div className="fieldset-title">Logo image</div>
        <div className="frow">
          <Field label="Image" path="logoImageName">
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
          </Field>
          <Field label="Position" path="logoPos">
            <Select
              value={st.logoPos}
              onChange={(v) => setField('logoPos', v)}
              ariaLabel="Position"
              options={[
                { value: 'top-left', label: 'Top left' },
                { value: 'top-right', label: 'Top right' },
                { value: 'bottom-left', label: 'Bottom left' },
                { value: 'bottom-right', label: 'Bottom right' },
              ]}
            />
          </Field>
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
    </>
  );
}
