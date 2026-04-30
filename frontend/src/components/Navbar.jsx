import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = () => {
    // console.log("user clicked logout");
    logout();
    navigate('/login');
    setDrawerOpen(false); // hide menu after logout
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'seller') return '/seller/dashboard';
    return '/buyer/dashboard';
  };

  const avatarClass = user ? `navbar-avatar ${user.role}` : 'navbar-avatar';

  const navContent = (
    <>
      <Link to="/" className="navbar-link" onClick={() => setDrawerOpen(false)}>Browse</Link>
      {isAuthenticated && user?.role === 'seller' && (
        <Link to="/seller/create-listing" className="navbar-link" onClick={() => setDrawerOpen(false)}>Sell</Link>
      )}
      {isAuthenticated && (
        <Link to={getDashboardLink()} className="navbar-link" onClick={() => setDrawerOpen(false)}>Dashboard</Link>
      )}
      {isAuthenticated ? (
        <>
          <span className="navbar-username">{user.name}</span>
          <div className={avatarClass}>{user.initials}</div>
          <button className="btn-outline" onClick={handleLogout}>Logout</button>
        </>
      ) : (
        <>
          <Link to="/login" className="navbar-link" onClick={() => setDrawerOpen(false)}>Login</Link>
          <Link to="/register" className="btn btn-primary" style={{ padding: '6px 16px', fontSize: '12px' }} onClick={() => setDrawerOpen(false)}>Register</Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="navbar" id="main-navbar">
        <Link to="/" className="navbar-brand">Sobi Auto-parts</Link>

        <div className="navbar-search">
          <span className="navbar-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search parts, makes, models..."
            id="global-search"
            // onChange={(e) => console.log(e.target.value)} // TO DO: actually implement search later
          />
        </div>

        <div className="navbar-links">
          {navContent}
        </div>

        <button
          className={`navbar-hamburger ${drawerOpen ? 'open' : ''}`}
          onClick={() => setDrawerOpen(!drawerOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`navbar-drawer ${drawerOpen ? 'open' : ''}`} onClick={() => setDrawerOpen(false)}>
        <div className="navbar-drawer-content" onClick={(e) => e.stopPropagation()}>
          {navContent}
        </div>
      </div>
    </>
  );
}
