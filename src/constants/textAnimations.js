// How a held item enters and leaves (sequential ticker, widget description lines).
export const TEXT_ANIMATIONS = [
  { value: 'fade', label: 'Fade' },
  { value: 'flip', label: 'Flip' },
  { value: 'slide', label: 'Slide' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'breaking', label: 'Breaking News sting' },
  { value: 'shatter', label: 'Shatter sting' },
  { value: 'gold', label: 'Gold sting' },
];

// How the widget moves from one item to the next (behavior.transition).
export const WIDGET_TRANSITIONS = [
  { value: 'fade', label: 'Fade in / out' },
  { value: 'none', label: 'None (cut)' },
  { value: 'slide-up', label: 'Slide up' },
  { value: 'slide-down', label: 'Slide down' },
  { value: 'push', label: 'Push (slide left)' },
  { value: 'wipe', label: 'Wipe' },
  { value: 'flip', label: 'Flip' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'blur', label: 'Blur' },
  { value: 'shine', label: 'Shine' },
  { value: 'stagger', label: 'Stagger' },
  { value: 'rise', label: 'Mask rise' },
  { value: 'split', label: 'Split' },
  { value: 'cube', label: 'Cube turn' },
  { value: 'drop', label: 'Drop' },
  { value: 'sweep', label: 'Page sweep' },
];
export const widgetTransition = (v) => (WIDGET_TRANSITIONS.some((a) => a.value === v) ? v : 'fade');

export const PART_WISE_TRANSITIONS = ['stagger', 'rise', 'split'];
export const cardTransition = (v, textWritesOn) => {
  const t = widgetTransition(v);
  return textWritesOn && PART_WISE_TRANSITIONS.includes(t) ? 'fade' : t;
};

export const PART_ANIMATIONS = [
  { value: 'none', label: 'No animation' },
  { value: 'write', label: 'Write on' },
  { value: 'flare', label: 'Write on + flare' },
  { value: 'words', label: 'Word by word' },
  { value: 'shine', label: 'Shine' },
];
export const partAnimation = (v) => (PART_ANIMATIONS.some((a) => a.value === v) ? v : 'none');
export const HEADING_ANIMATIONS = [
  ...PART_ANIMATIONS,
  { value: 'flash', label: 'Flash + light sweep' },
  { value: 'glintflash', label: 'Glitch + fire flash' },
];
export const headingAnimation = (v) => (HEADING_ANIMATIONS.some((a) => a.value === v) ? v : 'none');
export const DESC_ANIMATIONS = [...PART_ANIMATIONS, { value: 'flashwrite', label: 'Flash + write on' }];
export const descAnimation = (v) => (DESC_ANIMATIONS.some((a) => a.value === v) ? v : 'none');
export const STATIC_ANIMATIONS = [
  { value: 'none', label: 'No animation' },
  { value: 'shine', label: 'Shine' },
  { value: 'glintflash', label: 'Glitch + fire flash' },
];
export const staticAnimation = (v) => (STATIC_ANIMATIONS.some((a) => a.value === v) ? v : 'glintflash');
