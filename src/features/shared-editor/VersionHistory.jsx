import { Dialog, Version } from '../../ui-kit';
import { isOnAir } from '../../services/air.js';
import { when } from '../../utils/time.js';

// Every push this graphic has had, newest first: the version, its note, who pushed it and
// when. The one on air is marked; a graphic taken off air says so at the top.
//   air: the publish record (services/air.js)
export default function VersionHistory({ air, name, onClose }) {
  const rows = [...(air?.history || [])].reverse();
  const onAir = isOnAir(air);
  return (
    <Dialog title={`Versions of “${name}”`} onCancel={onClose} size="sheet" foot={
      <button type="button" className="btn ghost" onClick={onClose}>Close</button>
    }>
      {air?.off && !onAir && (
        <div className="vh-off">Taken off air {when(air.off.at)}{air.off.by ? ` by ${air.off.by}` : ''}.</div>
      )}
      {rows.length === 0 && <div className="rvw-none">Never published.</div>}
      {rows.length > 0 && (
        <ol className="vh-list">
          {rows.map((h) => {
            const current = onAir && h.v === air.v;
            return (
              <li key={h.v} className={'vh-row' + (current ? ' on' : '')}>
                <span className="vh-v"><Version n={h.v} /></span>
                <span className="vh-main">
                  <span className="vh-note">{h.note || <i className="muted">No note</i>}</span>
                  <span className="vh-meta">{h.by ? `${h.by} · ` : ''}{when(h.at)}</span>
                </span>
                {current && <span className="pill live">On air</span>}
              </li>
            );
          })}
        </ol>
      )}
    </Dialog>
  );
}
