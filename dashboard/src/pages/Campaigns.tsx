import React, { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  sessionCount: number;
  severity: 'high' | 'medium' | 'low';
  firstSeen: string;
  lastSeen: string;
  sessions: string[];
  attackType: string;
}

// Mock data — backend campaigns API not yet implemented
const mockCampaigns: Campaign[] = [
  {
    id: 'camp-1029',
    name: 'Distributed SQLi Scan',
    sessionCount: 45,
    severity: 'high',
    firstSeen: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastSeen: new Date(Date.now() - 3600000 * 2).toISOString(),
    sessions: ['sess-a1b2c3', 'sess-d4e5f6', 'sess-g7h8i9'],
    attackType: 'SQL Injection',
  },
  {
    id: 'camp-1030',
    name: 'Credential Stuffing - Auth API',
    sessionCount: 120,
    severity: 'medium',
    firstSeen: new Date(Date.now() - 3600000 * 48).toISOString(),
    lastSeen: new Date(Date.now() - 3600000 * 12).toISOString(),
    sessions: ['sess-x9y8z7', 'sess-u1v2w3'],
    attackType: 'Credential Stuffing',
  },
  {
    id: 'camp-1031',
    name: 'Slow-drip Path Enumeration',
    sessionCount: 8,
    severity: 'low',
    firstSeen: new Date(Date.now() - 3600000 * 6).toISOString(),
    lastSeen: new Date(Date.now() - 3600000 * 1).toISOString(),
    sessions: ['sess-m1n2o3'],
    attackType: 'Path Traversal',
  },
];

function fmt(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function Campaigns() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const toggle = (id: string) =>
    setExpanded((p) => ({ ...p, [id]: !p[id] }));

  return (
    <div className="page-wrapper">
      <div className="page-inner">
        <div className="page-header">
          <div>
            <h1 className="page-title">Campaigns</h1>
            <p className="page-subtitle">Correlated attack clusters detected across sessions</p>
          </div>
          <span
            style={{
              fontSize: '0.6875rem',
              color: 'var(--text-3)',
              fontStyle: 'italic',
            }}
          >
            Demo data - live campaign API coming soon
          </span>
        </div>

        <div className="data-table">
          {/* Column header */}
          <div
            className="data-row header-row"
            style={{ gridTemplateColumns: '1fr 8rem 6rem 10rem 10rem 5.5rem' }}
          >
            <div className="data-cell">Name</div>
            <div className="data-cell">Type</div>
            <div className="data-cell">Sessions</div>
            <div className="data-cell">First seen</div>
            <div className="data-cell">Last seen</div>
            <div className="data-cell" style={{ textAlign: 'right' }}>Severity</div>
          </div>

          {mockCampaigns.map((camp) => (
            <React.Fragment key={camp.id}>
              <div
                className="data-row"
                style={{
                  gridTemplateColumns: '1fr 8rem 6rem 10rem 10rem 5.5rem',
                  cursor: 'pointer',
                }}
                onClick={() => toggle(camp.id)}
              >
                <div className="data-cell" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {expanded[camp.id]
                    ? <ChevronDown size={13} color="var(--text-3)" />
                    : <ChevronRight size={13} color="var(--text-3)" />}
                  <span style={{ fontWeight: 500 }}>{camp.name}</span>
                </div>
                <div className="data-cell" style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                  {camp.attackType}
                </div>
                <div className="data-cell mono">{camp.sessionCount}</div>
                <div className="data-cell" style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                  {fmt(camp.firstSeen)}
                </div>
                <div className="data-cell" style={{ fontSize: '0.75rem', color: 'var(--text-2)' }}>
                  {fmt(camp.lastSeen)}
                </div>
                <div className="data-cell" style={{ textAlign: 'right' }}>
                  <span className={`badge ${camp.severity}`}>{camp.severity}</span>
                </div>
              </div>

              {/* Expanded — session list */}
              {expanded[camp.id] && (
                <div
                  style={{
                    borderBottom: '1px solid var(--border)',
                    background: 'var(--bg)',
                    padding: '0.75rem 1.25rem 0.75rem 3rem',
                  }}
                >
                  <p style={{ fontSize: '0.6875rem', fontWeight: 500, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
                    Involved sessions
                  </p>
                  {camp.sessions.map((s) => (
                    <div
                      key={s}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '0.3125rem 0',
                        borderBottom: '1px solid var(--border)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      <span className="mono" style={{ color: 'var(--text-2)' }}>{s}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-3)' }}>
                        {fmt(camp.firstSeen)} - {fmt(camp.lastSeen)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
