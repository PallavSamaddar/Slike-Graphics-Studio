import { useEffect, useState } from 'react';

// The person's theme, as the kit's ThemeSwitch keeps it: Light, Dark or
// Match device, picked in the profile menu, stored in this browser as `pc-theme`.
// Everyone starts on Light. index.html applies the same pick before the page draws.
const STORAGE_KEY = 'pc-theme'; // 'light' | 'dark' | 'device'

function readPick() {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'light' || v === 'dark' || v === 'device') return v;
  } catch { /* storage blocked: the pick lasts until reload */ }
  return 'light';
}

const deviceDark = () => !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);

function apply(pick) {
  const theme = pick === 'dark' || (pick === 'device' && deviceDark()) ? 'dark' : 'light';
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

  useEffect(() => {
    apply(pick);
    try { localStorage.setItem(STORAGE_KEY, pick); } catch { /* ignore */ }
    if (pick !== 'device' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('device');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [pick]);

  return { pick, setPick };
}
