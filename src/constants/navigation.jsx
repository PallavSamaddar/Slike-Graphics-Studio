import { TEMPLATE_COUNT } from './graphics.js';

// The Slike mark: full colour, transparent on the header band at 20px, beside the name set
// in type. Never recoloured, boxed or set on a fill.
export const BRAND = {
  name: 'Graphics Studio',
  mark: (
    <svg className="brand-mark" viewBox="0 0 29 32" aria-hidden="true">
      <g fill="none">
        <path fill="#F37021" d="M10.645 24.165c.69.32 1.63.345 2.9.07 1.04-.225 7.5-1.35 10.465-1.895 1.545-.285 1.855-.5 2.65-2.39l1.205-2.89c.77-1.845 1.1-2.3.35-3.53.815 1.34.28 2.16-.97 2.355-.855.135-11.54 1.96-15.345 2.605-.835.146-1.534.714-1.85 1.5-.835 2.335-.28 3.76.595 4.175z" />
        <path fill="#F7941D" d="M28.22 13.53c-6.63-9.735-6.63-9.685-7.565-11.155-.7-1.095-1.355-1.8-2.07-2.065-.955-.34-2.38.34-3.415 2.585l-.5 1.25 8.5 12.45 4.12-.715c1.21-.19 1.74-1.015.93-2.35z" />
        <path fill="#FDB913" d="M.945 26.65c.65.785 3.89 4.28 4.795 4.58-.875-.415-1.42-1.86-.585-4.21l10-24.155c1.065-2.22 2.46-2.89 3.4-2.55-.85-.435-5.615-.27-6.63-.18-1.44.125-2.07.81-2.635 2.17L.63 23.25c-.565 1.36-.63 2.29.315 3.4z" />
      </g>
    </svg>
  ),
};

// The rooms in the header band: 16px line icons, 1.5 stroke, in currentColor.
export const ROOMS = [
  {
    id: 'home',
    label: 'Home',
    icon: <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 7.2 8 2.6l5.5 4.6" /><path d="M4 6.2V13.4h8V6.2" /><path d="M6.6 13.4V9.6h2.8v3.8" /></svg>,
  },
  {
    id: 'templates',
    label: 'Templates',
    count: TEMPLATE_COUNT,
    icon: <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="12" height="12" rx="2" /><path d="M2 6h12M6.2 6v8" /></svg>,
  },
];

// The signed-in person (static for now) and their profile menu's items.
export const USER = { name: 'Diya Seth', email: 'diya.seth@timesinternet.in', initials: 'DS' };
export const PROFILE_MENU = [
  { label: 'Settings', onClick: () => {} },
  { label: 'Log out', danger: true, onClick: () => {} },
];
