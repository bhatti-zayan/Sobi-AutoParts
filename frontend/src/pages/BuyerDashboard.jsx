import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { purchases, buyerBids, buyerOffers } from '../data/mockData';
import TabBar from '../components/TabBar';
import './Dashboard.css';

const tabs = ['Purchases', 'My bids', 'My offers', 'Profile'];

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('Purchases');
  const { user, updateProfile, token } = useAuth();
  const { addToast } = useToast();

  const [localBids, setLocalBids] = useState([]);
  const [realPurchases, setRealPurchases] = useState([]);
  const [realOffers, setRealOffers] = useState([]);

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        const [ordRes, bidRes, offRes] = await Promise.all([
          fetch('http://localhost:5000/api/buyer/orders', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/buyer/bids', { headers: { Authorization: `Bearer ${token}` } }),
          fetch('http://localhost:5000/api/buyer/offers', { headers: { Authorization: `Bearer ${token}` } })
        ]);
        const ordData = await ordRes.json();
        const bidData = await bidRes.json();
        const offData = await offRes.json();
        if (ordRes.ok && ordData.success) setRealPurchases(ordData.data);
        if (bidRes.ok && bidData.success) setLocalBids(bidData.data);
        if (offRes.ok && offData.success) setRealOffers(offData.data);
      } catch (err) {
        console.error('Failed to fetch buyer data');
      }
    };
    if (token) fetchBuyerData();
  }, [token]);

  const handleCompletePurchase = async (bid) => {
    try {
      const res = await fetch('http://localhost:5000/api/buyer/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ productId: bid.productId || bid.id, method: 'auction', amount: bid.yourBid }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast(data.message || 'Purchase failed', 'error');
        return;
      }
      addToast('Purchase completed successfully!', 'success');
      setLocalBids(prev => prev.map(b => b.id === bid.id ? { ...b, purchased: true } : b));
    } catch (err) {
      addToast('Could not connect to server', 'error');
    }
  };

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');

  const handleProfileSave = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name: profileName, email: profileEmail, phone: profilePhone })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        updateProfile({ name: data.user.name, email: data.user.email, phone: data.user.phone, initials: data.user.initials });
        addToast('Profile updated successfully', 'success');
      } else {
        addToast(data.message || 'Failed to update profile', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  const getBadgeClass = (method) => {
    if (method === 'fixed') return 'badge-fixed';
    if (method === 'auction') return 'badge-auction';
    return 'badge-bargain';
  };

  const getBadgeText = (method) => {
    if (method === 'fixed') return 'Fixed';
    if (method === 'auction') return 'Auction';
    return 'Bargain';
  };

  return (
    <div className="page-enter">
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="dashboard-content">
        {/* Stats */}
        <div className="dashboard-stats" id="buyer-stats">
          <div className="stat-card">
            <div className="stat-label">Total purchases</div>
            <div className="stat-value">{realPurchases.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active bids</div>
            <div className="stat-value warn">{localBids.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending offers</div>
            <div className="stat-value info">{realOffers.length}</div>
          </div>
        </div>

        {/* Purchases Tab */}
        {activeTab === 'Purchases' && (
          <div className="dashboard-table-wrap" id="purchases-table">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {realPurchases.map((p) => (
                  <tr key={p.id}>
                    <td>{p.productName}</td>
                    <td><span className={`badge ${getBadgeClass(p.method)}`}>{getBadgeText(p.method)}</span></td>
                    <td>PKR {p.amount.toLocaleString()}</td>
                    <td className="muted">{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td><span className="badge badge-completed">Completed</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* My Bids Tab */}
        {activeTab === 'My bids' && (
          <div className="dashboard-table-wrap" id="bids-table">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Your bid</th>
                  <th>Current bid</th>
                  <th>Ends in</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {localBids.map((b) => (
                  <tr key={b.id}>
                    <td>{b.item}</td>
                    <td>PKR {b.yourBid.toLocaleString()}</td>
                    <td>PKR {b.currentBid.toLocaleString()}</td>
                    <td className="muted">{b.endsIn}</td>
                    <td>
                      {b.status.toLowerCase() === 'won' ? (
                        b.purchased ? (
                          <button className="btn btn-primary" disabled style={{ padding: '6px 14px', fontSize: '13px', opacity: 0.7 }}>Purchased ✓</button>
                        ) : (
                          <button className="btn btn-primary" onClick={() => handleCompletePurchase(b)} style={{ padding: '6px 14px', fontSize: '13px' }}>You Won! Complete Purchase</button>
                        )
                      ) : (
                        <span className={`badge ${b.status === 'Winning' ? 'badge-winning' : 'badge-outbid'}`}>
                          {b.status}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* My Offers Tab */}
        {activeTab === 'My offers' && (
          <div className="dashboard-table-wrap" id="offers-table">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Offered</th>
                  <th>Listed price</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {realOffers.map((o) => (
                  <tr key={o.id}>
                    <td>{o.item}</td>
                    <td>PKR {o.offered.toLocaleString()}</td>
                    <td className="muted">PKR {o.listed.toLocaleString()}</td>
                    <td className="muted">{o.time}</td>
                    <td>
                      {o.status.toLowerCase() === 'accepted' && (
                        <span className="badge badge-completed" style={{ color: 'var(--green, #2ecc71)', borderColor: 'var(--green, #2ecc71)' }}>Offer Accepted ✓</span>
                      )}
                      {o.status.toLowerCase() === 'rejected' && (
                        <span className="badge badge-outbid" style={{ color: 'var(--red, #e74c3c)', borderColor: 'var(--red, #e74c3c)' }}>Offer Rejected ✗</span>
                      )}
                      {o.status.toLowerCase() === 'rejected_other' && (
                        <div>
                          <span className="badge badge-outbid" style={{ color: 'var(--red, #e74c3c)', borderColor: 'var(--red, #e74c3c)' }}>Offer Rejected ✗</span>
                          <div style={{ fontSize: '11px', color: 'var(--text-placeholder)', marginTop: '4px' }}>Another offer was accepted for this listing.</div>
                        </div>
                      )}
                      {o.status.toLowerCase() === 'pending' && (
                        <span className="badge badge-pending" style={{ color: 'var(--amber, #f39c12)' }}>Pending...</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'Profile' && (
          <div id="buyer-profile">
            <div className="dashboard-sec-title" style={{ marginBottom: '18px' }}>Your profile</div>
            <div className="profile-form">
              <div className="profile-form-row">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input
                    className="form-input"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    id="profile-name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    id="profile-email"
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Phone number</label>
                <input
                  className="form-input"
                  placeholder="e.g. +92 300 1234567"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  id="profile-phone"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" value={user?.role || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleProfileSave} id="profile-save">
                Save changes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
