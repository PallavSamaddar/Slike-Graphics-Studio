import { useEffect, useState } from 'react';

const STORAGE_KEY = 'pc-theme'; // 'light' | 'dark' | 'device'

function readPick() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'device') return v;
  } catch { /* storage blocked: the pick lasts until reload */ }
  return 'light';
}

const deviceDark = () => !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
const resolve = (pick) => (pick === 'dark' || (pick === 'device' && deviceDark()) ? 'dark' : 'light');

function apply(theme) {
  const root = document.documentElement;
  if (root.getAttribute('data-theme') === theme) return;
  const paint = () => {
    root.setAttribute('data-theme', theme);
    document.dispatchEvent(new CustomEvent('pc-themechange', { detail: { theme } }));
  };
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduce) document.startViewTransition(paint);
  else paint();
}
export function useTheme() {
  const [pick, setPick] = useState(readPick);
  const [theme, setTheme] = useState(() => resolve(readPick()));

  useEffect(() => {
    const show = () => { const t = resolve(pick); setTheme(t); apply(t); };
    show();
    try { localStorage.setItem(STORAGE_KEY, pick); } catch { /* ignore */ }
    if (pick !== 'device' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    mq.addEventListener('change', show);
    return () => mq.removeEventListener('change', show);
  }, [pick]);

  return { pick, setPick, theme };
}
