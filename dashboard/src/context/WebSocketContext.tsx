import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { RequestRecord } from '../components/LiveFeed';

interface WebSocketContextType {
  requests: RequestRecord[];
  wsStatus: 'connecting' | 'connected' | 'error' | 'disconnected';
  setInitialData: (data: RequestRecord[]) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const useWebSocket = () => {
  const ctx = useContext(WebSocketContext);
  if (!ctx) throw new Error('useWebSocket must be used within WebSocketProvider');
  return ctx;
};

export const WebSocketProvider: React.FC<{ tenantId: string | null; children: React.ReactNode }> = ({ tenantId, children }) => {
  const [requests, setRequests] = useState<RequestRecord[]>([]);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('disconnected');

  const setInitialData = (data: RequestRecord[]) => {
    setRequests(prev => prev.length === 0 ? data : prev);
  };

  useEffect(() => {
    if (!tenantId) return;

    setWsStatus('connecting');
    const client = new Client({
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

  return (
    <WebSocketContext.Provider value={{ requests, wsStatus, setInitialData }}>
      {children}
    </WebSocketContext.Provider>
  );
};
