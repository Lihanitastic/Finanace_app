import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import api from '../utils/api';
import './Onboarding.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // Keep token in localstorage
      localStorage.setItem('finpulse_token', data.token);
      localStorage.setItem('finpulse_user', JSON.stringify({
        name: data.name,
        email: data.email,
        focus: data.focus,
        employmentType: data.employmentType
      }));
      
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to login');
    }
  };

  return (
    <div className="onboarding">
      <div className="onboarding-content" style={{ opacity: 1, transform: 'none' }}>
        <div className="welcome-step">
          <div className="welcome-icon-wrapper" style={{ marginBottom: '24px' }}>
            <Sparkles size={48} />
          </div>
          <h1 className="onboarding-title" style={{ fontSize: '2rem' }}>Welcome Back</h1>
          <p className="onboarding-subtitle">Log in to resume tracking your financial wellness.</p>
          
          {error && <div className="error-message" style={{ color: 'var(--color-expense)', marginBottom: '16px' }}>{error}</div>}

          <form onSubmit={handleLogin} className="setup-fields" style={{ marginTop: '32px', textAlign: 'left' }}>
            <div className="input-group" style={{ marginBottom: '16px' }}>
              <label className="input-label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            
            <div className="input-group" style={{ marginBottom: '32px' }}>
              <label className="input-label">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary btn-full btn-lg ${!email || !password ? 'btn-disabled' : ''}`}
              disabled={!email || !password}
            >
              Log In
              <ArrowRight size={20} />
            </button>
          </form>

          <p style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>
            New here? <Link to="/onboarding" style={{ color: 'var(--accent-primary)', textDecoration: 'none' }}>Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
