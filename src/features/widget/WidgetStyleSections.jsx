import { useEffect, useState } from 'react';
import { Field, Select, Tabs } from '../../ui-kit';
import { TEXT_SPACING } from '../../constants/widgetTemplates.js';
import ScrollRow from '../shared-editor/ScrollRow.jsx';
import TextColorButton from '../shared-editor/TextColorButton.jsx';
import { FontSelect, ImagePosition, Stepper, TextFormat } from '../shared-editor/StyleControls.jsx';
import { feedMediaOn } from '../../constants/widgetTemplates.js';
import { autoTextColor } from '../../utils/color.js';
import VideoNameModal from '../shared-editor/VideoNameModal.jsx';
import { PART_ANIMATIONS, WIDGET_TRANSITIONS, partAnimation, widgetTransition } from '../../constants/textAnimations.js';
import { baseName, takeFile } from '../../utils/files.js';
import { useMediaUpload } from '../../hooks/useMediaUpload.js';
import { uploadVideoWithSdk } from '../../services/uploadSdk.js';
import { isMediaReady, mediaThumbUrl } from '../../services/media.js';
import useUploadedVideos from '../../hooks/useUploadedVideos.js';

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
  const setStyle = (k, v) => setSt((state) => ({ ...state, style: { ...state.style, [k]: v } }));
  const setHt = (k, v) => setSt((state) => ({ ...state, headingText: { ...state.headingText, [k]: v } }));
  const setBt = (k, v) => setSt((state) => ({ ...state, bodyText: { ...state.bodyText, [k]: v } }));
  const setBehavior = (k, v) => setSt((state) => ({ ...state, behavior: { ...state.behavior, [k]: v } }));
  // Picking a solid Background Colour should actually be visible — clear any
  // preset gradient, which otherwise always wins over the solid `bg` value.
  const setSolidBg = (v) => setSt((state) => ({ ...state, style: { ...state.style, bg: v, bgGradient: null } }));
  const setHeadingBgColor = (v) => setSt((state) => ({ ...state, style: { ...state.style, headingBg: v, headingBgGradient: null } }));
  const setDescBgColor = (v) => setSt((state) => ({ ...state, style: { ...state.style, descBg: v, descBgGradient: null } }));

  const [pendingVideo, setPendingVideo] = useState(null); // { url, file, fileName }
  const upload = useMediaUpload();
  const [bgTab, setBgTab] = useState(isVideo ? 'video' : 'animation');
  const { videos: uploadedVideos, refresh: refreshUploaded } = useUploadedVideos(bgTab === 'video');

  // Video files are too large to reasonably hold as base64 in state — use an object URL
  // instead (valid for this browser session).
  const handleVideoUpload = (e) => {
    const file = takeFile(e);
    if (!file) return;
    setPendingVideo({ url: URL.createObjectURL(file), file, fileName: baseName(file) });
  };

  // Uploaded through the Slike upload SDK as a Slike media. It plays from the local copy;
  // the media's id is kept when the upload ends.
  const confirmVideoUpload = (name) => {
    const { url, file } = pendingVideo;
    setPendingVideo(null);
    upload({
      file, label: name, setSt, path: 'style.customVideoUrl', local: url,
      uploader: uploadVideoWithSdk, resultPath: 'style.customVideoMediaId',
      fields: { 'style.texture': 'video-custom', 'style.customVideoUrl': url, 'style.customVideoName': name, 'style.customVideoMediaId': null, 'style.customVideoBase': null },
    }).then(refreshUploaded);
  };

  // An earlier upload, picked from the list: on air it streams from its CDN folder
  // (<base>/hls/master.m3u8, output/GraphicVideo.jsx); the media id is the Cleo fallback.
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
  // A just-finished upload (or a graphic saved before the base was kept) learns its CDN base
  // once the uploaded list holds it, so on air it streams instead of loading the Cleo player.
  const pickedBase = uploadedVideos.find((m) => m.id === s.customVideoMediaId)?.cdn?.[0]?.base;
  useEffect(() => {
    if (pickedBase && !s.customVideoBase) setStyle('customVideoBase', pickedBase);
  }, [pickedBase]); // eslint-disable-line react-hooks/exhaustive-deps
  const customInList = uploadedVideos.some((m) => m.id === s.customVideoMediaId);

  const hasTexture = !!(s.texture && s.texture !== 'none');
  const showsImage = st.src === 'rss' ? feedMediaOn(st) : (st.media?.manual || []).some((m) => m?.url) || !!s.badgeImage;
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
              <Select value={widgetTransition(behavior.transition)} options={WIDGET_TRANSITIONS} onChange={(v) => setBehavior('transition', v)} ariaLabel="Transition between items" title="Transition between items" />
            </Field>
            <Field path="behavior.itemDuration">
              <Stepper value={behavior.itemDuration || 4} display={(v) => `${v}s`} step={1} min={1} max={30} onChange={(v) => setBehavior('itemDuration', v)} label="duration" title="How long each item stays on screen" />
            </Field>
            <Field path="style.textSpacing">
              <Select value={s.textSpacing || 'default'} options={TEXT_SPACING} onChange={(v) => setStyle('textSpacing', v)} ariaLabel="Text spacing" title="Spacing of the heading and description text" />
            </Field>
          </div>
          <div className="cs-row">
            <span className="cs-label">Heading</span>
            <Field path={['style.headingBg', 'style.headingBgGradient']}>
              <TextColorButton
                kind="fill"
                value={s.headingBg}
                fallback="#1A1714"
                bar={s.headingBgGradient || s.headingBg}
                onChange={setHeadingBgColor}
                allowGradient
                gradientValue={s.headingBgGradient}
                onChangeGradient={(css) => setStyle('headingBgGradient', css)}
                label="Heading background"
              />
            </Field>
            <Field path="headingText.color">
              <TextColorButton value={ht.color} auto={autoTextColor(s.headingBg)} onChange={(v) => setHt('color', v)} label="Heading" />
            </Field>
            <Field path="headingText.fontFamily" className="cs-wide">
              <FontSelect tx={ht} setTx={setHt} label="Heading" />
            </Field>
            <TextFormat tx={ht} setTx={setHt} path="headingText" label="Heading" />
          </div>
          <div className="cs-row">
            <span className="cs-label">Description</span>
            <Field path={['style.descBg', 'style.descBgGradient']}>
              <TextColorButton
                kind="fill"
                value={s.descBg}
                fallback="transparent"
                bar={s.descBgGradient || s.descBg}
                onChange={setDescBgColor}
                allowGradient
                gradientValue={s.descBgGradient}
                onChangeGradient={(css) => setStyle('descBgGradient', css)}
                label="Description background"
              />
            </Field>
            <Field path="bodyText.color">
              <TextColorButton value={bt.color} auto={autoTextColor(s.bg)} onChange={(v) => setBt('color', v)} label="Description" />
            </Field>
            <Field path="bodyText.fontFamily" className="cs-wide">
              <FontSelect tx={bt} setTx={setBt} label="Description" />
            </Field>
            <TextFormat tx={bt} setTx={setBt} path="bodyText" label="Description" />
          </div>
          {/* How the heading and the description come in and go out on their own (PartText). */}
          <div className="cs-row">
            <span className="cs-label">Text animation</span>
            <span className="cs-label cs-label-inline">Heading</span>
            <Field path="behavior.headingAnim" className="cs-wide">
              <Select value={partAnimation(behavior.headingAnim)} options={PART_ANIMATIONS} onChange={(v) => setBehavior('headingAnim', v)} ariaLabel="Heading animation" title="How the heading comes in and goes out" />
            </Field>
            <span className="cs-label cs-label-inline">Description</span>
            <Field path="behavior.descAnim" className="cs-wide">
              <Select value={partAnimation(behavior.descAnim)} options={PART_ANIMATIONS} onChange={(v) => setBehavior('descAnim', v)} ariaLabel="Description animation" title="How the description comes in and goes out" />
            </Field>
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
