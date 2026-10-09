import { useRef } from 'react';

// Single textarea, one ticker item per line — numbered gutter mirrors line count.
export default function ItemsEditor({ items, onChange, readOnly = false }) {
  const text = items.join('\n');
  const gutterRef = useRef(null);
  const taRef = useRef(null);

  const lineCount = Math.max(text.split('\n').length, 1);

  const handleChange = (e) => {
    onChange(e.target.value.split('\n'));
  };

  const syncScroll = () => {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  };

  return (
    <div className={'items-editor' + (readOnly ? ' items-editor-readonly' : '')}>
      <div className="items-editor-gutter" ref={gutterRef}>
        {Array.from({ length: lineCount }, (_, i) => (
          <div className="items-editor-linenum" key={i}>{i + 1}</div>
        ))}
      </div>
      <textarea
        ref={taRef}
        className="items-editor-textarea"
        value={text}
        placeholder="Enter headline…"
        onChange={handleChange}
        onScroll={syncScroll}
        spellCheck={false}
        rows={Math.max(lineCount, 6)}
        readOnly={readOnly}
        title={readOnly ? 'Fetched from source — edit not allowed. Change the URL and re-validate to update.' : undefined}
      />
    </div>
  );
}
