import { useEffect, useRef } from 'react';
import { Field } from '../../ui-kit';
import ImageUpload from '../shared-editor/ImageUpload.jsx';
import { useMediaUpload } from '../../hooks/useMediaUpload.js';
import { baseName, readAsDataUrl } from '../../utils/files.js';

export const readManualItems = (s) => {
  const titles = s.drafts?.manual?.length ? s.drafts.manual : [''];
  return titles.map((title, i) => ({
    title,
    description: s.descriptions?.manual?.[i] || '',
    media: s.media?.manual?.[i] || null,
  }));
};

export const writeManualItems = (s, list) => {
  const titles = list.map((item) => item.title);
  return {
    ...s,
    src: 'manual',
    items: titles,
    drafts: { ...s.drafts, manual: titles },
    descriptions: { ...s.descriptions, manual: list.map((item) => item.description) },
    media: { ...s.media, manual: list.map((item) => item.media) },
  };
};
function ManualLines({ st, setSt }) {
  const titles = st.drafts?.manual?.length ? st.drafts.manual : [''];
  const count = titles.filter((t) => t.trim()).length;
  const boxRef = useRef(null);
  const gutterRef = useRef(null);
  const setLines = (text) => setSt((s) => {
    const prev = readManualItems(s);
    return writeManualItems(s, text.split(/\r\n?|\n|\u2028|\u2029/).map((title, i) => ({ title, description: prev[i]?.description || '', media: prev[i]?.media || null })));
  });
  useEffect(() => {
    const box = boxRef.current;
    const area = box?.querySelector('textarea');
    if (!area) return undefined;
    const sync = () => {
      box.style.setProperty('--sb', `${area.offsetWidth - area.clientWidth - 2}px`);
      if (gutterRef.current) gutterRef.current.scrollTop = area.scrollTop;
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(area);
    area.addEventListener('scroll', sync);
    return () => { ro.disconnect(); area.removeEventListener('scroll', sync); };
  }, []);

  return (
    <div className="manual-items manual-lines">
      <Field label={<>News items, one per line <span className="req-mark">*</span>{count > 0 && <span className="manual-lines-count"> · {count}</span>}</>} grow path="drafts.manual.0">
        <div className="manual-lines-box" ref={boxRef}>
          <textarea
            className="manual-item-desc"
            rows={10}
            placeholder="Paste or type the news — one item per line"
            value={titles.join('\n')}
            onChange={(e) => setLines(e.target.value)}
          />
          <div className="manual-lines-gutter" ref={gutterRef} aria-hidden="true">
            {titles.map((title, i) => (
              <div key={i} className="manual-lines-row" data-n={i + 1}>{title || '\u200b'}</div>
            ))}
          </div>
        </div>
      </Field>
    </div>
  );
}

export default function WidgetManualItems({ st, setSt }) {
  const upload = useMediaUpload();
  const items = readManualItems(st);
  const listRef = useRef(null);
  const added = useRef(false);
  useEffect(() => {
    if (!added.current) return;
    added.current = false;
    const card = listRef.current?.lastElementChild;
    card?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card?.querySelector('input')?.focus({ preventScroll: true });
  }, [items.length]);

  const descOn = st.showFeedDescription !== false;
  if (!descOn && st.showFeedMedia === false) return <ManualLines st={st} setSt={setSt} />;

  const update = (fn) => setSt((s) => writeManualItems(s, fn(readManualItems(s))));
  const setField = (i, key, value) => update((list) => list.map((item, j) => (j === i ? { ...item, [key]: value } : item)));
  const hasBlank = items.some((item) => !item.title.trim());
  const add = () => {
    added.current = true;
    update((list) => (list.some((item) => !item.title.trim()) ? list : [...list, { title: '', description: '', media: null }]));
  };
  const remove = (i) => update((list) => list.filter((_, j) => j !== i));

  const pickImage = (i, file) => {
    const name = baseName(file);
    readAsDataUrl(file, (dataUrl) => upload({
      file: dataUrl, label: name, setSt, path: `media.manual.${i}.url`, local: dataUrl,
      fields: { [`media.manual.${i}`]: { url: dataUrl, name } },
    }));
  };

  return (
    <div className="manual-items">
      <div className="manual-items-list" ref={listRef}>
        {items.map((item, i) => (
          <div className="manual-item" key={i}>
            <div className="manual-item-hd">
              <span className="manual-item-num">Item {i + 1}</span>
              {items.length > 1 && (
                <button type="button" className="manual-item-remove" onClick={() => remove(i)} title="Delete this item" aria-label={`Delete item ${i + 1}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" /></svg>
                </button>
              )}
            </div>
            {/* Title and description on the left, the image on their right. */}
            <div className="manual-item-body">
              <div className="manual-item-text">
                <Field label={<>Title <span className="req-mark">*</span></>} grow path={`drafts.manual.${i}`}>
                  <input type="text" placeholder="Enter title here" value={item.title} onChange={(e) => setField(i, 'title', e.target.value)} />
                </Field>
                <Field label="Description" grow off={!descOn} offReason="Descriptions are off — tick Descriptions above the preview to show them">
                  <textarea className="manual-item-desc" rows={2} placeholder="Enter description (optional)" value={item.description} disabled={!descOn} onChange={(e) => setField(i, 'description', e.target.value)} />
                </Field>
              </div>
              <Field label="Image">
                <ImageUpload tile src={item.media?.url} name={item.media?.name} onFile={(file) => pickImage(i, file)} onRemove={() => setField(i, 'media', null)} />
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
        title={hasBlank ? 'Add a title to every item first' : undefined}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        Add more
      </button>
    </div>
  );
}
