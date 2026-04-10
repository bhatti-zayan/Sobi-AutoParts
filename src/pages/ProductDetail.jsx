import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const product = products.find((p) => p.id === id);

  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');

  if (!product) {
    return (
      <div className="page-enter" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-placeholder)' }}>
        Product not found. <span style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => navigate('/')}>Go back</span>
      </div>
    );
  }

  const handlePlaceBid = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const amount = parseInt(bidAmount);
    const minBid = (product.currentBid || product.price) + 200;
    if (!amount || amount < minBid) {
      addToast(`Minimum bid is PKR ${minBid.toLocaleString()}`, 'error');
      return;
    }
    addToast(`Bid of PKR ${amount.toLocaleString()} placed!`, 'success');
    setBidAmount('');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    addToast(`Purchased ${product.title} for PKR ${product.price.toLocaleString()}!`, 'success');
  };

  const handleMakeOffer = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const amount = parseInt(offerAmount);
    if (!amount || amount < product.bargainMin || amount > product.bargainMax) {
      addToast(`Offer must be between PKR ${product.bargainMin?.toLocaleString()} – ${product.bargainMax?.toLocaleString()}`, 'error');
      return;
    }
    addToast(`Offer of PKR ${amount.toLocaleString()} sent!`, 'success');
    setOfferAmount('');
  };

  const activeTabClass =
    product.type === 'auction' ? 'active-amber' :
    product.type === 'fixed' ? 'active-blue' : 'active-gray';

  return (
    <div className="page-enter">
      <div className="pd-breadcrumb" id="product-breadcrumb">
        <span onClick={() => navigate('/')}>Home</span> ›{' '}
        <span>{product.category}</span> ›{' '}
        <span>{product.title}</span>
      </div>

      <div className="pd-body">
        {/* Left */}
        <div className="pd-left">
          <div className="pd-img-box">
            <div className="pd-img-placeholder"></div>
          </div>
          <div className="pd-title" id="product-title">{product.title}{product.subtitle.includes('Set') ? ` — ${product.subtitle.split('·')[0].trim()}` : ''}</div>
          <div className="pd-subtitle">{product.subtitle}</div>
          <div className="pd-badge-row">
            <span className={`badge ${product.type === 'auction' ? 'badge-auction' : product.type === 'fixed' ? 'badge-fixed' : 'badge-bargain'}`}>
              {product.type === 'auction' ? 'Auction active' : product.type === 'fixed' ? 'Fixed price' : 'Bargaining'}
            </span>
            <span className="badge badge-bargain">{product.condition === 'New' ? 'New' : 'Used'}</span>
          </div>
          <div className="pd-desc">{product.description}</div>
          <div className="pd-divider"></div>
          <div className="pd-seller-row">
            <div className="pd-seller-avatar">{product.sellerInitials}</div>
            <div>
              <div className="pd-seller-name">{product.sellerName}</div>
              {product.sellerVerified && (
                <div className="pd-seller-verified">✓ Verified seller</div>
              )}
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="pd-right">
          <div className="pd-tab-switch">
            <div className={`pd-tab ${product.type === 'auction' ? activeTabClass : ''}`}>Auction</div>
            <div className={`pd-tab ${product.type === 'fixed' ? activeTabClass : ''}`}>Fixed</div>
            <div className={`pd-tab ${product.type === 'bargain' ? activeTabClass : ''}`}>Bargain</div>
          </div>

          {/* Auction Panel */}
          {product.type === 'auction' && (
            <>
              <div className="pd-stat-row">
                <div className="pd-stat-card">
                  <div className="pd-stat-label">Current bid</div>
                  <div className="pd-stat-value amber">PKR {product.currentBid?.toLocaleString()}</div>
                </div>
                <div className="pd-stat-card">
                  <div className="pd-stat-label">Ends in</div>
                  <div className="pd-stat-value red">{product.auctionEndsIn}</div>
                </div>
              </div>
              <div className="pd-form-group">
                <label className="form-label">Your bid (min PKR {((product.currentBid || 0) + 200).toLocaleString()})</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Enter amount"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  id="bid-amount"
                />
              </div>
              <button className="pd-btn-full amber" onClick={handlePlaceBid} id="place-bid-btn">
                Place bid
              </button>
              {product.bids && product.bids.length > 0 && (
                <div>
                  <div className="pd-hist-label">Bid history</div>
                  {product.bids.map((bid, i) => (
                    <div className="pd-hist-row" key={i}>
                      <span>{bid.user}</span>
                      <span>PKR {bid.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Fixed Price Panel */}
          {product.type === 'fixed' && (
            <>
              <div className="pd-stat-row">
                <div className="pd-stat-card">
                  <div className="pd-stat-label">Price</div>
                  <div className="pd-stat-value blue">PKR {product.price.toLocaleString()}</div>
                </div>
                <div className="pd-stat-card">
                  <div className="pd-stat-label">Condition</div>
                  <div className="pd-stat-value green">{product.condition}</div>
                </div>
              </div>
              <button className="pd-btn-full blue" onClick={handleBuyNow} id="buy-now-btn">
                Buy now — PKR {product.price.toLocaleString()}
              </button>
            </>
          )}

          {/* Bargain Panel */}
          {product.type === 'bargain' && (
            <>
              <div className="pd-stat-row">
                <div className="pd-stat-card">
                  <div className="pd-stat-label">Listed price</div>
                  <div className="pd-stat-value blue">PKR {product.price.toLocaleString()}</div>
                </div>
                <div className="pd-stat-card">
                  <div className="pd-stat-label">Condition</div>
                  <div className="pd-stat-value green">{product.condition}</div>
                </div>
              </div>
              <div className="pd-range-info">
                Acceptable offer range: <strong>PKR {product.bargainMin?.toLocaleString()}</strong> – <strong>PKR {product.bargainMax?.toLocaleString()}</strong>
              </div>
              <div className="pd-form-group">
                <label className="form-label">Your offer (PKR)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Enter your offer"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  id="offer-amount"
                />
              </div>
              <button className="pd-btn-full gray" onClick={handleMakeOffer} id="make-offer-btn">
                Make offer
              </button>
              {product.offers && product.offers.length > 0 && (
                <div>
                  <div className="pd-hist-label">Offer history</div>
                  {product.offers.map((offer) => (
                    <div className="pd-hist-row" key={offer.id}>
                      <span>{offer.buyerUser}</span>
                      <span>PKR {offer.amount.toLocaleString()} — {offer.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
