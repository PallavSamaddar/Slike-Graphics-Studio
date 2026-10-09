import { useState } from 'react';

// Deep copy, so editing a graphic never mutates the initial state or a template.
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// One kind of graphic's editor state: what is being edited (cur), the last save (saved),
// what is on air (pub: { snap, v, note } or null until first published) and the state it
// started from (base). Saving to the backend lives in useDocument; this hook only moves
// the local states once a write has succeeded.
export default function useGraphic(spec) {
  const [cur, setCur] = useState(spec.initial);
  const [saved, setSaved] = useState(spec.initial);
  const [pub, setPub] = useState(null);
  const [base, setBase] = useState(spec.initial);

  // Loads `next` as the saved state and starting point, with nothing on air.
  const load = (next) => {
    setCur(next);
    setSaved(next);
    setBase(next);
    setPub(null);
  };

  return {
    cur,
    setCur,
    saved,
    pub,
    base,
    load,
    // A template starts a new graphic from the initial state, not the current editor
    // state, so nothing from the previously opened graphic carries over.
    applyTemplate: (id) => {
      const next = spec.applyTemplate(clone(spec.initial), id);
      load(next);
      return next;
    },
    markSaved: (snap) => setSaved(snap),
    // Puts `snap` on air as the next version and returns that version number.
    goOnAir: (snap, note) => {
      const v = (pub?.v || 0) + 1;
      setPub({ snap, v, note });
      return v;
    },
    discard: () => setCur(saved),
  };
}
