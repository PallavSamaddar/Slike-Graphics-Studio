// Status — where a thing stands: a dot and a word. `pending` is the one state that wears a box.
//   kind: 'live' | 'off' | 'pending'
export default function Status({ kind, children, ...rest }) {
  return <span className={'stat ' + kind} {...rest}>{kind === 'live' ? <span>{children}</span> : children}</span>;
}

// A version number, set in the mono.
export function Version({ n }) {
  return <span className="vno">v{n}</span>;
}
