const BAR_COUNT = 14;

function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function bars() {
  const rand = seeded(5);
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    const along = i / (BAR_COUNT - 1);
    const near = 1 - along * 0.3;
    const width = (4.5 + rand() * 3.5) * near + (rand() < 0.3 ? 2 * near : 0);
    const jitter = i && i < BAR_COUNT - 1 ? (rand() - 0.5) * 2 : 0;
    return {
      left: `${(along * (100 - width) + jitter).toFixed(1)}%`,
      width: `${width.toFixed(2)}%`,
      height: '100%',
      bottom: 0,
      '--d': `${(along * 0.05 + rand() * 0.01).toFixed(3)}s`,
      '--tilt': `${((rand() - 0.5) * 36).toFixed(0)}deg`,
    };
  });
}

const BARS = bars();

const ARROWS = [
  { top: 20, size: 60, left: '4%', '--d': '.12s' },
  { top: 20, size: 60, left: '36%', '--d': '.2s' },
  { top: 20, size: 60, left: '64%', '--d': '.28s' },
];

export default function GoldSting({ text, style }) {
  return (
    <span className="gold-sting" style={style} aria-hidden="true">
      {ARROWS.map(({ top, size, left, ...timing }, i) => (
        <span key={i} className="gold-arrow-track" style={timing}>
          <span className="gold-arrow" style={{ top: `${top}%`, left, '--size': size }}>
            <span className="gold-arrow-head" />
          </span>
        </span>
      ))}
      <span className="gold-bars">
        {BARS.map((bar, i) => <span key={i} className="gold-bar" style={bar} />)}
      </span>
      <span className="gold-sting-text">
        {text}
        <span className="gold-sting-chevron" />
      </span>
    </span>
  );
}

const FLASHES = [
  { top: '56%', height: '26%', '--d': '.2s', '--from': '0%', '--to': '4%' },
  { top: '40%', height: '18%', '--d': '.25s', '--from': '-25%', '--to': '12%' },
  { top: '64%', height: '30%', '--d': '.3s', '--from': '20%', '--to': '-8%' },
];

export function GoldLanding() {
  return (
    <span className="gold-land" aria-hidden="true">
      <span className="gold-glow" />
      {FLASHES.map((flash, i) => <span key={i} className="gold-flash" style={flash} />)}
      <span className="gold-band" />
      <span className="gold-topline" />
    </span>
  );
}
