import React, { useState } from 'react';
import { Target, ChevronDown, ChevronRight } from 'lucide-react';

interface CampaignMock {
  id: string;
  name: string;
  sessionCount: number;
  severity: 'high' | 'medium' | 'low';
  firstSeen: string;
  lastSeen: string;
  sessions: string[];
}

const mockCampaigns: CampaignMock[] = [
  {
    id: 'camp-1029',
    name: 'Distributed SQLi Scan',
    sessionCount: 45,
    severity: 'high',
    firstSeen: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastSeen: new Date(Date.now() - 3600000 * 2).toISOString(),
    sessions: ['sess-a1', 'sess-b2', 'sess-c3']
  },
  {
    id: 'camp-1030',
    name: 'Credential Stuffing via Auth API',
    sessionCount: 120,
    severity: 'medium',
    firstSeen: new Date(Date.now() - 3600000 * 48).toISOString(),
    lastSeen: new Date(Date.now() - 3600000 * 12).toISOString(),
    sessions: ['sess-x9', 'sess-y8']
  }
];

export function Campaigns() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="content-wrapper">
      <div className="content-inner">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Campaigns</h1>
            <p className="dashboard-subtitle">Correlated attack campaigns and threat clusters</p>
          </div>
        </div>

        <div className="list-container">
          {mockCampaigns.map(camp => (
            <div key={camp.id} className="solid-card" style={{ padding: '1rem 1.5rem' }}>
              <div 
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                onClick={() => toggle(camp.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {expanded[camp.id] ? <ChevronDown size={20} color="var(--text-secondary)"/> : <ChevronRight size={20} color="var(--text-secondary)"/>}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontFamily: 'var(--font-space)', margin: 0, color: 'var(--text-primary)' }}>{camp.name}</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      First seen: {new Date(camp.firstSeen).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.25rem', fontFamily: 'var(--font-space)', fontWeight: 700 }}>{camp.sessionCount}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Sessions</div>
                  </div>
                  <div className={`delta-pill ${camp.severity === 'high' ? 'danger' : 'positive'}`} style={{ width: '80px', justifyContent: 'center' }}>
                    <Target size={14} /> {camp.severity}
                  </div>
                </div>
              </div>

              {expanded[camp.id] && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
                  <h4 style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', textTransform: 'uppercase' }}>Involved Sessions</h4>
                  <div className="list-container">
                    {camp.sessions.map(s => (
                      <div key={s} className="list-item" style={{ padding: '0.5rem 1rem', background: 'var(--bg-color)' }}>
                        <span className="item-id">{s}</span>
                        <span className="item-meta">Active between {new Date(camp.firstSeen).toLocaleTimeString()} and {new Date(camp.lastSeen).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
