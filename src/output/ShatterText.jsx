import { useLayoutEffect, useRef } from 'react';
const COLS = 8;
const CAP_FILL = 0.8;
const CAP_HEIGHT = 0.72;
const WIDTH_FILL = 0.94;
const ROWS = 3;

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function shards() {
  const rand = seeded(7);
  const point = (c, r) => {
    const inner = c > 0 && c < COLS && r > 0 && r < ROWS;
    const jx = inner ? (rand() - 0.5) * (70 / COLS) : 0;
    const jy = inner ? (rand() - 0.5) * (70 / ROWS) : 0;
    return [(c / COLS) * 100 + jx, (r / ROWS) * 100 + jy];
  };
  const grid = Array.from({ length: ROWS + 1 }, (_, r) => Array.from({ length: COLS + 1 }, (_, c) => point(c, r)));
  const list = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const [a, b, d, e] = [grid.at(r).at(c), grid.at(r).at(c + 1), grid.at(r + 1).at(c), grid.at(r + 1).at(c + 1)];
      // Alternate the diagonal, so the cracks don't all lean one way.
      const tris = (r + c) % 2 ? [[a, b, d], [b, e, d]] : [[a, b, e], [a, e, d]];
      for (const tri of tris) {
        const cx = (tri[0][0] + tri[1][0] + tri[2][0]) / 3;
        const cy = (tri[0][1] + tri[1][1] + tri[2][1]) / 3;
        list.push({
          clip: `polygon(${tri.map(([x, y]) => `${x.toFixed(1)}% ${y.toFixed(1)}%`).join(', ')})`,
          // Thrown outward from the middle, further for the shards at the edges.
          dx: `${((cx - 50) * (1.2 + rand())).toFixed(1)}%`,
          dy: `${((cy - 50) * (3 + rand() * 3)).toFixed(1)}%`,
          rot: `${((rand() - 0.5) * 140).toFixed(0)}deg`,
          delay: `${(rand() * 0.14).toFixed(2)}s`,
        });
      }
    }
  }
  return list;
}

const SHARDS = shards();

export default function ShatterText({ text, style }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    const box = el?.parentElement;
    if (!box) return undefined;
    const fit = () => {
      el.style.fontSize = '100px';
      const widthAt100 = el.offsetWidth;
      if (!widthAt100 || !box.clientHeight) return;
      const size = Math.min((box.clientHeight * CAP_FILL) / CAP_HEIGHT, (box.clientWidth * WIDTH_FILL * 100) / widthAt100);
      el.style.fontSize = `${size.toFixed(1)}px`;
    };
    fit();
    let live = true;
    document.fonts?.ready.then(() => { if (live) fit(); });
    const observer = new ResizeObserver(fit);
    observer.observe(box);
    return () => { live = false; observer.disconnect(); };
  }, [text]);

  return (
    <span ref={ref} className="shatter-text" style={style} aria-label={text}>
      <span className="shatter-text-size" aria-hidden="true">{text}</span>
      {SHARDS.map((s, i) => (
        <span
          key={i}
          className="shatter-shard"
          aria-hidden="true"
          style={{ clipPath: s.clip, '--dx': s.dx, '--dy': s.dy, '--rot': s.rot, '--d': s.delay }}
        >
          {text}
        </span>
      ))}
    </span>
  );
}
