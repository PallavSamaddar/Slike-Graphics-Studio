import { useRef, useState } from 'react';
import ColorField from './ColorField.jsx';
import FormattingToolbar from './FormattingToolbar.jsx';
import ScrollRow from './ScrollRow.jsx';
import VideoNameModal from './VideoNameModal.jsx';
import ImageCropperModal from './ImageCropperModal.jsx';
import newsBackgroundVideo from '../assets/news-background.mp4';
import redeBgVideo from '../assets/rede-bg.mp4';
import redBackgroundVideo from '../assets/red-background.mp4';

const ANIMATIONS = [
  { id: 'fade', label: 'Fade' },
  { id: 'flip', label: 'Flip' },
  { id: 'slide', label: 'Slide' },
  { id: 'typewriter', label: 'Typewriter' },
];

const TEXTURES = [
  { id: 'none', label: 'None' },
  { id: 'spiral', label: 'Spiral Dots' },
  { id: 'globe', label: 'Earth Orbit' },
  { id: 'wave-flow', label: 'Wave Flow' },
  { id: 'light-trails', label: 'Light Trails' },
  { id: 'circular-sweep', label: 'Circular Sweep' },
  { id: 'arrow-motion', label: 'Arrow Motion' },
  { id: 'radar-sweep', label: 'Radar Sweep' },
  { id: 'grid-pulse', label: 'Grid Pulse' },
  { id: 'data-stream', label: 'Data Stream' },
  { id: 'bokeh-glow', label: 'Bokeh Glow' },
];

const VIDEO_PRESETS = [
  { id: 'video-news', label: 'News Background', src: newsBackgroundVideo },
  { id: 'video-rede', label: 'Rede BG', src: redeBgVideo },
  { id: 'video-red', label: 'Red Background', src: redBackgroundVideo },
];

export default function WidgetStyleControls({ st, setSt }) {
  const { style: s, headingText: ht, bodyText: bt, behavior } = st;
  const isVideo = !!(s.texture && s.texture.startsWith('video'));
  // Feed/JSON sources can attach per-headline media (ticked in Content) —
  // when that's active for the live source, it drives the image instead of
  // this single manual upload, so hide the redundant control.
  const usingPerItemMedia = (st.src === 'rss' || st.src === 'json') && (st.media?.[st.src] || []).some((m) => m);
  const setStyle = (k, v) => setSt((state) => ({ ...state, style: { ...state.style, [k]: v } }));
  const setHt = (k, v) => setSt((state) => ({ ...state, headingText: { ...state.headingText, [k]: v } }));
  const setBt = (k, v) => setSt((state) => ({ ...state, bodyText: { ...state.bodyText, [k]: v } }));
  const setBehavior = (k, v) => setSt((state) => ({ ...state, behavior: { ...state.behavior, [k]: v } }));
  // Picking a solid Background Colour should actually be visible — clear any
  // preset gradient, which otherwise always wins over the solid `bg` value.
  const setSolidBg = (v) => setSt((state) => ({ ...state, style: { ...state.style, bg: v, bgGradient: null } }));
  const setHeadingBgColor = (v) => setSt((state) => ({ ...state, style: { ...state.style, headingBg: v, headingBgGradient: null } }));

  const [pendingVideo, setPendingVideo] = useState(null); // { url, fileName }
  const [cropSrc, setCropSrc] = useState(null);
  const [cropFileName, setCropFileName] = useState('');
  const [bgTab, setBgTab] = useState(isVideo ? 'video' : 'animation');
  const [showTextureSettings, setShowTextureSettings] = useState(false);
  const textureSettingsRef = useRef(null);

  const toggleTextureSettings = () => {
    setShowTextureSettings((v) => {
      const next = !v;
      if (next) {
        setTimeout(() => textureSettingsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 0);
      }
      return next;
    });
  };

  const handleBadgeImage = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCropSrc(reader.result);
    reader.readAsDataURL(file);
    setCropFileName(file.name.replace(/\.[^.]+$/, ''));
    e.target.value = '';
  };

  const handleCropConfirm = (croppedDataUrl, name) => {
    setStyle('badgeImage', croppedDataUrl);
    setStyle('badgeImageName', name);
    setCropSrc(null);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Video files are too large to reasonably hold as base64 in state — use
    // an object URL instead (valid for this browser session).
    const url = URL.createObjectURL(file);
    setPendingVideo({ url, fileName: file.name.replace(/\.[^.]+$/, '') });
    e.target.value = '';
  };

  const confirmVideoUpload = (name) => {
    setSt((state) => ({ ...state, style: { ...state.style, texture: 'video-custom', customVideoUrl: pendingVideo.url, customVideoName: name } }));
    setPendingVideo(null);
  };

  return (
    <div className="style-controls">
      <div className="style-sec">
        <div className="form-row heading-row">
          <div className="form-g" style={{ maxWidth: 140 }}>
            <label className="form-lbl">Heading Background</label>
            <ColorField
              value={s.headingBg}
              fallback="#1A1714"
              onChange={setHeadingBgColor}
              allowGradient
              gradientValue={s.headingBgGradient}
              onChangeGradient={(css) => setStyle('headingBgGradient', css)}
            />
          </div>
          <div className="form-g" style={{ minWidth: 0 }}>
            <label className="form-lbl">Heading Formatting</label>
            <FormattingToolbar tx={ht} setTx={setHt} />
          </div>
        </div>
      </div>

      <hr className="style-sep" />

      <div className="style-sec">
        <div className="form-row form-row-top" style={{ marginBottom: 16 }}>
          {!isVideo && (
            <div className="form-g">
              <label className="form-lbl">Background Colour</label>
              <ColorField value={s.bg} fallback="#8A1B12" onChange={setSolidBg} />
            </div>
          )}
          <div className="form-g">
            <label className="form-lbl">Text Animation</label>
            <select className="form-inp form-sel" value={behavior.animation || 'fade'} onChange={(e) => setBehavior('animation', e.target.value)}>
              {ANIMATIONS.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
          <div className="form-g">
            <label className="form-lbl">Duration (sec)</label>
            <div className="opacity-stepper">
              <button
                type="button"
                className="fmt-icon-btn fmt-step-btn"
                onClick={() => setBehavior('itemDuration', Math.max(1, (behavior.itemDuration || 4) - 1))}
                aria-label="Decrease duration" title="Decrease duration"
              >−</button>
              <span className="opacity-stepper-val">{behavior.itemDuration || 4}s</span>
              <button
                type="button"
                className="fmt-icon-btn fmt-step-btn"
                onClick={() => setBehavior('itemDuration', Math.min(30, (behavior.itemDuration || 4) + 1))}
                aria-label="Increase duration" title="Increase duration"
              >+</button>
            </div>
          </div>
          {!usingPerItemMedia && (
            <div className="form-g">
              <label className="form-lbl">Image</label>
              <div className="badge-img-combo">
                <div className="badge-img-row">
                  {s.badgeImage ? (
                    <div className="badge-img-thumb-wrap">
                      <img className="badge-img-thumb" src={s.badgeImage} alt="" />
                      <span className="badge-img-name">{s.badgeImageName || 'Untitled image'}</span>
                      <button type="button" className="badge-img-remove" onClick={() => setStyle('badgeImage', null)} title="Remove image">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                      </button>
                    </div>
                  ) : (
                    <label className="badge-img-upload">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
                      Upload
                      <input type="file" accept="image/*" hidden onChange={handleBadgeImage} />
                    </label>
                  )}
                </div>
                <div className="badge-img-combo-divider" />
                <div className="src-tog badge-img-combo-pos" style={{ opacity: s.badgeImage ? 1 : 0.45, pointerEvents: s.badgeImage ? 'auto' : 'none' }}>
                  <button type="button" className={'src-opt' + ((s.badgeImagePos || 'left') === 'left' ? ' active' : '')} onClick={() => setStyle('badgeImagePos', 'left')}>Left</button>
                  <button type="button" className={'src-opt' + (s.badgeImagePos === 'right' ? ' active' : '')} onClick={() => setStyle('badgeImagePos', 'right')}>Right</button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={'form-row ' + (isVideo ? 'form-row-1' : 'desc-fmt-row')} style={{ marginBottom: 16 }}>
          <div className="form-g">
            <label className="form-lbl">Description Vertical Align</label>
            <div className="fmt-toolbar" style={{ width: 'fit-content' }}>
              <button
                type="button"
                className={'fmt-icon-btn' + ((bt.verticalAlign || 'middle') === 'top' ? ' active' : '')}
                onClick={() => setBt('verticalAlign', 'top')}
                aria-label="Align top" aria-pressed={(bt.verticalAlign || 'middle') === 'top'} title="Align top"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="4" y1="4" x2="20" y2="4" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="15" x2="16" y2="15" /></svg>
              </button>
              <button
                type="button"
                className={'fmt-icon-btn' + ((bt.verticalAlign || 'middle') === 'middle' ? ' active' : '')}
                onClick={() => setBt('verticalAlign', 'middle')}
                aria-label="Align middle" aria-pressed={(bt.verticalAlign || 'middle') === 'middle'} title="Align middle"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="7" x2="16" y2="7" /><line x1="4" y1="12" x2="20" y2="12" /><line x1="8" y1="17" x2="16" y2="17" /></svg>
              </button>
              <button
                type="button"
                className={'fmt-icon-btn' + ((bt.verticalAlign || 'middle') === 'bottom' ? ' active' : '')}
                onClick={() => setBt('verticalAlign', 'bottom')}
                aria-label="Align bottom" aria-pressed={(bt.verticalAlign || 'middle') === 'bottom'} title="Align bottom"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="9" x2="16" y2="9" /><line x1="8" y1="14" x2="16" y2="14" /><line x1="4" y1="20" x2="20" y2="20" /></svg>
              </button>
            </div>
          </div>
          <div className="form-g" style={{ minWidth: 0 }}>
            <label className="form-lbl">Description Formatting</label>
            <FormattingToolbar tx={bt} setTx={setBt} />
          </div>
        </div>

        <div className="form-g" style={{ marginBottom: 10 }}>
          <label className="form-lbl">Category text</label>
          <input
            type="text"
            className="form-inp"
            placeholder="e.g. News, Sports"
            value={st.category}
            onChange={(e) => setSt((state) => ({ ...state, category: e.target.value }))}
          />
        </div>

        <div className="form-row meta-fields-row" style={{ marginBottom: 16 }}>
          <div className="form-g">
            <label className="form-lbl">Category</label>
            <label className="widget-toggle-field">
              <input
                type="checkbox"
                checked={!!st.showCategory}
                onChange={(e) => setSt((state) => ({ ...state, showCategory: e.target.checked }))}
              />
              Show category
            </label>
          </div>
          <div className="form-g">
            <label className="form-lbl">Time</label>
            <label className="widget-toggle-field">
              <input
                type="checkbox"
                checked={!!st.showTime}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setSt((state) => ({
                    ...state,
                    showTime: checked,
                    publishedAt: checked && !state.publishedAt ? Date.now() : state.publishedAt,
                  }));
                }}
              />
              Show time posted
            </label>
          </div>
          <div className="form-g">
            <label className="form-lbl">Publisher</label>
            <label className="widget-toggle-field">
              <input
                type="checkbox"
                checked={!!st.showProduct}
                onChange={(e) => setSt((state) => ({ ...state, showProduct: e.target.checked }))}
              />
              Show publisher
            </label>
          </div>
        </div>

        <div className="form-g" style={{ marginBottom: 16 }}>
          <div className="src-tog bg-tab-tog">
            <button type="button" className={'src-opt' + (bgTab === 'animation' ? ' active' : '')} onClick={() => setBgTab('animation')}>Animation</button>
            <button type="button" className={'src-opt' + (bgTab === 'video' ? ' active' : '')} onClick={() => setBgTab('video')}>Videos</button>
          </div>
        </div>

        {bgTab === 'animation' && (
          <div style={{ marginBottom: 16 }}>
            <div className="texture-panel-swatches-hd">
              <label className="form-lbl">Background Animation</label>
              <button
                type="button"
                className={'texture-settings-btn' + (showTextureSettings ? ' active' : '')}
                onClick={toggleTextureSettings}
                aria-expanded={showTextureSettings}
                title="Animation settings"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.6a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
                Settings
              </button>
            </div>
            <ScrollRow>
              {TEXTURES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={'texture-swatch' + (( s.texture || 'none') === t.id ? ' active' : '')}
                  onClick={() => setStyle('texture', t.id)}
                  title={t.label}
                >
                  <span className="texture-swatch-preview" style={{ background: s.bgGradient || s.bg }}>
                    <span className={'widget-texture-' + t.id} />
                    {t.id !== 'none' && s.textureColor && s.textureColor.toUpperCase() !== '#FFFFFF' && (
                      <span className="texture-tint" style={{ background: s.textureColor }} />
                    )}
                  </span>
                  <span className="texture-swatch-label">{t.label}</span>
                </button>
              ))}
            </ScrollRow>

            {showTextureSettings && (
              <div className="texture-panel-settings" ref={textureSettingsRef}>
                <div className="form-g">
                  <label className="form-lbl">Texture Colour</label>
                  <ColorField value={s.textureColor || '#FFFFFF'} fallback="#FFFFFF" onChange={(v) => setStyle('textureColor', v)} allowEyedropper />
                </div>
                <div className="form-g" style={{ opacity: s.texture && s.texture !== 'none' ? 1 : 0.45, pointerEvents: s.texture && s.texture !== 'none' ? 'auto' : 'none' }}>
                  <label className="form-lbl">Texture Speed</label>
                  <div className="opacity-stepper">
                    <button
                      type="button"
                      className="fmt-icon-btn fmt-step-btn"
                      onClick={() => setStyle('textureSpeed', Math.max(0.5, Math.round(((s.textureSpeed ?? 1) - 0.5) * 10) / 10))}
                      aria-label="Decrease texture speed" title="Decrease texture speed"
                    >−</button>
                    <span className="opacity-stepper-val">{(s.textureSpeed ?? 1)}×</span>
                    <button
                      type="button"
                      className="fmt-icon-btn fmt-step-btn"
                      onClick={() => setStyle('textureSpeed', Math.min(3, Math.round(((s.textureSpeed ?? 1) + 0.5) * 10) / 10))}
                      aria-label="Increase texture speed" title="Increase texture speed"
                    >+</button>
                  </div>
                </div>
                <div className="form-g" style={{ opacity: s.texture && s.texture !== 'none' ? 1 : 0.45, pointerEvents: s.texture && s.texture !== 'none' ? 'auto' : 'none' }}>
                  <label className="form-lbl">Texture Opacity</label>
                  <div className="range-with-pill texture-opacity-box">
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={Math.round((s.textureOpacity ?? 1) * 100)}
                      onChange={(e) => setStyle('textureOpacity', parseInt(e.target.value, 10) / 100)}
                      className="form-range"
                      style={{ '--range-pct': `${Math.round((s.textureOpacity ?? 1) * 100)}%` }}
                    />
                    <span className="texture-opacity-val">{Math.round((s.textureOpacity ?? 1) * 100)}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {bgTab === 'video' && (
          <div className="form-g">
            <label className="form-lbl">Background Videos</label>
            <ScrollRow hideNav>
              <label className="texture-swatch texture-swatch-upload texture-swatch-upload-empty" title="Upload video">
                <span className="texture-swatch-preview">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </span>
                <span className="texture-swatch-label">Upload</span>
                <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
              </label>
              {s.customVideoUrl && (
                <button
                  type="button"
                  className={'texture-swatch' + (s.texture === 'video-custom' ? ' active' : '')}
                  onClick={() => setStyle('texture', 'video-custom')}
                  title={s.customVideoName || 'Untitled video'}
                >
                  <span className="texture-swatch-preview texture-swatch-preview-video">
                    <video className="texture-swatch-video-thumb" src={s.customVideoUrl} muted />
                  </span>
                  <span className="texture-swatch-label">{s.customVideoName || 'Untitled video'}</span>
                </button>
              )}
              {VIDEO_PRESETS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  className={'texture-swatch' + (s.texture === v.id ? ' active' : '')}
                  onClick={() => setStyle('texture', v.id)}
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
        )}
      </div>

      {pendingVideo && (
        <VideoNameModal
          src={pendingVideo.url}
          fileName={pendingVideo.fileName}
          onCancel={() => setPendingVideo(null)}
          onConfirm={confirmVideoUpload}
        />
      )}

      {cropSrc && (
        <ImageCropperModal src={cropSrc} fileName={cropFileName} onCancel={() => setCropSrc(null)} onConfirm={handleCropConfirm} />
      )}
    </div>
  );
}
