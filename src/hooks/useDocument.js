import { useState } from 'react';
import { GRAPHICS } from '../constants/graphics.js';
import { getGraphic, publishGraphic, unpublishGraphic } from '../services/graphics.js';
import { saveGraphic, fromGraphic, hasInlineMedia } from '../services/graphicMapper.js';
import { airFromPublished } from '../services/air.js';
import useRemoteWatch from './useRemoteWatch.js';

const NEW_DOC = { id: null, mt: null, title: '', savedTitle: '' };
const CONFLICT_MESSAGE = 'Someone else saved this graphic after you opened it. Reload it to get their changes.';
const UPLOADING_MESSAGE = 'A video or image is still uploading. Save again once it finishes.';

export default function useDocument(graphics, { onCreated } = {}) {
  const [doc, setDoc] = useState(NEW_DOC);
  const remote = useRemoteWatch(doc.id, doc.mt);

  const startNew = () => setDoc(NEW_DOC);

  const open = async (id) => {
    const graphic = await getGraphic(id);
    const spec = GRAPHICS[graphic.kind];
    if (!spec) throw new Error(`unknown graphic type "${graphic.kind}"`);
    const state = fromGraphic(graphic, spec.initial);
    graphics[graphic.kind].load(state, airFromPublished(graphic.kind, graphic.published, spec.initial));
    const title = graphic.title || '';
    setDoc({ id: graphic.id, mt: graphic.mt, title, savedTitle: title });
    return { kind: graphic.kind, state };
  };

  const persist = async (kind, st) => {
    if (hasInlineMedia(st)) throw new Error(UPLOADING_MESSAGE);
    try {
      const wasNew = !doc.id;
      const { id, mt } = await saveGraphic({ ...doc, kind, st });
      setDoc((d) => ({ ...d, id, mt, savedTitle: d.title }));
      graphics[kind].markSaved(st);
      if (wasNew) onCreated?.(id);
      return { id, mt };
    } catch (err) {
      throw new Error(err.isConflict ? CONFLICT_MESSAGE : `Not saved: ${err.message}`);
    }
  };

  const studio = (kind) => {
    const g = graphics[kind];
    const spec = GRAPHICS[kind];
    return {
      graphic: {
        ...g,
        save: () => persist(kind, g.cur),
        publish: async (note) => {
          const { id, mt } = await persist(kind, g.cur);
          try {
            const published = await publishGraphic(id, mt, note);
            g.setAir(airFromPublished(kind, published, spec.initial));
            return published.v;
          } catch (err) {
            throw new Error(`Saved, but not published: ${err.isConflict ? CONFLICT_MESSAGE : err.message}`);
          }
        },
        takeOffAir: async () => {
          const published = await unpublishGraphic(doc.id);
          g.setAir(airFromPublished(kind, published, spec.initial));
        },
        discard: () => {
          g.discard();
          setDoc((d) => ({ ...d, title: d.savedTitle }));
        },
      },
      doc: {
        id: doc.id,
        title: doc.title,
        savedTitle: doc.savedTitle,
        isNew: !doc.id,
        onTitleChange: (title) => setDoc((d) => ({ ...d, title })),
        remote,
        reload: () => open(doc.id),
      },
    };
  };

  return { id: doc.id, startNew, open, studio };
}
