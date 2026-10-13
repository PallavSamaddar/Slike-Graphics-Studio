import { useState } from 'react';
import { isOnAir } from '../services/air.js';

// Deep copy, so editing a graphic never mutates the initial state or a template.
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// One kind of graphic's editor state: what is being edited (cur), the last save (saved),
// the publish record (air: see services/air.js, null until first published) and the state
// it started from (base). Saving to the backend lives in useDocument; this hook only moves
// the local states once a write has succeeded.
export default function useGraphic(spec) {
  const [cur, setCur] = useState(spec.initial);
  const [saved, setSaved] = useState(spec.initial);
  const [air, setAir] = useState(null);
  const [base, setBase] = useState(spec.initial);

  // Loads `next` as the saved state and starting point, with `nextAir` as its publish record.
  const load = (next, nextAir = null) => {
    setCur(next);
    setSaved(next);
    setBase(next);
    setAir(nextAir);
  };

  // What is on air, in the shape the page reads: { snap, v, note, at, by } or null.
  const pub = isOnAir(air) ? { snap: air.snap, v: air.v, note: air.note, at: air.at, by: air.by } : null;

  return {
    cur,
    setCur,
    saved,
    air,
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
    setAir,
    discard: () => setCur(saved),
  };
}
