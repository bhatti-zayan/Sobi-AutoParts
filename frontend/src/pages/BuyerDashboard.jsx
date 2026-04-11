import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { purchases, buyerBids, buyerOffers } from '../data/mockData';
import TabBar from '../components/TabBar';
import './Dashboard.css';

const tabs = ['Purchases', 'My bids', 'My offers', 'Profile'];

export default function BuyerDashboard() {
  const [activeTab, setActiveTab] = useState('Purchases');
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();

  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');

  const handleProfileSave = () => {
    updateProfile({ name: profileName, email: profileEmail });
    addToast('Profile updated!', 'success');
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
            <div className="stat-value">{purchases.length + 4}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active bids</div>
            <div className="stat-value warn">{buyerBids.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending offers</div>
            <div className="stat-value info">{buyerOffers.length}</div>
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
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td>{p.item}</td>
                    <td><span className={`badge ${getBadgeClass(p.method)}`}>{getBadgeText(p.method)}</span></td>
                    <td>PKR {p.amount.toLocaleString()}</td>
                    <td className="muted">{p.date}</td>
                    <td><span className="badge badge-completed">{p.status}</span></td>
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
                {buyerBids.map((b) => (
                  <tr key={b.id}>
                    <td>{b.item}</td>
                    <td>PKR {b.yourBid.toLocaleString()}</td>
                    <td>PKR {b.currentBid.toLocaleString()}</td>
                    <td className="muted">{b.endsIn}</td>
                    <td>
                      <span className={`badge ${b.status === 'Winning' ? 'badge-winning' : 'badge-outbid'}`}>
                        {b.status}
                      </span>
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
                {buyerOffers.map((o) => (
                  <tr key={o.id}>
                    <td>{o.item}</td>
                    <td>PKR {o.offered.toLocaleString()}</td>
                    <td className="muted">PKR {o.listed.toLocaleString()}</td>
                    <td className="muted">{o.time}</td>
                    <td><span className="badge badge-pending">{o.status}</span></td>
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
