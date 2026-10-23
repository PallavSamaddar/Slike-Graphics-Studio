import { SPEEDS, TPLS } from '../constants/tickerTemplates.js';
import useTickerScrollDuration from '../hooks/useTickerScrollDuration.js';
import SingleItemTicker from './SingleItemTicker.jsx';
import { autoTextColor, textShadowFor } from '../utils/color.js';
const BASE_HEIGHT_PX = 48;
// A bar this tall (Extra large and up) is a broadcast headline bar: its text fills it — at
// least 60% of its height — and is at least extra bold, as on news channels; its badge grows
// with it.
const HEADLINE_BAR_PX = 90;
const HEADLINE_TEXT_SHARE = 0.6;
const isHeadlineBar = (st) => (parseFloat(st.style?.height) || 0) >= HEADLINE_BAR_PX;
function fontSizeFor(st) {
  const base = parseFloat(st.text?.fontSize) || 14;
  const height = parseFloat(st.style?.height) || BASE_HEIGHT_PX;
  const designedFor = parseFloat(TPLS.find((t) => t.id === st.template)?.style?.height) || BASE_HEIGHT_PX;
  const scaled = base * (height / designedFor);
  const size = isHeadlineBar(st) ? Math.max(scaled, height * HEADLINE_TEXT_SHARE) : scaled;
  return Math.round(size * 10) / 10;
}
const badgeScaleFor = (st) => (st.badge?.scale || 1) * (isHeadlineBar(st) ? (parseFloat(st.style.height) || BASE_HEIGHT_PX) / 56 : 1);
const fontWeightFor = (st) => (isHeadlineBar(st) ? String(Math.max(800, parseInt(st.text?.fontWeight, 10) || 400)) : st.text?.fontWeight);

function badgeLabel(badge) {
  return badge.customText || badge.type || 'LIVE';
}

export default function TickerView({ st, scaled = false }) {
  const { style: s, badge: b, text: tx, behavior } = st;
  const items = st.items.filter((x) => x.trim());
  const sp = SPEEDS[behavior.speed] || SPEEDS[2];
  const iterCount = behavior.mode === 'loop' ? 'infinite' : 1;
  const [innerRef, scrollMs] = useTickerScrollDuration(sp.pxPerSec, {
    scaledTo: scaled ? '.broadcast-canvas' : undefined,
    active: behavior.mode !== 'single',
  });

  const autoColor = tx.color || autoTextColor(s.bgColor);
  const badgeAutoColor = autoTextColor(b.bgColor);

  const REF_HEIGHT = 1080;
  const cq = (px) => `calc(${parseFloat(px) || 0} / ${REF_HEIGHT} * 100cqh)`;
  const cqPlus = (px, minBump) => `calc(${cq(px)} + ${minBump}px)`;

  const tickerStyle = {
    background: s.bgColor,
    height: scaled ? cqPlus(s.height, 10) : s.height,
  };

  const ddHeightPx = (parseFloat(s.height) || 48) * 1.7;
  const ddTickerStyle = {
    background: s.bgColor,
    height: scaled ? cqPlus(ddHeightPx + 'px', 16) : ddHeightPx + 'px',
  };

  const itemStyle = {
    fontFamily: tx.fontFamily,
    fontSize: scaled ? cqPlus(fontSizeFor(st) + 'px', 6) : fontSizeFor(st) + 'px',
    fontWeight: fontWeightFor(st),
    fontStyle: tx.fontStyle || 'normal',
    textDecoration: tx.textDecoration || 'none',
    textTransform: tx.textTransform,
    textAlign: tx.textAlign || 'left',
    color: autoColor,
    textShadow: textShadowFor(autoColor),
  };

  const track = (
    <div className="p-track">
      {behavior.mode === 'single' ? (
        <SingleItemTicker
          items={items}
          animation={behavior.animation || 'fade'}
          durationSec={behavior.itemDuration || 5}
          itemStyle={itemStyle}
          align={['breaking', 'shatter'].includes(behavior.animation) ? 'center' : tx.textAlign || 'left'}
          stingText={behavior.stingText?.trim() || undefined}
          autoFit={!!tx.autoFit}
        />
      ) : (
        <div
          className="p-inner"
          ref={innerRef}
          style={{ animationDuration: scrollMs ? scrollMs + 'ms' : undefined, animationIterationCount: iterCount }}
        >
          {[0, 1].map((rep) => (
            <span key={rep}>
              {items.map((x, i) => (
                <span key={i}>
                  <span className="p-item" style={itemStyle}>{x}</span>
                  <span className="p-sep" style={{ color: s.separatorColor }}>◆</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      )}
    </div>
  );

  if (false && s.layout === 'double-decker' && b.show) {
    const ddStyle = s.ddStyle || 'chevron';
    return (
      <div className={'p-ticker p-ticker-dd p-dd-' + ddStyle + (scaled ? '' : ' p-ticker-real')} style={{ height: ddTickerStyle.height }}>
        <div className="p-dd-top" style={{ background: b.bgColor, color: badgeAutoColor, textShadow: textShadowFor(badgeAutoColor), fontWeight: b.fontWeight }}>
          {ddStyle === 'stripes' && (
            <span className="p-dd-stripes-mark" aria-hidden="true"><span /><span /><span /></span>
          )}
          <span className="p-dd-top-text">{badgeLabel(b)}</span>
        </div>
        <div className="p-dd-bottom" style={{ background: s.bgColor, color: autoColor, textShadow: textShadowFor(autoColor) }}>
          <div className="p-dd-tag" style={{ background: s.accentColor || '#1A1714', color: autoTextColor(s.accentColor || '#1A1714'), textShadow: textShadowFor(autoTextColor(s.accentColor || '#1A1714')) }}>
            {b.tag2 || '24/7'}
          </div>
          {track}
        </div>
      </div>
    );
  }

  const ddStyle = s.ddStyle || 'chevron';

  return (
    <div className={'p-ticker' + (scaled ? '' : ' p-ticker-real')} style={tickerStyle}>
      {b.show && (
        <div className={'p-badge p-badge-' + ddStyle + (s.badgeShape === 'wedge' ? ' p-badge-wedge' : '')} style={{ background: b.bgColor, color: badgeAutoColor, textShadow: textShadowFor(badgeAutoColor), fontWeight: b.fontWeight, '--badge-scale': badgeScaleFor(st) }}>
          {ddStyle === 'stripes' && (
            <span className="p-dd-stripes-mark" aria-hidden="true"><span /><span /><span /></span>
          )}
          {b.type === 'LIVE' && <div className="p-badge-dot" style={{ background: badgeAutoColor }}></div>}
          <span>{badgeLabel(b)}</span>
        </div>
      )}
      {track}
    </div>
  );
}
