import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/shared/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCredentials, setShowCredentials] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message);
    }
  };

  const demoCredentials = [
    { email: 'hr@company.com', password: 'password123', role: 'HR Manager' },
    { email: 'admin@company.com', password: 'password123', role: 'Admin' },
    { email: 'sales1@company.com', password: 'password123', role: 'Employee (Sales)' },
    { email: 'ops@company.com', password: 'password123', role: 'Operations' },
    { email: 'accounts@company.com', password: 'password123', role: 'Accounts' },
  ];

  const quickLogin = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 'var(--space-lg)'
    }}>
      <div className="animate-fade-in-up" style={{ width: '100%', maxWidth: '420px' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1 className="font-brand" style={{
            fontSize: '2rem',
            fontWeight: '700',
            letterSpacing: '0.05em',
            marginBottom: 'var(--space-sm)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '0.5rem'
          }}>
            <span style={{ color: 'white' }}>SYNDITECH</span>
            <span style={{ color: 'var(--accent-primary)' }}>HRMS</span>
          </h1>
          <p style={{
            fontSize: '0.9375rem',
            color: 'var(--text-secondary)'
          }}>
            Enterprise Portal
          </p>
        </div>

        {/* Login Card */}
        <div className="card" style={{ padding: 'var(--space-2xl)' }}>
          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '600',
            marginBottom: 'var(--space-sm)'
          }}>
            Sign In
          </h2>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-2xl)'
          }}>
            Access your workspace
          </p>

          <form onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className="input-group">
              <label htmlFor="email">Company Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@company.com"
                required
                autoComplete="email"
              />
            </div>

            {/* Password Input */}
            <div className="input-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="animate-fade-in" style={{
                padding: 'var(--space-md)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: 'var(--space-lg)'
              }}>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#EF4444',
                  margin: 0
                }}>
                  {error}
                </p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              style={{ width: '100%', marginBottom: 'var(--space-md)' }}
            >
              Sign In
            </Button>

            {/* Demo Credentials Toggle */}
            <div style={{ textAlign: 'center', marginTop: 'var(--space-lg)' }}>
              <button
                type="button"
                onClick={() => setShowCredentials(!showCredentials)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-primary)',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  padding: 'var(--space-sm)',
                  transition: 'color var(--transition-fast)'
                }}
              >
                {showCredentials ? 'Hide' : 'Show'} Demo Credentials
              </button>
            </div>
          </form>

          {/* Demo Credentials */}
          {showCredentials && (
            <div className="animate-fade-in-up" style={{
              marginTop: 'var(--space-lg)',
              paddingTop: 'var(--space-lg)',
              borderTop: '1px solid var(--border-subtle)'
            }}>
              <div style={{
                fontSize: '0.8125rem',
                fontWeight: '600',
                color: 'var(--text-secondary)',
                marginBottom: 'var(--space-md)'
              }}>
                Demo Accounts
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                {demoCredentials.map((cred, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => quickLogin(cred.email, cred.password)}
                    style={{
                      padding: 'var(--space-sm)',
                      backgroundColor: 'var(--bg-elevated)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)',
                      textAlign: 'left'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.borderColor = 'var(--accent-primary)';
                      e.currentTarget.style.backgroundColor = 'var(--accent-primary-subtle)';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-subtle)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-elevated)';
                    }}
                  >
                    <div style={{ fontWeight: '600', marginBottom: '0.125rem' }}>
                      {cred.role}
                    </div>
                    <div style={{ color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                      {cred.email} / {cred.password}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Emergency Reset */}
          <div style={{ marginTop: 'var(--space-2xl)', borderTop: '1px solid var(--border-subtle)', paddingTop: 'var(--space-md)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: 'var(--space-sm)' }}>
              Getting "Unauthorized" errors?
            </p>
            <button
              type="button"
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                background: 'none',
                border: '1px solid var(--border-subtle)',
                padding: '4px 8px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Force Clear Session & Refresh
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: 'var(--space-xl)',
          fontSize: '0.8125rem',
          color: 'var(--text-tertiary)'
        }}>
          Secure enterprise access • Powered by Synditech
        </div>
      </div>
    </div>
  );
};

export default Login;
