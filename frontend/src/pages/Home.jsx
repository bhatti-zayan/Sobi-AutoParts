import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import FilterBar from '../components/FilterBar';
import './Home.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    type: ''
  });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (filters.search) queryParams.append('search', filters.search);
        if (filters.category) queryParams.append('category', filters.category);
        if (filters.minPrice) queryParams.append('minPrice', filters.minPrice);
        if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice);
        if (filters.type) queryParams.append('type', filters.type);
        queryParams.append('page', page);
        queryParams.append('limit', 10);

        const res = await fetch(`http://localhost:5000/api/buyer/products?${queryParams.toString()}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProducts(data.data);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch products', err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [filters, page]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

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
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />

      {/* Product Grid */}
      <div className="home-grid" id="product-grid">
        {products.map((product) => (
          <ProductCard key={product.id || product._id} product={product} />
        ))}
        {products.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', color: 'var(--text-placeholder)' }}>
            No products found matching your filters.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', margin: '32px 0' }}>
          <button 
            className="btn btn-outline" 
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            style={{ padding: '8px 16px' }}
          >
            Previous
          </button>
          <span style={{ fontWeight: 500 }}>Page {page} of {totalPages}</span>
          <button 
            className="btn btn-outline" 
            disabled={page === totalPages}
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            style={{ padding: '8px 16px' }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
