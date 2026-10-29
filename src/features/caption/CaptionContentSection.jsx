import { useEffect, useRef } from 'react';
import { Field, Row, Section } from '../../ui-kit';
import ContentTitle from '../shared-editor/ContentTitle.jsx';
import { initialCaptionState } from '../../constants/initialState.js';

const readCaptions = (s) => {
  const names = s.names?.length ? s.names : [''];
  return names.map((name, i) => ({ name, role: s.roles?.[i] || '' }));
};
const writeCaptions = (s, list) => ({ ...s, names: list.map((c) => c.name), roles: list.map((c) => c.role) });

export default function CaptionContentSection({ st, setSt }) {
  const captions = readCaptions(st);
  const listRef = useRef(null);
  const added = useRef(false);

  useEffect(() => {
    if (!added.current) return;
    added.current = false;
    const card = listRef.current?.lastElementChild;
    card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card?.querySelector('input')?.focus({ preventScroll: true });
  }, [captions.length]);

  const update = (fn) => setSt((s) => writeCaptions(s, fn(readCaptions(s))));
  const setField = (i, key, value) => update((list) => list.map((c, j) => (j === i ? { ...c, [key]: value } : c)));
  const hasBlank = captions.some((c) => !c.name.trim());
  const add = () => {
    added.current = true;
    update((list) => (list.some((c) => !c.name.trim()) ? list : [...list, { name: '', role: '' }]));
  };
  const remove = (i) => update((list) => list.filter((_, j) => j !== i));
  const moved = st.pos && (st.pos.x !== initialCaptionState.pos.x || st.pos.y !== initialCaptionState.pos.y);

  return (
    <Section title={<ContentTitle />}>
      <div className="manual-items caption-items">
        <div className="manual-items-list" ref={listRef}>
          {captions.map((c, i) => (
            <div className="manual-item" key={i}>
              <div className="manual-item-hd">
                <span className="manual-item-num">Caption {i + 1}</span>
                {captions.length > 1 && (
                  <button type="button" className="manual-item-remove" onClick={() => remove(i)} title="Delete this caption" aria-label={`Delete caption ${i + 1}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                  </button>
                )}
              </div>
              <div className="caption-item-fields">
                <Field label={<>Title <span className="req-mark">*</span></>} grow path={`names.${i}`}>
                  <input type="text" placeholder="e.g. Rajiv Kumar" value={c.name} onChange={(e) => setField(i, 'name', e.target.value)} />
                </Field>
                <Field label="Subtitle" grow path={`roles.${i}`}>
                  <input type="text" placeholder="e.g. Chief Economist, NITI Aayog" value={c.role} onChange={(e) => setField(i, 'role', e.target.value)} />
                </Field>
              </div>
            </div>
          ))}
        </div>
        <div className="manual-items-divider" />
        <button
          type="button"
          className="btn manual-items-add"
          onClick={add}
          disabled={hasBlank}
          title={hasBlank ? 'Add a title to every caption first' : undefined}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          Add more
        </button>
      </div>

      <Row>
        <Field label="Label above the title" grow path="tag">
          <input type="text" placeholder="Optional — e.g. LIVE, EXCLUSIVE, ON CAMERA" value={st.tag || ''} onChange={(e) => setSt((s) => ({ ...s, tag: e.target.value }))} />
        </Field>
      </Row>
      <p className="caption-hint">
        Drag the caption on the preview to place it — it goes on air in the same spot.
        {moved && (
          <>
            {' '}
            <button type="button" className="zlink" onClick={() => setSt((s) => ({ ...s, pos: { ...initialCaptionState.pos } }))}>Reset position</button>
          </>
        )}
      </p>
    </Section>
  );
}
