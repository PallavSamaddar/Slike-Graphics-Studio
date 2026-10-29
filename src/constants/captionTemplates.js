export const CAPTION_SHAPES = [
  { value: 'bar', label: 'Bar' },
  { value: 'slant', label: 'Slant' },
  { value: 'line', label: 'Line' },
  { value: 'glass', label: 'Glass' },
  { value: 'pill', label: 'Pill' },
];

export const CAPTION_ANIMATIONS = [
  { value: 'slide', label: 'Slide in' },
  { value: 'wipe', label: 'Wipe' },
  { value: 'fade', label: 'Fade' },
];

export const CAPTION_TPLS = [
  {
    id: 'crimson-bar',
    name: 'Crimson Bar',
    desc: 'Red title block · white subtitle',
    style: { shape: 'bar', nameBg: '#C22F1E', nameBgGradient: 'linear-gradient(90deg, #E3262F 0%, #A3121B 100%)', nameColor: '#FFFFFF', roleBg: '#FFFFFF', roleColor: '#1A1714', accent: '#FFD400' },
  },
  // {
  //   id: 'gold-slant',
  //   name: 'Gold Slant',
  //   desc: 'Black and gold · angled edge',
  //   style: { shape: 'slant', nameBg: '#141414', nameBgGradient: null, nameColor: '#FFD400', roleBg: '#FFD400', roleColor: '#141414', accent: '#FFD400' },
  // },
  {
    id: 'clean-line',
    name: 'Clean Line',
    desc: 'Text on the picture · red rule',
    style: { shape: 'line', nameBg: null, nameBgGradient: null, nameColor: '#FFFFFF', roleBg: null, roleColor: '#F1F1F1', accent: '#E8432B' },
  },
  {
    id: 'frost-glass',
    name: 'Frost Glass',
    desc: 'Frosted panel · green accent',
    style: { shape: 'glass', nameBg: 'rgba(12, 18, 28, 0.55)', nameBgGradient: null, nameColor: '#FFFFFF', roleBg: null, roleColor: '#D7DEE8', accent: '#22C55E' },
  },
  // {
  //   id: 'emerald-pill',
  //   name: 'Emerald Pill',
  //   desc: 'Rounded green blocks',
  //   style: { shape: 'pill', nameBg: '#146B54', nameBgGradient: 'linear-gradient(90deg, #1E8A6E 0%, #146B54 100%)', nameColor: '#FFFFFF', roleBg: '#0F332B', roleColor: '#CFEDE3', accent: '#1E8A6E' },
  // },
];
