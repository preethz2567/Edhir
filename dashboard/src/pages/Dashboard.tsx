import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { StatCards } from '../components/StatCards';
import { LiveFeed, RequestRecord } from '../components/LiveFeed';
import { ErrorBoundary } from '../components/ErrorBoundary';

interface DashboardResponse {
  requests: RequestRecord[];
  summary: {
    total: number;
    allowed: number;
    blocked: number;
  };
}

interface DashboardProps {
  tenantId: string;
  onLogout: () => void;
}

export function Dashboard({ tenantId, onLogout }: DashboardProps) {
  const { data, isLoading, isError } = useQuery<DashboardResponse>({
    queryKey: ['dashboard', tenantId],
    queryFn: async () => {
      // In a real app, this endpoint would use the HttpOnly cookie for auth 
      // and return tenant-scoped data. Currently DashboardController returns all.
      // Assuming DashboardController is updated to check the cookie (or we just fetch it)
      const res = await fetch('/api/dashboard/live', {
        // credentials: 'include' is needed to send the HttpOnly cookie
      });
      if (!res.ok) {
        if (res.status === 401) onLogout();
        throw new Error('Failed to fetch data');
      }
      return res.json();
    }
  });

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } finally {
      onLogout();
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f16] text-gray-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">Security Overview</h1>
            <p className="text-gray-400 mt-1">Tenant ID: {tenantId}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <ErrorBoundary>
          <StatCards 
            isLoading={isLoading}
            isError={isError}
            total={data?.summary.total || 0}
            allowed={data?.summary.allowed || 0}
            blocked={data?.summary.blocked || 0}
            honeypot={0} // DashboardController doesn't split honeypot yet, assuming 0
          />
        </ErrorBoundary>

        <ErrorBoundary>
          <LiveFeed 
            tenantId={tenantId}
            initialData={data?.requests || []}
            isLoading={isLoading}
          />
        </ErrorBoundary>
      </div>
    </div>
  );
}
