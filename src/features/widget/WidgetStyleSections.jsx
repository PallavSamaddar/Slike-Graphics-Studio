import { useRef, useState } from 'react';
import ColorField from '../shared-editor/ColorField.jsx';
import { Field, GroupLabel, NumberBox, Row, Section, SegmentedControl, Select, Tabs, Toggle } from '../../ui-kit';
import FormattingToolbar from '../shared-editor/FormattingToolbar.jsx';
import ScrollRow from '../shared-editor/ScrollRow.jsx';
import VideoNameModal from '../shared-editor/VideoNameModal.jsx';
import ImageCropperModal from '../shared-editor/ImageCropperModal.jsx';
import ImageUpload from '../shared-editor/ImageUpload.jsx';
import { TEXT_ANIMATIONS } from '../../constants/textAnimations.js';
import { VIDEO_PRESETS } from '../../constants/videoPresets.js';
import { baseName, readAsDataUrl, takeFile } from '../../utils/files.js';
import { useMediaUpload } from '../../hooks/useMediaUpload.js';

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

export default function WidgetStyleSections({ st, setSt }) {
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

  const [pendingVideo, setPendingVideo] = useState(null); // { url, file, fileName }
  const upload = useMediaUpload();
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

  // A picked image opens the cropper first.
  const handleBadgeImage = (file) => {
    readAsDataUrl(file, setCropSrc);
    setCropFileName(baseName(file));
  };

  const handleCropConfirm = (croppedDataUrl, name) => {
    setCropSrc(null);
    upload({ file: croppedDataUrl, label: name, setSt, path: 'style.badgeImage', local: croppedDataUrl, fields: { 'style.badgeImage': croppedDataUrl, 'style.badgeImageName': name } });
  };

  // Video files are too large to reasonably hold as base64 in state — use an object URL
  // instead (valid for this browser session).
  const handleVideoUpload = (e) => {
    const file = takeFile(e);
    if (!file) return;
    setPendingVideo({ url: URL.createObjectURL(file), file, fileName: baseName(file) });
  };

  // Plays from the local copy at once; the uploaded URL replaces it when the upload ends.
  const confirmVideoUpload = (name) => {
    const { url, file } = pendingVideo;
    setPendingVideo(null);
    upload({
      file, label: name, setSt, path: 'style.customVideoUrl', local: url,
      fields: { 'style.texture': 'video-custom', 'style.customVideoUrl': url, 'style.customVideoName': name },
    });
  };

  const hasTexture = !!(s.texture && s.texture !== 'none');
  const hasImage = !!s.badgeImage;

  return (
    <>
      <Section title="Style">
        <GroupLabel>Heading</GroupLabel>
        <Row>
          <Field label="Heading background" path={['style.headingBg', 'style.headingBgGradient']}>
            <ColorField
              value={s.headingBg}
              fallback="#1A1714"
              onChange={setHeadingBgColor}
              allowGradient
              gradientValue={s.headingBgGradient}
              onChangeGradient={(css) => setStyle('headingBgGradient', css)}
            />
          </Field>
          <FormattingToolbar tx={ht} setTx={setHt} path="headingText" />
        </Row>

        <GroupLabel>Description</GroupLabel>
        <Row>
          <Field label="Background colour" path={['style.bg', 'style.bgGradient']} off={isVideo} offReason="A background video fills the widget — pick an animation to set a colour">
            <ColorField value={s.bg} fallback="#8A1B12" onChange={setSolidBg} />
          </Field>
          <Field label="Text animation" path="behavior.animation">
            <Select value={behavior.animation || 'fade'} options={TEXT_ANIMATIONS} onChange={(v) => setBehavior('animation', v)} ariaLabel="Text animation" />
          </Field>
          <Field label="Duration" path="behavior.itemDuration">
            <NumberBox value={behavior.itemDuration || 4} unit="sec" min={1} max={30} onChange={(n) => setBehavior('itemDuration', Math.round(n))} ariaLabel="Duration" />
          </Field>
        </Row>
        <Row>
          <Field label="Image" path={['style.badgeImageName', 'style.badgeImage']} off={usingPerItemMedia} offReason="Feed/JSON images are on for these headlines — they drive the image">
            <ImageUpload src={s.badgeImage} name={s.badgeImageName} onFile={handleBadgeImage} onRemove={() => setStyle('badgeImage', null)} />
          </Field>
          <Field label="Image position" path="style.badgeImagePos" off={usingPerItemMedia}>
            <SegmentedControl
              value={s.badgeImagePos || 'left'}
              onChange={(v) => setStyle('badgeImagePos', v)}
              off={!hasImage}
              title="Upload an image first"
              ariaLabel="Image position"
              options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]}
            />
          </Field>
          <Field label="Description vertical align" path="bodyText.verticalAlign">
            <SegmentedControl
              value={bt.verticalAlign || 'middle'}
              onChange={(v) => setBt('verticalAlign', v)}
              ariaLabel="Description vertical align"
              options={[{ value: 'top', label: 'Top' }, { value: 'middle', label: 'Middle' }, { value: 'bottom', label: 'Bottom' }]}
            />
          </Field>
        </Row>
        <Row>
          <FormattingToolbar tx={bt} setTx={setBt} path="bodyText" />
        </Row>
      </Section>

      <Section title="Details">
        <Row>
          <Field label="Category text" path="category">
            <input
              type="text"
              placeholder="e.g. News, Sports"
              value={st.category}
              onChange={(e) => setSt((state) => ({ ...state, category: e.target.value }))}
            />
          </Field>
        </Row>
        <Row>
          <Field path="showCategory">
            <Toggle on={!!st.showCategory} onChange={(v) => setSt((state) => ({ ...state, showCategory: v }))}>Show category</Toggle>
          </Field>
          <Field path="showTime">
            <Toggle
              on={!!st.showTime}
              onChange={(checked) => setSt((state) => ({
                ...state,
                showTime: checked,
                publishedAt: checked && !state.publishedAt ? Date.now() : state.publishedAt,
              }))}
            >
              Show time posted
            </Toggle>
          </Field>
          <Field path="showProduct">
            <Toggle on={!!st.showProduct} onChange={(v) => setSt((state) => ({ ...state, showProduct: v }))}>Show publisher</Toggle>
          </Field>
        </Row>
      </Section>

      <Section title="Background">
        <Tabs tabs={[{ id: 'animation', label: 'Animation' }, { id: 'video', label: 'Videos' }]} value={bgTab} onChange={setBgTab} />

        {bgTab === 'animation' && (
          <div className="bg-anim">
            <div className="texture-panel-swatches-hd">
              <span className="grp-label type-group-label">Background animation</span>
              <button
                type="button"
                className="btn ghost small"
                onClick={toggleTextureSettings}
                aria-expanded={showTextureSettings}
              >
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
              <Row className="texture-panel-settings" ref={textureSettingsRef}>
                <Field label="Texture colour" path="style.textureColor">
                  <ColorField value={s.textureColor || '#FFFFFF'} fallback="#FFFFFF" onChange={(v) => setStyle('textureColor', v)} allowEyedropper />
                </Field>
                <Field label="Texture speed" path="style.textureSpeed" off={!hasTexture} offReason="Pick a background animation first">
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
                </Field>
                <Field label="Texture opacity" path="style.textureOpacity" off={!hasTexture} offReason="Pick a background animation first">
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
                </Field>
              </Row>
            )}
          </div>
        )}

        {bgTab === 'video' && (
          <div className="bg-videos">
            <span className="grp-label type-group-label">Background videos</span>
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
      </Section>

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
    </>
  );
}
