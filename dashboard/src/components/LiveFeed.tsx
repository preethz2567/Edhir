import { useEffect } from 'react';
import { useWebSocket } from '../context/WebSocketContext';

export interface RequestRecord {
  id: string;
  sessionId: string;
  timestamp: string;
  path: string;
  method: string;
  verdict: 'allow' | 'block' | 'honeypot';
  responseTimeMs: number;
  matchedRuleId?: string;
}

interface LiveFeedProps {
  tenantId: string | null;
  initialData: RequestRecord[];
  isLoading: boolean;
}

const verdictLabel: Record<string, string> = {
  allow: 'ALLOW',
  block: 'BLOCK',
  honeypot: 'HNYP',
};

export function LiveFeed({ initialData, isLoading }: LiveFeedProps) {
  const { requests, wsStatus, setInitialData } = useWebSocket();

  useEffect(() => {
    if (initialData.length > 0) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  if (isLoading) {
    return (
      <div className="data-table" style={{ minHeight: 320 }}>
        <div className="data-table-header">
          <span className="card-title">Recent Traffic</span>
        </div>
        <div className="empty-state">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="data-table">
      <div className="data-table-header">
        <span className="card-title">Recent Traffic</span>
        <div className="ws-indicator">
          <span className={`ws-dot ${wsStatus === 'connected' ? 'connected' : wsStatus === 'error' ? 'error' : ''}`} />
          {wsStatus === 'connected' ? 'Live' : wsStatus === 'connecting' ? 'Connecting' : 'Disconnected'}
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="empty-state">
          <p className="empty-desc">No traffic recorded yet. Waiting for incoming requests.</p>
        </div>
      ) : (
        <>
          <div
            className="data-row header-row"
            style={{ gridTemplateColumns: '5rem 1fr 7rem 5rem 4.5rem' }}
          >
            <div className="data-cell">Method</div>
            <div className="data-cell">Path</div>
            <div className="data-cell">Session</div>
            <div className="data-cell">Latency</div>
            <div className="data-cell" style={{ textAlign: 'right' }}>Verdict</div>
          </div>
          {requests.slice(0, 50).map((req, i) => (
            <div
              key={`${req.id}-${i}`}
              className="data-row"
              style={{ gridTemplateColumns: '5rem 1fr 7rem 5rem 4.5rem' }}
            >
              <div className="data-cell">
                <span className="badge">{req.method}</span>
              </div>
              <div className="data-cell mono">{req.path}</div>
              <div className="data-cell mono" style={{ fontSize: '0.6875rem', color: 'var(--text-3)' }}>
                {req.sessionId.substring(0, 10)}…
              </div>
              <div className="data-cell mono">{req.responseTimeMs}ms</div>
              <div className="data-cell" style={{ textAlign: 'right' }}>
                <span className={`badge ${req.verdict}`}>
                  {verdictLabel[req.verdict] ?? req.verdict}
                </span>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
