export const writesWords = (anim) => ['write', 'flare', 'flash', 'flashwrite', 'words'].includes(anim);
export const ERASE_MS = 450;
export const START_SEC = 0.15;
const SEC_PER_CHAR = 0.03;
const WORD_SEC = 0.35;

const wordsOf = (text) => text.split(/(\s+)/).filter(Boolean);
const isSpace = (token) => /^\s+$/.test(token);
export function partSeconds(text, anim) {
  if (!writesWords(anim)) return 0;
  const words = wordsOf(text).filter((t) => !isSpace(t));
  if (anim === 'words') return Math.min(1.2, words.length * 0.08) + WORD_SEC;
  const chars = words.reduce((n, w) => n + w.length + 1, 0);
  return Math.min(2, Math.max(0.4, chars * SEC_PER_CHAR));
}
export default function PartText({ text, anim, className, delay = 0, pace = 1 }) {
  if (anim === 'shine') return <span className={className + ' part-shine'} data-text={text}>{text}</span>;
  if (anim === 'glintflash') {
    return (
      <span className={className + ' part-glintflash-box'}>
        <span className="part-glintflash" data-text={text}>{text}</span>
      </span>
    );
  }
  if (!writesWords(anim)) return <span className={className}>{text}</span>;

  const tokens = wordsOf(text);
  const words = tokens.filter((t) => !isSpace(t));
  const total = partSeconds(text, anim) / pace;
  const start = START_SEC + delay;
  const erase = ERASE_MS / 1000 - 0.05;
  const chars = words.reduce((n, w) => n + w.length + 1, 0) || 1;
  const timing = [];
  let at = 0;
  let left = erase;
  // Written on in order; wiped off in reverse, so the erase reaches the first word last.
  words.forEach((w, i) => {
    if (anim === 'words') {
      const gap = Math.min(0.08, 1.2 / words.length) / pace;
      const outGap = Math.min(0.04, (erase - 0.2) / words.length);
      timing.push({ d: start + i * gap, t: WORD_SEC / pace, ed: (words.length - 1 - i) * outGap, et: 0.2 });
      return;
    }
    const share = (w.length + 1) / chars;
    left -= erase * share;
    timing.push({ d: start + at, t: total * share, ed: left, et: erase * share });
    at += total * share;
  });

  let index = 0;
  return (
    <span className={`${className} part-anim part-${anim}`} aria-label={text}>
      {tokens.map((token, i) => {
        if (isSpace(token)) return token;
        const { d, t, ed, et } = timing[index++];
        return (
          <span key={i} className="part-w" aria-hidden="true" style={{ '--d': `${d.toFixed(3)}s`, '--t': `${t.toFixed(3)}s`, '--ed': `${Math.max(0, ed).toFixed(3)}s`, '--et': `${et.toFixed(3)}s` }}>
            {token}
          </span>
        );
      })}
      {anim === 'flare' && <span className="part-light" aria-hidden="true" style={{ '--d': `${start}s`, '--t': `${total}s` }} />}
    </span>
  );
}
