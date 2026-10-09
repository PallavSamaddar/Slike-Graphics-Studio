import ColorField from '../shared-editor/ColorField.jsx';
import TickerBehaviour from './TickerBehaviourSection.jsx';
import FormattingToolbar from '../shared-editor/FormattingToolbar.jsx';
import { Field, Row, Section, Select, Toggle } from '../../ui-kit';

const HEIGHTS = [
  { value: '36px', label: 'Compact — 36px' },
  { value: '44px', label: 'Small — 44px' },
  { value: '48px', label: 'Standard — 48px' },
  { value: '56px', label: 'Tall — 56px' },
  { value: '64px', label: 'Large — 64px' },
];
const BANNERS = [
  { value: 'chevron', label: 'Chevron — angled banner + tag' },
  { value: 'split', label: 'Split block — solid + angled' },
  { value: 'stripes', label: 'Diagonal stripes accent' },
  { value: 'pill', label: 'Rounded pill tag' },
];
const SIZES = [
  { value: 0.8, label: 'Small' },
  { value: 1, label: 'Standard' },
  { value: 1.3, label: 'Large' },
  { value: 1.6, label: 'Extra large' },
];

// The ticker's Style, Badge and Behaviour sections, each a section of the editor's one
// surface (UI kit Section inside .keyform).
export default function TickerStyleSections({ st, setSt }) {
  const { style: s, badge: b, text: tx, behavior } = st;
  // Alignment only affects a single held item — meaningless for a
  // continuous scroll, where every item just streams past left-to-right.
  const alignDisabled = behavior.mode !== 'single';
  const setStyle = (k, v) => setSt((state) => ({ ...state, style: { ...state.style, [k]: v } }));
  const setTx = (k, v) => setSt((state) => ({ ...state, text: { ...state.text, [k]: v } }));
  const setBadge = (k, v) => setSt((state) => ({ ...state, badge: { ...state.badge, [k]: v } }));
  const badgeOff = !b.show;
  const offReason = 'Badge is off — switch it on first';

  return (
    <>
      <Section title="Style">
        <Row>
          <Field label="Background colour" path={['style.bgColor', 'style.bgGradient']}>
            <ColorField value={s.bgColor} fallback="#D7282F" onChange={(v) => setStyle('bgColor', v)} />
          </Field>
          <Field label="Height" path="style.height">
            <Select value={s.height} options={HEIGHTS} onChange={(v) => setStyle('height', v)} ariaLabel="Height" />
          </Field>
        </Row>
        <Row>
          <FormattingToolbar
            tx={tx}
            setTx={setTx}
            path="text"
            fonts={['Inter', 'Roboto', 'Georgia', 'Merriweather', 'Courier']}
            withCase
            maxSize={72}
            alignDisabled={alignDisabled}
            alignReason="Alignment only applies to Sequential display mode"
          />
        </Row>
      </Section>

      <Section title="Badge" action={<Toggle on={b.show} onChange={(v) => setBadge('show', v)}>Show badge</Toggle>}>
        <Row>
          <Field label="Badge text" path="badge.customText" off={badgeOff} offReason={offReason}>
            <span className="num-wrap badge-text">
              <input placeholder="LIVE" maxLength={20} value={b.customText} onChange={(e) => setBadge('customText', e.target.value)} />
              <span className="unit">{b.customText.length}/20</span>
            </span>
          </Field>
          <Field label="Background" path="badge.bgColor" off={badgeOff} offReason={offReason}>
            <ColorField value={b.bgColor} fallback="#D7282F" onChange={(v) => setBadge('bgColor', v)} />
          </Field>
          <Field label="Banner style" path="style.ddStyle" off={badgeOff} offReason={offReason}>
            <Select value={s.ddStyle || 'chevron'} options={BANNERS} onChange={(v) => setStyle('ddStyle', v)} ariaLabel="Banner style" />
          </Field>
          <Field label="Badge size" path="badge.scale" off={badgeOff} offReason={offReason}>
            <Select value={b.scale || 1} options={SIZES} onChange={(v) => setBadge('scale', parseFloat(v))} ariaLabel="Badge size" />
          </Field>
        </Row>
      </Section>

      <TickerBehaviour st={st} setSt={setSt} />
    </>
  );
}
