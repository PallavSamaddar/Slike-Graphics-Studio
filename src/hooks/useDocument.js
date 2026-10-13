import { useState } from 'react';
import { GRAPHICS } from '../constants/graphics.js';
import { getGraphic } from '../services/graphics.js';
import { saveGraphic, fromGraphic, hasInlineMedia } from '../services/graphicMapper.js';
import { airOf, nextAir, offAir, withLive, withoutLive, liveIsFresh } from '../services/air.js';
import { getMe, toProfile } from '../services/user.js';
import useRemoteWatch from './useRemoteWatch.js';

// The graphic open in the studio, as the backend knows it. id/mt are null until its first
// save; mt is the saved version, sent back on every update so the backend can refuse a save
// that would overwrite someone else's newer one. savedTitle is the name as last saved.
const NEW_DOC = { id: null, mt: null, title: '', savedTitle: '' };
const CONFLICT_MESSAGE = 'Someone else saved this graphic after you opened it. Reload it to get their changes.';
const UPLOADING_MESSAGE = 'A video or image is still uploading. Save again once it finishes.';

// The signed-in person's name for the publish record; blank when the profile can't load.
const whoAmI = () => getMe().then((me) => toProfile(me).name).catch(() => '');

//   graphics:  { ticker, widget, jacket } — each a useGraphic() state
//   onCreated: (id) => … called once a new graphic's first save gives it an id
export default function useDocument(graphics, { onCreated } = {}) {
  const [doc, setDoc] = useState(NEW_DOC);
  // Someone else's newer save of the open graphic, seen by the watch: { mt, by } or null.
  const remote = useRemoteWatch(doc.id, doc.mt);

  // A new, unsaved graphic (picked from a template).
  const startNew = () => setDoc(NEW_DOC);

  // graphic.get, then load it into the matching editor. Returns { kind, state };
  // errors are shown by the caller.
  const open = async (id) => {
    const graphic = await getGraphic(id);
    const spec = GRAPHICS[graphic.kind];
    if (!spec) throw new Error(`unknown graphic type "${graphic.kind}"`);
    const state = fromGraphic(graphic, spec.initial);
    graphics[graphic.kind].load(state, airOf(graphic.config));
    const title = graphic.title || '';
    setDoc({ id: graphic.id, mt: graphic.mt, title, savedTitle: title });
    return { kind: graphic.kind, state };
  };

  // graphic.create on the first save, graphic.update after that, with `air` riding along as
  // the publish record. Throws with a message the page can show; the editor's saved state
  // moves only once the backend has it. `title` defaults to the name as typed. Resolves to
  // the saved id.
  const persist = async (kind, st, air, title = doc.title) => {
    // Picked files sit in the editor as local data:/blob: URLs until their upload ends.
    if (hasInlineMedia(st)) throw new Error(UPLOADING_MESSAGE);
    try {
      const wasNew = !doc.id;
      const { id, mt } = await saveGraphic({ ...doc, title, kind, st, air });
      setDoc((d) => ({ ...d, id, mt, savedTitle: title }));
      graphics[kind].markSaved(st);
      graphics[kind].setAir(air);
      if (wasNew) onCreated?.(id);
      return id;
    } catch (err) {
      throw new Error(err.isConflict ? CONFLICT_MESSAGE : `Not saved: ${err.message}`);
    }
  };

  // What the studio page needs for one kind: the graphic with backend-backed acts, and the doc.
  // Save keeps the draft and whatever is on air. Publish saves the draft and puts it on air as
  // the next version. Take off air keeps the saved draft and clears what is on air.
  const studio = (kind) => {
    const g = graphics[kind];
    return {
      graphic: {
        ...g,
        save: () => persist(kind, g.cur, g.air),
        publish: async (note) => {
          const air = nextAir(g.air, { snap: g.cur, by: await whoAmI(), note });
          await persist(kind, g.cur, air);
          return air.v;
        },
        // Saves nothing new: the last saved draft and name go back with the cleared record.
        takeOffAir: async () => persist(kind, g.saved, offAir(g.air, { by: await whoAmI() }), doc.savedTitle),
        // Slike Live opened the panel for `stream`: the graphic is on air there. Written quietly
        // on the saved draft, and again only once the stamp is old enough to matter.
        markLive: (stream) => (liveIsFresh(g.air, stream) ? Promise.resolve() : persist(kind, g.saved, withLive(g.air, stream), doc.savedTitle)),
        clearLive: () => (g.air?.live ? persist(kind, g.saved, withoutLive(g.air), doc.savedTitle) : Promise.resolve()),
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
