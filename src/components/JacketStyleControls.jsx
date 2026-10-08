import ColorField from './ColorField.jsx';
import FormattingToolbar from './FormattingToolbar.jsx';
import { TPLS } from '../data/templates.js';
import { Field } from '../ui/controls.jsx';

export default function JacketStyleControls({ st, setSt }) {
  const { style: s, headlineText: ht } = st;
  const setStyle = (k, v) => setSt((state) => ({ ...state, style: { ...state.style, [k]: v } }));
  const setHt = (k, v) => setSt((state) => ({ ...state, headlineText: { ...state.headlineText, [k]: v } }));
  const setLogoColor = (v) => setSt((state) => ({ ...state, style: { ...state.style, logoColor: v, logoGradient: null } }));

  const tickerTpl = st.tickerTemplate && TPLS.find((t) => t.id === st.tickerTemplate);
  const tickerStyle = tickerTpl ? { ...tickerTpl.style, ...st.tickerStyleOverrides } : null;
  const tickerBadge = tickerTpl ? { ...tickerTpl.badge, ...st.tickerBadgeOverrides } : null;
  const setTickerStyle = (k, v) => setSt((state) => ({ ...state, tickerStyleOverrides: { ...state.tickerStyleOverrides, [k]: v } }));
  const setTickerBadge = (k, v) => setSt((state) => ({ ...state, tickerBadgeOverrides: { ...state.tickerBadgeOverrides, [k]: v } }));
  const setTickerBg = (v) => setSt((state) => ({ ...state, tickerStyleOverrides: { ...state.tickerStyleOverrides, bgColor: v, bgGradient: null } }));

  return (
    <div className="fieldset">
      <div className="fieldset-title">Style</div>
      <div className="frow">
        <Field label="Logo colour" path={['style.logoColor', 'style.logoGradient']}>
          <ColorField
            value={s.logoColor}
            fallback="#C22F1E"
            onChange={setLogoColor}
            allowGradient
            gradientValue={s.logoGradient}
            onChangeGradient={(css) => setStyle('logoGradient', css)}
          />
        </Field>
        <Field label="Tag colour" path="style.tagColor">
          <ColorField value={s.tagColor} fallback="#1A1714" onChange={(v) => setStyle('tagColor', v)} />
        </Field>
        <Field label="Time colour" path="style.timeColor">
          <ColorField value={s.timeColor} fallback="#C22F1E" onChange={(v) => setStyle('timeColor', v)} />
        </Field>
      </div>

      <div className="grp-label type-group-label">Headline formatting</div>
      <div className="frow">
        <FormattingToolbar tx={ht} setTx={setHt} path="headlineText" />
      </div>

      {tickerTpl && (
        <>
          <div className="grp-label type-group-label">Ticker</div>
          <div className="frow">
            <Field label="Ticker background" path={['tickerStyleOverrides.bgColor', 'tickerStyleOverrides.bgGradient']}>
              <ColorField
                value={tickerStyle.bgColor}
                fallback={tickerTpl.style.bgColor}
                onChange={setTickerBg}
                allowGradient
                gradientValue={tickerStyle.bgGradient}
                onChangeGradient={(css) => setTickerStyle('bgGradient', css)}
              />
            </Field>
            <Field label="Badge colour" path="tickerBadgeOverrides.bgColor">
              <ColorField value={tickerBadge.bgColor} fallback={tickerTpl.badge.bgColor} onChange={(v) => setTickerBadge('bgColor', v)} />
            </Field>
            <Field label="Badge text" path="tickerBadgeOverrides.type">
              <input
                type="text"
                value={tickerBadge.type}
                onChange={(e) => {
                  const v = e.target.value;
                  setSt((state) => ({
                    ...state,
                    tickerBadgeOverrides: { ...state.tickerBadgeOverrides, type: v, show: !!v.trim() },
                  }));
                }}
              />
            </Field>
          </div>
        </>
      )}
    </div>
  );
}
