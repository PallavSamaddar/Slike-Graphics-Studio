import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { colorToCss, hsvToRgb, isHex, parseColor, rgbToHex, rgbToHsv } from '../../utils/color.js';

const POPOVER_W = 210;
const POPOVER_H = 360;

// Pulls the two hex/rgb color stops out of a simple two-stop linear-gradient
// string, e.g. "linear-gradient(180deg, #E8432B 0%, #C22F1E 100%)". Returns
// null for anything else (no gradient set, or a shape we don't author here).
function parseGradientStops(css) {
  if (!css || typeof css !== 'string') return null;
  const matches = css.match(/#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)/g);
  if (!matches || matches.length < 2) return null;
  return [matches[0], matches[1]];
}

// Full color picker popover: saturation/lightness canvas + hue slider + opacity
// slider + hex/RGB/A fields + eyedropper. Renders its own {r,g,b,a} state derived
// from `value`, committing to `onChange` (a CSS color string) as the user drags/types.
// Rendered via portal into document.body, positioned fixed from `anchorRef`'s
// bounding rect — this keeps it from being clipped by any ancestor's scroll/overflow.
//
// When `allowGradient` is set, a Solid/Gradient tab appears above the canvas.
// Gradient mode picks two color stops and composes a left-to-right
// `linear-gradient`, committed via `onChangeGradient` (kept separate from
// `onChange` so callers that don't pass `allowGradient` are unaffected).
export default function ColorPickerPopover({ value, onClose, onChange, anchorRef, allowGradient = false, gradientValue, onChangeGradient }) {
  const gradientStops = parseGradientStops(gradientValue);
  const [mode, setMode] = useState(gradientValue ? 'gradient' : 'solid');
  const [stop1, setStop1] = useState(gradientStops ? gradientStops[0] : (typeof value === 'string' && !value.includes('gradient') ? value : '#1A1714'));
  const [stop2, setStop2] = useState(gradientStops ? gradientStops[1] : '#000000');
  // Which gradient stop the canvas/hue/hex controls below are currently
  // editing — lets the same picker UI drive either end of the gradient
  // instead of only offering a plain hex text box.
  const [activeStop, setActiveStop] = useState('stop1');

  const initial = parseColor(mode === 'gradient' ? (activeStop === 'stop1' ? stop1 : stop2) : value);
  const initialHsv = rgbToHsv(initial);
  const [hue, setHue] = useState(initialHsv.h);
  const [sat, setSat] = useState(initialHsv.s);
  const [val, setVal] = useState(initialHsv.v);
  const [alpha, setAlpha] = useState(initial.a);
  const [hexText, setHexText] = useState(rgbToHex(initial));

  const popRef = useRef(null);
  const canvasRef = useRef(null);
  const hueRef = useRef(null);
  const opacityRef = useRef(null);
  const draggingRef = useRef(null);
  const [pos, setPos] = useState(null);

  useLayoutEffect(() => {
    const anchor = anchorRef.current;
    if (!anchor) return;
    const rect = anchor.getBoundingClientRect();
    const openUp = rect.bottom + 8 + POPOVER_H > window.innerHeight;
    const left = Math.min(rect.left, window.innerWidth - POPOVER_W - 8);
    const top = openUp ? Math.max(8, rect.top - 8 - POPOVER_H) : rect.bottom + 8;
    setPos({ left, top });
  }, [anchorRef]);

  const rgb = hsvToRgb(hue, sat, val);
  const css = colorToCss({ ...rgb, a: alpha });

  useEffect(() => setHexText(rgbToHex(rgb)), [hue, sat, val]);

  // In solid mode the canvas/hue drive `onChange` directly. In gradient mode
  // they instead drive whichever stop is active, so the same controls edit
  // either end of the gradient.
  useEffect(() => {
    if (mode === 'solid') {
      onChange(css);
    } else if (mode === 'gradient') {
      const hex = rgbToHex(rgb);
      if (activeStop === 'stop1') setStop1(hex); else setStop2(hex);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hue, sat, val, alpha, mode]);

  useEffect(() => {
    if (allowGradient && mode === 'gradient') {
      onChangeGradient(`linear-gradient(180deg, ${stop1} 0%, ${stop2} 100%)`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stop1, stop2, mode]);

  const chooseMode = (m) => {
    setMode(m);
    if (m === 'solid') onChangeGradient(null);
  };

  // Switching which stop is being edited re-syncs the canvas/hue state from
  // that stop's current color, so the picker always reflects the stop
  // actually selected instead of staying stuck on whatever was first shown.
  const selectStop = (which) => {
    setActiveStop(which);
    const hsv = rgbToHsv(parseColor(which === 'stop1' ? stop1 : stop2));
    setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
  };

  useEffect(() => {
    const onDocDown = (e) => {
      if (popRef.current && !popRef.current.contains(e.target) && !(anchorRef.current && anchorRef.current.contains(e.target))) {
        onClose();
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', onDocDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose, anchorRef]);

  const pctFromEvent = (el, e) => {
    const rect = el.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height));
    return { x, y };
  };

  const handleCanvasPoint = (e) => {
    const { x, y } = pctFromEvent(canvasRef.current, e);
    setSat(x * 100);
    setVal((1 - y) * 100);
  };
  const handleHuePoint = (e) => {
    const { x } = pctFromEvent(hueRef.current, e);
    setHue(x * 360);
  };
  const handleOpacityPoint = (e) => {
    const { x } = pctFromEvent(opacityRef.current, e);
    setAlpha(Math.round(x * 100) / 100);
  };

  const startDrag = (kind, handler) => (e) => {
    e.preventDefault();
    draggingRef.current = kind;
    handler(e);
    const onMove = (ev) => handler(ev);
    const onUp = () => {
      draggingRef.current = null;
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const commitHexText = (v) => {
    setHexText(v);
    if (isHex(v)) {
      const hsv = rgbToHsv(parseColor(v));
      setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
    }
  };

  const setRgbChannel = (ch, n) => {
    const clamped = Math.min(255, Math.max(0, parseInt(n, 10) || 0));
    const next = { ...rgb, [ch]: clamped };
    const hsv = rgbToHsv(next);
    setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
  };

  const useEyedropper = async () => {
    if (!window.EyeDropper) return;
    try {
      const res = await new window.EyeDropper().open();
      const picked = parseColor(res.sRGBHex);
      const hsv = rgbToHsv(picked);
      setHue(hsv.h); setSat(hsv.s); setVal(hsv.v);
    } catch {
      // user cancelled — no-op
    }
  };

  const hueRgb = hsvToRgb(hue, 100, 100);

  if (!pos) return null;

  return createPortal(
    <div className="cp-popover" ref={popRef} role="dialog" aria-label="Color picker" style={{ left: pos.left, top: pos.top }}>
      {allowGradient ? (
        <div className="cp-mode-tabs">
          <button type="button" className={'cp-mode-tab' + (mode === 'solid' ? ' active' : '')} onClick={() => chooseMode('solid')}>Solid</button>
          <button type="button" className={'cp-mode-tab' + (mode === 'gradient' ? ' active' : '')} onClick={() => chooseMode('gradient')}>Gradient</button>
        </div>
      ) : (
        <div className="cp-title">Solid colour</div>
      )}

      {mode === 'gradient' && (
        <>
          <div className="cp-gradient-preview" style={{ background: `linear-gradient(180deg, ${stop1} 0%, ${stop2} 100%)` }} />
          <div className="cp-stop-tabs">
            <button type="button" className={'cp-stop-tab' + (activeStop === 'stop1' ? ' active' : '')} onClick={() => selectStop('stop1')}>
              <span className="cp-stop-tab-swatch" style={{ background: stop1 }} />
              Start
            </button>
            <button type="button" className={'cp-stop-tab' + (activeStop === 'stop2' ? ' active' : '')} onClick={() => selectStop('stop2')}>
              <span className="cp-stop-tab-swatch" style={{ background: stop2 }} />
              End
            </button>
          </div>
        </>
      )}

      <div
        className="cp-canvas"
        ref={canvasRef}
        style={{ background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, rgb(${hueRgb.r},${hueRgb.g},${hueRgb.b}))` }}
        onMouseDown={startDrag('canvas', handleCanvasPoint)}
      >
        <div
          className="cp-canvas-thumb"
          style={{ left: `${sat}%`, top: `${100 - val}%`, background: rgbToHex(rgb) }}
        />
      </div>

      <div className="cp-hue" ref={hueRef} onMouseDown={startDrag('hue', handleHuePoint)}>
        <div className="cp-hue-thumb" style={{ left: `${(hue / 360) * 100}%`, background: rgbToHex(hueRgb) }} />
      </div>

      {mode === 'solid' && (
        <>
          <div className="cp-row cp-opacity-row">
            <span className="cp-lbl">Opacity</span>
            <span className="cp-lbl-val">{Math.round(alpha * 100)}%</span>
          </div>
          <div
            className="cp-opacity"
            ref={opacityRef}
            style={{ background: `linear-gradient(to right, transparent, ${rgbToHex(rgb)}), repeating-conic-gradient(#ccc 0 25%, #fff 0 50%) 0 0/10px 10px` }}
            onMouseDown={startDrag('opacity', handleOpacityPoint)}
          >
            <div className="cp-opacity-thumb" style={{ left: `${alpha * 100}%`, background: css }} />
          </div>
        </>
      )}

      <div className="cp-hex-row">
        <div className="cp-hex-swatch" style={{ background: mode === 'gradient' ? rgbToHex(rgb) : css }} />
        <div className="cp-hex-field">
          <span className="cp-hex-hash">#</span>
          <input
            className="cp-hex-inp"
            maxLength={6}
            value={hexText.replace('#', '')}
            onChange={(e) => commitHexText('#' + e.target.value)}
          />
        </div>
        <button type="button" className="cp-eyedrop-btn" title="Pick color from screen" onClick={useEyedropper} disabled={!window.EyeDropper}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22l1-4 9-9" /><path d="M17.5 2.5a2.12 2.12 0 0 1 3 3L18 8l-3-3 2.5-2.5z" /><path d="M15 5l3 3-9 9-4 1 1-4 9-9z" />
          </svg>
        </button>
      </div>

      <div className="cp-rgb-row">
        <RgbField value={Math.round(rgb.r)} onChange={(n) => setRgbChannel('r', n)} />
        <RgbField value={Math.round(rgb.g)} onChange={(n) => setRgbChannel('g', n)} />
        <RgbField value={Math.round(rgb.b)} onChange={(n) => setRgbChannel('b', n)} />
        {mode === 'solid' && (
          <RgbField value={Math.round(alpha * 100)} max={100} onChange={(n) => setAlpha(Math.min(100, Math.max(0, parseInt(n, 10) || 0)) / 100)} />
        )}
      </div>
      <div className="cp-rgb-labels">
        <span>R</span><span>G</span><span>B</span>{mode === 'solid' && <span>A%</span>}
      </div>
    </div>,
    document.body
  );
}

function RgbField({ value, onChange, max = 255 }) {
  return (
    <input
      type="number"
      className="cp-rgb-inp"
      min={0}
      max={max}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
