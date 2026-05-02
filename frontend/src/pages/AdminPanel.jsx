import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { adminStats, adminActivity, adminUsers, sellerListings } from '../data/mockData';
import './AdminPanel.css';
import './Dashboard.css';

const sidebarItems = ['Overview', 'Users', 'Listings', 'Auctions', 'Offers'];

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState('Overview');
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [listings, setListings] = useState([]);
  const { addToast } = useToast();
  const { token } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        const mappedUsers = data.data.map(u => ({
          id: u._id,
          name: u.name,
          email: u.email,
          role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
          status: u.isActive ? 'Active' : 'Inactive',
          joined: new Date(u.createdAt).toLocaleDateString()
        }));
        setUsers(mappedUsers);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    }
  };

  const fetchActivities = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/activities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setActivities(data.data);
    } catch (err) {}
  };

  const fetchListings = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/admin/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) setListings(data.data);
    } catch (err) {}
  };

  useEffect(() => {
    if (activeSection === 'Users') fetchUsers();
    if (activeSection === 'Overview') fetchActivities();
    if (activeSection === 'Listings') fetchListings();
  }, [activeSection]);

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus !== 'Active';
      const res = await fetch(`http://localhost:5000/api/admin/users/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: newStatus })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('User status updated', 'success');
        fetchUsers();
      } else {
        addToast(data.message || 'Error updating status', 'error');
      }
    } catch (err) {
      addToast('Network error', 'error');
    }
  };

  return (
    <div className="page-enter">
      <div className="admin-layout">
        {/* Sidebar */}
        <div className="admin-sidebar" id="admin-sidebar">
          <div className="admin-sidebar-title">Admin panel</div>
          {sidebarItems.map((item) => (
            <button
              key={item}
              className={`admin-sidebar-item ${activeSection === item ? 'active' : ''}`}
              onClick={() => setActiveSection(item)}
              id={`admin-nav-${item.toLowerCase()}`}
            >
              {item}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="admin-main">
          {/* Overview */}
          {activeSection === 'Overview' && (
            <div id="admin-overview">
              <div className="admin-sec-title">Platform overview</div>
              <div className="admin-stats">
                <div className="stat-card">
                  <div className="stat-label">Total users</div>
                  <div className="stat-value">{adminStats.totalUsers}</div>
                  <div className="stat-sub">↑ {adminStats.usersThisWeek} this week</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Active listings</div>
                  <div className="stat-value">{adminStats.activeListings}</div>
                  <div className="stat-sub">↑ {adminStats.listingsToday} today</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Live auctions</div>
                  <div className="stat-value warn">{adminStats.liveAuctions}</div>
                  <div className="stat-sub muted">{adminStats.endingSoon} ending soon</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Pending offers</div>
                  <div className="stat-value info">{adminStats.pendingOffers}</div>
                  <div className="stat-sub muted">Across {adminStats.acrossSellers} sellers</div>
                </div>
              </div>

              <div className="admin-sec-title">Recent activity</div>
              <div className="admin-activity-list">
                {activities.map((a) => (
                  <div className="admin-activity-item" key={a._id || a.id}>
                    <span
                      className="admin-activity-text"
                      dangerouslySetInnerHTML={{ __html: a.text }}
                    ></span>
                    <span className="admin-activity-time">{new Date(a.createdAt).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users */}
          {activeSection === 'Users' && (
            <div id="admin-users">
              <div className="admin-sec-title">Manage users</div>
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.name}</td>
                        <td className="muted">{u.email}</td>
                        <td><span className={`badge ${u.role === 'Buyer' ? 'badge-fixed' : u.role === 'Seller' ? 'badge-auction' : 'badge-bargain'}`}>{u.role}</span></td>
                        <td><span className={`badge ${u.status === 'Active' ? 'badge-active' : 'badge-inactive'}`}>{u.status}</span></td>
                        <td className="muted">{u.joined}</td>
                        <td>
                          <div className="admin-user-actions">
                            <button
                              className={`admin-btn-toggle ${u.status === 'Active' ? 'deactivate' : 'activate'}`}
                              onClick={() => toggleUserStatus(u.id, u.status)}
                            >
                              {u.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Listings */}
          {activeSection === 'Listings' && (
            <div id="admin-listings">
              <div className="admin-sec-title">All listings</div>
              <div className="dashboard-table-wrap">
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
                      <tr key={l.id || l._id}>
                        <td>{l.title}</td>
                        <td><span className={`badge ${l.type === 'fixed' ? 'badge-fixed' : l.type === 'auction' ? 'badge-auction' : 'badge-bargain'}`}>{l.type.charAt(0).toUpperCase() + l.type.slice(1)}</span></td>
                        <td>PKR {(l.price || l.currentBid || l.startingPrice || 0).toLocaleString()}</td>
                        <td><span className={`badge ${l.status === 'live' ? 'badge-live' : 'badge-pending'}`}>{l.status}</span></td>
                        <td>
                          <span className="action-edit">View</span>
                          <span className="action-delete" onClick={() => addToast('Listing removed', 'info')}>Remove</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Auctions */}
          {activeSection === 'Auctions' && (
            <div id="admin-auctions">
              <div className="admin-sec-title">Monitor auctions</div>
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

          {/* Offers */}
          {activeSection === 'Offers' && (
            <div id="admin-offers">
              <div className="admin-sec-title">All offers</div>
              <div className="dashboard-table-wrap">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Offer</th>
                      <th>Listed price</th>
                      <th>Buyer</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Suzuki Alto Engine Cover</td>
                      <td>PKR 1,900</td>
                      <td className="muted">PKR 2,200</td>
                      <td className="muted">User ***71</td>
                      <td><span className="badge badge-pending">Pending</span></td>
                    </tr>
                    <tr>
                      <td>Toyota Camry Headlight</td>
                      <td>PKR 4,000</td>
                      <td className="muted">PKR 4,500</td>
                      <td className="muted">User ***55</td>
                      <td><span className="badge badge-pending">Pending</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
