import React, { useState } from 'react';

interface LoginProps {
  onSuccess: (tenantId: string) => void;
  onNavigateToSignup: () => void;
}

export function Login({ onSuccess, onNavigateToSignup }: LoginProps) {
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
      }

      const data = await res.json();
      onSuccess(data.tenantId);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-center-wrapper">
      <div className="solid-card login-card">
        <h1 className="text-3xl text-center mb-2 dashboard-title">Edhir</h1>
        <p className="text-center mb-8 dashboard-subtitle">Adaptive WAF Dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tenant API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="form-input"
              placeholder="Enter your API key"
              required
            />
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
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onNavigateToSignup}
          >
            Create new tenant
          </button>
        </form>
      </div>
    </div>
  );
}
