import { SPEEDS } from '../constants/tickerTemplates.js';

function badgeLabel(badge) {
  if (badge.type === 'CUSTOM') return badge.customText || 'CUSTOM';
  return badge.type;
}

export default function LiveBar({ st }) {
  const { style: s, badge: b, text: tx, behavior } = st;
  const items = st.items.filter((x) => x.trim());
  const sp = SPEEDS[behavior.speed] || SPEEDS[2];
  const iterCount = behavior.mode === 'loop' ? 'infinite' : 1;

  const itemStyle = {
    fontFamily: tx.fontFamily,
    fontSize: tx.fontSize,
    fontWeight: tx.fontWeight,
    fontStyle: tx.fontStyle || 'normal',
    textDecoration: tx.textDecoration || 'none',
    letterSpacing: tx.letterSpacing,
    textTransform: tx.textTransform,
    textAlign: tx.textAlign || 'left',
    color: s.textColor,
  };

  const track = (
    <div className="live-track" style={{ '--fade': s.bgGradient ? 'rgba(0,0,0,0)' : s.bgColor }}>
      <div
        className="live-inner"
        id="liveInner"
        style={{ animationDuration: sp.lDur + 'ms', animationIterationCount: iterCount }}
      >
        {[0, 1].map((rep) => (
          <span key={rep}>
            {items.map((x, i) => (
              <span key={i}>
                <span className="live-item" style={itemStyle}>{x}</span>
                <span className="live-sep" style={{ color: s.separatorColor }}>◆</span>
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div className="live-bar">
      <div className="live-meta">
        <div className="live-dot"></div>
        <span className="live-meta-text">Live Preview</span>
      </div>
      {s.layout === 'double-decker' && b.show ? (
        <div className={'live-ticker-widget live-ticker-widget-dd live-dd-' + (s.ddStyle || 'chevron')} id="liveWidget">
          <div className="live-dd-top" style={{ background: b.bgColor, color: b.textColor, fontWeight: b.fontWeight }}>
            {(s.ddStyle || 'chevron') === 'stripes' && (
              <span className="live-dd-stripes-mark" aria-hidden="true"><span /><span /><span /></span>
            )}
            <span className="live-dd-top-text">{badgeLabel(b)}</span>
          </div>
          <div className="live-dd-bottom" style={{ background: s.bgGradient || s.bgColor }}>
            <div className="live-dd-tag" style={{ background: s.accentColor || '#1A1714', color: '#fff' }}>
              {b.tag2 || '24/7'}
            </div>
            {track}
          </div>
        </div>
      ) : (
        <div className="live-ticker-widget" id="liveWidget" style={{ background: s.bgGradient || s.bgColor }}>
          {b.show && (
            <div className={'live-badge' + (s.badgeShape === 'wedge' ? ' live-badge-wedge' : '')} style={{ background: b.bgColor, color: b.textColor, fontWeight: b.fontWeight, '--badge-scale': b.scale || 1 }}>
              {b.type === 'LIVE' && <div className="live-badge-dot" style={{ background: b.textColor }}></div>}
              <span>{badgeLabel(b)}</span>
            </div>
          )}
          {track}
        </div>
      )}
    </div>
  );
}
