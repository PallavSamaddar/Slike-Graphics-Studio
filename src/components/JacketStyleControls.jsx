import ColorField from './ColorField.jsx';
import FormattingToolbar from './FormattingToolbar.jsx';
import { TPLS } from '../data/templates.js';

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
    <div className="style-controls">
      <div className="style-sec">
        <div className="form-row form-row-3">
          <div className="form-g">
            <label className="form-lbl">Logo Colour</label>
            <ColorField
              value={s.logoColor}
              fallback="#C22F1E"
              onChange={setLogoColor}
              allowGradient
              gradientValue={s.logoGradient}
              onChangeGradient={(css) => setStyle('logoGradient', css)}
            />
          </div>
          <div className="form-g">
            <label className="form-lbl">Tag Colour</label>
            <ColorField value={s.tagColor} fallback="#1A1714" onChange={(v) => setStyle('tagColor', v)} />
          </div>
          <div className="form-g">
            <label className="form-lbl">Time Colour</label>
            <ColorField value={s.timeColor} fallback="#C22F1E" onChange={(v) => setStyle('timeColor', v)} />
          </div>
        </div>
      </div>

      <hr className="style-sep" />

      <div className="style-sec">
        <div className="form-g" style={{ minWidth: 0 }}>
          <label className="form-lbl">Headline Formatting</label>
          <FormattingToolbar tx={ht} setTx={setHt} />
        </div>
      </div>

      {tickerTpl && (
        <>
          <hr className="style-sep" />
          <div className="style-sec">
            <div className="form-row form-row-3">
              <div className="form-g">
                <label className="form-lbl">Ticker Background</label>
                <ColorField
                  value={tickerStyle.bgColor}
                  fallback={tickerTpl.style.bgColor}
                  onChange={setTickerBg}
                  allowGradient
                  gradientValue={tickerStyle.bgGradient}
                  onChangeGradient={(css) => setTickerStyle('bgGradient', css)}
                />
              </div>
              <div className="form-g">
                <label className="form-lbl">Badge Colour</label>
                <ColorField value={tickerBadge.bgColor} fallback={tickerTpl.badge.bgColor} onChange={(v) => setTickerBadge('bgColor', v)} />
              </div>
              <div className="form-g">
                <label className="form-lbl">Badge Text</label>
                <input
                  type="text"
                  className="form-inp"
                  value={tickerBadge.type}
                  onChange={(e) => {
                    const v = e.target.value;
                    setSt((state) => ({
                      ...state,
                      tickerBadgeOverrides: { ...state.tickerBadgeOverrides, type: v, show: !!v.trim() },
                    }));
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
