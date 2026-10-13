// Unicode-safe base64 encode/decode, used to pack a graphic's state into a URL.
export const encodeState = (obj) => {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let bin = '';
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
};

export const decodeState = (str) => {
  const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/'));
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
};

// A saved graphic's player URL names it by id: the player reads what is on air from the backend
// and follows every push. The state as copied rides along too, for a player that can't read
// the backend (no login, as in OBS) — it shows that until it is given a fresh URL.
export const playerUrl = (st, kind = 'ticker', id = null) => {
  const url = new URL(window.location.href);
  url.hash = '#/player?' + (id ? 'id=' + encodeURIComponent(id) + '&' : '') + 'kind=' + kind + '&data=' + encodeState(st);
  return url.toString();
};
