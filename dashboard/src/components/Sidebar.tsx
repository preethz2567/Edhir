import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Target, Shield, AlertTriangle, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  tenantId: string;
}

export function Sidebar({ onLogout, tenantId }: SidebarProps) {
  const links = [
    { to: '/app/overview', icon: LayoutDashboard, label: 'Overview' },
    { to: '/app/traffic', icon: Activity, label: 'Live Traffic' },
    { to: '/app/campaigns', icon: Target, label: 'Campaigns' },
    { to: '/app/rules', icon: Shield, label: 'Rules' },
    { to: '/app/honeypot', icon: AlertTriangle, label: 'Honeypot Events' },
    { to: '/app/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2 className="dashboard-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Edhir</h2>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
          Tenant: {tenantId.substring(0, 8)}...
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon size={18} />
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button onClick={onLogout} className="sidebar-link w-full text-left" style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <LogOut size={18} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
