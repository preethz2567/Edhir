import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ShieldAlert, ShieldCheck, Target } from 'lucide-react';

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

export function LiveFeed({ tenantId, initialData, isLoading }: LiveFeedProps) {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');

  // Load initial data
  useEffect(() => {
    if (initialData.length > 0) {
      setRequests(initialData);
    }
  }, [initialData]);

  useEffect(() => {
    if (!tenantId) return;

    setWsStatus('connecting');
    const client = new Client({
      // Depending on Vite proxy, we might just connect to the root
      webSocketFactory: () => new SockJS('/ws/feed'),
      reconnectDelay: 5000,
      onConnect: () => {
        setWsStatus('connected');
        client.subscribe(`/topic/feed/${tenantId}`, (message) => {
          if (message.body) {
            try {
              const newReq = JSON.parse(message.body) as RequestRecord;
              setRequests(prev => [newReq, ...prev].slice(0, 100));
            } catch (e) {
              console.error("Invalid message", e);
            }
          }
        });
      },
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        setWsStatus('error');
      },
      onWebSocketError: () => {
        setWsStatus('error');
      },
      onDisconnect: () => {
        setWsStatus('disconnected');
      }
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [tenantId]);

  if (isLoading) {
    return (
      <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 shadow-lg min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading historical feed...</p>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 shadow-lg min-h-[400px] flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Live Traffic Feed</h2>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
          <ShieldCheck size={48} className="mb-4 opacity-50" />
          <p className="text-lg">No traffic recorded yet.</p>
          <p className="text-sm">Waiting for incoming requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          Live Traffic Feed
          {wsStatus === 'connected' && <span className="flex h-3 w-3"><span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span></span>}
          {wsStatus === 'connecting' && <span className="h-3 w-3 rounded-full bg-yellow-500"></span>}
          {wsStatus === 'error' && <span className="h-3 w-3 rounded-full bg-red-500" title="WebSocket Error"></span>}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-[#151521] border-b border-gray-800">
            <tr>
              <th className="px-6 py-3 rounded-tl-lg">Time</th>
              <th className="px-6 py-3">Method</th>
              <th className="px-6 py-3">Path</th>
              <th className="px-6 py-3">Latency</th>
              <th className="px-6 py-3 rounded-tr-lg">Verdict</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req, i) => (
              <tr key={`${req.id}-${i}`} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap font-mono text-xs opacity-70">
                  {new Date(req.timestamp).toLocaleTimeString()}
                </td>
                <td className="px-6 py-4 font-mono font-medium">
                  {req.method}
                </td>
                <td className="px-6 py-4 font-mono truncate max-w-xs">
                  {req.path}
                </td>
                <td className="px-6 py-4">
                  {req.responseTimeMs}ms
                </td>
                <td className="px-6 py-4">
                  {req.verdict === 'allow' && <span className="inline-flex items-center gap-1 text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs"><ShieldCheck size={14}/> ALLOW</span>}
                  {req.verdict === 'block' && <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs"><ShieldAlert size={14}/> BLOCK</span>}
                  {req.verdict === 'honeypot' && <span className="inline-flex items-center gap-1 text-purple-400 bg-purple-400/10 px-2 py-1 rounded text-xs"><Target size={14}/> HONEYPOT</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
