import { useState } from 'react';
import { GRAPHICS } from '../constants/graphics.js';
import { getGraphic } from '../services/graphics.js';
import { saveGraphic, fromGraphic, hasInlineMedia } from '../services/graphicMapper.js';

// The graphic open in the studio, as the backend knows it. id/mt are null until its first
// save; mt is the saved version, sent back on every update so the backend can refuse a save
// that would overwrite someone else's newer one. savedTitle is the name as last saved.
const NEW_DOC = { id: null, mt: null, title: '', savedTitle: '' };
const CONFLICT_MESSAGE = 'Someone else saved this graphic after you opened it. Reopen it from Home to get their changes.';
const UPLOADING_MESSAGE = 'A video or image is still uploading. Save again once it finishes.';

//   graphics: { ticker, widget, jacket } — each a useGraphic() state
export default function useDocument(graphics) {
  const [doc, setDoc] = useState(NEW_DOC);

  // A new, unsaved graphic (picked from a template).
  const startNew = () => setDoc(NEW_DOC);

  // graphic.get, then load it into the matching editor. Returns { kind, state };
  // errors are shown by the caller.
  const open = async (id) => {
    const graphic = await getGraphic(id);
    const spec = GRAPHICS[graphic.kind];
    if (!spec) throw new Error(`unknown graphic type "${graphic.kind}"`);
    const state = fromGraphic(graphic, spec.initial);
    graphics[graphic.kind].load(state);
    const title = graphic.title || '';
    setDoc({ id: graphic.id, mt: graphic.mt, title, savedTitle: title });
    return { kind: graphic.kind, state };
  };

  // graphic.create on the first save, graphic.update after that. Throws with a message the
  // page can show; the editor's saved state moves only once the backend has it.
  const persist = async (kind, cur) => {
    // Picked files sit in the editor as local data:/blob: URLs until their upload ends.
    if (hasInlineMedia(cur)) throw new Error(UPLOADING_MESSAGE);
    try {
      const { id, mt } = await saveGraphic({ ...doc, kind, st: cur });
      setDoc((d) => ({ ...d, id, mt, savedTitle: d.title }));
      graphics[kind].markSaved(cur);
    } catch (err) {
      throw new Error(err.isConflict ? CONFLICT_MESSAGE : `Not saved: ${err.message}`);
    }
  };

  // What the studio page needs for one kind: the graphic with backend-backed acts, and the doc.
  // Save keeps the draft; Publish saves, then puts it on air as the next version. Publishing
  // is local for now: the backend stores the graphic, not what is on air.
  const studio = (kind) => {
    const g = graphics[kind];
    return {
      graphic: {
        ...g,
        save: () => persist(kind, g.cur),
        publish: async (note) => {
          await persist(kind, g.cur);
          return g.goOnAir(g.cur, note);
        },
        discard: () => {
          g.discard();
          setDoc((d) => ({ ...d, title: d.savedTitle }));
        },
      },
      doc: {
        title: doc.title,
        savedTitle: doc.savedTitle,
        isNew: !doc.id,
        onTitleChange: (title) => setDoc((d) => ({ ...d, title })),
      },
    };
  };

  return { startNew, open, studio };
}
