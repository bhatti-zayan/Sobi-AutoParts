import './FilterBar.css';
import { categories } from '../data/mockData';

export default function FilterBar({ filters, onFilterChange }) {
  const typeOptions = [
    { label: 'All', value: '' },
    { label: 'Fixed', value: 'fixed' },
    { label: 'Auction', value: 'auction' },
    { label: 'Bargain', value: 'bargain' }
  ];

  return (
    <div className="filter-bar" id="filter-bar" style={{ flexWrap: 'wrap', gap: '16px', padding: '16px' }}>
      <input 
        type="text" 
        className="form-input" 
        placeholder="Search keywords..." 
        value={filters.search}
        onChange={(e) => onFilterChange({ search: e.target.value })}
        style={{ minWidth: '200px', flex: '1 1 200px' }}
      />
      
      <select 
        className="form-input"
        value={filters.category}
        onChange={(e) => onFilterChange({ category: e.target.value })}
        style={{ minWidth: '150px', flex: '1 1 150px' }}
      >
        <option value="">All Categories</option>
        {categories.map(c => <option key={c} value={c}>{c}</option>)}
      </select>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: '1 1 200px' }}>
        <input 
          type="number" 
          className="form-input" 
          placeholder="Min PKR" 
          value={filters.minPrice}
          onChange={(e) => onFilterChange({ minPrice: e.target.value })}
          style={{ width: '100%' }}
        />
        <span style={{ color: 'var(--text-placeholder)' }}>-</span>
        <input 
          type="number" 
          className="form-input" 
          placeholder="Max PKR" 
          value={filters.maxPrice}
          onChange={(e) => onFilterChange({ maxPrice: e.target.value })}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span className="filter-label" style={{ marginRight: '8px' }}>Mode:</span>
        {typeOptions.map((opt) => (
          <button
            key={opt.value}
            className={`pill ${filters.type === opt.value ? 'active' : ''}`}
            onClick={() => onFilterChange({ type: opt.value })}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
