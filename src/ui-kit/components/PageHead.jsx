// PageHead — a room's head: its title, and an optional one-line sub and primary act.
export default function PageHead({ title, sub, action }) {
  return (
    <div className="page-head">
      <div>
        <h1>{title}</h1>
        {sub && <div className="page-sub">{sub}</div>}
      </div>
      {action}
    </div>
  );
}
