import { Activity, ShieldAlert, ShieldCheck, Target } from 'lucide-react';

interface StatCardsProps {
  isLoading: boolean;
  isError: boolean;
  total: number;
  allowed: number;
  blocked: number;
  honeypot: number;
}

export function StatCards({ isLoading, isError, total, allowed, blocked, honeypot }: StatCardsProps) {
  if (isError) {
    return (
      <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
        Failed to load statistics. The backend may be unavailable.
      </div>
    );
  }

  const cards = [
    {
      label: 'Total Requests',
      value: total,
      icon: Activity,
      dotClass: 'neutral',
    },
    {
      label: 'Allowed',
      value: allowed,
      icon: ShieldCheck,
      dotClass: 'allow',
    },
    {
      label: 'Blocked',
      value: blocked,
      icon: ShieldAlert,
      dotClass: 'block',
    },
    {
      label: 'Honeypot',
      value: honeypot,
      icon: Target,
      dotClass: 'honeypot',
    },
  ];

  return (
    <div className="stat-grid">
      {cards.map((c) => (
        <div key={c.label} className="stat-card">
          <div className="stat-label">
            <span className={`status-dot ${c.dotClass}`} />
            {c.label}
          </div>
          {isLoading ? (
            <div
              style={{
                height: '1.75rem',
                width: '5rem',
                background: 'var(--surface-2)',
                borderRadius: 'var(--radius)',
                marginTop: '0.5rem',
              }}
            />
          ) : (
            <div className="stat-value">{c.value.toLocaleString()}</div>
          )}
        </div>
      ))}
    </div>
  );
}
