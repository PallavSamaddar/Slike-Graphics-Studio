// Uploads a picked image or video and swaps it into the editor once it has a public URL.
//
// The editor shows the file at once from a local data:/blob: URL (the backend refuses to
// save those), uploads it in the background (upload.js), then replaces that local URL with
// the uploaded one — but only where the field still holds it, so a removed or replaced file
// is left alone. If the upload fails, the fields go back to what they were before the pick.
//
// Uploads in flight are kept here so the studio header can show their progress.
import { useCallback, useSyncExternalStore } from 'react';
import { uploadFile } from './upload.js';
import { useToast } from '../ui/Toast.jsx';

let uploads = []; // [{ id, label, progress }] — progress 0..1
const listeners = new Set();
let seq = 0;

const publish = (next) => {
  uploads = next;
  listeners.forEach((fn) => fn());
};
const subscribe = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// The uploads in flight, for a progress readout.
export const useUploads = () => useSyncExternalStore(subscribe, () => uploads);

// A field's value at a dotted path ('mainVideoUrl', 'style.customVideoUrl').
const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);
const set = (obj, path, value) => {
  const [k, ...rest] = path.split('.');
  return { ...obj, [k]: rest.length ? set(obj[k] || {}, rest.join('.'), value) : value };
};
const setAll = (obj, fields) => Object.entries(fields).reduce((o, [path, v]) => set(o, path, v), obj);

// A data: URL (an image read or cropped in the browser) as a File the uploader can send.
export async function dataUrlToFile(dataUrl, name) {
  const blob = await (await fetch(dataUrl)).blob();
  const ext = (blob.type.split('/')[1] || 'bin').replace('jpeg', 'jpg');
  return new File([blob], `${name || 'image'}.${ext}`, { type: blob.type });
}

// → upload({ file, label, setSt, path, local, fields })
//   file:   the File (or a data: URL, turned into one)
//   path:   where the local URL sits in the editor state; it gets the uploaded URL
//   local:  the local URL put there for the preview
//   fields: { path: value } to apply now (the local URL and anything picked with it);
//           their earlier values come back if the upload fails
export function useMediaUpload() {
  const toast = useToast();
  return useCallback(async ({ file, label, setSt, path, local, fields }) => {
    let before = null;
    setSt((s) => {
      before = Object.fromEntries(Object.keys(fields).map((p) => [p, get(s, p)]));
      return setAll(s, fields);
    });

    const id = ++seq;
    publish([...uploads, { id, label, progress: 0 }]);
    const progress = (p) => publish(uploads.map((u) => (u.id === id ? { ...u, progress: p } : u)));
    try {
      const source = typeof file === 'string' ? await dataUrlToFile(file, label) : file;
      const url = await uploadFile(source, { onProgress: progress });
      setSt((s) => (get(s, path) === local ? set(s, path, url) : s));
      if (local.startsWith('blob:')) URL.revokeObjectURL(local);
    } catch (err) {
      setSt((s) => (get(s, path) === local ? setAll(s, before) : s));
      toast(`Couldn't upload “${label}”: ${err.message}`, 'bad');
    } finally {
      publish(uploads.filter((u) => u.id !== id));
    }
  }, [toast]);
}
