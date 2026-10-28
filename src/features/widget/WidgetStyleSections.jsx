import { useEffect, useState } from 'react';
import { Field, Select, Tabs } from '../../ui-kit';
import { MIN_ITEM_SECONDS, TEXT_SPACING } from '../../constants/widgetTemplates.js';

import ScrollRow from '../shared-editor/ScrollRow.jsx';
import TextColorButton from '../shared-editor/TextColorButton.jsx';
import { FontSelect, ImagePosition, Stepper, TextFormat } from '../shared-editor/StyleControls.jsx';
import { feedMediaOn } from '../../constants/widgetTemplates.js';
import { autoTextColor } from '../../utils/color.js';
import VideoNameModal from '../shared-editor/VideoNameModal.jsx';
import { DESC_ANIMATIONS, PART_WISE_TRANSITIONS, STATIC_ANIMATIONS, WIDGET_TRANSITIONS, cardTransition, descAnimation, staticAnimation } from '../../constants/textAnimations.js';
import { writesWords } from '../../output/PartText.jsx';
import { baseName, takeFile } from '../../utils/files.js';
import { useMediaUpload } from '../../hooks/useMediaUpload.js';
import { uploadVideoWithSdk } from '../../services/uploadSdk.js';
import { isMediaReady, mediaThumbUrl } from '../../services/media.js';
import useUploadedVideos from '../../hooks/useUploadedVideos.js';

const CENTRED = 'Animated text is always centred — set the animation to No animation to align it';

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
  const { style: s, headingText: ht, behavior } = st;
  // The static heading is always on top; each item's title sits under it, written on its own way.
  const titleAnim = descAnimation(behavior.headingAnim);
  const headingAnimOn = titleAnim !== 'none';
  const textWritesOn = writesWords(titleAnim);
  const transitionOptions = WIDGET_TRANSITIONS.map((o) => (textWritesOn && PART_WISE_TRANSITIONS.includes(o.value)
    ? { ...o, disabled: true, title: 'Not with a written-on text animation — the words come in on their own' }
    : o));
  const isVideo = !!(s.texture && s.texture.startsWith('video'));
  const setStyle = (k, v) => setSt((state) => ({ ...state, style: { ...state.style, [k]: v } }));
  const setHt = (k, v) => setSt((state) => ({ ...state, headingText: { ...state.headingText, [k]: v } }));
  const setBehavior = (k, v) => setSt((state) => ({ ...state, behavior: { ...state.behavior, [k]: v } }));
  const setSolidBg = (v) => setSt((state) => ({ ...state, style: { ...state.style, bg: v, bgGradient: null } }));

  const [pendingVideo, setPendingVideo] = useState(null); // { url, file, fileName }
  const upload = useMediaUpload();
  const [bgTab, setBgTab] = useState(isVideo ? 'video' : 'animation');
  const { videos: uploadedVideos, refresh: refreshUploaded } = useUploadedVideos(bgTab === 'video');

  const handleVideoUpload = (e) => {
    const file = takeFile(e);
    if (!file) return;
    setPendingVideo({ url: URL.createObjectURL(file), file, fileName: baseName(file) });
  };

  const confirmVideoUpload = (name) => {
    const { url, file } = pendingVideo;
    setPendingVideo(null);
    upload({
      file, label: name, setSt, path: 'style.customVideoUrl', local: url,
      uploader: uploadVideoWithSdk, resultPath: 'style.customVideoMediaId',
      fields: { 'style.texture': 'video-custom', 'style.customVideoUrl': url, 'style.customVideoName': name, 'style.customVideoMediaId': null, 'style.customVideoBase': null },
    }).then(refreshUploaded);
  };

  const pickUploadedVideo = (media) => setSt((state) => ({
    ...state,
    style: {
      ...state.style,
      texture: 'video-custom',
      customVideoMediaId: media.id,
      customVideoBase: media.cdn?.[0]?.base || null,
      customVideoUrl: null,
      customVideoName: media.title || 'Untitled video',
    },
  }));
  const pickedUploaded = (media) => s.texture === 'video-custom' && s.customVideoMediaId === media.id;
  const pickedBase = uploadedVideos.find((m) => m.id === s.customVideoMediaId)?.cdn?.[0]?.base;
  useEffect(() => {
    if (pickedBase && !s.customVideoBase) setStyle('customVideoBase', pickedBase);
  }, [pickedBase]); // eslint-disable-line react-hooks/exhaustive-deps
  const customInList = uploadedVideos.some((m) => m.id === s.customVideoMediaId);

  const hasTexture = !!(s.texture && s.texture !== 'none');
  const showsImage = st.src === 'rss' ? feedMediaOn(st) : st.showFeedMedia !== false && ((st.media?.manual || []).some((m) => m?.url) || !!s.badgeImage);
  const noImage = st.src === 'rss' ? 'Tick Images/videos above the preview first' : 'Add an image to an item first';
  const imagePos = (st.src === 'rss' && st.media?.rss?.find(Boolean)?.pos) || s.badgeImagePos || 'left';
  const setImagePos = (pos) => setSt((state) => ({
    ...state,
    style: { ...state.style, badgeImagePos: pos },
    media: { ...state.media, rss: (state.media?.rss || []).map((m) => (m ? { ...m, pos } : m)) },
  }));
  const opacityPct = Math.round((s.textureOpacity ?? 1) * 100);
  const opacitySlider = (label) => (
    <div className="tool-group texture-opacity-group" title={`${label} opacity`}>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={opacityPct}
        onChange={(e) => setStyle('textureOpacity', parseInt(e.target.value, 10) / 100)}
        className="form-range"
        aria-label={`${label} opacity`}
        style={{ '--range-pct': `${opacityPct}%` }}
      />
      <span className="texture-opacity-val">{opacityPct}%</span>
    </div>
  );

  return (
    <>
      <div className="fieldset style-sec" aria-label="Style">
        <div className="cs-lines">
          <div className="cs-row">
            <span className="cs-label">Card</span>
            <Field path={['style.bg', 'style.bgGradient']} off={isVideo} offReason="A background video fills the widget — pick an animation to set a colour">
              <TextColorButton kind="fill" value={s.bg} fallback="#8A1B12" bar={s.bgGradient || s.bg} onChange={setSolidBg} label="Card background" />
            </Field>
            <Field path="behavior.transition" className="cs-wide">
              <Select value={cardTransition(behavior.transition, textWritesOn)} options={transitionOptions} onChange={(v) => setBehavior('transition', v)} ariaLabel="Transition between items" title="Transition between items" />
            </Field>
            <Field path="behavior.itemDuration">
              <Stepper value={Math.max(MIN_ITEM_SECONDS, behavior.itemDuration || MIN_ITEM_SECONDS)} display={(v) => `${v}s`} step={1} min={MIN_ITEM_SECONDS} max={30} onChange={(v) => setBehavior('itemDuration', v)} label="duration" title="How long each item stays on screen" />
            </Field>
            <Field path="style.textSpacing">
              <Select value={s.textSpacing || 'default'} options={TEXT_SPACING} onChange={(v) => setStyle('textSpacing', v)} ariaLabel="Text spacing" title="Spacing of the heading and description text" />
            </Field>
            <Field path="style.topLight">
              <label className="cs-check" title="A light glides slowly along the top edge of the static heading, again and again">
                <input type="checkbox" checked={!!s.topLight} onChange={(e) => setStyle('topLight', e.target.checked)} />
                Top light
              </label>
            </Field>
          </div>
          {/* Always on top of the card: the static heading. */}
          <div className="cs-row">
            <span className="cs-label">Heading</span>
            <Field path="style.staticBg">
              <TextColorButton kind="fill" value={s.staticBg || '#FFFFFF'} fallback="#FFFFFF" bar={s.staticBg || '#FFFFFF'} onChange={(v) => setStyle('staticBg', v)} label="Static heading background" />
            </Field>
            <Field path="style.staticColor">
              <TextColorButton value={s.staticColor || '#B5000F'} auto={autoTextColor(s.staticBg || '#FFFFFF')} onChange={(v) => setStyle('staticColor', v)} label="Static heading" />
            </Field>
            <Field path="behavior.staticAnim" className="cs-wide">
              <Select value={staticAnimation(behavior.staticAnim)} options={STATIC_ANIMATIONS} onChange={(v) => setBehavior('staticAnim', v)} ariaLabel="Static heading animation" title="How the static heading is animated, over and over" />
            </Field>
          </div>
          <div className="cs-row">
            <span className="cs-label">Text</span>
            <Field path="headingText.color">
              <TextColorButton value={ht.color} auto={autoTextColor(s.bg)} onChange={(v) => setHt('color', v)} label="Text" />
            </Field>
            <Field path="headingText.fontFamily" className="cs-wide">
              <FontSelect tx={ht} setTx={setHt} label="Text" />
            </Field>
            <Field path="behavior.headingAnim" className="cs-wide">
              <Select value={titleAnim} options={DESC_ANIMATIONS} onChange={(v) => setBehavior('headingAnim', v)} ariaLabel="Text animation" title="How each item's text comes in and goes out" />
            </Field>
            <TextFormat tx={ht} setTx={setHt} path="headingText" label="Text" alignOff={headingAnimOn} alignReason={CENTRED} />
          </div>
          <div className="cs-row">
            <span className="cs-label">Image</span>
            <Field path={['style.badgeImagePos', 'media']} off={!showsImage} offReason={noImage}>
              <ImagePosition value={imagePos} onChange={setImagePos} disabled={!showsImage} title={showsImage ? undefined : noImage} />
            </Field>
            <Field path="style.imageSlowZoom" off={!showsImage} offReason={noImage}>
              <label className="cs-check" title="While an item is on screen, its image slowly zooms in">
                <input type="checkbox" checked={!!s.imageSlowZoom} disabled={!showsImage} onChange={(e) => setStyle('imageSlowZoom', e.target.checked)} />
                Slow zoom
              </label>
            </Field>
          </div>
        </div>
      </div>

      <div className="fieldset bg-sec" aria-label="Background">
        <div className="cs-row bg-tabs-row">
          <span className="cs-label">Background</span>
          <div className="bg-tabs-full">
            <Tabs tabs={[{ id: 'animation', label: 'Animation' }, { id: 'video', label: 'Video' }]} value={bgTab} onChange={setBgTab} ariaLabel="Background type" />
          </div>
        </div>
        <div className="bg-tab-body">
          <div className={'bg-anim' + (bgTab === 'animation' ? '' : ' bg-tab-hidden')} aria-hidden={bgTab !== 'animation' || undefined}>
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

            <div className="cs-lines bg-texture">
              <div className="cs-row">
                <span className="cs-label">Texture</span>
                <Field path="style.textureColor">
                  <TextColorButton kind="fill" value={s.textureColor} fallback="#FFFFFF" onChange={(v) => setStyle('textureColor', v)} label="Texture" />
                </Field>
                <Field path="style.textureSpeed" off={!hasTexture} offReason="Pick a background animation first">
                  <Stepper value={s.textureSpeed ?? 1} display={(v) => `${v}×`} step={0.5} min={0.5} max={3} onChange={(v) => setStyle('textureSpeed', v)} label="texture speed" title="Texture speed" />
                </Field>
                <Field path="style.textureOpacity" off={!hasTexture} offReason="Pick a background animation first">
                  {opacitySlider('Texture')}
                </Field>
              </div>
            </div>
          </div>

        {bgTab === 'video' && (
          <div className="bg-videos">
            <ScrollRow>
              <label className="texture-swatch texture-swatch-upload texture-swatch-upload-empty" title="Upload video">
                <span className="texture-swatch-preview">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </span>
                <span className="texture-swatch-label">Upload</span>
                <input type="file" accept="video/*" hidden onChange={handleVideoUpload} />
              </label>
              {(s.customVideoUrl || s.customVideoMediaId) && !customInList && (
                <button
                  type="button"
                  className={'texture-swatch' + (s.texture === 'video-custom' ? ' active' : '')}
                  onClick={() => setStyle('texture', 'video-custom')}
                  title={s.customVideoName || 'Untitled video'}
                >
                  <span className="texture-swatch-preview texture-swatch-preview-video">
                    {s.customVideoUrl && <video className="texture-swatch-video-thumb" src={s.customVideoUrl} muted />}
                  </span>
                  <span className="texture-swatch-label">{s.customVideoName || 'Untitled video'}</span>
                </button>
              )}
              {uploadedVideos.map((m) => {
                const ready = isMediaReady(m);
                const thumb = mediaThumbUrl(m);
                return (
                  <button
                    key={m.id}
                    type="button"
                    className={'texture-swatch' + (pickedUploaded(m) ? ' active' : '')}
                    onClick={() => pickUploadedVideo(m)}
                    disabled={!ready}
                    title={ready ? m.title : `${m.title} — still processing`}
                  >
                    <span className="texture-swatch-preview texture-swatch-preview-video">
                      {thumb && <img className="texture-swatch-video-thumb" src={thumb} alt="" loading="lazy" />}
                    </span>
                    <span className="texture-swatch-label">{ready ? m.title : 'Processing…'}</span>
                  </button>
                );
              })}
            </ScrollRow>
            <div className="cs-lines bg-texture">
              <div className="cs-row">
                <span className="cs-label">Video</span>
                <Field path="style.textureOpacity" off={!isVideo} offReason="Pick a background video first">
                  {opacitySlider('Video')}
                </Field>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>

      {pendingVideo && (
        <VideoNameModal
          src={pendingVideo.url}
          fileName={pendingVideo.fileName}
          onCancel={() => setPendingVideo(null)}
          onConfirm={confirmVideoUpload}
        />
      )}

    </>
  );
}
