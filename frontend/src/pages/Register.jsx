import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [error, setError] = useState('');
  const { register, demoLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    const result = register(name, email, password, role);
    if (result.success) {
      addToast(`Welcome, ${result.user.name}! Account created.`, 'success');
      if (role === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    }
  };

  const handleDemoLogin = (r) => {
    const user = demoLogin(r);
    if (user) {
      addToast(`Logged in as ${user.name} (${r})`, 'success');
      if (r === 'admin') navigate('/admin');
      else if (r === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    }
  };

  return (
    <div className="page-enter">
      <div className="auth-page">
        <div className="auth-left">
          <div className="auth-logo">Sobi Auto-parts</div>
          <div className="auth-tagline">
            Pakistan's marketplace for buying and selling auto parts — fixed price, auction, or negotiate.
          </div>
          <div className="auth-features">
            <div className="auth-feature">
              <span className="auth-feature-check">✓</span>
              <span>Fixed price, auction &amp; bargaining</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-check">✓</span>
              <span>Role-based accounts (Buyer / Seller / Admin)</span>
            </div>
            <div className="auth-feature">
              <span className="auth-feature-check">✓</span>
              <span>Real-time bidding &amp; offer tracking</span>
            </div>
          </div>
          <div className="auth-divider-label">Quick demo logins</div>
          <div className="auth-demo-btns">
            <button className="auth-demo-btn buyer" onClick={() => handleDemoLogin('buyer')} id="demo-reg-buyer">
              Login as Buyer (Zayan Ahmed)
            </button>
            <button className="auth-demo-btn seller" onClick={() => handleDemoLogin('seller')} id="demo-reg-seller">
              Login as Seller (M. Soban)
            </button>
            <button className="auth-demo-btn admin" onClick={() => handleDemoLogin('admin')} id="demo-reg-admin">
              Login as Admin
            </button>
          </div>
        </div>

        <div className="auth-right">
          <div className="auth-tab-row">
            <button className="auth-tab inactive" onClick={() => navigate('/login')} id="reg-tab-login">
              Login
            </button>
            <button className="auth-tab active" id="reg-tab-register">Register</button>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error">{error}</div>}
            <div className="auth-form-row">
              <div className="form-group">
                <label className="form-label">Full name</label>
                <input
                  className="form-input"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  id="register-name"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  id="register-email"
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="register-password"
              />
            </div>
            <div>
              <div className="role-label">Register as</div>
              <div className="role-row" style={{ marginTop: '8px' }}>
                <div
                  className={`role-option ${role === 'buyer' ? 'active' : ''}`}
                  onClick={() => setRole('buyer')}
                  id="role-buyer"
                >
                  <span className="role-radio"></span>
                  Buyer
                </div>
                <div
                  className={`role-option ${role === 'seller' ? 'active' : ''}`}
                  onClick={() => setRole('seller')}
                  id="role-seller"
                >
                  <span className="role-radio"></span>
                  Seller
                </div>
              </div>
            </div>
            <button type="submit" className="auth-submit" id="register-submit">Create account</button>
          </form>
        </div>
      </div>
    </div>
  );
}
