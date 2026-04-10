import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import { categories } from '../data/mockData';
import './CreateListing.css';

export default function CreateListing() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('Used — Good');
  const [description, setDescription] = useState('');
  const [mode, setMode] = useState('fixed');
  const [fixedPrice, setFixedPrice] = useState('');
  const [startingPrice, setStartingPrice] = useState('');
  const [auctionDuration, setAuctionDuration] = useState('24');
  const [bargainPrice, setBargainPrice] = useState('');
  const [bargainMin, setBargainMin] = useState('');

  const checklist = [
    { label: 'Title added', done: title.length > 0 },
    { label: 'Category selected', done: category.length > 0 },
    { label: 'Images uploaded', done: false },
    { label: 'Price / mode set', done: (mode === 'fixed' && fixedPrice) || (mode === 'auction' && startingPrice) || (mode === 'bargain' && bargainPrice) },
  ];

  const previewPrice = mode === 'fixed' ? fixedPrice : mode === 'auction' ? startingPrice : bargainPrice;
  const previewBadge = mode === 'fixed' ? 'Fixed' : mode === 'auction' ? 'Auction' : 'Bargain';
  const previewBtnText = mode === 'fixed' ? 'Buy Now' : mode === 'auction' ? 'Place Bid' : 'Make Offer';

  const handlePublish = () => {
    if (!title) { addToast('Please add a product title', 'error'); return; }
    if (!category) { addToast('Please select a category', 'error'); return; }
    addToast('Listing published successfully!', 'success');
    navigate('/seller/dashboard');
  };

  const handleDraft = () => {
    addToast('Draft saved', 'info');
  };

  return (
    <div className="page-enter">
      <div className="cl-step-bar">
        <div className="cl-step-title">Create new listing</div>
        <div className="cl-step-hint">Step 1 of 2 — Product details</div>
      </div>

      <div className="cl-body">
        {/* Left - Form */}
        <div className="cl-left">
          <div className="form-group">
            <label className="form-label">Product title</label>
            <input
              className="form-input"
              placeholder="e.g. Honda Civic Alloy Rims — Set of 4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              id="listing-title"
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
            <label className="form-label">Product images</label>
            <div className="cl-upload" id="image-upload">
              <div className="cl-upload-text">
                Drag &amp; drop or <span className="cl-upload-link">browse files</span>
              </div>
              <div className="cl-upload-hint">PNG, JPG up to 5MB each — max 6 images</div>
            </div>
          </div>

          <div>
            <label className="form-label">Selling mode</label>
            <div className="cl-mode-grid">
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
            <div className="cl-preview-img">
              <div className="cl-preview-img-ph"></div>
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
