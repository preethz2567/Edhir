import React from 'react';
import { render, screen } from '@testing-library/react';
import { LiveFeed } from '../components/LiveFeed';

// Mock STOMP client as it uses WebSocket which isn't available in jsdom natively without setup
vi.mock('@stomp/stompjs', () => {
  return {
    Client: class {
      activate = vi.fn();
      deactivate = vi.fn();
      subscribe = vi.fn();
    }
  };
});

describe('LiveFeed Component', () => {
  const mockInitialData = [
    {
      id: "req-1",
      sessionId: "sess-1",
      timestamp: new Date().toISOString(),
      path: "/login",
      method: "POST",
      verdict: "block" as const,
      responseTimeMs: 45
    },
    {
      id: "req-2",
      sessionId: "sess-2",
      timestamp: new Date().toISOString(),
      path: "/dashboard",
      method: "GET",
      verdict: "allow" as const,
      responseTimeMs: 12
    }
  ];

  it('renders loading state', () => {
    render(<LiveFeed tenantId="t-1" initialData={[]} isLoading={true} />);
    expect(screen.getByText('Loading historical feed...')).toBeInTheDocument();
  });

  it('renders empty state when no data and not loading', () => {
    render(<LiveFeed tenantId="t-1" initialData={[]} isLoading={false} />);
    expect(screen.getByText('No traffic recorded yet.')).toBeInTheDocument();
  });

  it('renders initial data correctly', () => {
    render(<LiveFeed tenantId="t-1" initialData={mockInitialData} isLoading={false} />);
    
    // Check paths are rendered
    expect(screen.getByText('/login')).toBeInTheDocument();
    expect(screen.getByText('/dashboard')).toBeInTheDocument();
    
    // Check verdicts are rendered
    expect(screen.getByText(/BLOCK/i)).toBeInTheDocument();
    expect(screen.getByText(/ALLOW/i)).toBeInTheDocument();
    
    // Check methods
    expect(screen.getByText('POST')).toBeInTheDocument();
    expect(screen.getByText('GET')).toBeInTheDocument();
  });
});
