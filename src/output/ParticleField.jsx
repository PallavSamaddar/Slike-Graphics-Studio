import { useMemo } from 'react';

// A dense field of small dots scattered radially from center, each twinkling
// independently — the "Breaking Pulse" / "News Orbit" broadcast look. Seeded
// once per mount so the layout doesn't reshuffle on re-render.
function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export default function ParticleField({ count = 90, seed = 1, color = '#FFFFFF', opacity = 1 }) {
  const particles = useMemo(() => {
    const rand = seededRandom(seed);
    return Array.from({ length: count }, () => {
      const t = Math.pow(rand(), 0.55);
      const r = t * 46; // % of container radius
      const angle = rand() * Math.PI * 2;
      const x = 50 + r * Math.cos(angle);
      const y = 50 + r * Math.sin(angle);
      const size = 1.5 + t * 5;
      const opacity = 0.15 + t * 0.55;
      const dur = 2 + rand() * 3;
      const delay = rand() * 4;
      return { x, y, size, opacity, dur, delay };
    });
  }, [count, seed]);

  return (
    <div className="particle-field" style={{ opacity }}>
      {particles.map((p, i) => (
        <span
          key={i}
          className="particle-dot"
          style={{
            left: p.x + '%',
            top: p.y + '%',
            width: p.size,
            height: p.size,
            background: color,
            '--pf-opacity': p.opacity,
            animationDuration: p.dur + 's',
            animationDelay: p.delay + 's',
          }}
        />
      ))}
    </div>
  );
}
