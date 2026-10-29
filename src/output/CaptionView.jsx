import { useEffect, useRef, useState } from 'react';

const OUT_MS = 450; // the strap's exit before the next caption comes in
const SNAP = 1.5; // % — a drag this close to the frame's centre line snaps onto it
const PLACEHOLDER = { name: 'Title', role: 'Subtitle' };

const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
const ALIGN = { left: 'flex-start', center: 'center', right: 'flex-end' };


// `picture` puts a stand-in for the live picture behind it (the template thumbnails).
export default function CaptionView({ st, setSt, picture = false }) {
  const { style: s, nameText: nt, behavior } = st;
  const editing = !!setSt;
  const captions = (st.names || [])
    .map((name, i) => ({ name: name?.trim() || '', role: st.roles?.[i]?.trim() || '' }))
    .filter((c) => c.name);
  const shown = captions.length ? captions : editing || picture ? [PLACEHOLDER] : [];
  const count = shown.length;
  const durationMs = Math.max(2, behavior?.itemDuration || 6) * 1000;

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('in');
  useEffect(() => {
    setPhase('in');
    if (count < 2) return undefined;
    const out = setTimeout(() => setPhase('out'), durationMs - OUT_MS);
    const next = setTimeout(() => setIndex((i) => (i + 1) % count), durationMs);
    return () => { clearTimeout(out); clearTimeout(next); };
  }, [index, count, durationMs]);
  const at = index < count ? index : 0;
  const caption = shown[at];

  const frameRef = useRef(null);
  const [drag, setDrag] = useState(null); // { x, y } while dragging
  const pos = drag || st.pos || { x: 6, y: 66 };
  // Detaches a drag in progress; leaving the editor mid-drag drops it without saving.
  const endDrag = useRef(null);
  useEffect(() => () => endDrag.current?.(), []);

  const startDrag = (e) => {
    if (!editing || e.button !== 0) return;
    endDrag.current?.();
    e.preventDefault();
    const strap = e.currentTarget;
    const frame = frameRef.current.getBoundingClientRect();
    const box = strap.getBoundingClientRect();
    const grabX = e.clientX - box.left;
    const grabY = e.clientY - box.top;
    const maxX = 100 - (box.width / frame.width) * 100;
    const maxY = 100 - (box.height / frame.height) * 100;
    const centreX = 50 - (box.width / frame.width) * 50;
    let last = null;
    const onMove = (ev) => {
      let x = clamp(((ev.clientX - grabX - frame.left) / frame.width) * 100, 0, Math.max(0, maxX));
      const y = clamp(((ev.clientY - grabY - frame.top) / frame.height) * 100, 0, Math.max(0, maxY));
      if (Math.abs(x - centreX) < SNAP) x = centreX;
      last = { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
      setDrag(last);
    };
    const detach = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onCancel);
      endDrag.current = null;
    };
    const onUp = () => {
      detach();
      setDrag(null);
      if (last) setSt((state) => ({ ...state, pos: last }));
    };
    // The browser took the pointer back (touch interrupted, window lost): the strap returns.
    const onCancel = () => {
      detach();
      setDrag(null);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onCancel);
    endDrag.current = detach;
  };

  const nameSize = (parseFloat(nt?.fontSize) || 24) / 6.4; // px on the 640-wide design → % of the frame
  const nameStyle = {
    fontFamily: nt?.fontFamily,
    fontWeight: nt?.fontWeight,
    fontStyle: nt?.fontStyle,
    textDecoration: nt?.textDecoration,
    textTransform: nt?.textTransform,
    color: s.nameColor,
  };
  const shape = s.shape || 'bar';
  const centred = !!drag && !!frameRef.current && isCentred(drag, frameRef.current);

  return (
    <div className={'caption-frame' + (editing ? ' caption-frame-edit' : '')} ref={frameRef}>
      {(editing || picture) && <div className="caption-frame-picture" aria-hidden="true" />}
      {centred && <div className="caption-guide" aria-hidden="true" />}
      {caption && (
        <div
          className={'caption-anchor' + (drag ? ' dragging' : '')}
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, '--name-size': nameSize, '--accent': s.accent }}
          onPointerDown={startDrag}
          title={editing ? 'Drag to move the caption' : undefined}
        >
          <div
            key={`${at}:${caption.name}`}
            className={`caption-strap caption-${shape} caption-anim-${behavior?.animation || 'slide'} phase-${phase}`}
            style={{ fontFamily: nt?.fontFamily, background: shape === 'glass' ? s.nameBg : undefined, alignItems: shape === 'line' ? 'stretch' : ALIGN[nt?.textAlign] || 'flex-start', textAlign: nt?.textAlign || 'left' }}
          >
            {st.tag?.trim() && <span className="caption-tag">{st.tag.trim()}</span>}
            <div className="caption-name" style={{ background: shape === 'line' || shape === 'glass' ? 'none' : s.nameBgGradient || s.nameBg || 'none' }}>
              <span style={nameStyle}>{caption.name}</span>
            </div>
            {caption.role && (
              <div className="caption-role" style={{ background: shape === 'line' || shape === 'glass' ? 'none' : s.roleBg || 'none', color: s.roleColor }}>
                <span>{caption.role}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Whether a dragged strap sits on the frame's centre line (shows the guide).
function isCentred(drag, frame) {
  const strap = frame.querySelector('.caption-anchor');
  if (!strap) return false;
  const centreX = 50 - (strap.offsetWidth / frame.offsetWidth) * 50;
  return Math.abs(drag.x - centreX) < 0.15;
}
