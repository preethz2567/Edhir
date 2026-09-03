import React, { useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Target } from 'lucide-react';
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

export function LiveFeed({ initialData, isLoading }: LiveFeedProps) {
  const { requests, wsStatus, setInitialData } = useWebSocket();

  useEffect(() => {
    if (initialData.length > 0) {
      setInitialData(initialData);
    }
  }, [initialData, setInitialData]);

  if (isLoading) {
    return (
      <div className="solid-card" style={{minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <div className="empty-state">
          <p>Loading historical feed...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="solid-card" style={{minHeight: '400px'}}>
        <div className="section-header-wrap">
          <h2 className="section-header">Live Traffic Feed</h2>
        </div>
        <div className="empty-state">
          <ShieldCheck size={48} className="empty-icon" />
          <p>No traffic recorded yet. Waiting for incoming requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="solid-card">
      <div className="section-header-wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-header">
          Live Traffic Feed
        </h2>
        <div className={`delta-pill ${wsStatus === 'connected' ? 'positive' : wsStatus === 'error' ? 'danger' : ''}`}>
          {wsStatus === 'connected' ? 'CONNECTED' : wsStatus === 'connecting' ? 'CONNECTING' : 'DISCONNECTED'}
        </div>
      </div>

      <div className="list-container">
        {requests.map((req, i) => (
          <div key={`${req.id}-${i}`} className="list-item">
            <div className="item-main">
              <div className="item-id">
                <span className="badge">{req.method}</span>
                {req.path}
              </div>
              <div className="item-meta">
                Latency: {req.responseTimeMs}ms
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
        ))}
      </div>
    </div>
  );
}
