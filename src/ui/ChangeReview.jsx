import { useEffect, useRef, useState } from 'react';

// ChangeReview — the one confirm for every write. A page's own Save and Publish open it
// from the right as a side panel (.spanel), stacked, in four zones: head (title and the
// version line), caption (the count, who and when), evidence (sections of was → now rows)
// and act. Esc, the × and Cancel close it and change nothing.
//
//   ver:      [{ dot: 'on'|'off'|'draft'|'new', vn?, words }] joined by → arrows
//   sections: [{ title, path?, rows: [{ what, was, now }] }]
//   aside:    optional element above the acts' row (the Discard act)
export default function ChangeReview({ title, ver, reach, count, who, sections, empty, note, act, busyWord, onAct, onClose, aside }) {
  const [busy, setBusy] = useState(false);
  const [text, setText] = useState('');
  const panelRef = useRef(null);
  const titleRef = useRef(null);

  useEffect(() => {
    const prev = document.activeElement;
    titleRef.current?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape' && !busy) { e.stopPropagation(); onClose(); }
      if (e.key === 'Tab' && panelRef.current) {
        // focus stays inside the panel while it is open
        const f = [...panelRef.current.querySelectorAll('button:not([disabled]), input, [tabindex="0"]')];
        if (!f.length) return;
        const first = f[0];
        const last = f[f.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === titleRef.current)) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); prev?.focus?.(); };
  }, [onClose, busy]);

  const run = () => {
    setBusy(true);
    // the write is local and immediate; the box closes into its receipt
    Promise.resolve(onAct(text.trim())).finally(() => setBusy(false));
  };

  return (
    <div className="dlg-veil spanel-veil" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onClose(); }}>
      <div className="dlg rvw spanel stacked" role="dialog" aria-modal="true" aria-labelledby="rvw-title" ref={panelRef} inert={busy ? '' : undefined}>
        <div className="rvw-head">
          <h3 id="rvw-title" tabIndex={-1} ref={titleRef}>{title}</h3>
          {ver && ver.length > 0 && (
            <div className="rvw-ver">
              {ver.map((v, i) => (
                <span key={i} style={{ display: 'contents' }}>
                  {i > 0 && <span className="va" aria-hidden="true">→</span>}
                  <span className="vt"><i className={'vd ' + v.dot} aria-hidden="true" /><span>{v.vn && <><b className="vn">{v.vn}</b> </>}{v.words}</span></span>
                </span>
              ))}
            </div>
          )}
          {reach && <div className="rvw-reach">{reach}</div>}
          <button type="button" className="sp-x" aria-label="Close" onClick={onClose} disabled={busy}>×</button>
        </div>
        <div className="rvw-cap"><span className="rvw-n">{count}</span>{who && <span className="rvw-who">{who}</span>}</div>
        <div className="dlg-body rvw-body">
          {sections.length === 0 && <div className="rvw-none">{empty}</div>}
          {sections.map((s) => (
            <section className="rvw-sec" key={s.title}>
              <h4 className="rvw-sh">{s.title}{s.path && <span className="rvw-path">· {s.path}</span>}</h4>
              {s.rows.map((r, i) => (
                <div className="rvw-row" key={r.what + i}>
                  <span className="rvw-what">{r.what}</span>
                  <span className="rvw-was" title={r.wasFull}>{r.was}</span>
                  <i className="rvw-arr">→</i>
                  <span className="rvw-now" title={r.nowFull}>{r.now}</span>
                </div>
              ))}
            </section>
          ))}
        </div>
        <div className="dlg-foot">
          {note && <input className="rvw-note" maxLength={120} placeholder="Add a note — optional" value={text} onChange={(e) => setText(e.target.value)} disabled={busy} />}
          <div className="rvw-acts">
            {aside}
            <button type="button" className="btn ghost" onClick={onClose} disabled={busy}>Cancel</button>
            <button type="button" className={'btn' + (busy ? ' busy' : '')} onClick={run} disabled={busy || act.disabled} title={act.title}>
              {busy ? <><i className="btn-spin" aria-hidden="true" />{busyWord}</> : act.label}
            </button>
          </div>
          {busy && <span role="status" className="sr-only">{busyWord}</span>}
        </div>
      </div>
    </div>
  );
}
