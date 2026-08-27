import React from 'react';
import { ShieldAlert, ShieldCheck, Activity, Target } from 'lucide-react';

interface StatCardsProps {
  isLoading: boolean;
  isError: boolean;
  total: number;
  allowed: number;
  blocked: number;
  honeypot: number;
}

export function StatCards({ isLoading, isError, total, allowed, blocked, honeypot }: StatCardsProps) {
  if (isError) {
    return (
      <div className="p-6 bg-red-900/20 border border-red-500 rounded-lg text-red-200">
        Failed to load statistics.
      </div>
    );
  }

  const cards = [
    { label: "Total Requests", value: total, icon: Activity, color: "text-blue-400" },
    { label: "Allowed", value: allowed, icon: ShieldCheck, color: "text-green-400" },
    { label: "Blocked", value: blocked, icon: ShieldAlert, color: "text-red-400" },
    { label: "Honeypot", value: honeypot, icon: Target, color: "text-purple-400" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => (
        <div key={i} className="bg-[#1e1e2d] border border-gray-800 rounded-xl p-6 flex items-center justify-between shadow-lg">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{c.label}</p>
            {isLoading ? (
              <div className="h-8 w-16 bg-gray-700 animate-pulse rounded"></div>
            ) : (
              <h3 className="text-3xl font-bold text-white">{c.value.toLocaleString()}</h3>
            )}
          </div>
          <div className={`p-3 rounded-lg bg-black/20 ${c.color}`}>
            <c.icon size={24} />
          </div>
        </div>
      ))}
    </div>
  );
}
