import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();
  const { addToast } = useToast();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/buyer/products/${id}`);
        const data = await res.json();
        if (res.ok && data.success) {
          setProduct(data.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const [bidAmount, setBidAmount] = useState('');
  const [offerAmount, setOfferAmount] = useState('');
  const [offerError, setOfferError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isEnded, setIsEnded] = useState(false);

  useEffect(() => {
    if (product?.type !== 'auction' || !product.auctionEndTime) return;
    
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

  if (loading) {
    return <div className="page-enter" style={{ padding: '48px', textAlign: 'center' }}>Loading...</div>;
  }

  if (!product) {
    return (
      <div className="page-enter" style={{ padding: '48px', textAlign: 'center', color: 'var(--text-placeholder)' }}>
        Product not found. <span style={{ color: 'var(--blue)', cursor: 'pointer' }} onClick={() => navigate('/')}>Go back</span>
      </div>
    );
  }

  const handlePlaceBid = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const amount = parseInt(bidAmount);
    const minBid = (product.currentBid || product.startingPrice || 0) + 100;
    if (!amount || amount < minBid) {
      addToast(`Minimum bid is PKR ${minBid.toLocaleString()}`, 'error');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/buyer/bids', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ productId: product.id, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.message || 'Bid failed', 'error');
        return;
      }
      addToast(`Bid of PKR ${amount.toLocaleString()} placed!`, 'success');
      setBidAmount('');
      // Update UI without full page refresh
      setProduct(prev => {
        const newBid = { user: 'You', amount, status: 'winning', time: new Date().toISOString() };
        return {
          ...prev,
          currentBid: amount,
          bids: [...(prev.bids || []), newBid]
        };
      });
    } catch(err) {
      addToast('Network error', 'error');
    }
  };

  const handleBuyNow = async (method, amount) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    
    try {
      const res = await fetch('http://localhost:5000/api/buyer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, method, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.message || 'Purchase failed', 'error');
        return;
      }
      addToast(`Purchased ${product.title} for PKR ${amount.toLocaleString()}!`, 'success');
      navigate('/');
    } catch (err) {
      addToast('Could not connect to server. Please try again.', 'error');
    }
  };

  const handleMakeOffer = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    const amount = parseInt(offerAmount);

    // Client-side range check using the product data
    if (!amount || amount < product.bargainMin || amount > product.bargainMax) {
      setOfferError(`Offer must be between PKR ${product.bargainMin?.toLocaleString()} – ${product.bargainMax?.toLocaleString()}`);
      return;
    }

    setOfferError('');

    try {
      const res = await fetch('http://localhost:5000/api/buyer/offers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, amount }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Show the exact error message from the backend
        setOfferError(data.message || 'Something went wrong');
        return;
      }
      addToast(`Offer of PKR ${amount.toLocaleString()} sent!`, 'success');
      setOfferAmount('');
      setOfferError('');
      // Update UI
      setProduct(prev => {
        const newOffer = { id: Date.now(), buyerUser: 'You', amount, status: 'pending', time: new Date().toISOString() };
        return { ...prev, offers: [...(prev.offers || []), newOffer] };
      });
    } catch (err) {
      setOfferError('Could not connect to server. Please try again.');
    }
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
          <div className="pd-img-box" style={{ overflowX: 'auto', display: 'flex', gap: '8px' }}>
            {product.images && product.images.length > 0 ? (
              product.images.map((img, i) => (
                <img key={i} src={img} alt="product" style={{ height: '100%', minHeight: '300px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
              ))
            ) : (
              <div className="pd-img-placeholder" style={{ width: '100%', minHeight: '300px' }}></div>
            )}
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
                  <div className="pd-stat-value red">{timeLeft || product.auctionEndsIn}</div>
                </div>
              </div>
              <div className="pd-form-group">
                <label className="form-label">Your bid (min PKR {((product.currentBid || product.startingPrice || 0) + 100).toLocaleString()})</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="Enter amount"
                  value={bidAmount}
                  min={(product.currentBid || product.startingPrice || 0) + 100}
                  onChange={(e) => setBidAmount(e.target.value)}
                  id="bid-amount"
                  disabled={isEnded}
                />
                <small style={{ color: 'var(--text-placeholder)', marginTop: '4px', display: 'block' }}>
                  Minimum valid bid: PKR {((product.currentBid || product.startingPrice || 0) + 100).toLocaleString()}
                </small>
              </div>
              <button className={`pd-btn-full ${isEnded ? 'gray' : 'amber'}`} onClick={handlePlaceBid} disabled={isEnded} id="place-bid-btn">
                {isEnded ? 'Auction Ended' : 'Place bid'}
              </button>
              {product.bids && product.bids.length > 0 && (
                <div>
                  <div className="pd-hist-label">Bid history</div>
                  {product.bids.map((bid, i) => {
                    const isWinningBid = i === product.bids.length - 1;
                    const auctionEnded = product.auctionEndTime && new Date(product.auctionEndTime) < new Date();
                    return (
                      <div className="pd-hist-row" key={i}>
                        <span>{bid.user}</span>
                        <span>PKR {bid.amount.toLocaleString()}</span>
                        {isWinningBid && auctionEnded && (
                          <button 
                            className="pd-btn-full blue" 
                            style={{marginTop: '10px'}} 
                            onClick={() => handleBuyNow('auction', bid.amount)}
                          >
                            Buy now — PKR {bid.amount.toLocaleString()}
                          </button>
                        )}
                      </div>
                    );
                  })}
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
              <button className="pd-btn-full blue" onClick={() => handleBuyNow('fixed', product.price)} id="buy-now-btn">
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
                  min={product.bargainMin}
                  max={product.bargainMax}
                  onChange={(e) => { setOfferAmount(e.target.value); setOfferError(''); }}
                  id="offer-amount"
                />
                <small style={{ color: 'var(--text-placeholder)', marginTop: '4px', display: 'block' }}>
                  Range: PKR {product.bargainMin?.toLocaleString()} – PKR {product.bargainMax?.toLocaleString()}
                </small>
                {offerError && (
                  <small style={{ color: 'var(--red, #e74c3c)', marginTop: '4px', display: 'block' }}>
                    {offerError}
                  </small>
                )}
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
                      {offer.status === 'accepted' && (
                        <button 
                          className="pd-btn-full blue" 
                          style={{marginTop: '10px'}} 
                          onClick={() => handleBuyNow('bargain', offer.amount)}
                        >
                          Buy now — PKR {offer.amount.toLocaleString()}
                        </button>
                      )}
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
