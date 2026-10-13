import { Version } from '../../ui-kit';
import { ago } from '../../utils/time.js';
import { Thumb, KIND_LABEL } from './GraphicCard.jsx';

// On air and published: every graphic a Slike Live stream is using (on air, first) and every
// other one players are showing (published), each with its version, who pushed it and when,
// and a mark when the draft has moved on since. Opening one goes to its control panel.
//   graphics: cards from useGraphicsIndex that are live or published · onOpen(id)
export default function PublishedStrip({ graphics, onOpen }) {
  if (!graphics.length) return null;
  const onAir = graphics.filter((g) => g.live).length;
  const sum = [onAir && `${onAir} on air`, graphics.length - onAir && `${graphics.length - onAir} published`].filter(Boolean).join(' · ');
  return (
    <section className="home-sec" aria-label="On air and published">
      <div className="home-sec-head">
        <h2 className="type-card-title">{onAir ? 'On air' : 'Published'}</h2>
        <span className="saved-sum">{sum} · open one to manage it</span>
      </div>
      <div className="air-grid">
        {graphics.map((g) => (
          <div
            key={g.id}
            className={'dlg-card air-card' + (g.live ? ' is-live' : '')}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(g.id)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(g.id); } }}
          >
            <div className="air-thumb" aria-hidden="true"><div className="air-thumb-in"><Thumb g={g} compact /></div></div>
            <div className="air-main">
              <span className="air-title" title={g.title}>{g.title || `Untitled ${g.kind}`}</span>
              <span className="air-meta">
                {KIND_LABEL[g.kind] || g.kind}
                {g.published ? <> · <Version n={g.air.v} />{g.air.by ? ` · ${g.air.by}` : ''} · {ago(g.air.at)}</> : ' · nothing published yet'}
              </span>
              {g.air?.note && g.published && <span className="air-note" title={g.air.note}>{g.air.note}</span>}
              <span className="air-pills">
                {g.live && <span className="pill onair" title={`Seen ${ago(g.live.at)}`}>● On air · {g.live.name || g.live.id}</span>}
                {g.published && !g.live && <span className="pill live">Published</span>}
                {g.editedSincePush && <span className="pill draft" title="The saved draft has changed since the last push">Draft edited since</span>}
              </span>
            </div>
            <button type="button" className="btn ghost small air-manage" onClick={(e) => { e.stopPropagation(); onOpen(g.id); }}>Manage</button>
          </div>
        ))}
      </div>
    </section>
  );
}
