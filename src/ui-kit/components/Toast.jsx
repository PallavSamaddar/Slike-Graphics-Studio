import { createContext, useCallback, useContext, useRef, useState } from 'react';

// Toast — the receipt: one pill, bottom centre, one at a time. A new one replaces the old.
// It leaves after 2.2s (warn 5s, bad 6s).
const Ctx = createContext(() => {});
export const useToast = () => useContext(Ctx);

export function ToastHost({ children }) {
  const [t, setT] = useState(null);
  const timer = useRef(null);
  const toast = useCallback((content, kind = '') => {
    clearTimeout(timer.current);
    setT({ content, kind, k: Date.now() });
    timer.current = setTimeout(() => setT(null), kind === 'bad' ? 6000 : kind === 'warn' ? 5000 : 2200);
  }, []);
  return (
    <Ctx.Provider value={toast}>
      {children}
      <div id="toasts" role="status" aria-live="polite">
        {t && <div key={t.k} className={'toast' + (t.kind ? ' ' + t.kind : '')}><i className="tdot" />{t.content}</div>}
      </div>
    </Ctx.Provider>
  );
}
