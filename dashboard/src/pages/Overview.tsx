import React from 'react';
import { useDashboardContext } from './Dashboard';
import { StatCards } from '../components/StatCards';
import { LiveFeed } from '../components/LiveFeed';
import { ErrorBoundary } from '../components/ErrorBoundary';

export function Overview() {
  const { dashboardData, isLoading, isError } = useDashboardContext();

  return (
    <div className="content-wrapper">
      <div className="content-inner">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Overview</h1>
            <p className="dashboard-subtitle">At-a-glance security metrics</p>
          </div>
        </div>

        {/* System Status Mock */}
        <div style={{ background: 'var(--accent-red-glow)', border: '1px solid var(--accent-red)', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-red)' }} />
          <p style={{ color: '#fca5a5', fontSize: '0.875rem' }}>
            <strong style={{ color: 'var(--accent-red)' }}>ML Service Offline:</strong> Running in fast-path-only mode (circuit breaker open).
          </p>
        </div>

        <ErrorBoundary>
          <StatCards 
            isLoading={isLoading}
            isError={isError}
            total={dashboardData?.summary.total || 0}
            allowed={dashboardData?.summary.allowed || 0}
            blocked={dashboardData?.summary.blocked || 0}
            honeypot={0} 
          />
        </ErrorBoundary>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginTop: '1.5rem' }}>
          <ErrorBoundary>
            <LiveFeed 
              tenantId={null} // Handled by Context now
              initialData={dashboardData?.requests || []}
              isLoading={isLoading}
            />
          </ErrorBoundary>

          <div className="solid-card" style={{ alignSelf: 'start' }}>
            <div className="section-header-wrap">
              <h2 className="section-header">Recent Campaigns</h2>
            </div>
            <div className="empty-state" style={{ padding: '2rem 1rem' }}>
              <p>No active campaigns detected in the last 24 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
