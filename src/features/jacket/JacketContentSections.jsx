import { useState } from 'react';
import VideoNameModal from '../shared-editor/VideoNameModal.jsx';
import ScrollRow from '../shared-editor/ScrollRow.jsx';
import { TPLS } from '../../constants/tickerTemplates.js';
import { baseName, readAsDataUrl, takeFile } from '../../utils/files.js';
import ImageUpload from '../shared-editor/ImageUpload.jsx';
import { useMediaUpload } from '../../hooks/useMediaUpload.js';
import useUploadedVideos from '../../hooks/useUploadedVideos.js';
import { isMediaReady, mediaThumbUrl } from '../../services/media.js';
import { Field, Row, Section, SegmentedControl, Select, Toggle } from '../../ui-kit';
import ContentTitle from '../shared-editor/ContentTitle.jsx';

// Left-panel form for the Jacket: logo/brand text, a scrolling headline,
// time/weather, a main video (picked from the uploaded videos), and an
// optional left/right vertical image panel. No content-source machinery
// like the widget — a jacket is a live-feed overlay, not a card with a
// data source.
export default function JacketContentSections({ st, setSt }) {
  const setField = (k, v) => setSt((s) => ({ ...s, [k]: v }));
  const setShow = (k, v) => setSt((s) => ({ ...s, [k]: v }));

  const [pendingMainVideo, setPendingMainVideo] = useState(null); // { url, file, fileName }
  const upload = useMediaUpload();

  const handleMainVideoUpload = (e) => {
    const file = takeFile(e);
    if (!file) return;
    setPendingMainVideo({ url: URL.createObjectURL(file), file, fileName: baseName(file) });
  };
  // Plays from the local copy at once; the uploaded URL replaces it when the upload ends.
  const confirmMainVideo = (name) => {
    const { url, file } = pendingMainVideo;
    setPendingMainVideo(null);
    upload({ file, label: name, setSt, path: 'mainVideoUrl', local: url, fields: { mainVideoUrl: url, mainVideoName: name, mainVideoMediaId: null, mainVideoPreset: null } });
  };

  // The videos uploaded to Slike (the widget's background videos too): the Cleo player plays
  // the picked one from its media id.
  const { videos: uploadedVideos } = useUploadedVideos(true);
  const pickVideo = (media) => setSt((s) => ({
    ...s, mainVideoMediaId: media?.id || null, mainVideoName: media ? media.title || 'Untitled video' : '', mainVideoUrl: null, mainVideoPreset: null,
  }));

  // Logo and side image: shown from a local data: URL at once, then uploaded; the uploaded
  // URL replaces the local one when the upload ends.
  const setImage = (key) => (file) => {
    const name = baseName(file);
    readAsDataUrl(file, (url) => upload({ file, label: name, setSt, path: key, local: url, fields: { [key]: url, [`${key}Name`]: name } }));
  };
  const clearImage = (key) => () => { setField(key, null); setField(key + 'Name', ''); };

  return (
    <>
      <Section title={<ContentTitle />}>
        <Row>
          <Field label="Logo text" path="logoText">
            <input type="text" placeholder="e.g. TOI" value={st.logoText} onChange={(e) => setField('logoText', e.target.value)} />
          </Field>
          <Field label="Tag text" path="tagText">
            <input type="text" placeholder="e.g. GLOBAL" value={st.tagText} onChange={(e) => setField('tagText', e.target.value)} />
          </Field>
        </Row>
        <Row>
          <Field label="Logo subtext" path="logoSubtext" grow>
            <input type="text" placeholder="e.g. News That Moves, Nonstop." value={st.logoSubtext} onChange={(e) => setField('logoSubtext', e.target.value)} />
          </Field>
        </Row>
        <Row>
          <Field label={<>Headline <span className="req-mark">*</span></>} grow path="headline">
            <textarea
              className="jk-headline"
              placeholder="Enter a scrolling headline"
              value={st.headline}
              onChange={(e) => setField('headline', e.target.value)}
            />
          </Field>
        </Row>
        <Row>
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
        </Row>
        <Row>
          <Field label="Weather" path="weather">
            <input type="text" placeholder="e.g. 28°C, Clear sky" value={st.weather} onChange={(e) => setField('weather', e.target.value)} />
          </Field>
        </Row>
        <Row>
          <Field path="showLogo"><Toggle on={!!st.showLogo} onChange={(v) => setShow('showLogo', v)}>Show logo</Toggle></Field>
          <Field path="showHeadline"><Toggle on={!!st.showHeadline} onChange={(v) => setShow('showHeadline', v)}>Show headline</Toggle></Field>
          <Field path="showTime"><Toggle on={!!st.showTime} onChange={(v) => setShow('showTime', v)}>Show time</Toggle></Field>
          <Field path="showWeather"><Toggle on={!!st.showWeather} onChange={(v) => setShow('showWeather', v)}>Show weather</Toggle></Field>
        </Row>
      </Section>

      <Section title="Main video">
        <Field label="Choose a video" grow path="mainVideoName">
          <ScrollRow hideNav>
            <button
              type="button"
              className={'texture-swatch' + (!st.mainVideoMediaId && !st.mainVideoUrl ? ' active' : '')}
              onClick={() => pickVideo(null)}
              title="No video — the live feed shows here"
            >
              <span className="texture-swatch-preview texture-swatch-preview-video" />
              <span className="texture-swatch-label">None</span>
            </button>
            {st.mainVideoUrl && !st.mainVideoPreset && (
              <div className="badge-img-thumb-wrap">
                <video className="badge-img-thumb" src={st.mainVideoUrl} muted />
                <span className="badge-img-name">{st.mainVideoName || 'Untitled video'}</span>
                <button type="button" className="badge-img-remove" onClick={() => { setField('mainVideoUrl', null); setField('mainVideoName', ''); }} title="Remove video">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            )}
            {/* TEMP: video upload hidden for now — restore this tile (shown when no uploaded video is set) to bring it back.
            <label className="texture-swatch texture-swatch-upload texture-swatch-upload-empty" title="Upload video">
              <span className="texture-swatch-preview">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </span>
              <span className="texture-swatch-label">Upload</span>
              <input type="file" accept="video/*" hidden onChange={handleMainVideoUpload} />
            </label>
            */}
            {uploadedVideos.map((m) => {
              const ready = isMediaReady(m);
              const thumb = mediaThumbUrl(m);
              return (
                <button
                  key={m.id}
                  type="button"
                  className={'texture-swatch' + (st.mainVideoMediaId === m.id ? ' active' : '')}
                  onClick={() => pickVideo(m)}
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
        </Field>
      </Section>

      <Section title="Side image panel">
        <Row>
          <Field label="Image" path="sideImageName">
          <ImageUpload src={st.sideImage} name={st.sideImageName} onFile={setImage('sideImage')} onRemove={clearImage('sideImage')} />
          </Field>
          <Field label="Position" path="imagePanelPos">
            <SegmentedControl
              value={st.imagePanelPos}
              onChange={(v) => setField('imagePanelPos', v)}
              off={!st.sideImage}
              title="Upload an image first"
              ariaLabel="Position"
              options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }, { value: 'top', label: 'Top' }]}
            />
          </Field>
        </Row>
      </Section>

      <Section title="Logo image">
        <Row>
          <Field label="Image" path="logoImageName">
          <ImageUpload src={st.logoImage} name={st.logoImageName} onFile={setImage('logoImage')} onRemove={clearImage('logoImage')} />
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
        </Row>
      </Section>

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
