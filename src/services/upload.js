// Uploads one file the way slike-frontend does (src/components/Upload/index.tsx):
//   1. assets.register (CMS RPC) → a jwt for this upload
//   2. resumablejs sends the file in chunks to VITE_UPLOAD, method asset.resumable,
//      with the jwt in the `token` header
//   3. the last chunk's response carries the asset; its `url` is what the graphic keeps
import Resumable from 'resumablejs';
import { callRpc } from './rpc.js';

const UPLOAD_TARGET = import.meta.env.VITE_UPLOAD;
const ASSET_TYPE = 'graphic';

// Same tuning as slike-frontend's createResumableConfig.
const RESUMABLE_CONFIG = {
  target: UPLOAD_TARGET,
  query: { method: 'asset.resumable' },
  chunkSize: 4 * 1024 * 1024,
  simultaneousUploads: 3,
  testChunks: false,
  maxChunkRetries: 50,
  chunkRetryInterval: 2000,
  // Auth failures don't recover on retry.
  permanentErrors: [400, 401, 403, 404, 415, 500, 501],
};

// The upload server answers a failed chunk with plain text, JSON or an HTML page;
// keep only what is safe to show (as slike-frontend's normalizeUploadError).
const uploadError = (message) => {
  const text = typeof message === 'string' ? message.trim() : '';
  if (!text || text.startsWith('<')) return 'upload failed';
  if (text.startsWith('{')) {
    try {
      const body = JSON.parse(text);
      return body?.message || body?.error || 'upload failed';
    } catch {
      return 'upload failed';
    }
  }
  return text;
};

// Resolves to the uploaded file's public URL. onProgress gets 0..1.
export async function uploadFile(file, { onProgress } = {}) {
  if (!UPLOAD_TARGET) throw new Error('VITE_UPLOAD is not set');

  const { jwt } = await callRpc('assets.register', { type: ASSET_TYPE, name: ASSET_TYPE, title: file.name });
  if (!jwt) throw new Error('no upload token from assets.register');

  return new Promise((resolve, reject) => {
    const r = new Resumable({
      ...RESUMABLE_CONFIG,
      query: { ...RESUMABLE_CONFIG.query, key: ASSET_TYPE },
      headers: { token: jwt },
    });

    r.on('fileProgress', (f) => onProgress?.(f.progress()));
    r.on('fileSuccess', (_f, message) => {
      try {
        const asset = JSON.parse(message)?.data;
        if (!asset?.url) throw new Error('the upload finished without a URL');
        resolve(asset.url);
      } catch (err) {
        reject(err instanceof SyntaxError ? new Error('unreadable upload response') : err);
      }
    });
    r.on('fileError', (_f, message) => reject(new Error(uploadError(message))));

    // Start once the file is queued.
    r.on('fileAdded', () => r.upload());
    r.addFile(file);
  });
}
