import { useState } from 'react';
import { playerUrl } from '../utils.js';
import { EditorHeader } from '../ui/Editor.jsx';
import { ChangeScope } from '../ui/changes.jsx';
import ChangeReview from '../ui/ChangeReview.jsx';
import { Dialog } from '../ui/controls.jsx';
import { useToast } from '../ui/Toast.jsx';
import { diffGraphic, changes } from '../review/diff.js';
import { useUploads } from '../api/mediaUpload.js';

const NAMES = { ticker: 'Ticker', widget: 'Widget', jacket: 'Jacket' };

// The studio as a Player Console editor page: the sticky editor header (what is this,
// where it stands, Save · Publish · ⋯), the form as one surface, and the live preview
// beside it. Every write reads back in the change review from the right.
export default function StudioPage({ kind, cur, saved, base, pub, title, savedTitle, isNew, onTitleChange, onSave, onPublish, onDiscard, onBack, form, preview }) {
  const toast = useToast();
  const [review, setReview] = useState(null); // 'save' | 'publish'
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const name = NAMES[kind];
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
  const vno = (n) => <span className="vno">v{n}</span>;

  const air = hasAir
    ? <span className="stat live"><span>On air · {vno(pub.v)}</span></span>
    : <span className="stat off">Unpublished</span>;
  const uploads = useUploads();
  const uploading = uploads.length > 0 && (
    <span className="stat pending" role="status">
      {uploads.length === 1
        ? `Uploading “${uploads[0].label}” · ${Math.round(uploads[0].progress * 100)}%`
        : `Uploading ${uploads.length} files · ${Math.round((uploads.reduce((n, u) => n + u.progress, 0) / uploads.length) * 100)}%`}
    </span>
  );
  const pending = <>
    {waiting && waiting.count > 0 && <span className="stat pending">{changes(waiting.count)} not on air</span>}
    {uploading}
  </>;

  const urlItems = [
    {
      label: 'Copy URL',
      dim: !hasAir,
      title: hasAir ? `Copy URL — ${playerUrl(pub.snap, kind)}` : 'Not on air — publish it first',
      onClick: async () => {
        try {
          await navigator.clipboard.writeText(playerUrl(pub.snap, kind));
          toast('URL copied');
        } catch {
          toast('The browser would not let us copy — open the URL and copy it there', 'bad');
        }
      },
    },
    {
      label: 'Open URL',
      dim: !hasAir,
      title: hasAir ? `Open URL — ${playerUrl(pub.snap, kind)}` : 'Not on air — publish it first',
      onClick: () => window.open(playerUrl(pub.snap, kind), '_blank', 'noopener'),
    },
  ];

  const closeReview = () => setReview(null);

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
          onClick: () => setReview('save'),
          disabled: !canSave,
          title: canSave ? undefined : 'Nothing changed since the last save',
        }}
        publish={{
          label: 'Publish',
          ghost: !somethingToPublish,
          disabled: !somethingToPublish,
          title: somethingToPublish ? undefined : `Nothing waiting — v${pub.v} is on air`,
          onClick: () => setReview('publish'),
        }}
        more={urlItems}
      />
      <div className="detail studio-detail">
        <div className="form keyform">{form}</div>
        <aside className="studio-preview" aria-label="Live preview">{preview}</aside>
      </div>

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
          onAct={(note) => write(() => onPublish(note), (v) => toast(<span>Published · <span className="vno">v{v}</span></span>))}
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
