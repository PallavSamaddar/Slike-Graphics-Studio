import Select from '../ui/Select.jsx';
import { Field, NumBox, Seg } from '../ui/controls.jsx';

const ANIMATIONS = [
  { value: 'fade', label: 'Fade' },
  { value: 'flip', label: 'Flip' },
  { value: 'slide', label: 'Slide' },
  { value: 'typewriter', label: 'Typewriter' },
];
const SPEEDS = [
  { value: 1, label: 'Slow' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Fast' },
];

// The ticker's Behaviour section. Every field stays in place; the ones the display mode
// doesn't use grey where they sit (interaction rules: every field is always in the DOM).
export default function TickerBehaviour({ st, setSt }) {
  const { behavior } = st;

  const setSpeed = (v) => setSt((state) => ({ ...state, behavior: { ...state.behavior, speed: parseInt(v, 10) } }));
  const setMode = (m) => setSt((state) => ({ ...state, behavior: { ...state.behavior, mode: m } }));
  const setAnimation = (a) => setSt((state) => ({ ...state, behavior: { ...state.behavior, animation: a } }));
  const setItemDuration = (v) => setSt((state) => ({ ...state, behavior: { ...state.behavior, itemDuration: Math.min(30, Math.max(1, v)) } }));
  const loop = behavior.mode === 'loop';

  return (
    <div className="fieldset">
      <div className="fieldset-title">Behaviour</div>
      <div className="frow">
        <Field label="Display mode" path="behavior.mode">
          <Seg
            value={behavior.mode}
            onChange={setMode}
            ariaLabel="Display mode"
            options={[{ value: 'loop', label: 'Continuous' }, { value: 'single', label: 'Sequential' }]}
          />
        </Field>
        <Field label="Scroll speed" path="behavior.speed" off={!loop} offReason="Only for Continuous display mode">
          <Select value={behavior.speed} options={SPEEDS} onChange={setSpeed} ariaLabel="Scroll speed" />
        </Field>
        <Field label="Text animation" path="behavior.animation" off={loop} offReason="Only for Sequential display mode">
          <Select value={behavior.animation || 'fade'} options={ANIMATIONS} onChange={setAnimation} ariaLabel="Text animation" />
        </Field>
        <Field label="Duration" path="behavior.itemDuration" off={loop} offReason="Only for Sequential display mode">
          <NumBox value={behavior.itemDuration || 5} unit="sec" min={1} max={30} off={loop} onChange={(n) => setItemDuration(Math.round(n))} ariaLabel="Duration" />
        </Field>
      </div>
    </div>
  );
}
