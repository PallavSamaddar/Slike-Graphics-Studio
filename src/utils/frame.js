// True when the studio runs inside another page's frame (e.g. Slike Studio), which shows its
// own back. A cross-origin parent throws on window.top access — that is a frame too.
export const inFrame = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();
