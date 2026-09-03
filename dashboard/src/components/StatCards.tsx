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
      <div className="alert-error">
        Failed to load statistics.
      </div>
    );
  }

  const cards = [
    { label: "Total Requests", value: total, icon: Activity, classModifier: "" },
    { label: "Allowed", value: allowed, icon: ShieldCheck, classModifier: "accent-teal" },
    { label: "Blocked", value: blocked, icon: ShieldAlert, classModifier: "accent-red" },
    { label: "Honeypot", value: honeypot, icon: Target, classModifier: "" },
  ];

  return (
    <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
      {cards.map((c, i) => (
        <div key={i} className={`solid-card kpi-card ${c.classModifier}`}>
          <div className="kpi-header">
            <span className="kpi-title">{c.label}</span>
            <c.icon className="kpi-icon" />
          </div>
          <div className="kpi-body">
            {isLoading ? (
              <span className="kpi-value" style={{opacity: 0.5}}>...</span>
            ) : (
              <span className="kpi-value">{c.value.toLocaleString()}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
