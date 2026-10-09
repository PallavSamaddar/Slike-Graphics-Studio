import { forwardRef } from 'react';

// Section — one section of an editor's surface (or a standing card): a sentence-case title,
// an optional act at the title row's right edge, then its rows.
export default function Section({ title, action, children }) {
  return (
    <div className="fieldset">
      {action ? (
        <div className="fieldset-title-row">
          <div className="fieldset-title">{title}</div>
          {action}
        </div>
      ) : (
        <div className="fieldset-title">{title}</div>
      )}
      {children}
    </div>
  );
}

// A row of fields inside a section. Takes a ref (e.g. to scroll a row into view).
export const Row = forwardRef(function Row({ className = '', children }, ref) {
  return <div ref={ref} className={'frow' + (className ? ' ' + className : '')}>{children}</div>;
});

// A quieter name over a group of rows inside a section.
export function GroupLabel({ children }) {
  return <div className="grp-label type-group-label">{children}</div>;
}
