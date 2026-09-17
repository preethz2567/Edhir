import { useState } from 'react';
import { Hexagon } from 'lucide-react';
import authIllustration from '../assets/auth-illustration.jpg';

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
    <div className="auth-layout">
      <div className="auth-illustration-panel">
        <img src={authIllustration} alt="Edhir Security" className="auth-illustration-img" />
      </div>
      <div className="auth-content">
        <div className="auth-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Hexagon size={28} style={{ color: 'var(--accent)' }} />
            <span className="auth-logo" style={{ marginBottom: 0 }}>Edhir</span>
          </div>
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
    </div>
  );
}
