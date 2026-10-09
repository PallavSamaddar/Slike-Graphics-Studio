import { EmptyState } from '../../ui-kit';

const COPY = {
  widgets: { title: 'Widgets', desc: 'Clocks, scoreboards, polls, and other on-screen widgets.' },
  captions: { title: 'Captions', desc: 'Lower-third captions and speaker name straps.' },
  jackets: { title: 'Jackets', desc: 'Full-frame story jackets and title cards.' },
};

// A kind of graphic with no templates yet.
export default function ComingSoonPanel({ category }) {
  const copy = COPY[category] || { title: category, desc: '' };
  return (
    <EmptyState
      title={`${copy.title} — coming soon`}
      icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M7 10h3M7 14h7" /></svg>}
    >
      {copy.desc}
    </EmptyState>
  );
}
