// Video upload through the Slike upload SDK (VITE_UPLOAD_SDK_URL, global `SlikeSDK`):
//   1. new SlikeMedia({ token, environment }) + initialize(), once per page — the token is
//      the signed-in session's auth token, from user.me
//   2. uploadMediaBackground registers the file as a Slike media and sends it in chunks;
//      onUploadComplete reports the end. The result is the media's id, not a playable URL.
import { getMe } from './user.js';
import loadScript from '../utils/loadScript.js';

const SDK_URL = import.meta.env.VITE_UPLOAD_SDK_URL;
const SDK_ENV = import.meta.env.VITE_UPLOAD_SDK_ENV || 'prod'; // 'prod' | 'dev'
const DESCRIPTION = 'Graphics Studio widget background video';
// What media.register is sent with: the studio's own source (the media list filters on it)
// and media_state 1.
export const UPLOAD_SOURCE = 'graphicstudio';
const MEDIA_STATE = 1;
// After the chunks are sent, the media is transcoded; getStatus is asked until it is ready.
const STATUS_POLL_MS = 5000;
const STATUS_TIMEOUT_MS = 20 * 60 * 1000;

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let mediaPromise = null;

// Adds the SDK's <script> once and resolves to window.SlikeSDK.
async function loadSdk() {
  if (!SDK_URL) throw new Error('VITE_UPLOAD_SDK_URL is not set');
  await loadScript(SDK_URL);
  if (!window.SlikeSDK) throw new Error('the upload SDK did not load');
  return window.SlikeSDK;
}

// One initialised SlikeMedia for the page, made on the first upload.
function getMedia() {
  mediaPromise ??= (async () => {
    const [{ SlikeMedia }, me] = await Promise.all([loadSdk(), getMe()]);
    if (!me.token) throw new Error('no auth token from user.me');
    const slike = new SlikeMedia({ token: me.token, environment: SDK_ENV });
    await slike.initialize();
    // The SDK has no option for media_state; its registerMedia sends media.register through
    // this.rpc, so add it there.
    const rpc = slike.rpc.bind(slike);
    slike.rpc = (method, params, ...rest) =>
      rpc(method, method === 'media.register' ? { ...params, media_state: MEDIA_STATE } : params, ...rest);
    return slike;
  })().catch((err) => {
    mediaPromise = null;
    throw err;
  });
  return mediaPromise;
}

// Asks getStatus every STATUS_POLL_MS until the media is ready (transcoded and playable).
// A negative status or state is a failed media.
async function waitUntilReady(slike, mediaId, signal) {
  const giveUpAt = Date.now() + STATUS_TIMEOUT_MS;
  for (;;) {
    const { isReady, status, state } = await slike.getStatus(mediaId, signal);
    if (isReady) return;
    if (status < 0 || state < 0) throw new Error('the video could not be processed');
    if (Date.now() > giveUpAt) throw new Error('the video is taking too long to process');
    await wait(STATUS_POLL_MS);
  }
}

// Uploads a video and waits for it to be processed; resolves to its Slike media id once it is
// ready to play. onProgress gets 0..1 while the chunks are sent; onProcessing is called once
// they all are.
export async function uploadVideoWithSdk(file, { title, onProgress, onProcessing, signal } = {}) {
  const slike = await getMedia();
  const mediaId = await sendChunks(slike, file, { title, onProgress });
  onProcessing?.();
  await waitUntilReady(slike, mediaId, signal);
  return mediaId;
}

// Registers the media and sends its chunks; resolves to the media id when the last one is in.
function sendChunks(slike, file, { title, onProgress }) {
  return new Promise((resolve, reject) => {
    slike.uploadMediaBackground({
      file,
      title: title || file.name,
      description: DESCRIPTION,
      source: UPLOAD_SOURCE,
      onProgress: (done, total) => onProgress?.(total ? done / total : 0),
      onUploadComplete: (result, error) => (error ? reject(error) : resolve(result?.id)),
    })
      // A failed upload also rejects `completion`; onUploadComplete has reported it already.
      .then(({ completion }) => completion?.catch(() => {}), reject); // registration failed
  });
}
