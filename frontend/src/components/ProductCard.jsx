import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (product.type !== 'auction' || !product.auctionEndTime) return;
    
    const calculateTimeLeft = () => {
      const diff = new Date(product.auctionEndTime) - new Date();
      if (diff <= 0) {
        setIsEnded(true);
        setTimeLeft('Auction Ended');
        return;
      }
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [product]);

  const badgeClass =
    product.type === 'fixed' ? 'badge-fixed' :
    product.type === 'auction' ? 'badge-auction' :
    'badge-bargain';

  const badgeText =
    product.type === 'fixed' ? 'Fixed' :
    product.type === 'auction' ? 'Auction' :
    'Bargain';

  const btnClass =
    product.type === 'fixed' ? 'blue' :
    product.type === 'auction' ? 'amber' :
    'gray';

  const btnText =
    product.type === 'fixed' ? 'Buy now' :
    product.type === 'auction' ? 'Place bid' :
    'Make offer';

  const displayPrice = product.type === 'auction' 
    ? (product.currentBid || product.startingPrice || 0) 
    : product.price;

  const formatPrice = (price) =>
    `PKR ${price.toLocaleString()}`;

  return (
    <div
      className="product-card"
      id={`product-card-${product.id}`}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-card-img" style={{ overflow: 'hidden' }}>
        {product.images && product.images.length > 0 ? (
          <img src={product.images[0]} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <div className="product-card-img-placeholder"></div>
        )}
      </div>
      <div className="product-card-body">
        <div className="product-card-title">{product.title}</div>
        <div className="product-card-sub">{product.subtitle}</div>
        <div className="product-card-bottom">
          <span className="product-card-price">{formatPrice(displayPrice)}</span>
          <span className={`badge ${badgeClass}`}>{badgeText}</span>
        </div>
        {product.type === 'auction' && (
          <div className="product-card-timer">
            {isEnded ? <span style={{ color: 'var(--red, #e74c3c)' }}>Auction Ended</span> : `⏱ Ends in ${timeLeft || product.auctionEndsIn}`}
          </div>
        )}
        {product.type !== 'auction' && <div style={{ height: '22px' }}></div>}
        <button
          className={`product-card-btn ${isEnded ? 'gray' : btnClass}`}
          disabled={isEnded && product.type === 'auction'}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
        >
          {isEnded && product.type === 'auction' ? 'Auction Ended' : btnText}
        </button>
      </div>
    </div>
  );
}
