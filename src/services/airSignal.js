// Tells this browser's open players (another tab, e.g. one from "Open URL") the moment a
// graphic goes on or off air, so they read it again at once instead of on their next poll.
// Players on other devices still catch up on their own poll.
const CHANNEL = 'graphic-air';

export function announceAirChange(id) {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.postMessage({ id });
    channel.close();
  } catch { /* no BroadcastChannel — players catch up on their poll */ }
}

const HOST_ORIGIN = /^https:\/\/([a-z0-9-]+\.)*sli\.ke(:\d+)?$/i;
const HOST_MESSAGE = 'slike-graphic:air';

function embeddingOrigin() {
  if (window.parent === window) return null;
  const origin = window.location.ancestorOrigins?.[0]
    || (document.referrer ? new URL(document.referrer).origin : null);
  return origin && HOST_ORIGIN.test(origin) ? origin : null;
}

export function announceToHost({ id, v, off = false, error }) {
  const origin = embeddingOrigin();
  if (!origin) return;
  try {
    window.parent.postMessage({ type: HOST_MESSAGE, id, v, off, ...(error && { error }) }, origin);
  } catch { /* the studio re-checks the graphic when its editor closes */ }
}
export function onPublishRequest(fn) {
  const onMessage = (e) => {
    if (e.source === window.parent && HOST_ORIGIN.test(e.origin) && e.data?.type === 'slike-graphic:publish') fn();
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}

export function onAirChange(id, fn) {
  try {
    const channel = new BroadcastChannel(CHANNEL);
    channel.onmessage = (e) => { if (e.data?.id === id) fn(); };
    return () => channel.close();
  } catch {
    return () => {};
  }
}
