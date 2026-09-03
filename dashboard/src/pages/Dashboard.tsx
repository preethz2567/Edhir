import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatCards } from '../components/StatCards';
import { LiveFeed, RequestRecord } from '../components/LiveFeed';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Loader2, Copy, Check } from 'lucide-react';

interface DashboardResponse {
  requests: RequestRecord[];
  summary: {
    total: number;
    allowed: number;
    blocked: number;
  };
}

interface DashboardProps {
  tenantId: string;
  onLogout: () => void;
}

export function Dashboard({ tenantId, onLogout }: DashboardProps) {
  const { data, isLoading, isError } = useQuery<DashboardResponse>({
    queryKey: ['dashboard', tenantId],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/live', {
      });
      if (!res.ok) {
        if (res.status === 401) onLogout();
        throw new Error('Failed to fetch data');
      }
      return res.json();
    },
    refetchInterval: 3000,
  });

  const [copied, setCopied] = useState(false);
  const handleCopyCurl = () => {
    navigator.clipboard.writeText(`curl -i http://localhost:8443/`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      onLogout();
    }
  };

  const isWaiting = !isLoading && !isError && data?.summary.total === 0;

  return (
    <div className="content-wrapper">
      <div className="content-inner">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Security Overview</h1>
            <p className="dashboard-subtitle">Tenant ID: {tenantId}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="btn btn-secondary btn-sm"
          >
            Sign Out
          </button>
        </div>

        {isWaiting ? (
          <div className="solid-card text-center" style={{ padding: '4rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <div style={{ animation: 'spin 2s linear infinite' }}>
                <Loader2 size={48} color="var(--accent-teal)" />
              </div>
            </div>
            <style>{`
              @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
              }
            `}</style>
            <h2 className="dashboard-title" style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Waiting for first request</h2>
            <p className="dashboard-subtitle" style={{ marginBottom: '2rem' }}>No traffic yet. Send a test request to see it appear here.</p>
            
            <div style={{ display: 'inline-block', textAlign: 'left', background: 'var(--bg-color)', padding: '1.5rem', borderRadius: '8px', border: '1px solid var(--surface-border)', width: '100%', maxWidth: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>TEST CONNECTION</span>
                <button onClick={handleCopyCurl} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.75rem', width: 'auto' }}>
                  {copied ? <Check size={14} color="var(--accent-teal)" /> : <Copy size={14} />} Copy
                </button>
              </div>
              <div style={{ fontFamily: 'monospace', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                curl -i http://localhost:8443/
              </div>
            </div>
          </div>
        ) : (
          <>
            <ErrorBoundary>
              <StatCards 
                isLoading={isLoading}
                isError={isError}
                total={data?.summary.total || 0}
                allowed={data?.summary.allowed || 0}
                blocked={data?.summary.blocked || 0}
                honeypot={0} 
              />
            </ErrorBoundary>

            <ErrorBoundary>
              <LiveFeed 
                tenantId={tenantId}
                initialData={data?.requests || []}
                isLoading={isLoading}
              />
            </ErrorBoundary>
          </>
        )}
      </div>
    </div>
  );
}
