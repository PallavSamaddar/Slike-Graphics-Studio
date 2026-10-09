import { useChanged } from '../hooks/useChangeMarks.jsx';

// Field — label, box, then a hint or an error under it.
// `path` names the setting(s) it edits, so it wears the change mark while unsaved.
export default function Field({ label, path, grow, off, offReason, err, className = '', children, style }) {
  const changed = useChanged();
  const chg = path && changed(path);
  return (
    <div className={'field' + (grow ? ' grow' : '') + (off ? ' off' : '') + (err ? ' err' : '') + (chg ? ' chg' : '') + (className ? ' ' + className : '')} title={off ? offReason : undefined} style={style}>
      {label != null && <label>{label}</label>}
      {children}
      {err && <div className="field-err">{err}</div>}
    </div>
  );
}
