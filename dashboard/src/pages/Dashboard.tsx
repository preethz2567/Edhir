import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Outlet, useOutletContext } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { Copy, Check } from 'lucide-react';
import { WebSocketProvider } from '../context/WebSocketContext';
import { RequestRecord } from '../components/LiveFeed';

export interface DashboardResponse {
  requests: RequestRecord[];
  summary: {
    total: number;
    allowed: number;
    blocked: number;
    honeypot: number;
  };
}

export interface DashboardContextType {
  dashboardData?: DashboardResponse;
  isLoading: boolean;
  isError: boolean;
  tenantId: string;
}

export function useDashboardContext() {
  return useOutletContext<DashboardContextType>();
}

export function DashboardLayout({ tenantId, onLogout }: { tenantId: string; onLogout: () => void }) {
  const { data, isLoading, isError } = useQuery<DashboardResponse>({
    queryKey: ['dashboard', tenantId],
    queryFn: async () => {
      const res = await fetch('/api/dashboard/live');
      if (!res.ok) {
        if (res.status === 401) onLogout();
        throw new Error('Failed to fetch dashboard data');
      }
      return res.json();
    },
    refetchInterval: 3000,
  });

  const [copied, setCopied] = useState(false);
  const handleCopyCurl = () => {
    navigator.clipboard.writeText('curl -i http://localhost:8443/');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Show a "waiting for first request" empty state when backend returns 0 traffic
  const isWaiting = !isLoading && !isError && data?.summary.total === 0;

  if (isWaiting) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg)',
          padding: '2rem',
        }}
      >
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center' }}>
          <div style={{ marginBottom: '0.5rem', fontSize: '0.9375rem', fontWeight: 600, color: 'var(--text-1)' }}>
            Edhir
          </div>
          <h1
            style={{ fontSize: '1.375rem', fontWeight: 600, color: 'var(--text-1)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}
          >
            Waiting for first request
          </h1>
          <p
            style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '2rem', lineHeight: 1.6 }}
          >
            No traffic has been recorded yet. Send a request through your Edhir
            sidecar to see it appear here.
          </p>
          <div className="card" style={{ textAlign: 'left' }}>
            <div className="card-header">
              <span className="card-title">Test connection</span>
              <button className="btn btn-secondary btn-sm" onClick={handleCopyCurl}>
                {copied ? <Check size={13} /> : <Copy size={13} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="code-block">curl -i http://localhost:8443/</div>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-ghost btn-sm"
            style={{ marginTop: '1.5rem' }}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <WebSocketProvider tenantId={tenantId}>
      <div className="dashboard-layout">
        <Sidebar onLogout={onLogout} tenantId={tenantId} />
        <div className="dashboard-main">
          <Outlet context={{ dashboardData: data, isLoading, isError, tenantId }} />
        </div>
      </div>
    </WebSocketProvider>
  );
}
