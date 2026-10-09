import { useEffect, useRef, useState } from 'react';

// 9:16 crop modal: a fixed-size stage viewport; the image pans/zooms inside
// it (overflow hidden), and a draggable/resizable 9:16 crop rectangle sits
// on top, independent of zoom — styled after a standard photo-editor crop
// dialog.
const RATIO = 9 / 16; // width / height
const STAGE_W = 320;
const STAGE_H = 420;
const OUTPUT_W = 360;
const OUTPUT_H = Math.round(OUTPUT_W / RATIO);

export default function ImageCropperModal({ src, fileName, onCancel, onConfirm }) {
  const [stage, setStage] = useState(null); // {imgEl, naturalW, naturalH, baseFit}
  const [rect, setRect] = useState(null); // crop rect in stage px, {x, y, w, h}
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0); // 0/90/180/270
  const [name, setName] = useState(fileName || 'Untitled image');

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const swapped = rotation === 90 || rotation === 270;
      const effW = swapped ? img.height : img.width;
      const effH = swapped ? img.width : img.height;
      // "cover" fit — image always fills the stage viewport at zoom 1.
      const baseFit = Math.max(STAGE_W / effW, STAGE_H / effH);
      setStage({ imgEl: img, naturalW: img.width, naturalH: img.height, baseFit });
      setZoom(1);
      setPan({ x: 0, y: 0 });
    };
    img.src = src;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  const fitToImage = () => {
    let h = STAGE_H;
    let w = h * RATIO;
    if (w > STAGE_W) { w = STAGE_W; h = w / RATIO; }
    setRect({ x: (STAGE_W - w) / 2, y: (STAGE_H - h) / 2, w, h });
  };

  useEffect(() => {
    if (stage) fitToImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const clampRect = (r) => {
    let { x, y, w, h } = r;
    w = Math.min(w, STAGE_W);
    h = Math.min(h, STAGE_H);
    if (w / h > RATIO) w = h * RATIO; else h = w / RATIO;
    x = Math.min(Math.max(0, x), STAGE_W - w);
    y = Math.min(Math.max(0, y), STAGE_H - h);
    return { x, y, w, h };
  };

  const clampPan = (p, currentZoom) => {
    if (!stage) return p;
    const swapped = rotation === 90 || rotation === 270;
    const effW = swapped ? stage.naturalH : stage.naturalW;
    const effH = swapped ? stage.naturalW : stage.naturalH;
    const scale = stage.baseFit * currentZoom;
    const dispW = effW * scale;
    const dispH = effH * scale;
    const maxX = Math.max(0, (dispW - STAGE_W) / 2);
    const maxY = Math.max(0, (dispH - STAGE_H) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, p.x)), y: Math.min(maxY, Math.max(-maxY, p.y)) };
  };

  const startPanImage = (e) => {
    // Dragging the image itself (outside the crop rect) pans it.
    const start = { x: e.clientX, y: e.clientY, pan: { ...pan } };
    const onMove = (ev) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      setPan(clampPan({ x: start.pan.x + dx, y: start.pan.y + dy }, zoom));
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startMoveRect = (e) => {
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY, rect: { ...rect } };
    const onMove = (ev) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      setRect((r) => {
        const nx = Math.min(Math.max(0, start.rect.x + dx), STAGE_W - r.w);
        const ny = Math.min(Math.max(0, start.rect.y + dy), STAGE_H - r.h);
        return { ...r, x: nx, y: ny };
      });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startResize = (corner) => (e) => {
    e.stopPropagation();
    const start = { x: e.clientX, y: e.clientY, rect: { ...rect } };
    const onMove = (ev) => {
      const dx = ev.clientX - start.x;
      const dy = ev.clientY - start.y;
      setRect(() => {
        const s = start.rect;
        let newRect;
        if (corner === 'se') {
          const h = Math.max(40, s.h + dy);
          newRect = { x: s.x, y: s.y, w: h * RATIO, h };
        } else if (corner === 'sw') {
          const h = Math.max(40, s.h + dy);
          const w = h * RATIO;
          newRect = { x: s.x + s.w - w, y: s.y, w, h };
        } else if (corner === 'ne') {
          const h = Math.max(40, s.h - dy);
          const w = h * RATIO;
          newRect = { x: s.x, y: s.y + s.h - h, w, h };
        } else {
          const h = Math.max(40, s.h - dy);
          const w = h * RATIO;
          newRect = { x: s.x + s.w - w, y: s.y + s.h - h, w, h };
        }
        return clampRect(newRect);
      });
    };
    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleZoom = (v) => {
    setZoom(v);
    setPan((p) => clampPan(p, v));
  };

  const confirm = () => {
    if (!stage || !rect) return;
    const swapped = rotation === 90 || rotation === 270;
    const effW = swapped ? stage.naturalH : stage.naturalW;
    const effH = swapped ? stage.naturalW : stage.naturalH;
    const scale = stage.baseFit * zoom;
    const dispW = effW * scale;
    const dispH = effH * scale;

    // Render the pannable/zoomed/rotated image into an offscreen canvas at
    // stage scale, then read the crop rect straight off it.
    const off = document.createElement('canvas');
    off.width = STAGE_W;
    off.height = STAGE_H;
    const octx = off.getContext('2d');
    octx.save();
    octx.translate(STAGE_W / 2 + pan.x, STAGE_H / 2 + pan.y);
    octx.rotate((rotation * Math.PI) / 180);
    const drawW = swapped ? dispH : dispW;
    const drawH = swapped ? dispW : dispH;
    octx.drawImage(stage.imgEl, -drawW / 2, -drawH / 2, drawW, drawH);
    octx.restore();

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_W;
    canvas.height = OUTPUT_H;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(off, rect.x, rect.y, rect.w, rect.h, 0, 0, OUTPUT_W, OUTPUT_H);
    onConfirm(canvas.toDataURL('image/jpeg', 0.9), name);
  };

  const swapped = rotation === 90 || rotation === 270;
  const effW = stage ? (swapped ? stage.naturalH : stage.naturalW) : 0;
  const effH = stage ? (swapped ? stage.naturalW : stage.naturalH) : 0;
  const scale = stage ? stage.baseFit * zoom : 1;

  return (
    <div className="cropper-overlay" role="dialog" aria-modal="true">
      <div className="cropper-card">
        <div className="cropper-header">
          <div>
            <div className="cropper-title">Crop image (9:16)</div>
            <div className="cropper-subtitle">Adjust and move the crop to get the perfect frame</div>
          </div>
          <button type="button" className="cropper-close" onClick={onCancel} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>

        <div className="cropper-body">
          {stage && rect && (
            <div className="cropper-stage-scroll">
              <div className="cropper-stage" style={{ width: STAGE_W, height: STAGE_H }} onMouseDown={startPanImage}>
                <span className="cropper-ratio-tag">9:16</span>
                <img
                  src={src}
                  alt=""
                  draggable={false}
                  style={{
                    width: effW * scale,
                    height: effH * scale,
                    transform: `translate(-50%, -50%) translate(${pan.x}px, ${pan.y}px) rotate(${rotation}deg)`,
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                  }}
                />
                <div className="cropper-dim" />
                <div
                  className="cropper-rect"
                  style={{ left: rect.x, top: rect.y, width: rect.w, height: rect.h }}
                  onMouseDown={startMoveRect}
                >
                  <div className="cropper-grid">
                    <span /><span /><span />
                    <span /><span /><span />
                    <span /><span /><span />
                  </div>
                  <div className="cropper-handle cropper-handle-nw" onMouseDown={startResize('nw')} />
                  <div className="cropper-handle cropper-handle-ne" onMouseDown={startResize('ne')} />
                  <div className="cropper-handle cropper-handle-sw" onMouseDown={startResize('sw')} />
                  <div className="cropper-handle cropper-handle-se" onMouseDown={startResize('se')} />
                </div>
              </div>
              <div className="cropper-dims-caption">{Math.round(rect.w)} × {Math.round(rect.h)} px</div>
            </div>
          )}

          <div className="cropper-panel">
            <div className="cropper-panel-g">
              <label className="cropper-panel-lbl">Image name</label>
              <input
                type="text"
                className="form-inp cropper-name-inp"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter image name"
              />
            </div>

            <div className="cropper-panel-g">
              <label className="form-lbl form-lbl-row">
                Zoom
                <div className="range-badge-input">
                  <input
                    type="number"
                    min={100}
                    max={250}
                    value={Math.round(zoom * 100)}
                    onChange={(e) => handleZoom(Math.min(2.5, Math.max(1, (parseInt(e.target.value, 10) || 100) / 100)))}
                  />
                  <span>%</span>
                </div>
              </label>
              <div className="range-with-badge-slider">
                <div className="range-with-badge-slider-boxed">
                  <input
                    type="range"
                    min={1}
                    max={2.5}
                    step={0.01}
                    value={zoom}
                    onChange={(e) => handleZoom(parseFloat(e.target.value))}
                    className="form-range"
                    style={{ '--range-pct': `${((zoom - 1) / 1.5) * 100}%` }}
                  />
                </div>
                <div className="range-ticks">
                  <i /><i /><i />
                </div>
                <div className="range-tick-labels">
                  <b>100%</b><b>175%</b><b>250%</b>
                </div>
              </div>
            </div>

            <div className="cropper-panel-g">
              <label className="cropper-panel-lbl">Rotate</label>
              <div className="cropper-rotate-row">
                <button type="button" className="btn ghost cropper-rotate-btn" onClick={() => setRotation((r) => (r - 90 + 360) % 360)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 109-9" /><polyline points="3 3 3 12 12 12" /></svg>
                  Left
                </button>
                <button type="button" className="btn ghost cropper-rotate-btn" onClick={() => setRotation((r) => (r + 90) % 360)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 10-9 9" /><polyline points="21 3 21 12 12 12" /></svg>
                  Right
                </button>
              </div>
            </div>

            <div className="cropper-panel-g">
              <label className="cropper-panel-lbl">Quick Actions</label>
              <div className="cropper-rotate-row">
                <button type="button" className="btn ghost cropper-rotate-btn" onClick={fitToImage}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" /><line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" /></svg>
                  Fit to image
                </button>
                <button
                  type="button"
                  className="btn ghost cropper-rotate-btn"
                  onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); setRotation(0); fitToImage(); }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="cropper-actions">
          <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
          <button type="button" className="btn" onClick={confirm} disabled={!rect}>Use image</button>
        </div>
      </div>
    </div>
  );
}
