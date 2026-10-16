import { useState } from 'react';
import { GRAPHICS } from '../constants/graphics.js';
import { getGraphic, publishGraphic, unpublishGraphic } from '../services/graphics.js';
import { saveGraphic, fromGraphic, hasInlineMedia } from '../services/graphicMapper.js';
import { airFromPublished, isOnAir } from '../services/air.js';
import { announceAirChange } from '../services/airSignal.js';
import { onlyFeedDiffers, sameFeed, withFeedItems, withoutFeed } from '../services/feed.js';
import { diffGraphic } from '../utils/changeDiff.js';
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
        // A feed read: the fresh items go into the graphic, and when nothing but feed content
        // differs it's kept in step on its own —
        //   on air, and on air differs from it only in feed content → put on air again;
        //   a saved draft (or on air with other saved changes waiting) → saved.
        // Unsaved edits of the person's own are never saved or published for them.
        // → { done: 'same' | 'applied' | 'saved' | 'published', heldBy?: [what changed besides
        //   the feed, which kept the refresh from going on air on its own] }
        applyFeed: async (items) => {
          const next = withFeedItems(kind, g.cur, items);
          const changed = !sameFeed(next, g.cur);
          if (changed) g.setCur(next);
          const snap = isOnAir(g.air) ? g.air.snap : null;
          const airBehind = !!snap && !sameFeed(next, snap);
          const ownChanges = (from) => diffGraphic(kind, withoutFeed(from), withoutFeed(next)).sections.flatMap((sec) => sec.rows.map((r) => r.what));
          const unsaved = [...(doc.title !== doc.savedTitle ? ['Name'] : []), ...(onlyFeedDiffers(g.cur, g.saved) ? [] : ownChanges(g.saved))];
          if (!doc.id || unsaved.length) {
            return { done: changed ? 'applied' : 'same', heldBy: airBehind || changed ? unsaved : undefined };
          }
          if (airBehind && onlyFeedDiffers(next, snap)) {
            await publishState(next, 'Feed refreshed');
            return { done: 'published' };
          }
          const heldBy = airBehind ? ownChanges(snap) : undefined;
          if (!changed && sameFeed(next, g.saved)) return { done: 'same', heldBy };
          await persist(kind, next);
          return { done: 'saved', heldBy };
        },
        takeOffAir: async () => {
          const published = await unpublishGraphic(doc.id);
          g.setAir(airFromPublished(kind, published, spec.initial));
          announceAirChange(doc.id);
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
