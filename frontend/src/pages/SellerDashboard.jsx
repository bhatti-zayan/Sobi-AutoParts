import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { sellerListings, sellerOffers } from '../data/mockData';
import TabBar from '../components/TabBar';
import './Dashboard.css';

const tabs = ['My listings', 'Offer inbox', 'Auctions', 'Profile'];

export default function SellerDashboard() {
  const [activeTab, setActiveTab] = useState('My listings');
  const { user, updateProfile } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [listings, setListings] = useState(sellerListings);
  const [offers, setOffers] = useState(sellerOffers);
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profileEmail, setProfileEmail] = useState(user?.email || '');

  const handleDelete = (id) => {
    setListings((prev) => prev.filter((l) => l.id !== id));
    addToast('Listing deleted', 'info');
  };

  const handleAcceptOffer = (id) => {
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: 'accepted' } : o));
    addToast('Offer accepted!', 'success');
  };

  const handleRejectOffer = (id) => {
    setOffers((prev) => prev.map((o) => o.id === id ? { ...o, status: 'rejected' } : o));
    addToast('Offer rejected', 'info');
  };

  const handleProfileSave = () => {
    updateProfile({ name: profileName, email: profileEmail });
    addToast('Profile updated!', 'success');
  };

  const getBadgeClass = (type) => {
    if (type === 'fixed') return 'badge-fixed';
    if (type === 'auction') return 'badge-auction';
    return 'badge-bargain';
  };

  const getStatusBadge = (status) => {
    if (status === 'Live') return 'badge-live';
    return 'badge-pending';
  };

  return (
    <div className="page-enter">
      <TabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="dashboard-content">
        {/* Stats */}
        <div className="dashboard-stats four-col" id="seller-stats">
          <div className="stat-card">
            <div className="stat-label">Active listings</div>
            <div className="stat-value">{listings.length + 5}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending offers</div>
            <div className="stat-value warn">{offers.filter((o) => o.status === 'pending').length + 1}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Live auctions</div>
            <div className="stat-value info">2</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total sales</div>
            <div className="stat-value green">14</div>
          </div>
        </div>

        {/* My Listings Tab */}
        {activeTab === 'My listings' && (
          <>
            <div className="dashboard-sec-header">
              <div className="dashboard-sec-title">Listings</div>
              <button className="dashboard-btn-new" onClick={() => navigate('/seller/create-listing')} id="new-listing-btn">
                + New listing
              </button>
            </div>
            <div className="dashboard-table-wrap" id="listings-table">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Type</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((l) => (
                    <tr key={l.id}>
                      <td>{l.product}</td>
                      <td><span className={`badge ${getBadgeClass(l.type)}`}>{l.type.charAt(0).toUpperCase() + l.type.slice(1)}</span></td>
                      <td>PKR {l.price.toLocaleString()}</td>
                      <td><span className={`badge ${getStatusBadge(l.status)}`}>{l.status}</span></td>
                      <td>
                        <span className="action-edit" onClick={() => navigate('/seller/create-listing')}>Edit</span>
                        <span className="action-delete" onClick={() => handleDelete(l.id)}>Delete</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Offer Inbox Tab */}
        {activeTab === 'Offer inbox' && (
          <div id="offer-inbox">
            <div className="dashboard-sec-title" style={{ marginBottom: '14px' }}>Offer inbox</div>
            {offers.map((o) => (
              <div className="offer-card" key={o.id}>
                <div>
                  <div className="offer-card-title">{o.product}</div>
                  <div className="offer-card-sub">
                    Offer: PKR {o.offerAmount.toLocaleString()} · Listed: PKR {o.listedPrice.toLocaleString()} · by {o.buyer}
                  </div>
                </div>
                {o.status === 'pending' ? (
                  <div className="offer-card-btns">
                    <button className="offer-btn-accept" onClick={() => handleAcceptOffer(o.id)}>Accept</button>
                    <button className="offer-btn-reject" onClick={() => handleRejectOffer(o.id)}>Reject</button>
                  </div>
                ) : (
                  <span className={`badge ${o.status === 'accepted' ? 'badge-completed' : 'badge-outbid'}`}>
                    {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Auctions Tab */}
        {activeTab === 'Auctions' && (
          <div id="seller-auctions">
            <div className="dashboard-sec-title" style={{ marginBottom: '14px' }}>Live auctions</div>
            <div className="dashboard-table-wrap">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Current bid</th>
                    <th>Bids</th>
                    <th>Ends in</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Honda Civic Alloy Rims</td>
                    <td>PKR 12,800</td>
                    <td>3</td>
                    <td className="muted">2h 14m</td>
                    <td><span className="badge badge-live">Live</span></td>
                  </tr>
                  <tr>
                    <td>Suzuki Baleno Front Bumper</td>
                    <td>PKR 5,600</td>
                    <td>2</td>
                    <td className="muted">8h 50m</td>
                    <td><span className="badge badge-live">Live</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'Profile' && (
          <div id="seller-profile">
            <div className="dashboard-sec-title" style={{ marginBottom: '18px' }}>Your profile</div>
            <div className="profile-form">
              <div className="profile-form-row">
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" value={profileName} onChange={(e) => setProfileName(e.target.value)} id="seller-profile-name" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} id="seller-profile-email" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <input className="form-input" value={user?.role || ''} disabled style={{ opacity: 0.6 }} />
              </div>
              <button className="btn btn-primary btn-full" onClick={handleProfileSave} id="seller-profile-save">Save changes</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
