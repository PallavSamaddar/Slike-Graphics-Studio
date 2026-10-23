// How a held item enters and leaves (sequential ticker, widget description lines).
export const TEXT_ANIMATIONS = [
  { value: 'fade', label: 'Fade' },
  { value: 'flip', label: 'Flip' },
  { value: 'slide', label: 'Slide' },
  { value: 'typewriter', label: 'Typewriter' },
  { value: 'breaking', label: 'Breaking News sting' },
  { value: 'shatter', label: 'Shatter sting' },
];

// How the widget moves from one item to the next (behavior.transition).
export const WIDGET_TRANSITIONS = [
  { value: 'fade', label: 'Fade in / out' },
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
