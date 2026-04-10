import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { products } from '../data/mockData';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import './Home.css';

export default function Home() {
  const [activeFilter, setActiveFilter] = useState('All');
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Fixed price') return p.type === 'fixed';
    if (activeFilter === 'Auction') return p.type === 'auction';
    if (activeFilter === 'Bargaining') return p.type === 'bargain';
    return true;
  });

  return (
    <div className="page-enter">
      {/* Hero */}
      <div className="home-hero" id="home-hero">
        <div className="home-hero-title">Buy &amp; Sell Auto Parts</div>
        <div className="home-hero-sub">Fixed price, live auctions, or price negotiation</div>
        <div className="home-hero-btns">
          <button className="home-hero-btn-white" onClick={() => document.getElementById('product-grid')?.scrollIntoView({ behavior: 'smooth' })} id="hero-browse">
            Browse listings
          </button>
          {isAuthenticated && user?.role === 'seller' ? (
            <button className="home-hero-btn-outline" onClick={() => navigate('/seller/create-listing')} id="hero-sell">
              Start selling
            </button>
          ) : (
            <button className="home-hero-btn-outline" onClick={() => navigate(isAuthenticated ? '/seller/dashboard' : '/login')} id="hero-sell">
              Start selling
            </button>
          )}
        </div>
      </div>

      {/* Filter bar */}
      <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />

      {/* Product Grid */}
      <div className="home-grid" id="product-grid">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {filteredProducts.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-placeholder)' }}>
            No products found for this filter.
          </div>
        )}
      </div>
    </div>
  );
}
