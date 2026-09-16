import { useDashboardContext } from './Dashboard';
import { StatCards } from '../components/StatCards';
import { LiveFeed } from '../components/LiveFeed';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export function Overview() {
  const { dashboardData, isLoading, isError } = useDashboardContext();

  return (
    <div className="page-wrapper">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <h1 className="page-title">Overview</h1>
            <p className="page-subtitle">Security summary for this tenant</p>
          </div>
        </div>

        <ErrorBoundary>
          <StatCards
            isLoading={isLoading}
            isError={isError}
            total={dashboardData?.summary.total ?? 0}
            allowed={dashboardData?.summary.allowed ?? 0}
            blocked={dashboardData?.summary.blocked ?? 0}
            honeypot={dashboardData?.summary.honeypot ?? 0}
          />
        </ErrorBoundary>

        <div className="overview-grid">
          <ErrorBoundary>
            <LiveFeed
              tenantId={null}
              initialData={dashboardData?.requests ?? []}
              isLoading={isLoading}
            />
          </ErrorBoundary>

          {/* Recent campaigns summary */}
          <div className="data-table" style={{ alignSelf: 'start' }}>
            <div className="data-table-header">
              <span className="card-title">Campaigns</span>
              <Link
                to="/app/campaigns"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-2)',
                }}
              >
                View all <ArrowRight size={12} />
              </Link>
            </div>
            <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
              <p className="empty-desc">No active campaigns in the last 24 hours.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
