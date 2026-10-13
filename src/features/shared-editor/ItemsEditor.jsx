import { useLayoutEffect, useRef, useState } from 'react';

// Single textarea, one ticker item per line — numbered gutter mirrors line count.
// A long item wraps onto more than one row, so each number is given its item's wrapped
// height, measured on a hidden copy of the text laid out at the textarea's width; the gutter
// then lines up with the text and scrolls with it.
export default function ItemsEditor({ items, onChange, readOnly = false }) {
  const text = items.join('\n');
  const lines = text.split('\n');
  const gutterRef = useRef(null);
  const taRef = useRef(null);
  const mirrorRef = useRef(null);
  const [heights, setHeights] = useState([]);

  useLayoutEffect(() => {
    const ta = taRef.current;
    const mirror = mirrorRef.current;
    if (!ta || !mirror) return undefined;
    const measure = () => {
      mirror.style.width = `${ta.clientWidth}px`; // without the scrollbar, as the text wraps
      setHeights([...mirror.children].map((el) => el.offsetHeight));
      syncScroll();
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(ta);
    return () => ro.disconnect();
  }, [text]);

  const handleChange = (e) => {
    onChange(e.target.value.split('\n'));
  };

  function syncScroll() {
    if (gutterRef.current && taRef.current) {
      gutterRef.current.scrollTop = taRef.current.scrollTop;
    }
  }

  return (
    <div className={'items-editor' + (readOnly ? ' items-editor-readonly' : '')}>
      <div className="items-editor-gutter" ref={gutterRef}>
        {lines.map((_, i) => (
          <div className="items-editor-linenum" key={i} style={heights[i] ? { height: heights[i] } : undefined}>{i + 1}</div>
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
        rows={Math.max(lines.length, 6)}
        readOnly={readOnly}
        title={readOnly ? 'Fetched from source — edit not allowed. Change the URL and re-validate to update.' : undefined}
      />
      <div className="items-editor-mirror" ref={mirrorRef} aria-hidden="true">
        {lines.map((line, i) => <div key={i}>{line || '​'}</div>)}
      </div>
    </div>
  );
}
