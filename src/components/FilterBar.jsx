import './FilterBar.css';

export default function FilterBar({ activeFilter, onFilterChange }) {
  const filters = ['All', 'Fixed price', 'Auction', 'Bargaining'];

  return (
    <div className="filter-bar" id="filter-bar">
      <span className="filter-label">Filter:</span>
      {filters.map((f) => (
        <button
          key={f}
          className={`pill ${activeFilter === f ? 'active' : ''}`}
          onClick={() => onFilterChange(f)}
          id={`filter-${f.toLowerCase().replace(/\s/g, '-')}`}
        >
          {f}
        </button>
      ))}
      <button className="pill" id="filter-category">Category ▾</button>
      <button className="pill" id="filter-price">Price ▾</button>
    </div>
  );
}
