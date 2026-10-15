const DESIGNS = [
  {
    id: 'crimson-dots',
    name: 'Crimson',
    desc: 'Red gradient · dotted texture',
    style: {
      bg: '#8A1B12',
      bgGradient: 'linear-gradient(160deg, #E8432B 0%, #6E140D 55%)',
      texture: 'spiral',
      textureOpacity: 0.28,
      headingBg: '#C22F1E',
      headingBgGradient: 'linear-gradient(180deg, #E8432B 0%, #C22F1E 100%)',
    },
  },
  {
    id: 'midnight-solid',
    name: 'Midnight',
    desc: 'Solid navy · clean',
    style: {
      bg: '#131A2B',
      bgGradient: null,
      texture: 'none',
      headingBg: '#1E2A47',
    },
  },
  {
    id: 'paper-light',
    name: 'Paper',
    desc: 'Off-white · editorial',
    style: {
      bg: '#FAF8F4',
      bgGradient: null,
      texture: 'none',
      headingBg: '#1A1714',
    },
  },
  {
    id: 'slate-grid',
    name: 'Slate',
    desc: 'Dark slate · arrow motion',
    style: {
      bg: '#20242C',
      bgGradient: null,
      texture: 'arrow-motion',
      textureOpacity: 0.28,
      headingBg: '#2E3440',
    },
  },
  {
    id: 'crimson-image-left',
    name: 'Crimson + Image',
    desc: 'Red gradient · image left',
    style: {
      bg: '#8A1B12',
      bgGradient: 'linear-gradient(160deg, #E8432B 0%, #6E140D 55%)',
      texture: 'none',
      headingBg: '#C22F1E',
      headingBgGradient: 'linear-gradient(180deg, #E8432B 0%, #C22F1E 100%)',
      badgeImagePos: 'left',
    },
  },
  {
    id: 'midnight-image-right',
    name: 'Midnight + Image',
    desc: 'Solid navy · image right',
    // Midnight with the image on the right — kept so saved graphics still open, not offered.
    hidden: true,
    style: {
      bg: '#131A2B',
      bgGradient: null,
      texture: 'none',
      headingBg: '#1E2A47',
      badgeImagePos: 'right',
    },
  },
  {
    id: 'emerald-globe',
    name: 'Emerald',
    desc: 'Deep green · earth orbit',
    style: {
      bg: '#0F332B',
      bgGradient: 'linear-gradient(160deg, #1E6B57 0%, #0A2620 60%)',
      texture: 'globe',
      textureOpacity: 0.28,
      headingBg: '#146B54',
      headingBgGradient: 'linear-gradient(180deg, #1E8A6E 0%, #146B54 100%)',
    },
  },
  {
    id: 'violet-radar',
    name: 'Violet',
    desc: 'Purple gradient · radar sweep',
    style: {
      bg: '#241533',
      bgGradient: 'linear-gradient(160deg, #6B3FA0 0%, #241533 60%)',
      texture: 'radar-sweep',
      textureOpacity: 0.28,
      headingBg: '#3B2154',
      headingBgGradient: 'linear-gradient(180deg, #7A4CB0 0%, #3B2154 100%)',
    },
  },
  {
    id: 'amber-datastream',
    name: 'Amber',
    desc: 'Warm brown · data stream',
    style: {
      bg: '#3B2508',
      bgGradient: 'linear-gradient(160deg, #B0741E 0%, #3B2508 60%)',
      texture: 'data-stream',
      textureOpacity: 0.28,
      headingBg: '#5C3B0F',
      headingBgGradient: 'linear-gradient(180deg, #C98A28 0%, #5C3B0F 100%)',
    },
  },
  {
    id: 'ocean-wave',
    name: 'Ocean',
    desc: 'Deep blue · wave flow',
    style: {
      bg: '#0A2438',
      bgGradient: 'linear-gradient(160deg, #1B5C87 0%, #0A2438 60%)',
      texture: 'wave-flow',
      textureOpacity: 0.28,
      headingBg: '#123A54',
      headingBgGradient: 'linear-gradient(180deg, #2578A8 0%, #123A54 100%)',
    },
  },
  {
    id: 'teal-image-left',
    name: 'Teal + Image',
    desc: 'Bright teal · image left',
    style: {
      bg: '#0E3B3D',
      bgGradient: 'linear-gradient(160deg, #17A2A8 0%, #0A2A2C 60%)',
      texture: 'none',
      headingBg: '#0F5457',
      headingBgGradient: 'linear-gradient(180deg, #1BB5BC 0%, #0F5457 100%)',
      badgeImagePos: 'left',
    },
  },
  {
    id: 'charcoal-image-right',
    name: 'Charcoal + Image',
    desc: 'Near-black · image right',
    style: {
      bg: '#17181B',
      bgGradient: 'linear-gradient(160deg, #2B2D32 0%, #0D0E10 65%)',
      texture: 'none',
      headingBg: '#2B2D32',
      badgeImagePos: 'right',
    },
  },
];

const WIDGET_LAYOUTS = [
  { key: 'title', label: 'Title only', desc: false, img: false },
  { key: 'title-desc', label: 'Title + desc', desc: true, img: false },
  { key: 'title-desc-img', label: 'Title + desc + image', desc: true, img: true },
  { key: 'title-img', label: 'Title + image', desc: false, img: true },
];

const nativeLayout = (design) => (design.style.badgeImagePos ? 'title-desc-img' : 'title-desc');

function inLayout(design, layout) {
  const { badgeImagePos, ...style } = design.style;
  return {
    ...design,
    id: layout.key === nativeLayout(design) ? design.id : `${design.id}--${layout.key}`,
    layout,
    style: layout.img ? { ...style, badgeImagePos: badgeImagePos || 'left' } : style,
  };
}

export const WIDGET_TPLS = DESIGNS.flatMap((design) => WIDGET_LAYOUTS
  .filter((layout) => !design.hidden || layout.key === nativeLayout(design))
  .map((layout) => inLayout(design, layout)));

export const usesFeedMedia = (st) => st.src === 'rss' && (st.media?.rss || []).some(Boolean);
