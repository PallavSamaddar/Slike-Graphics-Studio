import ColorField from '../shared-editor/ColorField.jsx';
import FormattingToolbar from '../shared-editor/FormattingToolbar.jsx';
import { Stepper } from '../shared-editor/StyleControls.jsx';
import { CAPTION_ANIMATIONS, CAPTION_SHAPES } from '../../constants/captionTemplates.js';
import { Field, GroupLabel, Row, Section, Select } from '../../ui-kit';

export default function CaptionStyleSection({ st, setSt }) {
  const { style: s, nameText: nt, behavior } = st;
  const setStyle = (k, v) => setSt((state) => ({ ...state, style: { ...state.style, [k]: v } }));
  const setNt = (k, v) => setSt((state) => ({ ...state, nameText: { ...state.nameText, [k]: v } }));
  const setBehavior = (k, v) => setSt((state) => ({ ...state, behavior: { ...state.behavior, [k]: v } }));
  const setNameBg = (v) => setSt((state) => ({ ...state, style: { ...state.style, nameBg: v, nameBgGradient: null } }));
  const several = (st.names || []).filter((n) => n?.trim()).length > 1;
  const shape = s.shape || 'bar';
  const noBlocks = shape === 'line';
  const onePanel = shape === 'glass';

  return (
    <Section title="Style">
      <Row>
        <Field label="Shape" path="style.shape">
          <Select value={shape} options={CAPTION_SHAPES} onChange={(v) => setStyle('shape', v)} ariaLabel="Shape" />
        </Field>
        <Field label="Animation" path="behavior.animation">
          <Select value={behavior?.animation || 'slide'} options={CAPTION_ANIMATIONS} onChange={(v) => setBehavior('animation', v)} ariaLabel="Animation" />
        </Field>
        {several && (
          <Field label="Each caption" path="behavior.itemDuration">
            <Stepper value={behavior?.itemDuration || 6} display={(v) => `${v}s`} step={1} min={3} max={60} onChange={(v) => setBehavior('itemDuration', v)} label="duration" title="How long each caption stays on screen" />
          </Field>
        )}
      </Row>

      <GroupLabel>Colours</GroupLabel>
      <Row>
        {!noBlocks && (
          <Field label={onePanel ? 'Panel' : 'Title background'} path={['style.nameBg', 'style.nameBgGradient']}>
            <ColorField
              value={s.nameBg}
              fallback="#C22F1E"
              onChange={setNameBg}
              allowGradient={!onePanel}
              gradientValue={onePanel ? null : s.nameBgGradient}
              onChangeGradient={(css) => setStyle('nameBgGradient', css)}
            />
          </Field>
        )}
        <Field label="Title text" path="style.nameColor">
          <ColorField value={s.nameColor} fallback="#FFFFFF" onChange={(v) => setStyle('nameColor', v)} />
        </Field>
        {!noBlocks && !onePanel && (
          <Field label="Subtitle background" path="style.roleBg">
            <ColorField value={s.roleBg} fallback="#FFFFFF" onChange={(v) => setStyle('roleBg', v)} />
          </Field>
        )}
        <Field label="Subtitle text" path="style.roleColor">
          <ColorField value={s.roleColor} fallback="#1A1714" onChange={(v) => setStyle('roleColor', v)} />
        </Field>
        <Field label="Accent" path="style.accent">
          <ColorField value={s.accent} fallback="#FFD400" onChange={(v) => setStyle('accent', v)} />
        </Field>
      </Row>

      <GroupLabel>Title formatting</GroupLabel>
      <Row>
        <FormattingToolbar tx={nt} setTx={setNt} path="nameText" withCase maxSize={48} />
      </Row>
    </Section>
  );
}
