import React from 'react';
import { Target } from 'lucide-react';

interface HoneypotEventMock {
  id: string;
  sessionId: string;
  timestamp: string;
  actionObserved: string;
  resolvedVerdict: 'block' | 'allow' | 'pending';
}

const mockEvents: HoneypotEventMock[] = [
  { id: 'hp-1', sessionId: 'sess-x1', timestamp: new Date(Date.now() - 360000).toISOString(), actionObserved: 'Attempted to read /etc/passwd', resolvedVerdict: 'block' },
  { id: 'hp-2', sessionId: 'sess-y2', timestamp: new Date(Date.now() - 720000).toISOString(), actionObserved: 'Scanned 15 non-existent admin endpoints', resolvedVerdict: 'block' },
  { id: 'hp-3', sessionId: 'sess-z3', timestamp: new Date(Date.now() - 1080000).toISOString(), actionObserved: 'No malicious activity observed', resolvedVerdict: 'allow' },
];

export function Honeypot() {
  return (
    <div className="content-wrapper">
      <div className="content-inner">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Honeypot Events</h1>
            <p className="dashboard-subtitle">Sessions redirected to the deception environment</p>
          </div>
        </div>

        <div className="solid-card">
          <div className="list-container">
            {mockEvents.map(ev => (
              <div key={ev.id} className="list-item">
                <div className="item-main">
                  <div className="item-id">
                    <Target size={16} color="var(--accent-teal)" />
                    Session: {ev.sessionId}
                  </div>
                  <div className="item-meta">
                    Action: {ev.actionObserved}
                  </div>
                </div>
                <div className="item-end">
                  <div className="timestamp">
                    {new Date(ev.timestamp).toLocaleTimeString()}
                  </div>
                  <div className={`delta-pill ${ev.resolvedVerdict === 'block' ? 'danger' : ev.resolvedVerdict === 'allow' ? 'positive' : ''}`} style={{ width: '80px', justifyContent: 'center' }}>
                    {ev.resolvedVerdict.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
