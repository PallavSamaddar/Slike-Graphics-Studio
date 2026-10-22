import { inFrame } from '../utils/frame.js';
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
const PUBLISH_REQUEST = 'slike-graphic:publish';
const STATE_MESSAGE = 'slike-graphic:state';

function embeddingOrigin() {
  if (!inFrame) return null;
  const origin = window.location.ancestorOrigins?.[0]
    || (document.referrer ? new URL(document.referrer).origin : null);
  return origin && HOST_ORIGIN.test(origin) ? origin : null;
}

function postToHost(message) {
  const origin = embeddingOrigin();
  if (!origin) return;
  try {
    window.parent.postMessage(message, origin);
  } catch { /* the host re-reads the graphic when its editor closes */ }
}

export const announceToHost = ({ id, v, error }) => postToHost({ type: HOST_MESSAGE, id, v, ...(error && { error }) });

// Whether there is anything to publish, so the host's button can follow it.
export const announceCanPublish = (id, canPublish) => postToHost({ type: STATE_MESSAGE, id, canPublish });

export function onPublishRequest(fn) {
  const onMessage = (e) => {
    if (e.source === window.parent && HOST_ORIGIN.test(e.origin) && e.data?.type === PUBLISH_REQUEST) fn();
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
