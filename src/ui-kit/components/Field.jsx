import { useChanged } from '../hooks/useChangeMarks.jsx';
import { useFieldError } from '../hooks/useFieldErrors.jsx';

// Field — label, box, then a hint or an error under it.
// `path` names the setting(s) it edits, so it wears the change mark while unsaved and
// shows any error a surrounding FieldErrors gives that path (an `err` prop wins).
export default function Field({ label, path, grow, off, offReason, err: errProp, className = '', children, style }) {
  const changed = useChanged();
  const chg = path && changed(path);
  const pathErr = useFieldError(path);
  const err = errProp || pathErr;
  return (
    <div className={'field' + (grow ? ' grow' : '') + (off ? ' off' : '') + (err ? ' err' : '') + (chg ? ' chg' : '') + (className ? ' ' + className : '')} title={off ? offReason : undefined} style={style}>
      {label != null && <label>{label}</label>}
      {children}
      {err && <div className="field-err">{err}</div>}
    </div>
  );
}
