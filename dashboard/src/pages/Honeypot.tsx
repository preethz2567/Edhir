
interface HoneypotEvent {
  id: string;
  sessionId: string;
  timestamp: string;
  actionObserved: string;
  resolvedVerdict: 'block' | 'allow' | 'pending';
}

// Mock data — backend honeypot events API not yet implemented
const mockEvents: HoneypotEvent[] = [
  {
    id: 'hp-1',
    sessionId: 'sess-x1y2z3a4',
    timestamp: new Date(Date.now() - 360_000).toISOString(),
    actionObserved: 'Attempted to read /etc/passwd via path traversal',
    resolvedVerdict: 'block',
  },
  {
    id: 'hp-2',
    sessionId: 'sess-b5c6d7e8',
    timestamp: new Date(Date.now() - 720_000).toISOString(),
    actionObserved: 'Scanned 15 non-existent admin endpoints in 30 seconds',
    resolvedVerdict: 'block',
  },
  {
    id: 'hp-3',
    sessionId: 'sess-f9g0h1i2',
    timestamp: new Date(Date.now() - 1_080_000).toISOString(),
    actionObserved: 'No malicious activity observed during session',
    resolvedVerdict: 'allow',
  },
  {
    id: 'hp-4',
    sessionId: 'sess-j3k4l5m6',
    timestamp: new Date(Date.now() - 2_400_000).toISOString(),
    actionObserved: 'Attempted SQL injection via query parameter',
    resolvedVerdict: 'block',
  },
  {
    id: 'hp-5',
    sessionId: 'sess-n7o8p9q0',
    timestamp: new Date(Date.now() - 5_400_000).toISOString(),
    actionObserved: 'Awaiting analysis - session still active',
    resolvedVerdict: 'pending',
  },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

const verdictClass: Record<string, string> = {
  block:   'block',
  allow:   'allow',
  pending: 'honeypot',
};

const verdictLabel: Record<string, string> = {
  block:   'BLOCK',
  allow:   'ALLOW',
  pending: 'PENDING',
};

export function Honeypot() {
  return (
    <div className="page-wrapper">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <h1 className="page-title">Honeypot Events</h1>
            <p className="page-subtitle">Sessions redirected to the deception environment</p>
          </div>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-3)',
              fontStyle: 'italic',
            }}
          >
            Demo data - live honeypot API coming soon
          </span>
        </div>

        <div className="data-table">
          {/* Column header */}
          <div
            className="data-row header-row"
            style={{ gridTemplateColumns: '9rem 1fr 10rem 5.5rem' }}
          >
            <div className="data-cell">Session</div>
            <div className="data-cell">Action observed</div>
            <div className="data-cell">Time</div>
            <div className="data-cell" style={{ textAlign: 'right' }}>Verdict</div>
          </div>

          {mockEvents.map((ev) => (
            <div
              key={ev.id}
              className="data-row"
              style={{ gridTemplateColumns: '9rem 1fr 10rem 5.5rem' }}
            >
              <div className="data-cell mono" style={{ fontSize: '0.6875rem', color: 'var(--text-2)' }}>
                {ev.sessionId}
              </div>
              <div
                className="data-cell"
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-1)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {ev.actionObserved}
              </div>
              <div
                className="data-cell"
                style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}
              >
                {fmt(ev.timestamp)}
              </div>
              <div className="data-cell" style={{ textAlign: 'right' }}>
                <span className={`badge ${verdictClass[ev.resolvedVerdict]}`}>
                  {verdictLabel[ev.resolvedVerdict]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
