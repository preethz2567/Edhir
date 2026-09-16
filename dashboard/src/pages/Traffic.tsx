import { useState } from 'react';
import { useDashboardContext } from './Dashboard';
import { useWebSocket } from '../context/WebSocketContext';
import { Search } from 'lucide-react';

type VerdictFilter = 'all' | 'allow' | 'block' | 'honeypot';

const verdictLabel: Record<string, string> = {
  allow: 'ALLOW',
  block: 'BLOCK',
  honeypot: 'HNYP',
};

export function Traffic() {
  const { isLoading } = useDashboardContext();
  const { requests, wsStatus } = useWebSocket();
  const [filter, setFilter] = useState<VerdictFilter>('all');
  const [search, setSearch] = useState('');

  const filteredRequests = requests.filter((req) => {
    if (filter !== 'all' && req.verdict !== filter) return false;
    if (search && !req.path.toLowerCase().includes(search.toLowerCase()) && !req.sessionId.includes(search)) return false;
    return true;
  });

  const tabs: { key: VerdictFilter; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'allow',    label: 'Allowed' },
    { key: 'block',    label: 'Blocked' },
    { key: 'honeypot', label: 'Honeypot' },
  ];

  return (
    <div className="page-wrapper">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <h1 className="page-title">Live Traffic</h1>
            <p className="page-subtitle">Real-time request feed with filtering</p>
          </div>
          <div className="ws-indicator">
            <span className={`ws-dot ${wsStatus === 'connected' ? 'connected' : wsStatus === 'error' ? 'error' : ''}`} />
            {wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting' : 'Disconnected'}
          </div>
        </div>

        <div className="data-table">
          {/* Filter toolbar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0 1.25rem',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <div className="filter-tabs">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  className={`filter-tab ${filter === t.key ? 'active' : ''}`}
                  onClick={() => setFilter(t.key)}
                >
                  {t.label}
                  {t.key !== 'all' && (
                    <span
                      style={{
                        marginLeft: '0.375rem',
                        fontSize: '0.625rem',
                        color: 'var(--text-3)',
                      }}
                    >
                      {requests.filter((r) => r.verdict === t.key).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="search-wrap">
              <Search size={13} className="search-icon" />
              <input
                type="text"
                placeholder="Filter path or session…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {/* Column header */}
          <div
            className="data-row header-row"
            style={{ gridTemplateColumns: '4.5rem 1fr 8rem 4.5rem 5rem 5rem' }}
          >
            <div className="data-cell">Method</div>
            <div className="data-cell">Path</div>
            <div className="data-cell">Session</div>
            <div className="data-cell">Latency</div>
            <div className="data-cell">Time</div>
            <div className="data-cell" style={{ textAlign: 'right' }}>Verdict</div>
          </div>

          {/* Rows */}
          {isLoading ? (
            <div className="empty-state">
              <div className="spinner" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="empty-state">
              <p className="empty-desc">
                {requests.length === 0
                  ? 'No traffic recorded yet. Waiting for incoming requests.'
                  : 'No requests match the current filter.'}
              </p>
            </div>
          ) : (
            filteredRequests.map((req, i) => (
              <div
                key={`${req.id}-${i}`}
                className="data-row"
                style={{ gridTemplateColumns: '4.5rem 1fr 8rem 4.5rem 5rem 5rem' }}
              >
                <div className="data-cell">
                  <span className="badge">{req.method}</span>
                </div>
                <div className="data-cell mono">{req.path}</div>
                <div className="data-cell mono" style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>
                  {req.sessionId.substring(0, 10)}…
                </div>
                <div className="data-cell mono">{req.responseTimeMs}ms</div>
                <div className="data-cell" style={{ fontSize: '0.75rem', color: 'var(--text-3)', fontVariantNumeric: 'tabular-nums' }}>
                  {new Date(req.timestamp).toLocaleTimeString()}
                </div>
                <div className="data-cell" style={{ textAlign: 'right' }}>
                  <span className={`badge ${req.verdict}`}>
                    {verdictLabel[req.verdict] ?? req.verdict}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
