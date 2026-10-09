// Unicode-safe base64 encode/decode, used to pack ticker state into a URL.
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

export const playerUrl = (st, kind = 'ticker') => {
  const url = new URL(window.location.href);
  url.hash = '/player?kind=' + kind + '&data=' + encodeState(st);
  return url.toString();
};
