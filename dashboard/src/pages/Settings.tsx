import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useDashboardContext } from './Dashboard';
import { Key, Eye, EyeOff, RefreshCw, Loader2 } from 'lucide-react';

interface TenantDetails {
  id: string;
  appName: string;
  contactEmail: string;
  apiKey: string;
  integrationMode: string;
}

export function Settings() {
  const { tenantId } = useDashboardContext();
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
    }
  });

  const rotateKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/tenants/${tenantId}/rotate-key?gracePeriodHours=${gracePeriod}`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('Failed to rotate key');
      return res.text(); // returns new API key
    },
    onSuccess: (newKey) => {
      setRotationMsg(`Key rotated successfully! New key: ${newKey}`);
      queryClient.invalidateQueries({ queryKey: ['tenant', tenantId] });
      setShowKey(true); // force reveal so they see it
    },
    onError: (err: any) => {
      setRotationMsg(`Error: ${err.message}`);
    }
  });

  if (isLoading || !tenant) {
    return (
      <div className="content-wrapper">
        <div className="content-inner" style={{ display: 'flex', justifyContent: 'center', paddingTop: '4rem' }}>
          <Loader2 size={48} className="animate-spin" color="var(--accent-teal)" />
        </div>
      </div>
    );
  }

  const maskedKey = `****${tenant.apiKey.slice(-4)}`;

  return (
    <div className="content-wrapper">
      <div className="content-inner">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Settings</h1>
            <p className="dashboard-subtitle">Manage your tenant configuration</p>
          </div>
        </div>

        <div className="solid-card" style={{ maxWidth: '600px', marginBottom: '2rem' }}>
          <div className="section-header-wrap">
            <h2 className="section-header">API Key Management</h2>
          </div>

          <div className="form-group">
            <label>Current API Key</label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input 
                type="text" 
                value={showKey ? tenant.apiKey : maskedKey} 
                readOnly 
                className="form-input" 
                style={{ fontFamily: 'monospace' }} 
              />
              <button 
                onClick={() => setShowKey(!showKey)} 
                className="btn btn-secondary btn-sm"
                style={{ padding: '0 1rem' }}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
            <h3 style={{ fontSize: '1rem', fontFamily: 'var(--font-space)', marginBottom: '1rem' }}>Rotate API Key</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Regenerate your API key. The old key will continue to work for the specified grace period.
            </p>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
                <label>Grace Period (Hours)</label>
                <input 
                  type="number" 
                  min="0"
                  max="168"
                  value={gracePeriod} 
                  onChange={e => setGracePeriod(parseInt(e.target.value) || 0)} 
                  className="form-input" 
                />
              </div>
              <button 
                className="btn btn-primary" 
                style={{ height: '42px', width: 'auto' }}
                onClick={() => rotateKeyMutation.mutate()}
                disabled={rotateKeyMutation.isPending}
              >
                {rotateKeyMutation.isPending ? 'Rotating...' : <><RefreshCw size={16} /> Regenerate Key</>}
              </button>
            </div>
            {rotationMsg && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', fontSize: '0.875rem', wordBreak: 'break-all' }}>
                {rotationMsg}
              </div>
            )}
          </div>
        </div>

        <div className="solid-card" style={{ maxWidth: '600px' }}>
          <div className="section-header-wrap">
            <h2 className="section-header">Integration Details</h2>
          </div>
          
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label>Application Name</label>
            <input type="text" value={tenant.appName} className="form-input" readOnly />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label>Integration Mode</label>
            <input type="text" value={tenant.integrationMode === 'sdk' ? 'Native SDK' : 'Sidecar Proxy'} className="form-input" readOnly />
          </div>
        </div>
      </div>
    </div>
  );
}
