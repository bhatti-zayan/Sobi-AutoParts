import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { categories, products } from '../data/mockData';
import './CreateListing.css';

export default function CreateListing({ isEditMode }) {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { token } = useAuth();

  const { id } = useParams();
  const existingProduct = isEditMode ? products.find(p => p.id === id) : null;
  const hasBids = existingProduct && existingProduct.bids && existingProduct.bids.length > 0;

  const [title, setTitle] = useState(existingProduct?.title || '');
  const [category, setCategory] = useState(existingProduct?.category || '');
  const [condition, setCondition] = useState(existingProduct?.condition || 'Used — Good');
  const [description, setDescription] = useState(existingProduct?.description || '');
  const [mode, setMode] = useState(existingProduct?.type || 'fixed');
  const [fixedPrice, setFixedPrice] = useState(existingProduct?.type === 'fixed' ? existingProduct.price : '');
  const [startingPrice, setStartingPrice] = useState(existingProduct?.type === 'auction' ? existingProduct.startingPrice : '');
  const [auctionDuration, setAuctionDuration] = useState('24');
  const [bargainPrice, setBargainPrice] = useState(existingProduct?.type === 'bargain' ? existingProduct.price : '');
  const [bargainMin, setBargainMin] = useState(existingProduct?.type === 'bargain' ? existingProduct.bargainMin : '');
  const [images, setImages] = useState(existingProduct?.images || []);
  const [currentImageUrl, setCurrentImageUrl] = useState('');

  const checklist = [
    { label: 'Title added', done: title.length > 0 },
    { label: 'Category selected', done: category.length > 0 },
    { label: 'Images uploaded', done: false },
    { label: 'Price / mode set', done: (mode === 'fixed' && fixedPrice) || (mode === 'auction' && startingPrice) || (mode === 'bargain' && bargainPrice) },
  ];

  const previewPrice = mode === 'fixed' ? fixedPrice : mode === 'auction' ? startingPrice : bargainPrice;
  const previewBadge = mode === 'fixed' ? 'Fixed' : mode === 'auction' ? 'Auction' : 'Bargain';
  const previewBtnText = mode === 'fixed' ? 'Buy Now' : mode === 'auction' ? 'Place Bid' : 'Make Offer';

  const handlePublish = async () => {
    if (!title) { addToast('Please add a product title', 'error'); return; }
    if (!category) { addToast('Please select a category', 'error'); return; }
    
    try {
      const payload = {
        title, category, condition, description, type: mode, images,
        price: mode === 'fixed' ? Number(fixedPrice) : undefined,
        startingPrice: mode === 'auction' ? Number(startingPrice) : undefined,
        auctionDuration: mode === 'auction' ? Number(auctionDuration) : undefined,
        bargainPrice: mode === 'bargain' ? Number(bargainPrice) : undefined,
        bargainMin: mode === 'bargain' ? Number(bargainMin) : undefined,
      };

      const url = isEditMode ? `http://localhost:5000/api/seller/products/${id}` : 'http://localhost:5000/api/seller/products';
      const fetchMethod = isEditMode ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method: fetchMethod,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        addToast(isEditMode ? 'Listing updated successfully!' : 'Listing published successfully!', 'success');
        navigate('/seller/dashboard');
      } else {
        addToast(data.message || 'Error saving listing', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const handleDraft = () => {
    addToast('Draft saved', 'info');
  };

  return (
    <div className="page-enter">
      <div className="cl-step-bar">
        <div className="cl-step-title">{isEditMode ? 'Edit listing' : 'Create new listing'}</div>
        <div className="cl-step-hint">Step 1 of 2 — Product details</div>
      </div>

      <div className="cl-body">
        {/* Left - Form */}
        <div className="cl-left">
          <div className="form-group">
            <label className="form-label">
              Product title 
              {hasBids && <span style={{color: 'var(--red, #e74c3c)', fontSize: '12px', marginLeft: '10px'}}>Cannot edit after bids are placed</span>}
            </label>
            <input
              className="form-input"
              placeholder="e.g. Honda Civic Alloy Rims — Set of 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="listing-title"
              disabled={hasBids}
            />
          </div>

          <div className="cl-form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                id="listing-category"
              >
                <option value="">Select category</option>
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Condition</label>
              <select
                className="form-input"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                id="listing-condition"
              >
                <option>New</option>
                <option>Used — Good</option>
                <option>Used — Fair</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="cl-textarea"
              rows="3"
              placeholder="Describe condition, compatibility, defects..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              id="listing-description"
            ></textarea>
          </div>

          <div>
            <label className="form-label">Product images (URLs)</label>
            <div className="form-group" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                className="form-input"
                placeholder="https://example.com/image.jpg"
                value={currentImageUrl}
                onChange={(e) => setCurrentImageUrl(e.target.value)}
              />
              <button 
                className="btn btn-outline"
                style={{ padding: '0 16px', whiteSpace: 'nowrap' }}
                onClick={() => {
                  if (currentImageUrl) {
                    setImages(prev => [...prev, currentImageUrl]);
                    setCurrentImageUrl('');
                  }
                }}
              >
                Add Image
              </button>
            </div>
            {images.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {images.map((img, i) => (
                  <div key={i} style={{ position: 'relative' }}>
                    <img src={img} alt="preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
                    <button 
                      onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                      style={{ position: 'absolute', top: '-6px', right: '-6px', background: 'var(--red)', color: 'white', borderRadius: '50%', width: '20px', height: '20px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}
                    >×</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="form-label">
              Selling mode
              {hasBids && <span style={{color: 'var(--red, #e74c3c)', fontSize: '12px', marginLeft: '10px'}}>Cannot edit after bids are placed</span>}
            </label>
            <div className={`cl-mode-grid ${hasBids ? 'disabled' : ''}`} style={hasBids ? {opacity: 0.6, pointerEvents: 'none'} : {}}>
              <div
                className={`cl-mode-card ${mode === 'fixed' ? 'active' : 'inactive'}`}
                onClick={() => setMode('fixed')}
                id="mode-fixed"
              >
                <div className="cl-mode-title">Fixed price</div>
                <div className="cl-mode-sub">Set one price</div>
              </div>
              <div
                className={`cl-mode-card ${mode === 'auction' ? 'active' : 'inactive'}`}
                onClick={() => setMode('auction')}
                id="mode-auction"
              >
                <div className="cl-mode-title">Auction</div>
                <div className="cl-mode-sub">Accept bids</div>
              </div>
              <div
                className={`cl-mode-card ${mode === 'bargain' ? 'active' : 'inactive'}`}
                onClick={() => setMode('bargain')}
                id="mode-bargain"
              >
                <div className="cl-mode-title">Bargaining</div>
                <div className="cl-mode-sub">Negotiate</div>
              </div>
            </div>
          </div>

          {/* Mode-specific fields */}
          {mode === 'fixed' && (
            <div className="form-group">
              <label className="form-label">Fixed price (PKR)</label>
              <input
                className="form-input"
                type="number"
                placeholder="e.g. 4500"
                value={fixedPrice}
                onChange={(e) => setFixedPrice(e.target.value)}
                id="fixed-price"
                disabled={hasBids}
              />
            </div>
          )}

          {mode === 'auction' && (
            <div className="cl-form-row">
              <div className="form-group">
                <label className="form-label">Starting price (PKR)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 3000"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  id="auction-start-price"
                  disabled={hasBids}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Duration (hours)</label>
                <select
                  className="form-input"
                  value={auctionDuration}
                  onChange={(e) => setAuctionDuration(e.target.value)}
                  id="auction-duration"
                >
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                </select>
              </div>
            </div>
          )}

          {mode === 'bargain' && (
            <div className="cl-form-row">
              <div className="form-group">
                <label className="form-label">Listed price (PKR)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 2200"
                  value={bargainPrice}
                  onChange={(e) => setBargainPrice(e.target.value)}
                  id="bargain-price"
                  disabled={hasBids}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Minimum acceptable (PKR)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="e.g. 1800"
                  value={bargainMin}
                  onChange={(e) => setBargainMin(e.target.value)}
                  id="bargain-min"
                  disabled={hasBids}
                />
              </div>
            </div>
          )}

          <div className="cl-btn-row">
            <button className="cl-btn-draft" onClick={handleDraft} id="save-draft-btn">Save draft</button>
            <button className="cl-btn-publish" onClick={handlePublish} id="publish-btn">Publish listing →</button>
          </div>
        </div>

        {/* Right - Preview */}
        <div className="cl-right">
          <div className="cl-preview-title">Live preview</div>
          <div className="cl-preview-card">
            <div className="cl-preview-img" style={{ overflow: 'hidden' }}>
              {images.length > 0 ? (
                <img src={images[0]} alt="main preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div className="cl-preview-img-ph"></div>
              )}
            </div>
            <div className="cl-preview-body">
              <div className="cl-preview-name">{title || 'Your product title'}</div>
              <div className="cl-preview-bottom">
                <span className="cl-preview-price">
                  PKR {previewPrice ? parseInt(previewPrice).toLocaleString() : '—'}
                </span>
                <span className={`badge ${mode === 'fixed' ? 'badge-fixed' : mode === 'auction' ? 'badge-auction' : 'badge-bargain'}`}>
                  {previewBadge}
                </span>
              </div>
              <button className="cl-preview-btn">{previewBtnText}</button>
            </div>
          </div>

          <div className="cl-checklist">
            <div className="cl-checklist-title">Checklist</div>
            {checklist.map((item, i) => (
              <div
                key={i}
                className={item.done ? 'cl-checklist-done' : 'cl-checklist-todo'}
              >
                {item.done ? '✓' : '○'} {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
