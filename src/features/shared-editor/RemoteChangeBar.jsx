import { ago } from '../../utils/time.js';

// The line over the editor when someone else saved the open graphic after it was opened:
// who (when the backend says) and when, and the one act — reload to get their version.
//   remote: { mt, by, at }
export default function RemoteChangeBar({ remote, onReload }) {
  return (
    <div className="remote-bar" role="status">
      <span className="remote-dot" aria-hidden="true" />
      <span>
        <b>{remote.by ? remote.by : 'Someone else'}</b> saved this graphic {ago(remote.at)} — your copy is older.
        {' '}A save from here would be refused until you reload.
      </span>
      <button type="button" className="btn ghost small" onClick={onReload}>Reload</button>
    </div>
  );
}
