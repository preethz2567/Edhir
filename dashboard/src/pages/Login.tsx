import { useState } from 'react';

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid API key.');
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
    <div className="center-layout">
      <div className="auth-card">
        <span className="auth-logo">Edhir</span>
        <h1 className="auth-title">Sign in</h1>
        <p className="auth-sub">Enter your tenant API key to continue.</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="apiKey">
              API Key
            </label>
            <input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="form-input"
              placeholder="edhir_live_…"
              autoComplete="current-password"
              required
            />
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
            {loading ? <><div className="spinner" style={{ width: 14, height: 14 }} /> Signing in…</> : 'Sign in'}
          </button>

          <button
            type="button"
            className="btn btn-ghost btn-full"
            onClick={onNavigateToSignup}
          >
            Create a new tenant
          </button>
        </form>
      </div>
    </div>
  );
}
