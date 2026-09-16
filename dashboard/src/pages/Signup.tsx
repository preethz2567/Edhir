import { useState } from 'react';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    <div className="center-layout">
      <div className="auth-card" style={{ maxWidth: 420 }}>
        <span className="auth-logo">Edhir</span>
        <h1 className="auth-title">Create a tenant</h1>
        <p className="auth-sub">Register your application to receive an API key.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="appName">Application name</label>
            <input
              id="appName"
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="form-input"
              placeholder="e.g. Acme Corp Billing"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="contactEmail">Contact email</label>
            <input
              id="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="form-input"
              placeholder="admin@example.com"
              required
            />
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
  );
}
