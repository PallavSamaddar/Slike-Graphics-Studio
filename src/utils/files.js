// Helpers for the upload inputs.

// The file an <input type="file"> just picked, with the input cleared so the same file can be
// picked again. null when nothing was picked.
export function takeFile(e) {
  const file = e.target.files && e.target.files[0];
  e.target.value = '';
  return file || null;
}

// A file's name without its extension ("logo.png" → "logo").
export const baseName = (file) => file.name.replace(/\.[^.]+$/, '');

// Reads an image file as a data: URL and hands it to onLoad.
export function readAsDataUrl(file, onLoad) {
  const reader = new FileReader();
  reader.onload = () => onLoad(reader.result);
  reader.readAsDataURL(file);
}
