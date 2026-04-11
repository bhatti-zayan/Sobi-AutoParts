import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const navigate = useNavigate();

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

  const formatPrice = (price) =>
    `PKR ${price.toLocaleString()}`;

  return (
    <div
      className="product-card"
      id={`product-card-${product.id}`}
      onClick={() => navigate(`/product/${product.id}`)}
    >
      <div className="product-card-img">
        <div className="product-card-img-placeholder"></div>
      </div>
      <div className="product-card-body">
        <div className="product-card-title">{product.title}</div>
        <div className="product-card-sub">{product.subtitle}</div>
        <div className="product-card-bottom">
          <span className="product-card-price">{formatPrice(product.price)}</span>
          <span className={`badge ${badgeClass}`}>{badgeText}</span>
        </div>
        {product.type === 'auction' && product.auctionEndsIn && (
          <div className="product-card-timer">⏱ Ends in {product.auctionEndsIn}</div>
        )}
        {product.type !== 'auction' && <div style={{ height: '22px' }}></div>}
        <button
          className={`product-card-btn ${btnClass}`}
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
        >
          {btnText}
        </button>
      </div>
    </div>
  );
}
