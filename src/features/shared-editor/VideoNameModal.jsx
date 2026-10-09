import { useState } from 'react';
import { Dialog, Field, Row } from '../../ui-kit';

// Shown right after a background video upload: the clip at its real 16:9 aspect and an
// editable display name, in the house dialog's sheet frame (620).
export default function VideoNameModal({ src, fileName, onCancel, onConfirm }) {
  const [name, setName] = useState(fileName || 'Untitled video');

  return (
    <Dialog
      title="Background video (16:9)"
      size="sheet"
      onCancel={onCancel}
      foot={<>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
        <button type="button" className="btn" onClick={() => onConfirm(name)}>Use video</button>
      </>}
    >
      <p className="dlg-lead">Preview the clip and give it a name</p>
      <div className="video-name-stage">
        <span className="cropper-ratio-tag">16:9</span>
        <video className="video-name-preview" src={src} muted loop autoPlay playsInline />
      </div>
      <Row>
        <Field label="Video name" grow>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter video name" />
        </Field>
      </Row>
    </Dialog>
  );
}
