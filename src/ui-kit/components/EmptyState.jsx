// EmptyState — a pane with nothing in it yet: a mark, a heading of a few plain words, one line.
export default function EmptyState({ icon, title, children }) {
  return (
    <div className="card">
      <div className="sh-blank">
        {icon}
        <b>{title}</b>
        <span>{children}</span>
      </div>
    </div>
  );
}
