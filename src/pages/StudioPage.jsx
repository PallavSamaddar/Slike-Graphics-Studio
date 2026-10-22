import { useEffect, useRef, useState } from 'react';
import { PreviewActions } from '../features/shared-editor/PreviewCanvas.jsx';
import { embedUrl } from '../utils/playerUrl.js';
import { ago } from '../utils/time.js';
import { ChangeReview, ChangeScope, Dialog, EditorHeader, FieldErrors, Status, Version, useToast } from '../ui-kit';
import { GRAPHICS } from '../constants/graphics.js';
import { liveStream } from '../services/air.js';
import { announceCanPublish, announceToHost, onPublishRequest } from '../services/airSignal.js';
import { inFrame } from '../utils/frame.js';
import { withoutFeed } from '../services/feed.js';
import { diffGraphic, changes } from '../utils/changeDiff.js';
import { useUploads } from '../hooks/useMediaUpload.js';
import useCopy from '../hooks/useCopy.js';
import { missingFields, missingFieldsMessage, requiredMessage } from '../utils/requiredFields.js';
import RemoteChangeBar from '../features/shared-editor/RemoteChangeBar.jsx';
import { AirStatusProvider } from '../features/shared-editor/ContentTitle.jsx';
import VersionHistory from '../features/shared-editor/VersionHistory.jsx';

export default function StudioPage({ kind, graphic, doc, stream, onBack, content, style, preview }) {
  const { cur, saved, base, pub, air, save: onSave, publish: onPublish, restore, takeOffAir, discard: onDiscard } = graphic;
  const { id, title, savedTitle, isNew, onTitleChange, remote, reload } = doc;
  const toast = useToast();
  const [review, setReview] = useState(null); // 'save' | 'publish'
  const [confirm, setConfirm] = useState(null); // 'discard' | 'offair' | 'reload'
  const [styleOpen, setStyleOpen] = useState(false); // narrow screens: the style panel shown
  const [history, setHistory] = useState(false);
  const [showRequired, setShowRequired] = useState(false);
  const name = GRAPHICS[kind].name;
  const q = `“${name}”`;

  const edits = diffGraphic(kind, saved, cur);
  const renamed = title.trim() !== savedTitle.trim();
  const unsaved = !renamed ? edits : {
    count: edits.count + 1,
    sections: [{ title: 'Details', rows: [{ what: 'Name', was: savedTitle.trim() || 'Untitled', now: title.trim() || 'Untitled' }] }, ...edits.sections],
  };
  const canSave = isNew || unsaved.count > 0;
  const design = (st) => (st?.src === 'rss' ? withoutFeed(st) : st);
  const waiting = pub ? diffGraphic(kind, design(pub.snap), design(saved)) : null;
  const toAir = diffGraphic(kind, design(pub ? pub.snap : base), design(cur));
  const hasAir = !!pub;
  const live = stream || liveStream(air);
  const carried = hasAir && !!live; 
  const somethingToPublish = !hasAir || toAir.count > 0;
  const streamName = live?.name || live?.id;
  const pushWord = carried ? 'Push to air' : 'Publish';

  const airStatus = carried
    ? (
      <Status kind="onair" title={`On air on ${streamName} · v${pub.v}${pub.by ? ` by ${pub.by}` : ''} · ${ago(pub.at)}`}>
        On air<span className="stream"> · {streamName} · <Version n={pub.v} /></span>
      </Status>
    )
    : hasAir
      ? (
        <Status kind="live" title={`Published v${pub.v}${pub.by ? ` by ${pub.by}` : ''} · ${ago(pub.at)}${pub.note ? ` — ${pub.note}` : ''}`}>
          Published · <Version n={pub.v} />
        </Status>
      )
      : <Status kind="off">{live ? `On ${streamName} · nothing published yet` : 'Unpublished'}</Status>;

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

  const airUrl = hasAir && id ? embedUrl(id) : null;
  const notOnAir = 'Not on air — publish it first';
  const copy = useCopy();
  const moreItems = [
    {
      label: 'Copy ID',
      fact: id || undefined,
      dim: isNew,
      title: isNew ? 'Not saved yet — save it first' : `Copy ID — ${id}`,
      onClick: () => copy(id, 'ID copied'),
    },
    {
      label: 'Copy URL',
      dim: !airUrl,
      title: airUrl ? `Copy URL — ${airUrl}` : notOnAir,
      onClick: () => copy(airUrl, 'URL copied'),
    },
    {
      label: 'Open URL',
      dim: !airUrl,
      title: airUrl ? `Open URL — ${airUrl}` : notOnAir,
      onClick: () => window.open(airUrl, '_blank', 'noopener'),
    },
    {
      label: 'Version history',
      dim: !air?.history?.length,
      title: air?.history?.length ? undefined : 'Never published',
      onClick: () => setHistory(true),
    },
    {
      label: 'Take off air',
      danger: true,
      dim: !hasAir,
      title: hasAir ? undefined : 'Nothing is on air',
      onClick: () => setConfirm('offair'),
    },
  ];

  const closeReview = () => setReview(null);

  const missing = missingFields(kind, cur);
  const fieldErrors = showRequired ? Object.fromEntries(missing.map((f) => [f.path, requiredMessage(f.label)])) : {};

  const openReview = (which) => {
    if (missing.length) {
      setShowRequired(true);
      toast(missingFieldsMessage(missing, which), 'bad');
      setTimeout(() => document.querySelector('.keyform .field.err')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 0);
      return;
    }
    setReview(which);
  };
  const write = async (act, done) => {
    try {
      done(await act());
      closeReview();
    } catch (err) {
      toast(err.message, 'bad');
    }
  };

  // Inside Slike Live the host's own button publishes (no header here): same checks, no review step.
  const hostPublish = useRef(null);
  hostPublish.current = async () => {
    if (missing.length) {
      setShowRequired(true);
      const message = missingFieldsMessage(missing, 'publish');
      toast(message, 'bad');
      announceToHost({ id, error: message });
      return;
    }
    if (!somethingToPublish) {
      announceToHost({ id, v: pub.v });
      return;
    }
    try {
      announceToHost({ id, v: await onPublish('') });
    } catch (err) {
      toast(err.message, 'bad');
      announceToHost({ id, error: err.message });
    }
  };
  useEffect(() => (inFrame ? onPublishRequest(() => hostPublish.current()) : undefined), []);
  useEffect(() => {
    if (inFrame && id) announceCanPublish(id, somethingToPublish);
  }, [id, somethingToPublish]);

  const doReload = () => reload()
    .then(() => { setConfirm(null); toast('Reloaded'); })
    .catch((err) => toast(`Couldn't reload: ${err.message}`, 'bad'));
  const askReload = () => (unsaved.count > 0 ? setConfirm('reload') : doReload());

  const doOffAir = () => takeOffAir()
    .then(() => { setConfirm(null); toast('Taken off air'); })
    .catch((err) => toast(err.message, 'bad'));

  return (
    <ChangeScope saved={saved} cur={cur}>
      {!inFrame && <EditorHeader
        name={name}
        title={title}
        onTitleChange={onTitleChange}
        placeholder={`Untitled ${kind}`}
        onBack={onBack}
        pending={pending}
        // Once published, edits go straight on air: Publish is the only act, no separate Save.
        save={hasAir ? null : {
          onClick: () => openReview('save'),
          disabled: !canSave,
          title: canSave ? undefined : 'Nothing changed since the last save',
        }}
        publish={{
          label: pushWord,
          ghost: !somethingToPublish,
          disabled: !somethingToPublish,
          title: somethingToPublish ? undefined : `Nothing waiting — v${pub.v} is on air`,
          onClick: () => openReview('publish'),
        }}
        more={moreItems}
      />}
      {remote && <RemoteChangeBar remote={remote} onReload={askReload} />}
      <FieldErrors errors={fieldErrors}>
        <div className="detail studio-detail">
          <div className="form keyform"><AirStatusProvider value={airStatus}>{content}</AirStatusProvider></div>
          <aside className={`studio-side studio-side-${kind}` + (styleOpen ? ' style-open' : '')}>
            {/* Narrow screens only: the style panel opens under the preview, above the content. */}
            <PreviewActions.Provider value={(
              <button
                type="button"
                className="studio-style-toggle"
                aria-expanded={styleOpen}
                aria-controls="studio-style"
                onClick={() => setStyleOpen((open) => !open)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="4" y1="7" x2="20" y2="7" /><line x1="4" y1="17" x2="20" y2="17" /><circle cx="9" cy="7" r="2.2" fill="var(--bg-panel)" /><circle cx="15" cy="17" r="2.2" fill="var(--bg-panel)" /></svg>
                {styleOpen ? 'Hide settings' : 'Settings'}
              </button>
            )}>
              <div className="studio-preview" aria-label="Live preview">{preview}</div>
            </PreviewActions.Provider>
            <div className="form keyform studio-style" id="studio-style">{style}</div>
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
            <button type="button" className="zlink quiet-danger rvw-discard" onClick={() => { closeReview(); setConfirm('discard'); }}>
              Discard {changes(unsaved.count)}
            </button>
          )}
          onAct={() => write(onSave, () => toast('Saved, not published'))}
          onClose={closeReview}
        />
      )}

      {review === 'publish' && (
        <ChangeReview
          title={carried ? `Push ${q} to air on ${streamName}` : `Publish ${q}`}
          ver={hasAir
            ? [{ dot: 'on', vn: `v${pub.v}`, words: 'on air' }, { dot: 'draft', vn: `v${pub.v + 1}`, words: 'goes on air' }]
            : null}
          reach={carried ? 'the stream picks it up within seconds' : null}
          count={hasAir ? changes(toAir.count) : `${changes(toAir.count)} from the template`}
          sections={toAir.sections}
          empty="Nothing changed from the template — it goes on air as it is."
          note
          act={{ label: toAir.count && hasAir ? `${pushWord} · ${changes(toAir.count)}` : pushWord }}
          busyWord={carried ? 'Pushing…' : 'Publishing…'}
          onAct={(note) => write(() => onPublish(note), (v) => toast(<span>{carried ? 'On air' : 'Published'} · <Version n={v} /></span>))}
          onClose={closeReview}
        />
      )}

      {confirm === 'discard' && (
        <Dialog
          title={`Discard ${changes(unsaved.count)} to ${q}?`}
          onCancel={() => { setConfirm(null); setReview('save'); }}
          foot={<>
            <button type="button" className="btn ghost" onClick={() => { setConfirm(null); setReview('save'); }}>Cancel</button>
            <button type="button" className="btn danger" onClick={() => { onDiscard(); setConfirm(null); toast('Changes discarded'); }}>Discard</button>
          </>}
        >
          Your edits since the last save are lost. {hasAir ? 'The saved draft and what is on air stay as they are.' : 'The saved draft stays as it is.'}
        </Dialog>
      )}

      {confirm === 'offair' && (
        <Dialog
          title={`Take ${q} off air?`}
          onCancel={() => setConfirm(null)}
          foot={<>
            <button type="button" className="btn ghost" onClick={() => setConfirm(null)}>Cancel</button>
            <button type="button" className="btn danger" onClick={doOffAir}>Take off air</button>
          </>}
        >
          <Version n={pub?.v} /> stops showing{carried ? ` on ${streamName}` : ''} and its player shows nothing{live ? '; the stream is no longer marked as using it' : ''}. The saved draft stays, and the next publish goes on air as <Version n={(air?.v || 0) + 1} />.
        </Dialog>
      )}

      {confirm === 'reload' && (
        <Dialog
          title={`Reload ${q} and lose ${changes(unsaved.count)}?`}
          onCancel={() => setConfirm(null)}
          foot={<>
            <button type="button" className="btn ghost" onClick={() => setConfirm(null)}>Keep editing</button>
            <button type="button" className="btn danger" onClick={doReload}>Reload</button>
          </>}
        >
          Their saved version replaces what is open here. Your edits since the last save are lost.
        </Dialog>
      )}

      {history && (
        <VersionHistory
          air={air}
          name={title.trim() || `Untitled ${kind}`}
          onRestore={(entry) => {
            restore(entry);
            setHistory(false);
            toast(<span><Version n={entry.v} /> loaded — review it, then publish to put it on air</span>);
          }}
          onClose={() => setHistory(false)}
        />
      )}
    </ChangeScope>
  );
}
