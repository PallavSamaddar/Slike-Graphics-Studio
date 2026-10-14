import { Field, SegmentedControl } from '../../ui-kit';
import ImageUpload from '../shared-editor/ImageUpload.jsx';
import { useMediaUpload } from '../../hooks/useMediaUpload.js';
import { baseName, readAsDataUrl } from '../../utils/files.js';

// The Manual widget's items: a box each, with a title (required), a description and an
// image. Kept on `st` as parallel lists like the Feed's — drafts.manual (titles),
// descriptions.manual and media.manual ({ url, name } or null) — so both sources render alike.
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

export default function WidgetManualItems({ st, setSt }) {
  const upload = useMediaUpload();
  const items = readManualItems(st);

  const update = (fn) => setSt((s) => writeManualItems(s, fn(readManualItems(s))));
  const setField = (i, key, value) => update((list) => list.map((item, j) => (j === i ? { ...item, [key]: value } : item)));
  const add = () => update((list) => [...list, { title: '', description: '', media: null }]);
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
      {items.map((item, i) => (
        <div className="manual-item" key={i}>
          <div className="manual-item-hd">
            <span className="manual-item-num">Item {i + 1}</span>
            {items.length > 1 && (
              <button type="button" className="manual-item-remove" onClick={() => remove(i)} title="Remove this item" aria-label={`Remove item ${i + 1}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            )}
          </div>
          <Field label={<>Title <span className="req-mark">*</span></>} grow path={`drafts.manual.${i}`}>
            <input type="text" placeholder="Enter title here" value={item.title} onChange={(e) => setField(i, 'title', e.target.value)} />
          </Field>
          <Field label="Description" grow>
            <textarea className="manual-item-desc" rows={2} placeholder="Enter description (optional)" value={item.description} onChange={(e) => setField(i, 'description', e.target.value)} />
          </Field>
          <Field label="Image">
            <ImageUpload src={item.media?.url} name={item.media?.name} onFile={(file) => pickImage(i, file)} onRemove={() => setField(i, 'media', null)} />
          </Field>
        </div>
      ))}
      {items.some((item) => item.media?.url) && (
        <Field label="Image position" path="style.badgeImagePos">
          <SegmentedControl
            value={st.style?.badgeImagePos || 'left'}
            onChange={(v) => setSt((s) => ({ ...s, style: { ...s.style, badgeImagePos: v } }))}
            ariaLabel="Image position"
            options={[{ value: 'left', label: 'Left' }, { value: 'right', label: 'Right' }]}
          />
        </Field>
      )}
      <button type="button" className="btn ghost manual-items-add" onClick={add}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
        Add more
      </button>
    </div>
  );
}
