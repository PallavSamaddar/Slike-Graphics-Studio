import { SPEEDS } from '../constants/tickerTemplates.js';
import SingleItemTicker from './SingleItemTicker.jsx';
import { autoTextColor } from '../utils/color.js';

function badgeLabel(badge) {
  return badge.customText || badge.type || 'LIVE';
}

// Renders just the ticker bar (badge + scrolling/single-pass text) from
// state `st`. Shared by the small in-editor preview and the standalone
// player page so both stay in sync.
//
// `scaled`: when true, sizes are expressed in container-query units
// (relative to a real 1080p canvas) with a legibility floor, for use
// inside the small preview frame. When false (player/export), the
// author's raw px values are used as-is — the player IS the real canvas.
export default function TickerView({ st, scaled = false }) {
  const { style: s, badge: b, text: tx, behavior } = st;
  const items = st.items.filter((x) => x.trim());
  const sp = SPEEDS[behavior.speed] || SPEEDS[2];
  const iterCount = behavior.mode === 'loop' ? 'infinite' : 1;

  const autoColor = autoTextColor(s.bgColor);
  const badgeAutoColor = autoTextColor(b.bgColor);

  const REF_HEIGHT = 1080;
  const cq = (px) => `calc(${parseFloat(px) || 0} / ${REF_HEIGHT} * 100cqh)`;
  const cqPlus = (px, minBump) => `calc(${cq(px)} + ${minBump}px)`;

  const tickerStyle = {
    background: s.bgColor,
    height: scaled ? cqPlus(s.height, 10) : s.height,
  };

  // Double-decker stacks a top banner + bottom row in the same bar, so it
  // needs more total height than a single-row ticker at the same "Height"
  // setting — otherwise both rows get squeezed too thin to read.
  const ddHeightPx = (parseFloat(s.height) || 48) * 1.7;
  const ddTickerStyle = {
    background: s.bgColor,
    height: scaled ? cqPlus(ddHeightPx + 'px', 16) : ddHeightPx + 'px',
  };

  const itemStyle = {
    fontFamily: tx.fontFamily,
    fontSize: scaled ? cqPlus(tx.fontSize, 6) : tx.fontSize,
    fontWeight: tx.fontWeight,
    fontStyle: tx.fontStyle || 'normal',
    textDecoration: tx.textDecoration || 'none',
    textTransform: tx.textTransform,
    textAlign: tx.textAlign || 'left',
    color: autoColor,
  };

  const track = (
    <div className="p-track">
      {behavior.mode === 'single' ? (
        <SingleItemTicker
          items={items}
          animation={behavior.animation || 'fade'}
          durationSec={behavior.itemDuration || 5}
          itemStyle={itemStyle}
          align={tx.textAlign || 'left'}
        />
      ) : (
        <div
          className="p-inner"
          style={{ animationDuration: sp.pDur + 'ms', animationIterationCount: iterCount }}
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

  // Double-decker layout disabled for now — kept behind this permanently-false
  // check so the rendering path/markup is preserved for later re-enable.
  // eslint-disable-next-line no-constant-condition
  if (false && s.layout === 'double-decker' && b.show) {
    const ddStyle = s.ddStyle || 'chevron';
    return (
      <div className={'p-ticker p-ticker-dd p-dd-' + ddStyle + (scaled ? '' : ' p-ticker-real')} style={{ height: ddTickerStyle.height }}>
        <div className="p-dd-top" style={{ background: b.bgColor, color: badgeAutoColor, fontWeight: b.fontWeight }}>
          {ddStyle === 'stripes' && (
            <span className="p-dd-stripes-mark" aria-hidden="true"><span /><span /><span /></span>
          )}
          <span className="p-dd-top-text">{badgeLabel(b)}</span>
        </div>
        <div className="p-dd-bottom" style={{ background: s.bgColor, color: autoColor }}>
          <div className="p-dd-tag" style={{ background: s.accentColor || '#1A1714', color: autoTextColor(s.accentColor || '#1A1714') }}>
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
        <div className={'p-badge p-badge-' + ddStyle + (s.badgeShape === 'wedge' ? ' p-badge-wedge' : '')} style={{ background: b.bgColor, color: badgeAutoColor, fontWeight: b.fontWeight, '--badge-scale': b.scale || 1 }}>
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
