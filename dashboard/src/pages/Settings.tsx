import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboardContext } from './Dashboard';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, RotateCw } from 'lucide-react';

interface TenantDetails {
  id: string;
  appName: string;
  contactEmail: string;
  apiKey: string;
  integrationMode: string;
}

type ThemeChoice = 'system' | 'light' | 'dark';

export function Settings() {
  const { tenantId } = useDashboardContext();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [showKey, setShowKey] = useState(false);
  const [gracePeriod, setGracePeriod] = useState(24);
  const [rotationMsg, setRotationMsg] = useState('');

  const { data: tenant, isLoading } = useQuery<TenantDetails>({
    queryKey: ['tenant', tenantId],
    queryFn: async () => {
      const res = await fetch(`/api/tenants/${tenantId}`);
      if (!res.ok) throw new Error('Failed to fetch tenant details');
      return res.json();
    },
  });

  const rotateKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        `/api/tenants/${tenantId}/rotate-key?gracePeriodHours=${gracePeriod}`,
        { method: 'POST' }
      );
      if (!res.ok) throw new Error('Failed to rotate key');
      return res.text();
    },
    onSuccess: (newKey) => {
      setRotationMsg(`Key rotated. New key: ${newKey}`);
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      setShowKey(true);
    },
    onError: (err: any) => {
      setRotationMsg(`Error: ${err.message}`);
    },
  });

  const themeOptions: { value: ThemeChoice; label: string }[] = [
    { value: 'system', label: 'System' },
    { value: 'light',  label: 'Light' },
    { value: 'dark',   label: 'Dark' },
  ];

  const maskedKey = tenant ? `****${tenant.apiKey.slice(-4)}` : '••••••••';

  return (
    <div className="page-wrapper">
      <div className="page-inner" style={{ maxWidth: 640 }}>
        <div className="page-header">
          <div>
            <h1 className="page-title">Settings</h1>
            <p className="page-subtitle">Tenant configuration and preferences</p>
          </div>
        </div>

        {/* Appearance */}
        <div className="settings-section">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Appearance</span>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Theme</div>
                <div className="settings-row-sub">Overrides system preference when set.</div>
              </div>
              <div className="theme-toggle-group">
                {themeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`theme-toggle-btn ${theme === opt.value ? 'active' : ''}`}
                    onClick={() => setTheme(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* API Key */}
        <div className="settings-section">
          <div className="card">
            <div className="card-header">
              <span className="card-title">API Key</span>
            </div>

            <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
              <div className="settings-row-label">Current key</div>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                {isLoading ? (
                  <div
                    style={{
                      flex: 1,
                      height: 36,
                      background: 'var(--surface-2)',
                      borderRadius: 'var(--radius)',
                    }}
                  />
                ) : (
                  <input
                    type="text"
                    readOnly
                    value={showKey ? tenant?.apiKey ?? '' : maskedKey}
                    className="form-input"
                    style={{ flex: 1, fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}
                  />
                )}
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowKey((s) => !s)}
                  disabled={isLoading}
                  title={showKey ? 'Hide key' : 'Reveal key'}
                >
                  {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="divider" />

            <div>
              <div className="settings-row-label" style={{ marginBottom: '0.25rem' }}>Rotate key</div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-2)', marginBottom: '1rem', lineHeight: 1.5 }}>
                Generates a new API key. The old key remains valid for the grace period before expiring.
              </p>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end' }}>
                <div className="form-group" style={{ marginBottom: 0, flex: '0 0 180px' }}>
                  <label className="form-label">Grace period (hours)</label>
                  <input
                    type="number"
                    min={0}
                    max={168}
                    value={gracePeriod}
                    onChange={(e) => setGracePeriod(parseInt(e.target.value) || 0)}
                    className="form-input"
                  />
                </div>
                <button
                  className="btn btn-primary"
                  style={{ flexShrink: 0 }}
                  onClick={() => rotateKeyMutation.mutate()}
                  disabled={rotateKeyMutation.isPending || isLoading}
                >
                  <RotateCw size={13} />
                  {rotateKeyMutation.isPending ? 'Rotating…' : 'Rotate key'}
                </button>
              </div>
              {rotationMsg && (
                <div
                  className="alert alert-warning"
                  style={{ marginTop: '1rem' }}
                >
                  {rotationMsg}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tenant info */}
        <div className="settings-section">
          <div className="card">
            <div className="card-header">
              <span className="card-title">Tenant details</span>
            </div>
            {isLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    style={{ height: 34, background: 'var(--surface-2)', borderRadius: 'var(--radius)' }}
                  />
                ))}
              </div>
            ) : (
              <>
                <div className="settings-row">
                  <div className="settings-row-label">Tenant ID</div>
                  <span className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                    {tenant?.id}
                  </span>
                </div>
                <div className="settings-row">
                  <div className="settings-row-label">Application name</div>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-2)' }}>{tenant?.appName}</span>
                </div>
                <div className="settings-row">
                  <div className="settings-row-label">Integration mode</div>
                  <span className="badge" style={{ textTransform: 'none' }}>
                    {tenant?.integrationMode === 'sdk' ? 'Native SDK' : 'Sidecar Proxy'}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
