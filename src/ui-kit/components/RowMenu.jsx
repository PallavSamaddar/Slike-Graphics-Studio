import { useRef, useState } from 'react';
import useDismiss from '../hooks/useDismiss.js';
import MenuItem from './MenuItem.jsx';

// RowMenu — the secondary acts behind one quiet ⋯.
//   items: [{ label, onClick, danger?, dim?, title?, fact? }]
export default function RowMenu({ items, label = 'More', onOpenChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const set = (v) => { setOpen(v); onOpenChange?.(v); };
  useDismiss(open, ref, () => set(false));
  return (
    <div className={'rmenu' + (open ? ' open' : '')} ref={ref} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <button type="button" className="row-kebab" aria-haspopup="true" aria-expanded={open} aria-label={label} onClick={() => set(!open)}>⋯</button>
      <div className="rmenu-list" role="menu">
        {items.map((it) => (
          <MenuItem key={it.label} it={it} close={() => set(false)} />
        ))}
      </div>
    </div>
  );
}
