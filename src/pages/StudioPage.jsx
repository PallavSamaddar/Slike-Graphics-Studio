import { useState } from 'react';
import { playerUrl } from '../utils/playerUrl.js';
import { ChangeReview, ChangeScope, Dialog, EditorHeader, FieldErrors, Status, Version, useToast } from '../ui-kit';
import { GRAPHICS } from '../constants/graphics.js';
import { diffGraphic, changes } from '../utils/changeDiff.js';
import { useUploads } from '../hooks/useMediaUpload.js';
import { missingFields, missingFieldsMessage, requiredMessage } from '../utils/requiredFields.js';

// The studio as an editor page: the sticky editor header (what is this,
// where it stands, Save · Publish · ⋯), the content as one surface on the left, and on the
// right the live preview with the style sections under it. Every write reads back in the
// change review from the right.
//   graphic: the useGraphic() state of the graphic being edited (cur, saved, pub, base and its acts)
//   doc:     its saved identity: { title, savedTitle, isNew, onTitleChange }
export default function StudioPage({ kind, graphic, doc, onBack, content, style, preview }) {
  const { cur, saved, base, pub, save: onSave, publish: onPublish, discard: onDiscard } = graphic;
  const { title, savedTitle, isNew, onTitleChange } = doc;
  const toast = useToast();
  const [review, setReview] = useState(null); // 'save' | 'publish'
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  // Required fields show their error once a Save or Publish has been tried, until filled.
  const [showRequired, setShowRequired] = useState(false);
  const name = GRAPHICS[kind].name;
  const q = `“${name}”`;

  // The graphic's name is saved with it, so a renamed graphic has a change to save too.
  const edits = diffGraphic(kind, saved, cur);
  const renamed = title.trim() !== savedTitle.trim();
  const unsaved = !renamed ? edits : {
    count: edits.count + 1,
    sections: [{ title: 'Details', rows: [{ what: 'Name', was: savedTitle.trim() || 'Untitled', now: title.trim() || 'Untitled' }] }, ...edits.sections],
  };
  // A graphic the backend has never seen can be saved as the template left it.
  const canSave = isNew || unsaved.count > 0;
  const waiting = pub ? diffGraphic(kind, pub.snap, saved) : null; // saved, not on air
  const toAir = diffGraphic(kind, pub ? pub.snap : base, cur);
  const hasAir = !!pub;
  const somethingToPublish = !hasAir || toAir.count > 0;
  const air = hasAir
    ? <Status kind="live">On air · <Version n={pub.v} /></Status>
    : <Status kind="off">Unpublished</Status>;
  // Files still uploading show their progress beside the status.
  const uploads = useUploads();
  const uploading = uploads.length > 0 && (
    <Status kind="pending" role="status">
      {uploads.length === 1
        ? (uploads[0].processing
          ? `Processing “${uploads[0].label}”…`
          : `Uploading “${uploads[0].label}” · ${Math.round(uploads[0].progress * 100)}%`)
        : `Uploading ${uploads.length} files · ${Math.round((uploads.reduce((n, u) => n + u.progress, 0) / uploads.length) * 100)}%`}
    </Status>
  );
  const pending = <>
    {waiting && waiting.count > 0 && <Status kind="pending">{changes(waiting.count)} not on air</Status>}
    {uploading}
  </>;

  const airUrl = hasAir ? playerUrl(pub.snap, kind, doc.id) : null;
  const urlItems = [
    {
      label: 'Copy URL',
      dim: !hasAir,
      title: hasAir ? `Copy URL — ${airUrl}` : 'Not on air — publish it first',
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(airUrl);
          toast('URL copied');
        } catch {
          toast('The browser would not let us copy — open the URL and copy it there', 'bad');
        }
      },
    },
    {
      label: 'Open URL',
      dim: !hasAir,
      title: hasAir ? `Open URL — ${airUrl}` : 'Not on air — publish it first',
      onClick: () => window.open(airUrl, '_blank', 'noopener'),
    },
  ];

  const closeReview = () => setReview(null);

  const missing = missingFields(kind, cur);
  const fieldErrors = showRequired ? Object.fromEntries(missing.map((f) => [f.path, requiredMessage(f.label)])) : {};

  // Save and Publish open their review only when every required field is filled;
  // otherwise the empty fields show their error and the first one scrolls into view.
  const openReview = (which) => {
    if (missing.length) {
      setShowRequired(true);
      toast(missingFieldsMessage(missing, which), 'bad');
      setTimeout(() => document.querySelector('.keyform .field.err')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return;
    }
    setReview(which);
  };

  // Runs a backend write; the review stays open on a failure so it can be tried again.
  const write = async (act, done) => {
    try {
      done(await act());
      closeReview();
    } catch (err) {
      toast(err.message, 'bad');
    }
  };

  return (
    <ChangeScope saved={saved} cur={cur}>
      <EditorHeader
        name={name}
        title={title}
        onTitleChange={onTitleChange}
        placeholder={`Untitled ${kind}`}
        onBack={onBack}
        air={air}
        pending={pending}
        save={{
          onClick: () => openReview('save'),
          disabled: !canSave,
          title: canSave ? undefined : 'Nothing changed since the last save',
        }}
        publish={{
          label: 'Publish',
          ghost: !somethingToPublish,
          disabled: !somethingToPublish,
          title: somethingToPublish ? undefined : `Nothing waiting — v${pub.v} is on air`,
          onClick: () => openReview('publish'),
        }}
        more={urlItems}
      />
      <FieldErrors errors={fieldErrors}>
        <div className="detail studio-detail">
          <div className="form keyform">{content}</div>
          <aside className="studio-side">
            <div className="studio-preview" aria-label="Live preview">{preview}</div>
            <div className="form keyform studio-style">{style}</div>
          </aside>
        </div>
      </FieldErrors>

      {review === 'save' && (
        <ChangeReview
          title={`Save changes to ${q}?`}
          ver={hasAir ? [{ dot: 'on', vn: `v${pub.v}`, words: 'stays on air' }] : null}
          reach={hasAir ? 'the changes wait as a draft, not on air' : null}
          count={changes(unsaved.count)}
          who="Yours, not saved yet"
          sections={unsaved.sections}
          empty={isNew ? 'Nothing changed from the template — it is saved as it is.' : 'Nothing changed since the last save.'}
          act={{ label: unsaved.count ? `Save ${changes(unsaved.count)}` : 'Save' }}
          busyWord="Saving…"
          aside={unsaved.count > 0 && (
            <button type="button" className="zlink quiet-danger rvw-discard" onClick={() => { closeReview(); setConfirmDiscard(true); }}>
              Discard {changes(unsaved.count)}
            </button>
          )}
          onAct={() => write(onSave, () => toast('Saved, not published'))}
          onClose={closeReview}
        />
      )}

      {review === 'publish' && (
        <ChangeReview
          title={`Publish ${q}`}
          ver={hasAir
            ? [{ dot: 'on', vn: `v${pub.v}`, words: 'on air' }, { dot: 'draft', vn: `v${pub.v + 1}`, words: 'goes on air' }]
            : null}
          count={hasAir ? changes(toAir.count) : `${changes(toAir.count)} from the template`}
          sections={toAir.sections}
          empty="Nothing changed from the template — it goes on air as it is."
          note
          act={{ label: toAir.count && hasAir ? `Publish ${changes(toAir.count)}` : 'Publish' }}
          busyWord="Publishing…"
          onAct={(note) => write(() => onPublish(note), (v) => toast(<span>Published · <Version n={v} /></span>))}
          onClose={closeReview}
        />
      )}

      {confirmDiscard && (
        <Dialog
          title={`Discard ${changes(unsaved.count)} to ${q}?`}
          onCancel={() => { setConfirmDiscard(false); setReview('save'); }}
          foot={<>
            <button type="button" className="btn ghost" onClick={() => { setConfirmDiscard(false); setReview('save'); }}>Cancel</button>
            <button type="button" className="btn danger" onClick={() => { onDiscard(); setConfirmDiscard(false); toast('Changes discarded'); }}>Discard</button>
          </>}
        >
          Your edits since the last save are lost. {hasAir ? 'The saved draft and what is on air stay as they are.' : 'The saved draft stays as it is.'}
        </Dialog>
      )}
    </ChangeScope>
  );
}
