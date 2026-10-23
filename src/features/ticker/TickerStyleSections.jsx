import { Field, SegmentedControl, Select } from '../../ui-kit';
import TextColorButton from '../shared-editor/TextColorButton.jsx';
import { FontSelect, Stepper, TextFormat } from '../shared-editor/StyleControls.jsx';
import { TEXT_ANIMATIONS } from '../../constants/textAnimations.js';
import { autoTextColor } from '../../utils/color.js';

const HEIGHTS = [
  { value: '36px', label: 'Compact · 36px' },
  { value: '44px', label: 'Small · 44px' },
  { value: '48px', label: 'Standard · 48px' },
  { value: '56px', label: 'Tall · 56px' },
  { value: '64px', label: 'Large · 64px' },
  { value: '96px', label: 'Extra large · 96px' },
  { value: '140px', label: 'Extra extra large · 140px' },
];
const BANNERS = [
  { value: 'chevron', label: 'Chevron' },
  { value: 'split', label: 'Split block' },
  { value: 'stripes', label: 'Stripes' },
  { value: 'pill', label: 'Pill' },
];
const SIZES = [
  { value: 0.8, label: 'Small' },
  { value: 1, label: 'Standard' },
  { value: 1.3, label: 'Large' },
  { value: 1.6, label: 'Extra large' },
];
// The animations that show a sting between headlines.
const STINGS = ['breaking', 'shatter'];
const SPEEDS = [
  { value: 1, label: 'Slow' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Fast' },
];

export default function TickerStyleSections({ st, setSt }) {
  const { style: s, badge: b, text: tx, behavior } = st;
  const setStyle = (k, v) => setSt((state) => ({ ...state, style: { ...state.style, [k]: v } }));
  const setTx = (k, v) => setSt((state) => ({ ...state, text: { ...state.text, [k]: v } }));
  const setBadge = (k, v) => setSt((state) => ({ ...state, badge: { ...state.badge, [k]: v } }));
  const setBehavior = (k, v) => setSt((state) => ({ ...state, behavior: { ...state.behavior, [k]: v } }));
  const loop = behavior.mode !== 'single';
  const badgeOff = !b.show;
  const badgeReason = 'Badge is off — tick Show first';

  return (
    <div className="fieldset style-sec" aria-label="Style">
      <div className="cs-lines">
        <div className="cs-row">
          <span className="cs-label">Bar</span>
          <Field path={['style.bgColor', 'style.bgGradient']}>
            <TextColorButton kind="fill" value={s.bgColor} fallback="#D7282F" onChange={(v) => setStyle('bgColor', v)} label="Bar background" />
          </Field>
          <Field path="style.height" className="cs-wide">
            <Select value={s.height} options={HEIGHTS} onChange={(v) => setStyle('height', v)} ariaLabel="Height" title="Bar height — the text grows and shrinks with it" />
          </Field>
        </div>

        <div className="cs-row">
          <span className="cs-label">Text</span>
          <Field path="text.color">
            <TextColorButton value={tx.color} auto={autoTextColor(s.bgColor)} onChange={(v) => setTx('color', v)} label="Text" />
          </Field>
          <Field path="text.fontFamily" className="cs-wide">
            <FontSelect tx={tx} setTx={setTx} label="Text" />
          </Field>
          <TextFormat
            tx={tx}
            setTx={setTx}
            path="text"
            label="Text"
            alignKey="textAlign"
            alignDefault="left"
            alignOff={loop || STINGS.includes(behavior.animation)}
            alignReason={loop ? 'Alignment only applies to Sequential' : 'The sting animations centre the headline'}
            withCase
          />
          <Field path="text.autoFit" off={loop} offReason="Only for Sequential — a scrolling ticker never cuts its text">
            <label className="cs-check" title="On: a long headline gets smaller to fit the bar. Off: it keeps its size and ends in …">
              <input type="checkbox" checked={!!tx.autoFit} disabled={loop} onChange={(e) => setTx('autoFit', e.target.checked)} />
              Shrink to fit
            </label>
          </Field>
        </div>

        <div className="cs-row">
          <span className="cs-label">Badge</span>
          <label className="cs-check" title="Show the badge at the start of the bar">
            <input type="checkbox" checked={!!b.show} onChange={(e) => setBadge('show', e.target.checked)} />
            Show
          </label>
          <Field path="badge.customText" off={badgeOff} offReason={badgeReason}>
            <input
              type="text"
              className="cs-text"
              placeholder="LIVE"
              maxLength={20}
              value={b.customText || ''}
              onChange={(e) => setBadge('customText', e.target.value)}
              aria-label="Badge text"
              title="Badge text (up to 20 characters)"
            />
          </Field>
          <Field path="badge.bgColor" off={badgeOff} offReason={badgeReason}>
            <TextColorButton kind="fill" value={b.bgColor} fallback="#D7282F" onChange={(v) => setBadge('bgColor', v)} label="Badge background" />
          </Field>
          <Field path="style.ddStyle" off={badgeOff} offReason={badgeReason}>
            <Select value={s.ddStyle || 'chevron'} options={BANNERS} onChange={(v) => setStyle('ddStyle', v)} ariaLabel="Banner style" title="Banner style" />
          </Field>
          <Field path="badge.scale" off={badgeOff} offReason={badgeReason}>
            <Select value={b.scale || 1} options={SIZES} onChange={(v) => setBadge('scale', parseFloat(v))} ariaLabel="Badge size" title="Badge size" />
          </Field>
        </div>

        <div className="cs-row">
          <span className="cs-label">Motion</span>
          <Field path="behavior.mode">
            <SegmentedControl
              value={loop ? 'loop' : 'single'}
              onChange={(m) => setBehavior('mode', m)}
              ariaLabel="Display mode"
              options={[{ value: 'loop', label: 'Continuous' }, { value: 'single', label: 'Sequential' }]}
            />
          </Field>
          <Field path="behavior.speed" off={!loop} offReason="Only for Continuous">
            <Select value={behavior.speed} options={SPEEDS} onChange={(v) => setBehavior('speed', parseInt(v, 10))} ariaLabel="Scroll speed" title="Scroll speed" />
          </Field>
          <Field path="behavior.animation" off={loop} offReason="Only for Sequential">
            <Select value={behavior.animation || 'fade'} options={TEXT_ANIMATIONS} onChange={(v) => setBehavior('animation', v)} ariaLabel="Text animation" title="Text animation" />
          </Field>
          <Field path="behavior.stingText" off={loop || !STINGS.includes(behavior.animation)} offReason="Only for the Breaking News and Shatter stings">
            <input
              type="text"
              className="cs-text cs-text-wide"
              placeholder="BREAKING NEWS"
              maxLength={30}
              value={behavior.stingText ?? ''}
              onChange={(e) => setBehavior('stingText', e.target.value)}
              aria-label="Sting text"
              title="The words the sting shows between headlines"
            />
          </Field>
          <Field path="behavior.itemDuration" off={loop} offReason="Only for Sequential">
            <Stepper value={behavior.itemDuration || 5} display={(v) => `${v}s`} step={1} min={1} max={30} onChange={(v) => setBehavior('itemDuration', v)} label="duration" title="How long each headline stays on screen" />
          </Field>
        </div>
      </div>
    </div>
  );
}
