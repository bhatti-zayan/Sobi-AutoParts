import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import './Auth.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const { login, demoLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    const result = login(email, password);
    if (result.success) {
      addToast(`Welcome back, ${result.user.name}!`, 'success');
      if (result.user.role === 'admin') navigate('/admin');
      else if (result.user.role === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    } else {
      setError(result.error);
    }
  };

  const handleDemoLogin = (role) => {
    const user = demoLogin(role);
    if (user) {
      addToast(`Logged in as ${user.name} (${role})`, 'success');
      if (role === 'admin') navigate('/admin');
      else if (role === 'seller') navigate('/seller/dashboard');
      else navigate('/');
    }
  };

  const handleForgotPassword = () => {
    if (forgotEmail) {
      addToast('Password reset link sent to ' + forgotEmail, 'info');
      setShowForgot(false);
      setForgotEmail('');
    }
  };

  const AuthLeftPanel = () => (
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
        <button className="auth-demo-btn buyer" onClick={() => handleDemoLogin('buyer')} id="demo-login-buyer">
          Login as Buyer (Zayan Ahmed)
        </button>
        <button className="auth-demo-btn seller" onClick={() => handleDemoLogin('seller')} id="demo-login-seller">
          Login as Seller (M. Soban)
        </button>
        <button className="auth-demo-btn admin" onClick={() => handleDemoLogin('admin')} id="demo-login-admin">
          Login as Admin
        </button>
      </div>
    </div>
  );

  return (
    <div className="page-enter">
      <div className="auth-page">
        <AuthLeftPanel />
        <div className="auth-right">
          <div className="auth-tab-row">
            <button className="auth-tab active" id="tab-login">Login</button>
            <button className="auth-tab inactive" onClick={() => navigate('/register')} id="tab-register">
              Register
            </button>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            {error && <div className="auth-error" id="login-error">{error}</div>}
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                id="login-email"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                id="login-password"
              />
            </div>
            <div className="auth-forgot" onClick={() => setShowForgot(true)} id="forgot-password-link">
              Forgot password?
            </div>
            <button type="submit" className="auth-submit" id="login-submit">Login</button>
          </form>
          <div className="auth-note">
            Don't have an account?{' '}
            <span onClick={() => navigate('/register')}>Register</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgot && (
        <div className="modal-overlay" onClick={() => setShowForgot(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">Reset Password</div>
            <div className="modal-desc">
              Enter your email address and we'll send you a link to reset your password.
            </div>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                id="forgot-email"
              />
            </div>
            <div className="modal-actions">
              <button className="btn btn-gray" onClick={() => setShowForgot(false)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={handleForgotPassword} style={{ flex: 2 }} id="forgot-submit">
                Send reset link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
