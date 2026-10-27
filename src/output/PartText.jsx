// A widget heading's or description's own animation (behavior.headingAnim / descAnim), on top of
// the card's transition — as on broadcast breaking-news boxes, where the panel stays and only
// its text changes:
//   write — written on left to right, line by line, behind a soft edge; wiped off backwards
//   flare — written on the same way while a light flare crosses ahead of the words
//   words — each word rises in after the one before; they fade out last first
//   shine — a glint sweeps across the letters every few seconds (the text comes and goes with the card)
// Each word is timed here (CSS variables); the CSS runs them off the card's phase classes:
// phase-hold writes them on, parts-erase wipes them off.

// The animations that write the words on and take them off again.
export const writesWords = (anim) => anim === 'write' || anim === 'flare' || anim === 'words';

// How long the words take to come off before the card changes.
export const ERASE_MS = 450;
// Writing waits this long for the card to come in.
const START_SEC = 0.15;
const SEC_PER_CHAR = 0.03;
const WORD_SEC = 0.35;

const wordsOf = (text) => text.split(/(\s+)/).filter(Boolean);
const isSpace = (token) => /^\s+$/.test(token);

// How long writing the text on takes (after its start delay).
export function partSeconds(text, anim) {
  if (!writesWords(anim)) return 0;
  const words = wordsOf(text).filter((t) => !isSpace(t));
  if (anim === 'words') return Math.min(1.2, words.length * 0.08) + WORD_SEC;
  const chars = words.reduce((n, w) => n + w.length + 1, 0);
  return Math.min(2, Math.max(0.4, chars * SEC_PER_CHAR));
}

//   delay: seconds to wait before writing (a description waits for its heading)
//   pace: how many times faster than usual to write (so a long text is written in time)
export default function PartText({ text, anim, className, delay = 0, pace = 1 }) {
  if (anim === 'shine') return <span className={className + ' part-shine'} data-text={text}>{text}</span>;
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
