import { useState } from 'react';
import { GRAPHICS } from '../constants/graphics.js';
import { getGraphic, publishGraphic, unpublishGraphic } from '../services/graphics.js';
import { saveGraphic, fromGraphic, hasInlineMedia } from '../services/graphicMapper.js';
import { airFromPublished } from '../services/air.js';
import { announceAirChange, announceToHost } from '../services/airSignal.js';
import { onlyFeedDiffers, sameFeed, withFeedItems, withFeedOf } from '../services/feed.js';
import useRemoteWatch from './useRemoteWatch.js';

const NEW_DOC = { id: null, mt: null, title: '', savedTitle: '', feedRefreshedAt: null };
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
    setDoc({ id: graphic.id, mt: graphic.mt, title, savedTitle: title, feedRefreshedAt: graphic.last_synced_at || null });
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
    const publishState = async (st, note) => {
      const { id, mt } = await persist(kind, st);
      try {
        const published = await publishGraphic(id, mt, note);
        g.setAir(airFromPublished(kind, published, spec.initial));
        announceAirChange(id);
        announceToHost({ id, v: published.v });
        return published.v;
      } catch (err) {
        throw new Error(`Saved, but not published: ${err.isConflict ? CONFLICT_MESSAGE : err.message}`);
      }
    };
    return {
      graphic: {
        ...g,
        save: () => persist(kind, g.cur),
        publish: (note) => publishState(g.cur, note),
        applyFeed: async (items) => {
          const next = withFeedItems(kind, g.cur, items);
          const changed = !sameFeed(next, g.cur);
          if (changed) g.setCur(next);
          const ownUnsaved = doc.title !== doc.savedTitle || !onlyFeedDiffers(g.cur, g.saved);
          if (!doc.id || ownUnsaved) return { done: changed ? 'applied' : 'same' };
          if (!changed && sameFeed(next, g.saved)) return { done: 'same' };
          await persist(kind, next);
          return { done: 'saved' };
        },
        restore: (entry) => {
          const st = fromGraphic({ kind, ...entry.snapshot }, spec.initial);
          g.setCur(st.src === 'rss' && st.rssUrl === g.cur.rssUrl ? withFeedOf(st, g.cur) : st);
        },
        takeOffAir: async () => {
          const published = await unpublishGraphic(doc.id);
          g.setAir(airFromPublished(kind, published, spec.initial));
          announceAirChange(doc.id);
          announceToHost({ id: doc.id, v: published?.v, off: true });
        },
        discard: () => {
          g.discard();
          setDoc((d) => ({ ...d, title: d.savedTitle }));
        },
      },
      doc: {
        id: doc.id,
        feedRefreshedAt: doc.feedRefreshedAt,
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
