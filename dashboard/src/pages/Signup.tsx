import { useState } from 'react';
import { Hexagon } from 'lucide-react';
import authIllustration from '../assets/auth-illustration.jpg';

interface SignupProps {
  onSuccess: (apiKey: string, integrationMode: string) => void;
  onNavigateToLogin: () => void;
}

export function Signup({ onSuccess, onNavigateToLogin }: SignupProps) {
  const [appName, setAppName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [integrationMode, setIntegrationMode] = useState('sidecar');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{appName?: string, contactEmail?: string}>({});

  const validate = () => {
    const errors: {appName?: string, contactEmail?: string} = {};
    if (!appName.trim() || appName.length < 3) {
      errors.appName = 'Application name must be at least 3 characters.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!contactEmail.trim() || !emailRegex.test(contactEmail)) {
      errors.contactEmail = 'Please enter a valid email address.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appName, contactEmail, integrationMode }),
      });

      if (!res.ok) {
        throw new Error('Registration failed. Please try again.');
      }

      const apiKey = await res.text();
      onSuccess(apiKey, integrationMode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-illustration-panel">
        <img src={authIllustration} alt="Edhir Security" className="auth-illustration-img" />
      </div>
      <div className="auth-content">
        <div className="auth-card" style={{ maxWidth: 420 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Hexagon size={28} style={{ color: 'var(--accent)' }} />
            <span className="auth-logo" style={{ marginBottom: 0 }}>Edhir</span>
          </div>
          <h1 className="auth-title">Create a tenant</h1>
          <p className="auth-sub">Register your application to receive an API key.</p>

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" htmlFor="appName">Application name</label>
              <input
                id="appName"
                type="text"
                value={appName}
                onChange={(e) => {
                  setAppName(e.target.value);
                  setValidationErrors(prev => ({ ...prev, appName: undefined }));
                }}
                className={`form-input ${validationErrors.appName ? 'form-input-error' : ''}`}
                placeholder="e.g. Acme Corp Billing"
              />
              {validationErrors.appName && <div className="form-error-text">{validationErrors.appName}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="contactEmail">Contact email</label>
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => {
                  setContactEmail(e.target.value);
                  setValidationErrors(prev => ({ ...prev, contactEmail: undefined }));
                }}
                className={`form-input ${validationErrors.contactEmail ? 'form-input-error' : ''}`}
                placeholder="admin@example.com"
              />
              {validationErrors.contactEmail && <div className="form-error-text">{validationErrors.contactEmail}</div>}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="integrationMode">Integration mode</label>
              <select
                id="integrationMode"
                value={integrationMode}
                onChange={(e) => setIntegrationMode(e.target.value)}
                className="form-input form-select"
              >
                <option value="sidecar">Sidecar Proxy</option>
                <option value="sdk">Native SDK</option>
              </select>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-full"
              style={{ marginBottom: '0.5rem' }}
            >
              {loading
                ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Creating tenant…</>
                : 'Create tenant'}
            </button>

            <button
              type="button"
              className="btn btn-ghost btn-full"
              onClick={onNavigateToLogin}
            >
              Already have an API key? Sign in
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
