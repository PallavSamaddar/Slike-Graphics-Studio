import { useEffect, useRef } from 'react';

// Dialog — the house confirm, centred at 440 (`sheet` 620) over the blurred veil.
export default function Dialog({ title, children, foot, onCancel, size, busy }) {
  const ref = useRef(null);
  useEffect(() => {
    const prev = document.activeElement;
    ref.current?.querySelector('h3')?.focus();
    const onKey = (e) => { if (e.key === 'Escape' && !busy) { e.stopPropagation(); onCancel(); } };
    document.addEventListener('keydown', onKey, true);
    return () => { document.removeEventListener('keydown', onKey, true); prev?.focus?.(); };
  }, [onCancel, busy]);
  return (
    <div className="dlg-veil" onMouseDown={(e) => { if (e.target === e.currentTarget && !busy) onCancel(); }}>
      <div className={'dlg' + (size ? ' ' + size : '')} role="dialog" aria-modal="true" ref={ref}>
        <h3 tabIndex={-1}>{title}</h3>
        <div className="dlg-body">{children}</div>
        <div className="dlg-foot">{foot}</div>
      </div>
    </div>
  );
}
