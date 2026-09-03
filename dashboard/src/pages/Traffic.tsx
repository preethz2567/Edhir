import React, { useState } from 'react';
import { useDashboardContext } from './Dashboard';
import { useWebSocket } from '../context/WebSocketContext';
import { ShieldAlert, ShieldCheck, Target, Search } from 'lucide-react';

export function Traffic() {
  const { isLoading } = useDashboardContext();
  const { requests } = useWebSocket();
  const [filter, setFilter] = useState<'all' | 'allow' | 'block' | 'honeypot'>('all');
  const [search, setSearch] = useState('');

  const filteredRequests = requests.filter(req => {
    if (filter !== 'all' && req.verdict !== filter) return false;
    if (search && !req.path.includes(search) && !req.sessionId.includes(search)) return false;
    return true;
  });

  return (
    <div className="content-wrapper">
      <div className="content-inner">
        <div className="dashboard-header">
          <div>
            <h1 className="dashboard-title">Live Traffic</h1>
            <p className="dashboard-subtitle">Real-time request feed and filtering</p>
          </div>
        </div>

        <div className="solid-card">
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', background: 'var(--bg-color)', border: '1px solid var(--surface-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <button 
                onClick={() => setFilter('all')}
                style={{ padding: '0.5rem 1rem', background: filter === 'all' ? 'var(--surface-border)' : 'transparent', border: 'none', color: filter === 'all' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}
              >All</button>
              <button 
                onClick={() => setFilter('allow')}
                style={{ padding: '0.5rem 1rem', background: filter === 'allow' ? 'var(--accent-teal-glow)' : 'transparent', border: 'none', color: filter === 'allow' ? 'var(--accent-teal)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}
              >Allowed</button>
              <button 
                onClick={() => setFilter('block')}
                style={{ padding: '0.5rem 1rem', background: filter === 'block' ? 'var(--accent-red-glow)' : 'transparent', border: 'none', color: filter === 'block' ? 'var(--accent-red)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}
              >Blocked</button>
              <button 
                onClick={() => setFilter('honeypot')}
                style={{ padding: '0.5rem 1rem', background: filter === 'honeypot' ? 'rgba(255,255,255,0.1)' : 'transparent', border: 'none', color: filter === 'honeypot' ? 'var(--text-primary)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.875rem' }}
              >Honeypot</button>
            </div>

            <div style={{ position: 'relative', flex: 1, maxWidth: '300px' }}>
              <Search size={16} color="var(--text-secondary)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search path or session ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
          </div>

          <div className="list-container">
            {filteredRequests.length === 0 ? (
              <div className="empty-state">
                <p>No requests match your current filters.</p>
              </div>
            ) : (
              filteredRequests.map((req, i) => (
                <div key={`${req.id}-${i}`} className="list-item">
                  <div className="item-main">
                    <div className="item-id">
                      <span className="badge">{req.method}</span>
                      {req.path}
                    </div>
                    <div className="item-meta">
                      Session: {req.sessionId} | Latency: {req.responseTimeMs}ms
                    </div>
                  </div>
                  <div className="item-end">
                    <div className="timestamp">
                      {new Date(req.timestamp).toLocaleTimeString()}
                    </div>
                    {req.verdict === 'allow' && <div className="delta-pill positive"><ShieldCheck size={14}/> ALLOW</div>}
                    {req.verdict === 'block' && <div className="delta-pill danger"><ShieldAlert size={14}/> BLOCK</div>}
                    {req.verdict === 'honeypot' && <div className="delta-pill"><Target size={14}/> HONEYPOT</div>}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
