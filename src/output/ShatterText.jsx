// Text that assembles from broken glass: the words are drawn once per shard, each copy cut to
// one irregular triangle of the text's box (clip-path), and every shard flies in from its own
// offset and turn to land in place, slightly after the one before. The cut is the same every
// time (a fixed seed), so a sting looks the same on every screen.
const COLS = 8;
const ROWS = 3;

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

// The grid's corners, the inner ones nudged so the cracks run crooked like real glass.
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
          delay: `${(rand() * 0.22).toFixed(2)}s`,
        });
      }
    }
  }
  return list;
}

const SHARDS = shards();

export default function ShatterText({ text, style }) {
  return (
    <span className="shatter-text" style={style} aria-label={text}>
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
