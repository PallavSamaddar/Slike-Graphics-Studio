import { takeFile } from '../../utils/files.js';

// An image field's box: the picked image's thumbnail, name and a remove ×, or an Upload button.
//   src, name: the current image (data: URL) and its name · onFile(file) · onRemove()
export default function ImageUpload({ src, name, onFile, onRemove }) {
  return (
    <div className="badge-img-row">
      {src ? (
        <div className="badge-img-thumb-wrap">
          <img className="badge-img-thumb" src={src} alt="" />
          <span className="badge-img-name">{name || 'Untitled image'}</span>
          <button type="button" className="badge-img-remove" onClick={onRemove} title="Remove image">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      ) : (
        <label className="badge-img-upload">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
          Upload
          <input type="file" accept="image/*" hidden onChange={(e) => { const f = takeFile(e); if (f) onFile(f); }} />
        </label>
      )}
    </div>
  );
}
