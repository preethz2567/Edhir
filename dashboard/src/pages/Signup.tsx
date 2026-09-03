import React, { useState } from 'react';

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ appName, contactEmail, integrationMode }),
      });

      if (!res.ok) {
        throw new Error('Registration failed. Please try again.');
      }

      // Backend returns the raw string API key
      const apiKey = await res.text();
      onSuccess(apiKey, integrationMode);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-center-wrapper">
      <div className="solid-card login-card">
        <h1 className="text-3xl text-center mb-2 dashboard-title">Register</h1>
        <p className="text-center mb-8 dashboard-subtitle">Create a new Edhir tenant</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Application Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              className="form-input"
              placeholder="e.g. Acme Corp Billing"
              required
            />
          </div>

          <div className="form-group">
            <label>Contact Email</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="form-input"
              placeholder="admin@acme.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Integration Mode</label>
            <select
              value={integrationMode}
              onChange={(e) => setIntegrationMode(e.target.value)}
              className="form-input"
              style={{ appearance: 'auto' }}
            >
              <option value="sidecar">Sidecar Proxy</option>
              <option value="sdk">Native SDK</option>
            </select>
          </div>

          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary mb-2"
          >
            {loading ? 'Registering...' : 'Sign Up'}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onNavigateToLogin}
          >
            Already have an API Key? Log in
          </button>
        </form>
      </div>
    </div>
  );
}
