// What is on air for a graphic. The backend stores a graphic, not a publish, so the publish
// record travels inside the graphic's `config` under this key and the editor keeps it apart
// from the editable state (see graphicMapper.js):
//   { v, at, by, note, snap, history: [{ v, at, by, note }], off: { at, by } | null,
//     live: { id, name, at } | null }
// `snap` is the editor state that was pushed (null once taken off air); `v` counts every
// push, so a graphic put back on air continues from where it left. `live` is the Slike Live
// stream using the graphic — Live says so by opening the control panel with ?stream=…, and
// the panel writes it here so Home and every other browser see ON AIR too.
export const AIR_KEY = 'air';
const HISTORY_MAX = 30;
// A stream's claim on a graphic lapses after this long without Live opening the panel
// again, since Live has no way to say a stream ended (other than ?stream=…&off=1).
export const LIVE_TTL_MS = 6 * 60 * 60 * 1000;
// The panel re-stamps `live.at` while open, no more often than this.
export const LIVE_RESTAMP_MS = 10 * 60 * 1000;

const EMPTY = { v: 0, at: 0, by: '', note: '', snap: null, history: [], off: null, live: null };

// The record as saved, or null when the graphic has never been published or put on a stream.
export const airOf = (config) => config?.[AIR_KEY] ?? null;

// A publish record with `snap` on air as the next version.
export function nextAir(air, { snap, by, note }) {
  const v = (air?.v || 0) + 1;
  const entry = { v, at: Date.now(), by: by || '', note: note || '' };
  return {
    ...EMPTY,
    ...air,
    ...entry,
    snap,
    history: [...(air?.history || []), entry].slice(-HISTORY_MAX),
    off: null,
  };
}

// The record with nothing on air and no stream; the version count and history stay.
export const offAir = (air, { by }) => (air ? { ...air, snap: null, live: null, off: { at: Date.now(), by: by || '' } } : null);

// True while a version is on air (pushed and not taken off).
export const isOnAir = (air) => !!air?.snap;

// The stream using the graphic right now — { id, name, at } — or null once its claim lapsed.
export const liveStream = (air) => (air?.live && Date.now() - air.live.at < LIVE_TTL_MS ? air.live : null);

// The record with `stream` ({ id, name }) using the graphic as of now.
export const withLive = (air, stream) => ({ ...EMPTY, ...air, live: { id: stream.id, name: stream.name || '', at: Date.now() } });

// True if `stream`'s claim is already fresh enough that writing it again would change nothing worth a save.
export const liveIsFresh = (air, stream) => !!air?.live && air.live.id === stream.id && Date.now() - air.live.at < LIVE_RESTAMP_MS;

// The record with no stream using the graphic.
export const withoutLive = (air) => (air ? { ...air, live: null } : null);
