/// <reference types="vitest/globals" />
import { render, screen } from '@testing-library/react';
import { LiveFeed } from '../components/LiveFeed';
import { WebSocketProvider } from '../context/WebSocketContext';
import { ReactElement } from 'react';

// Mock STOMP client (WebSocket not available in jsdom)
vi.mock('@stomp/stompjs', () => ({
  Client: class {
    activate = vi.fn();
    deactivate = vi.fn();
    subscribe = vi.fn();
  },
}));

const renderWithProvider = (ui: ReactElement) =>
  render(<WebSocketProvider tenantId="t-1">{ui}</WebSocketProvider>);

describe('LiveFeed Component', () => {
  const mockInitialData = [
    {
      id: 'req-1',
      sessionId: 'sess-1234567890',
      timestamp: new Date().toISOString(),
      path: '/login',
      method: 'POST',
      verdict: 'block' as const,
      responseTimeMs: 45,
    },
    {
      id: 'req-2',
      sessionId: 'sess-abcdefghij',
      timestamp: new Date().toISOString(),
      path: '/dashboard',
      method: 'GET',
      verdict: 'allow' as const,
      responseTimeMs: 12,
    },
  ];

  it('renders loading state', () => {
    renderWithProvider(<LiveFeed tenantId="t-1" initialData={[]} isLoading={true} />);
    // Loading state shows a spinner (no text)
    expect(document.querySelector('.spinner')).toBeTruthy();
  });

  it('renders empty state when no data and not loading', () => {
    renderWithProvider(<LiveFeed tenantId="t-1" initialData={[]} isLoading={false} />);
    expect(screen.getByText(/No traffic recorded yet/i)).toBeInTheDocument();
  });

  it('renders initial data correctly', () => {
    renderWithProvider(
      <LiveFeed tenantId="t-1" initialData={mockInitialData} isLoading={false} />
    );
    expect(screen.getByText('/login')).toBeInTheDocument();
    expect(screen.getByText('/dashboard')).toBeInTheDocument();
    expect(screen.getByText(/BLOCK/i)).toBeInTheDocument();
    expect(screen.getByText(/ALLOW/i)).toBeInTheDocument();
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
  });
});
